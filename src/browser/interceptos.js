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

  const xTokenCreate = headers.get('X-Token-Create');
  const xTokenUpdate = headers.get('X-Token-Update');
  const xTokenRemove = headers.get('X-Token-Remove');

  if (xTokenRemove) {
    logout();
  } else if (xTokenCreate || xTokenUpdate) {
    setToken(xTokenCreate || xTokenUpdate);
  }

  return response;
}

export function onResponseError(error) {
  if (error.response) {
    onResponse(error.response);
  }

  return Promise.reject(error);
}
