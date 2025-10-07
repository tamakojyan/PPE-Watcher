"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
console.log("JWT_SECRET >>>", process.env.JWT_SECRET);
const app_1 = require("./app");
const app = (0, app_1.buildApp)();
const port = Number(process.env.PORT || 3000);
app.listen({ host: '0.0.0.0', port }).then(() => app.log.info(`API listening on :${port}`)).catch((err) => {
    app.log.error(err);
    process.exit(1);
});
