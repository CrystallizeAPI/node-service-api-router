# Node Service API Router

This is the entry point of your Service API when you decide to use this library.

## Installation

With NPM:

```bash
npm install @crystallize/node-service-api-router
```

With Yarn:

```bash
yarn add @crystallize/node-service-api-router
```

## Usage

Here is what a valid _index.ts_ would look like with only one endpoint.

```typescript
import {
    createServiceApiApp,
    ValidatingRequestRouting,
    StandardRouting,
    authenticatedMiddleware,
} from '@crystallize/node-service-api-router';
import Koa from 'koa';
const routes: StandardRouting = {
    '/': {
        get: {
            handler: async (ctx: Koa.Context) => {
                ctx.body = { msg: `Crystallize Service API - Tenant ${process.env.CRYSTALLIZE_TENANT_IDENTIFIER}` };
            },
        },
    },
};
const bodyConvertedRoutes: ValidatingRequestRouting = {};
const { run } = createServiceApiApp(bodyConvertedRoutes, routes, authenticatedMiddleware(`${process.env.JWT_SECRET}`));
run(process.env.PORT ? parseInt(process.env.PORT) : 3000);
```

This is using [Koa JS](https://koajs.com/) for the Middleware management.

Note: CORS is managed in this library.

## StandardRouting

Standard routes are standard by definition, nothing specific to understand. You get access to the request (and more) through the Koa.Context and you need to set the Body. (alias of _ctx.response.body_)

## ValidatingRequestRouting

This is where this library takes all its meaning. It does not provide any features by itself, but it enables a concept.

```typescript
const bodyConvertedRoutes: ValidatingRequestRouting = {
    '/my/endpoint': {
        post: {
            schema: requestInputSchema,
            handler: requestInputHandler,
            args: (context: any) => {};
        }
    }
}
```

It means on the `'/my/endpoint'` endpoint, the API Router will intercept the request, check and validate the entry against requestInputSchema, run the `args` function to get handler’s arguments to finally execute the handler when it validates.

But the response is not returned yet, so you can still extend it in the standard routes:

```typescript
const routes: StandardRouting = {
    '/cart': {
        post: {
            handler: async (ctx: Koa.Context) => {
                const cart = ctx.body as Cart;
                ctx.body = {
                    ...cart,
                    hello: 'world',
                };
            },
        },
    },
};
const bodyConvertedRoutes: ValidatingRequestRouting = {
    '/cart': {
        post: {
            schema: cartPayload,
            handler: handleCartRequestPayload,
            args: (context: Koa.Context): any => {},
        },
    },
};
```

With this code, if the Request validates against _cartRequest_, the body of the request will be converted to a Cart. And the standard route can still do whatever it wants, knowing the _ctx.body_ is a Cart. In this example, we add a property to the response.

## Why

This enables the next library: [Node Service API Request Handlers](https://crystallize.com/learn/open-source/sdks-and-libraries/node-service-api-request-handlers) which provides many highly customizable schemas and handlers (like the Cart mentioned above) so you can get started in minutes and you can extend them to make your Service API yours!

## Authentification

Library comes with a default Authentication middleware. For each route that you describe, you have a boolean attribute named `authenticated` which is by default set to `false`.

```typescript
'/echo': {
    post: {
        handler: async (ctx: Koa.Context) => {
            ctx.body = {
                echoed: ctx.request.body
            }
        }
    }
},
'/authenticated/echo': {
    post: {
        authenticated: true,
        handler: async (ctx: Koa.Context) => {
            ctx.body = {
                echoed: ctx.request.body,
                user: ctx.user
            }
        }
    }
},
```

In this example `/authenticated/echo` will be accessible with a valid authentication.

### How does that work?

First, the middleware is passed to the router via Dependency Injection, therefore you can also provide your own.

```javascript
const { run, router } = createServiceApiApp(
    bodyConvertedRoutes,
    routes,
    authenticatedMiddleware(`${process.env.JWT_SECRET}`),
);
```

The [authenticatedMiddleware provided by the library is simple](https://github.com/CrystallizeAPI/libraries/blob/main/components/node-service-api-router/src/core/middlewares.ts#L14):

-   it will check the existence of a cookie name: **jwt**
-   if that cookie exists, then it will decode it and check its signature. (That’s why you pass the _JWT_SECRET_)
-   and it will check the `sub` property of the payload to be: _isLoggedInOnServiceApiToken_

Note: The last check is to be consistent with the provided [MagickLink feature](https://github.com/CrystallizeAPI/libraries/blob/main/components/node-service-api-request-handlers/src/magicklink/handlers.ts#L31).

If one of the checks fails, the router will return a 401 error.

Once again, all is extendable. You may or may not use the **authenticatedMiddleware** and you can certainly pass your own to do your own logic.

[crystallizeobject]: crystallize_marketing|folder|62561a1ab30ff82a1f664931
