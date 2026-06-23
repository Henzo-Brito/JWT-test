import { createRouter } from "../../lib/create-app";

import * as handler from "./auth.handlers"
import * as route from "./auth.route"

const auth = createRouter();

auth.openapi(route.registerRoute, handler.registerHandler);
auth.openapi(route.loginRoute, handler.loginHandler);
auth.openapi(route.refreshRoute, handler.refreshHandler);
auth.openapi(route.logoutRoute, handler.logoutHandler);
auth.openapi(route.meRoute, handler.meHandler);

export { auth as authRoute };