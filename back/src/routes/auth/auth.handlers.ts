import { RouteHandler } from "@hono/zod-openapi";
import { eq } from "drizzle-orm";
import * as route from "./auth.route";
import { db } from "../../db/index";
import { users, refreshTokens } from "../../db/schema";
import { signAccessToken, signRefreshToken, verifyToken } from "../../lib/jwt";

async function hashPassword(password: string): Promise<string> {
	const data = new TextEncoder().encode(password);
	const hash = await crypto.subtle.digest("SHA-256", data);
	return Buffer.from(hash).toString("hex");
}

export const registerHandler: RouteHandler<typeof route.registerRoute> = async (c) => {
	const { name, email, password } = c.req.valid("json");

	const existing = await db.select().from(users).where(eq(users.email, email)).limit(1);
	if (existing.length > 0) {
		return c.json({ message: "Email já cadastrado." }, 409);
	}

	const passwordHash = await hashPassword(password);
	await db.insert(users).values({ name, email, passwordHash });

	return c.json({ message: "Usuário criado com sucesso." }, 201);
};

export const loginHandler: RouteHandler<typeof route.loginRoute> = async (c) => {
	const { email, password } = c.req.valid("json");

	const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
	const user = result[0];

	if (!user) {
		return c.json({ message: "Email ou senha inválidos." }, 401);
	}

	const passwordHash = await hashPassword(password);
	if (user.passwordHash !== passwordHash) {
		return c.json({ message: "Email ou senha inválidos." }, 401);
	}

	const accessToken = await signAccessToken(user.id);
	const refreshToken = await signRefreshToken(user.id);

	const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
	await db.insert(refreshTokens).values({ userId: user.id, token: refreshToken, expiresAt });

	c.header("Set-Cookie", `refreshToken=${refreshToken}; HttpOnly; Path=/; SameSite=Strict; Max-Age=604800`);

	return c.json({ accessToken }, 200);
};

export const refreshHandler: RouteHandler<typeof route.refreshRoute> = async (c) => {
	const { refreshToken } = c.req.valid("json");

	const result = await db.select().from(refreshTokens).where(eq(refreshTokens.token, refreshToken)).limit(1);
	const stored = result[0];

	if (!stored || stored.expiresAt < new Date()) {
		if (stored) {
			await db.delete(refreshTokens).where(eq(refreshTokens.token, refreshToken));
		}
		return c.json({ message: "Refresh token inválido ou expirado." }, 401);
	}

	try {
		const payload = await verifyToken(refreshToken);
		if (payload.type !== "refresh") {
			return c.json({ message: "Token inválido." }, 401);
		}

		const accessToken = await signAccessToken(Number(payload.sub));
		return c.json({ accessToken }, 200);
	} catch {
		await db.delete(refreshTokens).where(eq(refreshTokens.token, refreshToken));
		return c.json({ message: "Refresh token expirado." }, 401);
	}
};

export const logoutHandler: RouteHandler<typeof route.logoutRoute> = async (c) => {
	const body = c.req.valid("json");
	const refreshToken = body?.refreshToken;

	if (refreshToken) {
		await db.delete(refreshTokens).where(eq(refreshTokens.token, refreshToken));
	}

	c.header("Set-Cookie", "refreshToken=; HttpOnly; Path=/; SameSite=Strict; Max-Age=0");

	return c.json({ message: "Logout realizado com sucesso." }, 200);
};

export const meHandler: RouteHandler<typeof route.meRoute> = async (c) => {
	const authHeader = c.req.header("Authorization");

	if (!authHeader?.startsWith("Bearer ")) {
		return c.json({ message: "Token não fornecido." }, 401);
	}

	const token = authHeader.split(" ")[1];

	try {
		const payload = await verifyToken(token);

		const result = await db.select().from(users).where(eq(users.id, Number(payload.sub))).limit(1);
		const user = result[0];

		if (!user) {
			return c.json({ message: "Usuário não encontrado." }, 401);
		}

		return c.json({ id: user.id, name: user.name, email: user.email }, 200);
	} catch {
		return c.json({ message: "Token inválido ou expirado." }, 401);
	}
};
