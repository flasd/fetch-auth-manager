import jsonWebToken from 'jsonwebtoken';

function getDefaults() {
  if (!process.env.JWT_SECRET) {
    throw new ReferenceError('[fetch-auth-manager] Please set a JWT_SECRET environment variable!');
  }

  return {
    secret: process.env.JWT_SECRET,
    lifetime: process.env.JWT_LIFETIME || 259200,
  };
}

const defaults = getDefaults();

function createToken(tokenData, options = {}) {
  const payload = {
    ...tokenData,
  };

  delete payload.iat;
  delete payload.exp;

  return `Bearer ${
    jsonWebToken.sign(
      payload,
      options.secret,
      {
        expiresIn: `${options.lifetime} seconds`,
      },
    )
  }`;
}

function verifyAndDecode(token, options) {
  try {
    return jsonWebToken.verify(token, options.secret);
  } catch (error) {
    return null;
  }
}

export function authenticate(response, tokenData, userOptions) {
  const options = {
    ...defaults,
    ...userOptions,
  };
  response.header('X-Token-Set', createToken(tokenData, options));
}

export function deauthenticate(response) {
  response.header('X-Token-Unset', 'true');
}

export function manageAuth(userOptions) {
  const options = {
    ...defaults,
    ...userOptions,
  };

  return (request, response, next) => {
    const {
      headers: {
        authorization,
        Authorization,
      },
    } = request;

    request.user = verifyAndDecode(authorization || Authorization, options);

    next();
  };
}

export const exposeHeaders = ['X-Token-Set', 'X-Token-Unset'];

export function decodedWsParams(userOptions, userOnConnect) {
  const options = {
    ...defaults,
    ...userOptions,
  };

  return (params, ...rest) => {
    const { Authorization, authorization } = params;

    const withAuthParams = {
      user: verifyAndDecode(authorization || Authorization, options),
    };

    return typeof userOnConnect === 'function'
      ? userOnConnect(withAuthParams, ...rest)
      : withAuthParams;
  };
}
