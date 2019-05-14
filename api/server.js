const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const session = require("express-session");
const KnexSessionStore = require("connect-session-knex")(session); //stores session in database if server crashes

const sessionConfig = {
  name: "monkey", //default is session id number that would reveal our stack, so we hide it
  secret: "keep it secret, keep it safe!", //to encrypt/decrypt the cookie
  cookie: {
    maxAge: 1000 * 60 * 60, // how long the session is valid for in milliseconds
    secure: false //used over https only, should be true in production
  },
  httpOnly: true, // cannot access the cookie from JS using document.cookie - security feature
  //keep this true unless there is a good reason to let JS access the cookie
  resave: false, //keep it false to avoid recreating sessions that have not changed
  saveUninitialized: false, //GDPR laws against setting cookies automatically

  //we add this to configure the way sessions are stored
  store: new KnexSessionStore({
    knex: require("../database/dbConfig"),
    tablename: "session", //table that will store sessions inside the database, name it anything you want
    sidfieldname: "sid", //hold the session id
    createtable: true, //if table does not exist will be created automatically
    clearInterval: 1000 * 60 * 60 //time it takes to check for old sessions and remove them to clean database
  })
};

const authRouter = require("../auth/auth-router.js");
const usersRouter = require("../users/users-router.js");

const server = express();

server.use(helmet());
server.use(express.json());
server.use(cors());
server.use(session(sessionConfig));

server.use("/api/auth", authRouter);
server.use("/api/users", usersRouter);

server.get("/", (req, res) => {
  res.send("It's alive!");
});

module.exports = server;
