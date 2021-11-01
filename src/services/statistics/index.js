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

 app.get('/api/statistics', async (request, response) => {
    console.log("[Statistics] GET")
    return response.send(await mongo.getStatistics(db.db));
  });

  app.get('/api/statistics/latest', async (request, response) => {
    console.log("[Statistics] GET Latest")
    return response.send(await mongo.getLatestStatistic(db.db));
  });

  app.get('/api/statistics/byday/:day', async(request, response) =>{
    let day = request.params.day;
    console.log("[Statistics] By Day")
    let result = await mongo.getStatisticsByDay(db.db,day)
    return response.send(result)
  });

  app.post('/api/statistics', async(request, response)=>{
    console.log("[Statistics] Insert statistics")
    let result = await mongo.insertStatistics(db.db,request.body.data);
    return response.send(result)
  })

  app.listen(PORT, () => console.log(`Cloud Jobs API listening on port ${PORT}`));
}
start();

