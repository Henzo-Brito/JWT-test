import { setDocumentation } from './lib/app.documentation'
import { createApp } from './lib/create-app'
import { apiRoute } from './routes/api'

const app = createApp()

setDocumentation(app)

app.route("/api", apiRoute)

export {app}