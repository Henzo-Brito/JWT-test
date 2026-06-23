import { SignJWT, jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(process.env.JWT_SIGNATURE ?? "my-super-secret");

const ACCESS_TTL = "15m";
const REFRESH_TTL = "7d";

export async function signAccessToken(userId: number): Promise<string> {
	return new SignJWT({ sub: String(userId) })
		.setProtectedHeader({ alg: "HS256" })
		.setIssuedAt()
		.setExpirationTime(ACCESS_TTL)
		.sign(SECRET);
}

export async function signRefreshToken(userId: number): Promise<string> {
	return new SignJWT({ sub: String(userId), type: "refresh" })
		.setProtectedHeader({ alg: "HS256" })
		.setIssuedAt()
		.setExpirationTime(REFRESH_TTL)
		.sign(SECRET);
}

export async function verifyToken(token: string): Promise<{ sub: string; type?: string }> {
	const { payload } = await jwtVerify(token, SECRET);
	return payload as { sub: string; type?: string };
}
