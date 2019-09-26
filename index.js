"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.setLocalStorageKey = setLocalStorageKey;
exports.getLocalStorageKey = getLocalStorageKey;
exports.logout = logout;
exports.createAuthManagerLink = createAuthManagerLink;
exports.createWsParams = createWsParams;
exports.withAuth = withAuth;
exports.AuthConsumer = exports.AuthProvider = void 0;

var _apolloLink = require("apollo-link");

var _react = _interopRequireDefault(require("react"));

var _jwtDecode = _interopRequireDefault(require("jwt-decode"));

var _hoistNonReactStatics = _interopRequireDefault(require("hoist-non-react-statics"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function decode(raw) {
  try {
    return (0, _jwtDecode.default)(raw);
  } catch (error) {
    return null;
  }
}

var subscribers = [];
var localStorageKey = 'CHANGE_THIS_VALUE';

if (process.env.NODE_ENV === 'production') {
  localStorageKey = '789519fa69a45c83c7e0b1e350c81000945ac366';
}

function setLocalStorageKey(value) {
  localStorageKey = value;
}

function getLocalStorageKey() {
  return localStorageKey;
}

function logout() {
  localStorage.removeItem(localStorageKey);
  subscribers.forEach(function (s) {
    return s(null);
  });
}
/**
 * @typedef {Function} GraphQlLinkMiddleware handles graphql http response
 * @property {Object} GraphQlResponse in the local storage to store jwt to
 * @property {Object} GraphQlResponse.headers Server response headers
 */
// /**
//  * @function handleResponse
//  * @private
//  * @param  {Options} values Config values
//  * @return {GraphQlLinkMiddleware} Function that handles the response
//  */
// function handleResponse(response) {
//   const { headers = {} } = response;
//   const {
//     'X-Token-Create': xTokenCreate,
//     'X-Token-Update': xTokenUpdate,
//     'X-Token-Remove': xTokenRemove,
//   } = headers;
//   if (xTokenCreate || xTokenUpdate) {
//     localStorage.setItem(localStorageKey, xTokenCreate || xTokenUpdate);
//     subscribers.forEach((s) => s(decode(`${xTokenCreate || xTokenUpdate}`
//       .replace('Bearer ', ''))));
//   }
//   if (xTokenRemove) {
//     localStorage.removeItem(localStorageKey);
//     subscribers.forEach((s) => s(null));
//   }
//   return response;
// }

/**
 * @function createAuthManagerLink
 * @param  {type} options {description}
 * @return {GraphLink} Returns a manager link
 */


function createAuthManagerLink() {
  if (localStorageKey === 'CHANGE_THIS_VALUE' && process.env.NODE_ENV === 'development') {
    // eslint-disable-next-line no-console
    console.warn('Please update the localStorageKey by calling setLocalStorageKey(yourKey)');
  }

  return new _apolloLink.ApolloLink(function (operation, forward) {
    operation.setContext(function (_ref) {
      var _ref$headers = _ref.headers,
          headers = _ref$headers === void 0 ? {} : _ref$headers;
      return {
        headers: _objectSpread({}, headers, {
          authorization: localStorage.getItem(localStorageKey) || null
        })
      };
    });
    return forward(operation).map(function (response) {
      var _operation$getContext = operation.getContext(),
          headers = _operation$getContext.response.headers;

      var xTokenCreate = headers.get('X-Token-Create');
      var xTokenUpdate = headers.get('X-Token-Update');
      var xTokenRemove = headers.get('X-Token-Remove');

      if (xTokenCreate || xTokenUpdate) {
        localStorage.setItem(localStorageKey, xTokenCreate || xTokenUpdate);
        subscribers.forEach(function (s) {
          return s(decode("".concat(xTokenCreate || xTokenUpdate).replace('Bearer ', '')));
        });
      }

      if (xTokenRemove) {
        localStorage.removeItem(localStorageKey);
        subscribers.forEach(function (s) {
          return s(null);
        });
      }

      return response;
    });
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
        _args = arguments;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            partialParams = _args.length > 0 && _args[0] !== undefined ? _args[0] : {};

            /* eslint-disable no-param-reassign */
            if (typeof partialParams === 'function') {
              partialParams = partialParams();
            }

            if (!(typeof partialParams.then === 'function')) {
              _context.next = 6;
              break;
            }

            _context.next = 5;
            return partialParams;

          case 5:
            partialParams = _context.sent;

          case 6:
            return _context.abrupt("return", _objectSpread({}, partialParams, {
              authorization: localStorage.getItem(localStorageKey) || null
            }));

          case 7:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));
  return _createWsParams.apply(this, arguments);
}

var AuthContext = _react.default.createContext();

var AuthProvider =
/*#__PURE__*/
function (_React$Component) {
  _inherits(AuthProvider, _React$Component);

  function AuthProvider(props) {
    var _this;

    _classCallCheck(this, AuthProvider);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(AuthProvider).call(this, props));
    var decoded = decode(localStorage.getItem(localStorageKey));
    _this.state = {
      hasAuth: !!decoded,
      user: decoded
    };
    _this.handleUpdate = _this.handleUpdate.bind(_assertThisInitialized(_this));
    return _this;
  }

  _createClass(AuthProvider, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      subscribers.push(this.handleUpdate);
    }
  }, {
    key: "handleUpdate",
    value: function handleUpdate(decoded) {
      var _this2 = this;

      if (this.timeout) {
        clearTimeout(this.timeout);
        this.timeout = null;
      }

      if (decoded) {
        var exp = decoded.exp;
        var now = Math.round(Date.now() / 1000);
        var diff = exp - now;

        if (diff <= 0) {
          this.handleUpdate(null);
          return;
        }

        if (diff > 0 && diff < 3600) {
          setTimeout(function () {
            return _this2.handleUpdate(null);
          }, diff * 1000);
        }

        this.setState({
          hasAuth: true,
          user: decoded
        });
        return;
      }

      localStorage.removeItem(localStorageKey);
      this.setState({
        hasAuth: false,
        user: null
      });
    }
  }, {
    key: "render",
    value: function render() {
      var _this$state = this.state,
          hasAuth = _this$state.hasAuth,
          user = _this$state.user;
      var children = this.props.children;

      if (!hasAuth) {
        localStorage.removeItem(localStorageKey);
      }

      return _react.default.createElement(AuthContext.Provider, {
        value: {
          hasAuth: hasAuth,
          user: user
        }
      }, children);
    }
  }]);

  return AuthProvider;
}(_react.default.Component);

exports.AuthProvider = AuthProvider;
var AuthConsumer = AuthContext.Consumer;
exports.AuthConsumer = AuthConsumer;

function withAuth(UserComponent) {
  function CustomComponent(props) {
    return _react.default.createElement(AuthConsumer, {}, // eslint-disable-next-line prefer-arrow-callback
    function renderer(values) {
      return _react.default.createElement(UserComponent, _objectSpread({}, props, {}, values));
    });
  }

  (0, _hoistNonReactStatics.default)(CustomComponent, UserComponent);
  CustomComponent.displayName = "withAuth(".concat(UserComponent.displayName || UserComponent.name, ")");
  return CustomComponent;
}

//# sourceMappingURL=index.js.map