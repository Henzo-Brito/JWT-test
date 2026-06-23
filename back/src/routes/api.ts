import { createRouter } from "../lib/create-app";
import { authMiddleware } from "../middleware/authMiddleware";
import { authRoute } from "./auth/auth.r";
import { musicRoute } from "./music/music.route";

const api = createRouter()

api.route("/auth", authRoute)

api.use("/music/*", authMiddleware)

api.route("/music", musicRoute)

export {api as apiRoute}
