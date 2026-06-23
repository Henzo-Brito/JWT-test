import type { App } from ".."
import { Scalar } from '@scalar/hono-api-reference'

export function setDocumentation(app: App) {
    app.doc("/doc", {
        openapi: "3.0.0",
        info:{
            title: "Teste JWT",
            version: "1.0.0"
        }
    })

    app.get("/scalar", Scalar({
        url: "/doc",
        theme: "kepler",
        layout: "classic",
    }))
}