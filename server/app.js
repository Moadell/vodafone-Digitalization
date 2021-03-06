const bodyParser = require("body-parser");
const express = require("express");
const session = require("express-session");
const morgan = require("morgan");
const path = require("path");

var cors = require("cors");

const { configureAuth } = require("./middlewares/authentication");

const infoRouterFactory = require("./routes/info");
const loginRouterFactory = require("./routes/login");
const usersRouterFactory = require('./routes/users');
const resignationsRouterFactory = require('./routes/resignations');
const formResRouterFactory = require("./routes/form-res");

const appFactory = (db, sessionStoreProvider) => {
  const app = express();
  const API_ROOT_PATH = "/api";
  app.use(
    express.json({
      limit: "50mb"
    })
  );
  app.use(morgan("dev"));

  app.use(
    bodyParser.urlencoded({
      limit: "50mb",
      parameterLimit: 1000 * 1000 * 50,
      extended: true
    })
  );

  app.use(bodyParser.json({ limit: "50mb" }));
  app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept"
    );
    next();
  });
  const sessionSettings = {
    cookie: {},
    resave: false,
    saveUninitialized: true,
    secret: "randomsecret" || process.env.SESSION_SECRET,
    store: sessionStoreProvider(session)
  };

  if (app.get("env") === "production") {
    app.enable("trust proxy");
    sessionSettings.cookie.secure = true;
    app.use("*", httpsOnly);
  }

  app.use(session(sessionSettings));

  configureAuth(app, db);

  app.use(`${API_ROOT_PATH}/info`, infoRouterFactory(db));
  app.use(`${API_ROOT_PATH}/login`, loginRouterFactory());
  app.use(`${API_ROOT_PATH}/resignations`, resignationsRouterFactory(db));
  app.use(`${API_ROOT_PATH}/users`, usersRouterFactory(db));
  app.use(`${API_ROOT_PATH}/form`, formResRouterFactory(db));

  app.use(express.static(path.join(__dirname, "static")));

  app.get("*", (req, res, next) => {
    if (req.url.startsWith(API_ROOT_PATH)) {
      return next();
    }
    res.sendFile(path.join(__dirname, "static/index.html"));
  });
  app.use(cors());

  return app;
};

const httpsOnly = (req, res, next) => {
  if (!req.secure) {
    return res.redirect(301, `https://${req.headers.host}${req.originalUrl}`);
  }
  next();
};

module.exports = appFactory;
