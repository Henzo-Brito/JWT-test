import { createRoute } from "@hono/zod-openapi";
import { createRouter } from "../../lib/create-app";
import { jsonContent } from "stoker/openapi/helpers";
import * as HttpStatusCode from "stoker/http-status-codes";

import z from "zod"

const music = createRouter();

const musicRoute = createRoute({
    method: "get",
    path: "/music",
    responses:{
        [HttpStatusCode.OK]: jsonContent(
            z.object({
                musicId: z.string().max(255) ,
                name: z.string().max(255)
			}),
            "JWT token"
        ) 
    },
    request:{
        body: jsonContent(
            z.object({
                musicId: z.string().max(255)    
            }),
            "Login Payload"
        )
    },
    tags: ["Auth"]
})

music.openapi(musicRoute, async c => {
    const {musicId} = c.req.valid("json")

    const music = {
        musicId: musicId,
        name: "Henzo"
    }

    return c.json(music, HttpStatusCode.OK)
})


export {music as musicRoute}
