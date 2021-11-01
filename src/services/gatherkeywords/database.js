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

const insertGathererKeyword = (db, keyword) => {
  return new Promise((resolve, reject) => {
    const config = db.collection('config');
    config.findOne({ type: 'gatherer' }, (err, configDocument) => {
      if (err) return reject(err);
      console.log(keyword);
      console.log(configDocument.config.keywords);
      configDocument.config.keywords.push(keyword);
      console.log(configDocument.config.keywords);
      config.findOneAndReplace({ _id: configDocument._id }, configDocument, (err, results) => {
        if (err) return reject(err);
        return resolve(results);
      });
    });
  });
}

const deleteGathererKeyword = (db, keyword) => {
  return new Promise((resolve, reject) => {
    const config = db.collection('config');
    config.findOne({ type: 'gatherer' }, (err, configDocument) => {
      if (err) return reject(err);

      let index = configDocument.config.keywords.indexOf(keyword);
      if (index !== -1) {
        configDocument.config.keywords.splice(index, 1);
      }
      config.findOneAndReplace({ _id: configDocument._id }, configDocument, (err, results) => {
        if (err) return reject(err);
        return resolve(results);
      });
    });
  });
}

const getGathererConfig = (db) => {
  return new Promise((resolve, reject) => {
    const configCollection = db.collection('config');
    configCollection.findOne({ type: 'gatherer' }, (err, result) => {
      if (err) return reject(err);
      return resolve(result);
    });
  });
}


module.exports = {
  connect: connect,
  getGathererConfig: getGathererConfig,
  insertGathererKeyword: insertGathererKeyword,
  deleteGathererKeyword: deleteGathererKeyword,
}
