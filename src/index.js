import { ApolloLink } from 'apollo-link';
import React from 'react';
import decode from 'jwt-decode';
import hoinstStatics from 'hoist-non-react-statics';

export const subscribers = [];

/**
 * @typedef {Object} Options apollo options options
 * @property {string} localStorageKey Key in the local storage to store jwt to
 */

const defaults = {
  localStorageKey: '5cnasGf8fvJFB8WW2Uxrayc5',
};

/**
 * @typedef {Function} GraphQlLinkMiddleware handles graphql http response
 * @property {Object} GraphQlResponse in the local storage to store jwt to
 * @property {Object} GraphQlResponse.headers Server response headers
 */

/**
 * @function handleResponse
 * @private
 * @param  {Options} values Config values
 * @return {GraphQlLinkMiddleware} Function that handles the response
 */
function handleResponse(values) {
  return (response) => {
    const { headers = {} } = response;

    const {
      'X-Token-Create': xTokenCreate,
      'X-Token-Update': xTokenUpdate,
      'X-Token-Remove': xTokenRemove,
    } = headers;

    if (xTokenCreate || xTokenUpdate) {
      localStorage.setItem(values.localStorageKey, xTokenCreate || xTokenUpdate);
      subscribers.forEach((s) => s(decode(`${xTokenCreate || xTokenUpdate}`.replace('Bearer ', ''))));
    }

    if (xTokenRemove) {
      localStorage.removeItem(values.localStorageKey);
      subscribers.forEach((s) => s(null));
    }

    return response;
  };
}

/**
 * @function createAuthManagerLink
 * @param  {type} options {description}
 * @return {GraphLink} Returns a manager link
 */
export function createAuthManagerLink() {
  const values = {
    ...defaults,
  };

  return new ApolloLink((operation, forward) => {
    operation.setContext(({ headers = {} }) => ({
      headers: {
        ...headers,
        authorization: localStorage.getItem(values.localStorageKey) || null,
      },
    }));

    return forward(operation).map(handleResponse(values));
  });
}

/**
 * @function createWsParams
 * @param  {Object|Function<Object|Promise<Object>>} partialParams WS params
 * @param  {Options} options User options
 * @return {Object} Ws Connection Params
 * @description Make `lazy: true` in WsLink options
 */
export async function createWsParams(partialParams = {}, options) {
  /* eslint-disable no-param-reassign */

  const values = {
    ...defaults,
    options,
  };

  if (typeof partialParams === 'function') {
    partialParams = partialParams();
  }

  if (typeof partialParams.then === 'function') {
    partialParams = await partialParams;
  }

  return {
    ...partialParams,
    authorization: localStorage.getItem(values.localStorageKey) || null,
  };
}

const AuthContext = React.createContext();

export class AuthProvider extends React.Component {
  constructor(props) {
    super(props);

    const decoded = decode(localStorage.getItem(defaults.localStorageKey));

    this.state = {
      hasAuth: !!decoded,
      user: decoded,
    };

    this.handleUpdate = this.handleUpdate.bind(this);
  }

  componentDidMount() {
    subscribers.push(this.handleUpdate);
  }

  handleUpdate(decoded) {
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }

    if (decoded) {
      const { exp } = decoded;

      const now = Math.round(Date.now() / 1000);
      const diff = exp - now;

      if (diff <= 0) {
        this.handleUpdate(null);
        return;
      }

      if (diff > 0 && diff < 3600) {
        setTimeout(() => this.handleUpdate(null), diff * 1000);
      }

      this.setState({
        hasAuth: true,
        user: decoded,
      });

      return;
    }

    localStorage.removeItem(defaults.localStorageKey);

    this.setState({
      hasAuth: false,
      user: null,
    });
  }

  render() {
    const { hasAuth, user } = this.state;
    const { children } = this.props;

    return React.createElement(AuthContext.Provider, {
      value: {
        hasAuth,
        user,
      },
    }, children);
  }
}

const { Consumer: AuthConsumer } = AuthContext;

export function withAuth(UserComponent) {
  function CustomComponent(props) {
    return React.createElement(
      AuthConsumer,
      ({ values }) => React.createElement(UserComponent, { ...props, ...values }),
    );
  }

  hoinstStatics(CustomComponent, UserComponent);

  CustomComponent.displayName = `withAuth(${UserComponent.displayName || UserComponent.name})`;

  return CustomComponent;
}

export { AuthConsumer };
