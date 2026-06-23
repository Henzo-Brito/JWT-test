import { MiddlewareHandler } from "hono";
import { verifyToken } from "../lib/jwt";

export const authMiddleware: MiddlewareHandler = async (c, next) => {
	const authHeader = c.req.header("Authorization");

	if (!authHeader?.startsWith("Bearer ")) {
		return c.json({ message: "Token não fornecido." }, 401);
	}

	const token = authHeader.split(" ")[1];

	try {
		const payload = await verifyToken(token);
		c.set("user", payload);
		await next();
	} catch {
		return c.json({ message: "Token inválido ou expirado." }, 401);
	}
};
