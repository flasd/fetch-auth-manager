import { getToken, setToken, logout } from './bridge';

export function onRequest(config) {
  const { headers = {} } = config;

  return {
    ...config,
    headers: {
      ...headers,
      authorization: getToken(false),
    },
  };
}

export function onResponse(response) {
  const { headers } = response;

  const xTokenSet = headers.get('X-Token-Set');
  const xTokenUnset = headers.get('X-Token-Unset');

  if (xTokenUnset) {
    logout();
  } else if (xTokenSet) {
    setToken(xTokenSet);
  }

  return response;
}

export function onResponseError(error) {
  if (error.response) {
    onResponse(error.response);
  }

  return Promise.reject(error);
}
