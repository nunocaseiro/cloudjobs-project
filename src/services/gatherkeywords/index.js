const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const passportHTTPBearer = require('passport-http-bearer').Strategy;
const mongo = require('./database.js');

const PORT = process.env.PORT || 8080;
const JWT_SECRET = process.env.JWT_SECRET || 'secret';

const start = async () => {
  console.log("Starting Node Server")
  const app = express();
  console.log("MongoDB setup")
  const db = await mongo.connect();

  // passport.use(new passportLocal((username, password, done) => {
  //   const users = db.db.collection('users');
  //   users.findOne({ username: username }, (err, user) => {
  //     if (err) return done(err);
  //     if (!user) return done(null, false);
  //     if (!bcrypt.compareSync(password, user.password)) return done(null, false);
  //     return done(null, user);
  //   });
  // }));

  passport.use(new passportHTTPBearer((token, done) => {
    const users = db.db.collection('users');
    try {
      jwt.verify(token, JWT_SECRET);
    } catch (exception) {
      return done(exception);
    }
    users.findOne({ token: token }, (err, user) => {
      if (err) return done(err);
      if (!user) return done(null, false);
      return done(null, user, { scope: 'all' });
    });
  }));

  app.use(passport.initialize());

  app.use(cors())

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.get('/api/keywords', passport.authenticate('bearer', { session: false }), async (request, response) => {
    console.log("KEYWORDS GET")
    let configData = await mongo.getGathererConfig(db.db);
    console.log("[Keywords] GET")
    return response.send(configData.config.keywords);
  });

  app.post('/api/keywords/insert', passport.authenticate('bearer', { session: false }), async (request, response) => {
    let keyword = request.body.data;
    console.log("[Keywords] POST")
    let result = await mongo.insertGathererKeyword(db.db, keyword);
    return response.send(result);
  });

  app.delete('/api/keywords/:keyword', passport.authenticate('bearer', { session: false }), async (request, response) => {
    let keyword = request.params.keyword;
    console.log("[Keywords] DELETE")
    let result = await mongo.deleteGathererKeyword(db.db, keyword);
    return response.send(result);
  });

  app.listen(PORT, () => console.log(`Cloud Jobs Gather  API listening on port ${PORT}`));
}
start();

