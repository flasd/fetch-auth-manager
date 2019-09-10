import src from 'secure-random-string';
import jsonWebToken from 'jsonwebtoken';

/**
 * @typedef {Object} ExpressResponse Express-like response object
 * @property {Function} header
 */

/**
 * @typedef {Object} ExpressRequest Express-like response object
 * @property {Object} header
 */

/**
 * @typedef {Object} Options JWT options
 * @property {string} jwtSecret Defaults to process.env.JWT_SECRET or random string
 * @property {number} jwtLifetime Token exp in seconds
 * @property {boolean} debug Log jwt decode errors to console, defaults to false.
 */

const defaults = {
  jwtSecret: process.env.JWT_SECRET || src(),
  jwtLifetime: parseInt(process.env.JWT_LIFETIME, 10) || 259200,
  debug: false,
};

/**
 * @function createToken
 * @param  {ExpressResponse} res Express-like response object
 * @param  {Object} payload JWT payload
 * @param  {Options} options Jwt options
 * @return {void} It sets the correct header on the response object
 */
export function createToken(res, payload = {}, options = {}) {
  /* eslint-disable no-param-reassign */
  const values = {
    ...defaults,
    options,
  };

  delete payload.exp;
  delete payload.iat;

  const JWT_TOKEN = `Bearer ${
    jsonWebToken.sign(
      payload,
      values.jwtSecret,
      {
        expiresIn: `${values.jwtLifetime} seconds`,
      },
    )
  }`;

  res.header(options.update ? 'X-Token-Update' : 'X-Token-Create', JWT_TOKEN);
}

/**
 * @function logout
 * @param  {ExpressResponse} res Express-like response object
 * @return {void} It sets the correct header on the response object
 */
export function logout(res) {
  res.header('X-Token-Remove', 'remove');
}

/**
 * @function decode
 * @param  {String} header
 * @param  {String} jwtSecret
 * @return {?Object} Decoded JWT or null
 */
export function decode(header, jwtSecret) {
  const JWT_TOKEN = `${header}`.replace('Bearer ', '');

  if (!JWT_TOKEN) {
    return null;
  }

  try {
    return jsonWebToken.decode(
      JWT_TOKEN,
      jwtSecret,
    );
  } catch (error) {
    return null;
  }
}

/**
 * @typedef {Function} FetchAuthManagerMiddleware
 * @param {ExpressRequest} req Express-like request object
 * @param {ExpressResponse} res Express-like response object
 * @param {Function} next Expres next function
 * @return {void} Returns void and calls express`s next() regardless
 */

/**
 * @function fetchAuthManager
 * @param  {Options} options Jwt options
 * @return {FetchAuthManagerMiddleware} Middleware to handle auth
 */
export function fetchAuthManager(options = {}) {
  const values = {
    ...defaults,
    options,
  };

  return (req, res, next) => {
    const {
      headers: {
        Authorization,
        authorization,
      },
    } = req;

    try {
      const decoded = decode(Authorization || authorization);

      if (!decoded) {
        req.user = null;
        next();
        return;
      }

      const { exp } = decoded;

      const now = Math.round(Date.now() / 1000);
      const diff = exp - now;

      if (diff > 0) {
        const reference = (values.jwtLifetime / 3) * 2;

        if (diff < reference) {
          createToken(req, { ...decoded }, { ...values, update: true });
        }
      } else {
        req.user = null;
        logout(res);
        return;
      }

      req.user = {
        ...decoded,
      };

      next();
    } catch (error) {
      if (values.debug) {
        // eslint-disable-next-line no-console
        console.error(error);
      }

      logout(res);

      req.user = null;
      next();
    }
  };
}
