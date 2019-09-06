"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = createAuthManagerLink;
exports.createWsParams = createWsParams;

var _apolloLink = require("apollo-link");

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/**
 * @typedef {Object} Options apollo options options
 * @property {string} localStorageKey Key in the local storage to store jwt to
 */
var defaults = {
  localStorageKey: '5cnasGf8fvJFB8WW2Uxrayc5'
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
  return function (response) {
    var _response$headers = response.headers,
        headers = _response$headers === void 0 ? {} : _response$headers;
    var xTokenCreate = headers['X-Token-Create'],
        xTokenUpdate = headers['X-Token-Update'],
        xTokenRemove = headers['X-Token-Remove'];

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


function createAuthManagerLink() {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  var values = _objectSpread({}, defaults, {
    options: options
  });

  return new _apolloLink.ApolloLink(function (operation, forward) {
    operation.setContext(function (_ref) {
      var _ref$headers = _ref.headers,
          headers = _ref$headers === void 0 ? {} : _ref$headers;
      return {
        headers: _objectSpread({}, headers, {
          authorization: localStorage.getItem(values.localStorageKey) || null
        })
      };
    });
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


function createWsParams() {
  return _createWsParams.apply(this, arguments);
}

function _createWsParams() {
  _createWsParams = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee() {
    var partialParams,
        options,
        values,
        _args = arguments;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            partialParams = _args.length > 0 && _args[0] !== undefined ? _args[0] : {};
            options = _args.length > 1 ? _args[1] : undefined;

            /* eslint-disable no-param-reassign */
            values = _objectSpread({}, defaults, {
              options: options
            });

            if (typeof partialParams === 'function') {
              partialParams = partialParams();
            }

            if (!(typeof partialParams.then === 'function')) {
              _context.next = 8;
              break;
            }

            _context.next = 7;
            return partialParams;

          case 7:
            partialParams = _context.sent;

          case 8:
            return _context.abrupt("return", _objectSpread({}, partialParams, {
              authorization: localStorage.getItem(values.localStorageKey) || null
            }));

          case 9:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));
  return _createWsParams.apply(this, arguments);
}

//# sourceMappingURL=index.js.map