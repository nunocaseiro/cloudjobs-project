const MongoClient = require('mongodb').MongoClient;
const bcrypt = require('bcryptjs');

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

const APP_USER_PASS = process.env.APP_USER_PASS || 'password';

const loadDefaults = (db) => {
  return new Promise((resolve, reject) => {
    const config = db.collection('config');
    const gathererConfig = {
      type: 'gatherer',
      config: {
        keywords: [
          'cloud',
          'aws',
          'gcp',
          'azure',
          'docker',
          'kubernetes',
          'serverless',
          'microservices',
          'iaas',
          'paas',
          'sass'
        ]
      }
    }
    config.find({ type: 'gatherer' }).toArray((err, result) => {
      if (err) return reject(err);
      if (!result || result.length == 0) {
        config.insertOne(gathererConfig, (err, result) => {
          if (err) return reject(err);
          return resolve(true);
        });
      }
      return resolve(true);
    });
  });
}

const loadDefaultUser = (db) => {
  return new Promise((resolve, reject) => {
    const users = db.collection('users');
    users.find({}).toArray((error, result) => {
      if (error) return reject(error);
      if (!result || result.length == 0) {

        let salt = bcrypt.genSaltSync(10);
        let hash = bcrypt.hashSync(APP_USER_PASS, salt);

        users.insert({ username: 'admin', password: hash }, (err, result) => {
          if (err) return reject(err);
          return resolve(true);
        });
      }
      return resolve(true);
    })
  })
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

      await loadDefaults(db);
      await loadDefaultUser(db);

      return resolve({
        client: client,
        db: db
      });
    });
  })
}

module.exports = {
  connect: connect,
}
