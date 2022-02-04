const express = require("express");

// Middleware imports
const cors = require("cors");
const compression = require("compression");
const helmet = require("helmet");
var morgan = require("morgan");

// Data source imports
var mongoose = require("mongoose");
var redis = require("redis");

// Misc imports
const bluebird = require("bluebird");
var twilio = require("twilio");
require = require("esm")(module);
require("dotenv").config();

// Promisify
bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);
bluebird.promisifyAll(twilio);

// Globals
global.env = process.env;
global.router = express.Router();
global.app = express();
global.twilio = twilio();

//Start the server
const PORT = env.PORT || 8080;
app.listen(PORT, async () => {
  // Connect mongoDB
  await mongoose.connect(env.NODE_ENV === "DEVELOPMENT" ? env.DB_DEV_URL : env.DB_PROD_URL);

  // Connect redis
  global.redis =
    env.NODE_ENV === "DEVELOPMENT" ? redis.createClient() : redis.createClient(env.REDIS_PORT, env.REDIS_HOST);

  // Ready
  console.log(`Listening on ${PORT}`);
});

//Middlewares
app.use(morgan(":method :url\nSTATUS: :status RESPONSE-TIME: :response-time ms"));
app.use(compression());
app.use(helmet());
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Source route
app.use("/api/v1/", require("./api/v1/index"));

// Handle wildcard
app.use("*", (req, res) => {
  res.status(404);
  res.json({
    errorCode: 404,
    errorMessage: "Unable to find requested resource.",
  });
});
