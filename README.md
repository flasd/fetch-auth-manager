# fetch-auth-manager

Manage authentication in a stateless and simple manner, both in NodeJs and React, using Axios or GraphQL as transporters.

## Usage

Install the latest version of fetch-auth-manager:

```
yarn add fetch-auth-manager

// or
npm install fetch-auth-manager
```

### NodeJs

Inside NodeJs, you have access to three functions:

```javascript
const {
  manageAuth,
  authenticate,
  deauthenticate
} = "fetch-auth-manager/server";
```

#### manageAuth(options): ExpressMiddleware

The `manageAuth` function returns a middleware that verifies the authorization header using the `JWT_SECRET` environment variable and injects the decoded payload in `req.user`. If there is no token, this will simply set `req.user` to `null`. **It's up to you to disallow unauthenticated requests!**

Usage:

```javascript
const app = require("express")();
const { manageAuth } = require("fetch-auth-manager/server");

const authManager = manageAuth({ secret: process.env.JWT_SECRET });

app.use(authManager);
```

#### authenticate(response, tokenData, options)

The `authenticate` function expects the Express Response object, any data you want present inside the token and some options. Call it when you want to set or update the user's JWT token.

```javascript
const { authenticate } = require("fetch-auth-manager/server");

const options = {
  secret: process.env.JWT_SECRET, // default
  lifespan: process.env.JWT_LIFESPAN // jwt ttl in seconds
};

function loginController(req, res) {
  // your login logic
  authenticate(res, { subject: "userId goes here" }, options);
}
```

#### deauthenticate(response)

The `deauthenticate` function expects the Express Response object. It will remove the user's token.

```javascript
const { deauthenticate } = require("fetch-auth-manager/server");

function logoutController(req, res) {
  // your logout logic
  deauthenticate(res);
}
```

### Browser

#### Utility methods

You can call these functions anywhere in your code to control/get auth state:

```javascript
import { logout, hasAuth, subscribe } from "fetch-auth-manager";
```

##### logout()

Will log the user out and update all connected providers.

##### hasAuth()

Returns a boolean value telling if the user has auth.

##### subscribe(fn): unsubscribeFn

Registers a callback that will get called everytime the auth state changes. This function returns a unsubscribe function that cancels the subscription when called.

#### React

At or near the root of your application, apply the `AuthProvider` component.

```javascript
import { AuthProvider } from 'fetch-auth-manager';

default function App(props) {
	return (
		<AuthProvider>
			<YourApp />
		</AuthProvider>
	);
}
```

Then, whenever you need access to auth state, decorate any component with the `withAuth` HOC.

```javascript
import { withAuth } from "fetch-auth-manager";

function AnyComponent({ hasAuth, decoded }) {
  // hasAuth is a boolean flag
  // decoded contains all the token payload
  return <div />;
}

export default withAuth(AnyComponent);
```

### Transports

Transports are interfaces that connect the frontend code with the server. There are two transports, GraphQL and Axios.

#### GraphQL

The GraphQL transport has support for both `http` and `ws` links.

##### Http Transport

```javascript
import { ApolloClient } from "apollo-client";
import { ApolloLink } from "apollo-link";
import { createHttpLink } from "apollo-link-http";
import { authHttpLink } from "fetch-auth-manager/dist/link";

const httpLink = createHttpLink({
  uri: "https://backend.com/graphql",
  credentials: "include",
  fetchOptions: {
    credentials: "include"
  }
});

export const client = new ApolloClient({
  link: ApolloLink.from([authHttpLink, httpLink])
});
```

##### WS Transport

To use the WS transport, you need to prepare your backend. In your Apollo Setup:

```javascript
const { parseWSAuth } from 'fetch-auth-manager/server';

const apolloServer = new ApolloServer({
	// ...your Config
	subscriptions: {
		onConnect: parseWSAuth(options, (params, ws, context) => {
			// this function is optional
			// params.user has the decoded token
		})
	}
})
```

Then, just decorate the WSLink options

```javascript
import { ApolloClient } from "apollo-client";
import { WebSocketLink } from "apollo-link-ws";
import { withWSAuth } from "fetch-auth-manager/dist/link";

const wsLink = new WebSocketLink({
  uri: "ws://backend.com/graphql",
  options: withWSAuth({
    /* your options */
  })
});

export const client = new ApolloClient({
  link: wsLink
});
```

#### Axios

To use the Axios transport, add the interceptors to your Axios instance.

```javascript
import Axios from "axios";
import {
  onRequest,
  onResponse,
  onResponseError
} from "fetch-auth-manager/interceptors";

const axios = Axios.create();

axios.interceptors.request.use(onRequest);
axios.interceptors.response.use(onResponse, onResponseError);
```

## Copyright e Licença

Copyright (c) 2019 [Marcel de Oliveira Coelho](https://github.com/husscode) sob a [Licença MIT](https://github.com/husscode/cpf-check/blob/master/LICENSE.md). Go Crazy. :rocket:
