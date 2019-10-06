import React, { Component } from 'react';
import hoinstStatics from 'hoist-non-react-statics';
import { getToken, subscribe, hasAuth as hasAuthFn } from './bridge';

const AuthContext = React.createContext();

export class AuthProvider extends Component {
  constructor(props) {
    super(props);

    const decoded = getToken(true);

    this.state = {
      hasAuth: hasAuthFn(),
      user: decoded,
    };

    this.handleUpdate = this.handleUpdate.bind(this);
  }

  componentDidMount() {
    this.unsubscribe = subscribe(this.handleUpdate);
  }

  componentWillUnmount() {
    if (typeof this.unsubscribe === 'function') {
      this.unsubscribe();
    }
  }

  handleUpdate(decoded) {
    this.setState({
      hasAuth: hasAuthFn(),
      user: decoded,
    });
  }

  render() {
    const { children } = this.props;

    return React.createElement(AuthContext.Provider, {
      value: { ...this.state },
    }, children);
  }
}

const { Consumer: AuthConsumer } = AuthContext;

export function withAuth(UserComponent) {
  function CustomComponent(props) {
    return React.createElement(
      AuthConsumer,
      {},
      // eslint-disable-next-line prefer-arrow-callback
      function renderer(values) {
        return React.createElement(UserComponent, { ...props, ...values });
      },
    );
  }

  hoinstStatics(CustomComponent, UserComponent);

  CustomComponent.displayName = `withAuth(${UserComponent.displayName || UserComponent.name})`;

  return CustomComponent;
}

export { AuthConsumer };
