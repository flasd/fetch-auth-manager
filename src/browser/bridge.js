import jwtDecode from 'jwt-decode';

const LOCAL_STORAGE_KEY = '789519fa69a45c83c7';
const privateSubscribers = {};
let lastSubscriber = -1;
let timeout;

function decodeJWT(raw) {
  try {
    return jwtDecode(raw);
  } catch (error) {
    return null;
  }
}

/**
 * @function onAuthStateChange
 * @param  {DecodedJWT | null} decoded Decoded JWT token or null
 * @return {void}
 * @description Calls all subscribers with decoded
 */
export function onAuthStateChange(decoded) {
  Object.values(privateSubscribers).forEach((sub) => sub(decoded));
}

/**
 * @function subscribe
 * @param  {Function} fn Function that gets called when there is auth state updates
 * @return {void}
 */
export function subscribe(fn) {
  if (typeof fn !== 'function') {
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.error(`[fetch-auth-manager] Expected subscriber to be a function, instead got: ${typeof fn}`);
    }

    return () => { };
  }

  lastSubscriber += 1;
  const index = lastSubscriber;

  privateSubscribers[index] = fn;

  return () => {
    delete privateSubscribers[index];
  };
}


function isExpired(decoded) {
  if (!decoded || typeof decoded.exp !== 'number') {
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.error(`[fetch-auth-manager] Expected decoded to be a object with an exp property, instead got: ${typeof decoded}`);
    }

    return true;
  }

  const { exp } = decoded;
  const now = Math.round(Date.now() / 1000);

  return (exp - now) < 0;
}

/**
 * @function getToken
 * @param  {Boolean} decode Should we decode the token?
 * @return {String|null|DecodedJWT}
 */
export function getToken(decode = false) {
  const token = localStorage.getItem(LOCAL_STORAGE_KEY);

  if (!token) {
    return null;
  }

  if (decode) {
    return decodeJWT(token);
  }

  return token;
}

function removeToken() {
  localStorage.removeItem(LOCAL_STORAGE_KEY);
}

function createTimeout(exp) {
  const now = Math.round(Date.now() / 1000);

  if (timeout) {
    clearTimeout(timeout);
  }

  timeout = setTimeout(() => {
    removeToken();
    onAuthStateChange(null);
  }, (now - exp) * 1000);
}

/**
 * @function setToken
 * @param  {String} token Raw JTW token
 * @return {void}
 */
export function setToken(token) {
  if (typeof token !== 'string' || !token.includes('Bearer')) {
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.warn(`[fetch-auth-manager] You just tried to set an empty or invalid token: ${token}`);
    }
    return;
  }

  const decoded = decodeJWT(token);

  if (isExpired(decoded)) {
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.warn(`[fetch-auth-manager] You just set an expired token: ${token}`);
    }
  }

  createTimeout(decoded.exp);
  localStorage.setItem(LOCAL_STORAGE_KEY, `${token}`);
  onAuthStateChange(decoded);
}

function main() {
  const decoded = getToken(true);

  if (!decoded) {
    return;
  }

  createTimeout(decoded.exp);
}

/**
 * @function hasAuth
 * @return {Boolean} Wheather the user has auth
 */
export function hasAuth() {
  const decoded = getToken(true);

  if (!decoded || isExpired(decoded)) {
    return false;
  }

  return true;
}

/**
 * @function logout
 * @return {void}
 * @description Logs the user out an calls all subscribers
 */
export function logout() {
  if (timeout) {
    clearTimeout(timeout);
  }

  removeToken();
  onAuthStateChange(null);
}

main();
