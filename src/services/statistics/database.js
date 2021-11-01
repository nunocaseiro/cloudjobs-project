const MongoClient = require('mongodb').MongoClient;
//const dbHost = process.env.DB_HOST || '127.0.0.1';
//const dbPort = process.env.BD_PORT || 27017;
const dbUsername = process.env.DB_USERNAME || 'meicmproject2';
const dbPassword = process.env.DB_PASSWORD || 'meicm2021';
const dbName = process.env.DB_NAME || 'cloudjobs';


// Connection URL
//const url = `mongodb+srv://${dbHost}:${dbPort}/${dbName}`;
const url = `mongodb+srv://${dbUsername}:${dbPassword}@cluster0.3ehfv.mongodb.net/${dbName}?retryWrites=true&w=majority`;
const mongoDBOptions = {
  reconnectInterval: 1000,
  reconnectTries: 60,
  autoReconnect: true,
  useNewUrlParser: true,
  useUnifiedTopology: true
}

const connect = () => {
  let db;
  let client;
  console.log(`[MongoDB] connecting to: ${url}`);


  return new Promise((resolve, reject) => {
    console.log("Connecting to " + url)
    client = new MongoClient(url, mongoDBOptions);
    client.connect(async (err) => {
      if (err) {
        return reject(err);
      }
      console.log("Connected successfully to server");
      db = client.db(dbName);

      return resolve({
        client: client,
        db: db
      });
    });
  })
}


const getLatestStatistic = (db) => {
  return new Promise((resolve, reject) => {
    const statistics = db.collection('statistics');
    statistics.find().sort({ date: -1 }).limit(1).next((err, doc) => {
      if (err) return reject(err);
      return resolve(doc);
    });
  });
}

const getStatistics = (db) => {
  return new Promise((resolve, reject) => {
    const statistics = db.collection('statistics');
    statistics.find({}).sort({ date: -1 }).limit(30).toArray((err, docs) => {
      if (err) return reject(err);
      return resolve(docs);
    });
  });
}

const getStatisticsByDay = (db, day) => {
  return new Promise((resolve, reject) => {
    const statistics = db.collection('statistics');
    statistics.findOne({ date: day }, (err, statistic) => {
      if (err) return reject(err);
      return resolve(statistic);
    });
  });
}

const insertStatistics = (db, statistic) => {
  return new Promise((resolve, reject) => {
    const statistics = db.collection('statistics');
    statistics.insertOne(statistic, (err, result) => {
      if (err) return reject(err);
      return resolve(result);
    });
  });
}


module.exports = {
  connect: connect,
  getLatestStatistic: getLatestStatistic,
  getStatistics: getStatistics,
  getStatisticsByDay: getStatisticsByDay,
  insertStatistics: insertStatistics,
}
