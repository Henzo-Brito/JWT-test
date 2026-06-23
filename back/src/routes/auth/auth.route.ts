import { createRoute } from "@hono/zod-openapi";
import { jsonContent } from "stoker/openapi/helpers";
import * as HttpStatusCode from "stoker/http-status-codes";
import z from "zod";

const ErrorSchema = z.object({ message: z.string() });
const TokenSchema = z.object({ accessToken: z.string() });
const UserSchema = z.object({
	id: z.number(),
	name: z.string(),
	email: z.string(),
});

export const registerRoute = createRoute({
	method: "post",
	path: "/register",
	tags: ["Auth"],
	request: {
		body: jsonContent(
			z.object({
				name: z.string().min(3),
				email: z.string().min(1),
				password: z.string().min(8),
			}),
			"Register payload",
		),
	},
	responses: {
		[HttpStatusCode.CREATED]: jsonContent(z.object({ message: z.string() }), "Usuário criado com sucesso"),
		[HttpStatusCode.CONFLICT]: jsonContent(ErrorSchema, "Email já cadastrado"),
		[HttpStatusCode.UNPROCESSABLE_ENTITY]: jsonContent(ErrorSchema, "Dados inválidos"),
	},
});

export const loginRoute = createRoute({
	method: "post",
	path: "/login",
	tags: ["Auth"],
	request: {
		body: jsonContent(
			z.object({
				email: z.string().min(1),
				password: z.string().min(8),
			}),
			"Login payload",
		),
	},
	responses: {
		[HttpStatusCode.OK]: jsonContent(TokenSchema, "JWT token de acesso"),
		[HttpStatusCode.UNAUTHORIZED]: jsonContent(ErrorSchema, "Credenciais inválidas"),
		[HttpStatusCode.UNPROCESSABLE_ENTITY]: jsonContent(ErrorSchema, "Dados inválidos"),
	},
});

export const refreshRoute = createRoute({
	method: "post",
	path: "/refresh",
	tags: ["Auth"],
	request: {
		body: jsonContent(
			z.object({ refreshToken: z.string() }),
			"Refresh token payload",
		),
	},
	responses: {
		[HttpStatusCode.OK]: jsonContent(TokenSchema, "Novo access token"),
		[HttpStatusCode.UNAUTHORIZED]: jsonContent(ErrorSchema, "Refresh token inválido ou expirado"),
	},
});

export const logoutRoute = createRoute({
	method: "post",
	path: "/logout",
	tags: ["Auth"],
	request: {
		body: jsonContent(
			z.object({ refreshToken: z.string().optional() }),
			"Refresh token para invalidar",
		),
	},
	responses: {
		[HttpStatusCode.OK]: jsonContent(z.object({ message: z.string() }), "Logout realizado"),
	},
});

export const meRoute = createRoute({
	method: "get",
	path: "/me",
	tags: ["Auth"],
	security: [{ bearerAuth: [] }],
	responses: {
		[HttpStatusCode.OK]: jsonContent(UserSchema, "Dados do usuário logado"),
		[HttpStatusCode.UNAUTHORIZED]: jsonContent(ErrorSchema, "Token ausente ou inválido"),
	},
});
