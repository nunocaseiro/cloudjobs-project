const express = require('express');
const cors = require('cors');
const itJobs = require('./itjobs.js');

const PORT = process.env.PORT || 8080;

const start = async () => {
  console.log("Starting Node Server")
  const app = express();

  app.use(cors())

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

 
  app.post('/api/itjobs/search', async (request, response) => {
    let search = request.body.search;
    console.log(`[Search] ${search}`);
    let limit = request.body.limit || 10;
    let page = request.body.page || 1;
    let data = await itJobs.searchITJobs(search, limit, page);
    return response.send(data);
  });

  app.get('/api/itjobs/getAllJobs', async (request,response) => {
    let data = await itJobs.getAllJobs();
    return response.send(data);
  });

  app.listen(PORT, () => console.log(`Cloud Jobs API listening on port ${PORT}`));
}
start();

