export const port = parseInt(process.env["PORT"]) || 8080
export const hostname = process.env["HOSTNAME"] || "localhost"
export const appHostname = `http://${hostname}:${port}`
