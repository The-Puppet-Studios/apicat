import { Application, Router, Context, RouterContext, Middleware, RouterMiddleware, Status } from "https://deno.land/x/oak@v17.0.0/mod.ts";

type State = Record<string, unknown>;

type MiddlewareFn = Middleware<State>;

type RouteHandler = RouterMiddleware<string>;

class ApiCat {
  private app: Application<State>;
  private router: Router<State>;

  constructor() {
    this.app = new Application<State>();
    this.router = new Router<State>();
  }

  use(middleware: MiddlewareFn) {
    this.app.use(middleware);
  }

  get(path: string, ...handlers: RouteHandler[]) {
    this.router.get(path, this.combineHandlers(handlers));
  }

  post(path: string, ...handlers: RouteHandler[]) {
    this.router.post(path, this.combineHandlers(handlers));
  }

  put(path: string, ...handlers: RouteHandler[]) {
    this.router.put(path, this.combineHandlers(handlers));
  }

  delete(path: string, ...handlers: RouteHandler[]) {
    this.router.delete(path, this.combineHandlers(handlers));
  }

  patch(path: string, ...handlers: RouteHandler[]) {
    this.router.patch(path, this.combineHandlers(handlers));
  }

  all(path: string, ...handlers: RouteHandler[]) {
    this.router.all(path, this.combineHandlers(handlers));
  }

  private combineHandlers(handlers: RouteHandler[]): RouteHandler {
    return async (context: RouterContext<string>, next) => {
      for (const handler of handlers) {
        await handler(context, next);
      }
    };
  }

  handleError(handler: (ctx: Context<State>, error: Error) => void) {
    this.app.use(async (ctx, next) => {
      try {
        await next();
      } catch (error) {
        handler(ctx, error);
      }
    });
  }

  validate(schema: Record<string, (value: string | null) => boolean>) {
    return async (ctx: Context<State>, next: () => Promise<void>) => {
      const validationErrors: string[] = [];
      for (const [key, validateFn] of Object.entries(schema)) {
        const paramValue = ctx.request.url.searchParams.get(key);
        if (!validateFn(paramValue)) {
          validationErrors.push(`Invalid value for ${key}`);
        }
      }

      if (validationErrors.length > 0) {
        ctx.response.status = Status.BadRequest;
        ctx.response.body = { errors: validationErrors };
        return;
      }
      await next();
    };
  }

  getQueryParams(ctx: Context<State>): Record<string, string | null> {
    const params: Record<string, string | null> = {};
    ctx.request.url.searchParams.forEach((value, key) => {
      params[key] = value;
    });
    return params;
  }

  setResponseHeaders(headers: Record<string, string>) {
    this.app.use((ctx, next) => {
      Object.entries(headers).forEach(([key, value]) => {
        ctx.response.headers.set(key, value);
      });
      return next();
    });
  }

  cors(options: {
    origin?: string | string[];
    methods?: string[];
    allowedHeaders?: string[];
    exposedHeaders?: string[];
    credentials?: boolean;
    maxAge?: number;
  } = {}) {
    const defaultOptions = {
      origin: "*",
      methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
      allowedHeaders: [],
      exposedHeaders: [],
      credentials: false,
      maxAge: 5,
    };

    const corsOptions = { ...defaultOptions, ...options };

    return async (ctx: Context<State>, next: () => Promise<void>) => {
      const requestOrigin = ctx.request.headers.get("Origin");

      if (!requestOrigin) {
        await next();
        return;
      }

      const origin = typeof corsOptions.origin === "string"
        ? corsOptions.origin
        : corsOptions.origin.includes(requestOrigin)
        ? requestOrigin
        : "";

      if (!origin) {
        ctx.throw(Status.Forbidden, "Not allowed by CORS");
      }

      ctx.response.headers.set("Access-Control-Allow-Origin", origin);
      ctx.response.headers.set(
        "Access-Control-Allow-Methods",
        corsOptions.methods.join(", ")
      );

      if (corsOptions.allowedHeaders.length) {
        ctx.response.headers.set(
          "Access-Control-Allow-Headers",
          corsOptions.allowedHeaders.join(", ")
        );
      }

      if (corsOptions.exposedHeaders.length) {
        ctx.response.headers.set(
          "Access-Control-Expose-Headers",
          corsOptions.exposedHeaders.join(", ")
        );
      }

      if (corsOptions.credentials) {
        ctx.response.headers.set("Access-Control-Allow-Credentials", "true");
      }

      ctx.response.headers.set(
        "Access-Control-Max-Age",
        corsOptions.maxAge.toString()
      );

      if (ctx.request.method === "OPTIONS") {
        ctx.response.status = Status.NoContent;
        return;
      }

      await next();
    };
  }

  static(root: string) {
    return async (ctx: Context<State>, next: () => Promise<void>) => {
      try {
        await ctx.send({ root });
      } catch {
        await next();
      }
    };
  }

  listen(port: number) {
    this.app.use(this.router.routes());
    this.app.use(this.router.allowedMethods());
    console.log(`Server running at http://localhost:${port}`);
    return this.app.listen({ port });
  }
}

export { ApiCat };