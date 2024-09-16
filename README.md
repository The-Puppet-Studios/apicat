# ApiCat Web Framework Documentation

ApiCat is a lightweight api web framework built on top of Deno. It provides a simple and intuitive API for creating web applications with features like routing, middleware support, error handling, and more.

## Table of Contents

1. [Installation](#installation)
2. [Basic Usage](#basic-usage)
3. [API Reference](#api-reference)
   - [Constructor](#constructor)
   - [Routing Methods](#routing-methods)
   - [Middleware](#middleware)
   - [Error Handling](#error-handling)
   - [Request Validation](#request-validation)
   - [Query Parameters](#query-parameters)
   - [Response Headers](#response-headers)
   - [CORS](#cors)
   - [Static File Serving](#static-file-serving)
   - [Starting the Server](#starting-the-server)

## Installation

To use ApiCat in your Deno project, you need to import it from your project file:

```typescript
import { ApiCat } from "./path/to/ApiCat.ts";
```

Make sure you have Deno installed and the Oak dependency is available.

## Basic Usage

Here's a simple example of how to use ApiCat:

```typescript
import { ApiCat } from "./ApiCat.ts";

const app = new ApiCat();

app.get("/", (ctx) => {
  ctx.response.body = "Hello, ApiCat!";
});

app.listen(8000);
```

## API Reference

### Constructor

```typescript
new ApiCat()
```

Creates a new instance of the ApiCat application.

### Routing Methods

ApiCat provides methods for different HTTP verbs:

- `get(path: string, ...handlers: RouteHandler[])`
- `post(path: string, ...handlers: RouteHandler[])`
- `put(path: string, ...handlers: RouteHandler[])`
- `delete(path: string, ...handlers: RouteHandler[])`
- `patch(path: string, ...handlers: RouteHandler[])`
- `all(path: string, ...handlers: RouteHandler[])`

Each method takes a path and one or more handler functions.

### Middleware

```typescript
use(middleware: MiddlewareFn)
```

Adds middleware to the application.

### Error Handling

```typescript
handleError(handler: (ctx: Context<State>, error: Error) => void)
```

Sets up a global error handler for the application.

### Request Validation

```typescript
validate(schema: Record<string, (value: string | null) => boolean>)
```

Creates a middleware for validating request parameters based on the provided schema.

### Query Parameters

```typescript
getQueryParams(ctx: Context<State>): Record<string, string | null>
```

Retrieves all query parameters from the request.

### Response Headers

```typescript
setResponseHeaders(headers: Record<string, string>)
```

Sets global response headers for all routes.

### CORS

```typescript
cors(options: CorsOptions = {})
```

Creates a middleware for handling Cross-Origin Resource Sharing (CORS).

### Static File Serving

```typescript
static(root: string)
```

Creates a middleware for serving static files from a specified directory.

### Starting the Server

```typescript
listen(port: number)
```

Starts the server on the specified port.

## License

This project is licensed under the MIT License.