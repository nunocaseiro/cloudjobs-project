const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const passportLocal = require('passport-local').Strategy;
const passportHTTPBearer = require('passport-http-bearer').Strategy;
const mongo = require('./database.js');

const PORT = process.env.PORT || 8080;
const JWT_SECRET = process.env.JWT_SECRET || 'secret';

const start = async () => {
  console.log("Starting Node Server")
  const app = express();
  console.log("MongoDB setup")
  const db = await mongo.connect();

  passport.use(new passportLocal((username, password, done) => {
    const users = db.db.collection('users');
    users.findOne({ username: username }, (err, user) => {
      if (err) return done(err);
      if (!user) return done(null, false);
      if (!bcrypt.compareSync(password, user.password)) return done(null, false);
      return done(null, user);
    });
  }));

  // passport.use(new passportHTTPBearer((token, done) => {
  //   const users = db.db.collection('users');
  //   try {
  //     jwt.verify(token, JWT_SECRET);
  //   } catch (exception) {
  //     return done(exception);
  //   }
  //   users.findOne({ token: token }, (err, user) => {
  //     if (err) return done(err);
  //     if (!user) return done(null, false);
  //     return done(null, user, { scope: 'all' });
  //   });
  // }));

  app.use(passport.initialize());

  app.use(cors())

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.post('/api/signin', passport.authenticate('local', { session: false }), async (request, response) => {
    let user = request.user;
    user.token = jwt.sign({ userID: user._id }, JWT_SECRET);
    const users = db.db.collection('users');
    users.findOneAndReplace({ _id: user._id }, user, (err, result) => {
      if (err) return response.send({ error: 'db error' });
      return response.send({ token: user.token });
    });
  });

  app.get('/', async(request, response) => {
    console.log("[Health Check] GET")
    return response.send({ msg: 'CLOUD JOBS API V1' });
});

  app.listen(PORT, () => console.log(`Cloud Jobs API listening on port ${PORT}`));
}
start();

