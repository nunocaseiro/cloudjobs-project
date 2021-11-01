const express = require('express');
const mongo = require('./database.js');
const agenda = require('./agenda.js');

const PORT = process.env.PORT || 8080;

const start = async () => {
  console.log("Starting Node Server")
  const app = express();
  console.log("MongoDB setup")
  const db = await mongo.connect();
  console.log("Agenda setup")
  agenda.start(db);

  app.listen(PORT, () => console.log(`Cloud Jobs Agenda API listening on port ${PORT}`));
}
start();

