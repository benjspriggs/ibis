import { appHostname, hostname, port } from "./config";
import app from "./app";
app.listen(port, hostname, () => {
    console.log(`Listening on ${appHostname}`);
});

//# sourceMappingURL=index.js.map
