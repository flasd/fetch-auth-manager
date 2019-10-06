import { ApolloLink } from 'apollo-link';
import { getToken, setToken, logout } from './bridge';

// ############## GRAPHQL HTTP LINK ##############

/**
 * @function setOperationContext
 * @private
 */
function setOperationContext(params) {
  const { headers = {} } = params;

  return {
    ...params,
    headers: {
      ...headers,
      authorization: getToken(false),
    },
  };
}

/**
 * @function handleResponse
 * @private
 */
function handleResponse(operation) {
  return (response) => {
    const { response: { headers } } = operation.getContext();

    const xTokenSet = headers.get('X-Token-Set');
    const xTokenUnset = headers.get('X-Token-Remove');

    if (xTokenUnset) {
      logout();
    } else if (xTokenSet) {
      setToken(xTokenSet);
    }

    return response;
  };
}

/**
 * @function handleLink
 * @private
 */
function handleLink(operation, forward) {
  operation.setContext(setOperationContext);

  return forward(operation).map(handleResponse(operation));
}

// ############## GRAPHQL WS LINK ##############

const defaultOptions = { params: {}, reconect: true, lazy: true };

async function createWsParams(partialParams = {}) {
  /* eslint-disable no-param-reassign */
  if (typeof partialParams === 'function') {
    partialParams = partialParams();
  }

  if (typeof partialParams.then === 'function') {
    partialParams = await partialParams;
  }

  return {
    ...partialParams,
    authorization: getToken(false),
  };
}


export const authHttpLink = new ApolloLink(handleLink);

export function withWSAuth(userOptions) {
  const options = {
    ...defaultOptions,
    ...userOptions,
  };

  return {
    ...options,
    params: createWsParams(options.params),
  };
}
