"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createToken = createToken;
exports.logout = logout;
exports.decode = decode;
exports.fetchAuthManager = fetchAuthManager;

var _secureRandomString = _interopRequireDefault(require("secure-random-string"));

var _jsonwebtoken = _interopRequireDefault(require("jsonwebtoken"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

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
var defaults = {
  jwtSecret: process.env.JWT_SECRET || (0, _secureRandomString.default)(),
  jwtLifetime: parseInt(process.env.JWT_LIFETIME, 10) || 259200,
  debug: false
};
/**
 * @function createToken
 * @param  {ExpressResponse} res Express-like response object
 * @param  {Object} payload JWT payload
 * @param  {Options} options Jwt options
 * @return {void} It sets the correct header on the response object
 */

function createToken(res) {
  var payload = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  /* eslint-disable no-param-reassign */
  var values = _objectSpread({}, defaults, {
    options: options
  });

  delete payload.exp;
  delete payload.iat;
  var JWT_TOKEN = "Bearer ".concat(_jsonwebtoken.default.sign(payload, values.jwtSecret, {
    expiresIn: "".concat(values.jwtLifetime, " seconds")
  }));
  res.header(options.update ? 'X-Token-Update' : 'X-Token-Create', JWT_TOKEN);
}
/**
 * @function logout
 * @param  {ExpressResponse} res Express-like response object
 * @return {void} It sets the correct header on the response object
 */


function logout(res) {
  res.header('X-Token-Remove', 'remove');
}
/**
 * @function decode
 * @param  {String} header
 * @param  {String} jwtSecret
 * @return {?Object} Decoded JWT or null
 */


function decode(header, jwtSecret) {
  var JWT_TOKEN = "".concat(header).replace('Bearer ', '');

  if (!JWT_TOKEN) {
    return null;
  }

  try {
    return _jsonwebtoken.default.decode(JWT_TOKEN, jwtSecret);
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


function fetchAuthManager() {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  var values = _objectSpread({}, defaults, {
    options: options
  });

  return function (req, res, next) {
    var _req$headers = req.headers,
        Authorization = _req$headers.Authorization,
        authorization = _req$headers.authorization;

    try {
      var decoded = decode(Authorization || authorization);

      if (!decoded) {
        req.user = null;
        next();
        return;
      }

      var exp = decoded.exp;
      var now = Math.round(Date.now() / 1000);
      var diff = exp - now;

      if (diff > 0) {
        var reference = values.jwtLifetime / 3 * 2;

        if (diff < reference) {
          createToken(req, _objectSpread({}, decoded), _objectSpread({}, values, {
            update: true
          }));
        }
      } else {
        req.user = null;
        logout(res);
        return;
      }

      req.user = _objectSpread({}, decoded);
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

//# sourceMappingURL=server.js.map