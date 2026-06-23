import { OpenAPIHono } from "@hono/zod-openapi";
import { notFound, onError, serveEmojiFavicon } from "stoker/middlewares";
import { cors } from "hono/cors";
import { defaultHook } from "stoker/openapi";

export function createApp() {
	const app = new OpenAPIHono({ defaultHook });

	app.onError(onError);
	app.notFound(notFound);
	app.use(serveEmojiFavicon("🔥"));
	app.use("*", cors());

	return app;
}

export function createRouter() {
	return new OpenAPIHono();
}
