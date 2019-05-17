const express = require("express");
const app = express();
const routeConfig = require("./config/route-config.js");
const appConfig = require("./config/main-config.js");
app.use("/css",express.static(__dirname + "/css"));
appConfig.init(app,express);
routeConfig.init(app, express);

module.exports = app;
