import { ApolloLink } from 'apollo-link';

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
    }

    if (xTokenRemove) {
      localStorage.removeItem(values.localStorageKey);
    }

    return response;
  };
}

/**
 * @function createAuthManagerLink
 * @param  {type} options {description}
 * @return {GraphLink} Returns a manager link
 */
export default function createAuthManagerLink(options = {}) {
  const values = {
    ...defaults,
    options,
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
