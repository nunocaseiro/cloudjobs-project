const express = require('express');
const cors = require('cors');
const mongo = require('./database.js');

const PORT = process.env.PORT || 8080;

const start = async () => {
  console.log("Starting Node Server")
  const app = express();
  console.log("MongoDB setup")
  const db = await mongo.connect();

  app.use(cors())

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.post('/api/search/local', async (request, response) => {
    let search = request.body.search;
    let forFrontend = request.body.forFrontend
    let bool = true
    if (forFrontend != undefined){
      bool = false
    }
    let data = await mongo.searchJobs(db.db, search, bool);
    console.log(`[Local Search] ${search}`);
    return response.send(data);
  });

  app.listen(PORT, () => console.log(`Cloud Jobs API listening on port ${PORT}`));
}
start();

