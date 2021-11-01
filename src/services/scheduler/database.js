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

const getGathererConfig = (db) => {
  return new Promise((resolve, reject) => {
    const configCollection = db.collection('config');
    configCollection.findOne({ type: 'gatherer' }, (err, result) => {
      if (err) return reject(err);
      return resolve(result);
    });
  });
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


const getJobByITJobsID = (db, ITJobsID) => {
  return new Promise((resolve, reject) => {
    const jobs = db.collection('jobs');
    jobs.findOne({ 'itjobs.id': ITJobsID }, (err, job) => {
      if (err) return reject(err);
      return resolve(job);
    });
  });
}

const insertJob = (db, job) => {
  return new Promise((resolve, reject) => {
    const jobs = db.collection('jobs');
    jobs.insertOne(job, (err, result) => {
      if (err) return reject(err);
      return resolve(result);
    });
  });
}

const getJobsNotUpdated = (db, today) => {
  return new Promise((resolve, reject) => {
    const jobs = db.collection('jobs');
    jobs.find({ DGUpdatedOn: { $ne: today }, removedOn: { $exists: false } }).toArray((err, jobsNotUpdated) => {
      if (err) return reject(err);
      return resolve(jobsNotUpdated);
    });
  });
}

const updateJob = (db, job) => {
  return new Promise((resolve, reject) => {
    const jobs = db.collection('jobs');
    jobs.findOneAndReplace({ _id: job._id }, job, (err, results) => {
      if (err) return reject(err);
      return resolve(results);
    });
  });
}

const getJobs = (db) => {
  return new Promise((resolve, reject) => {
    const jobs = db.collection('jobs');
    jobs.find({ removedOn: { $exists: false } }).toArray((err, documents) => {
      if (err) return reject(err);
      return resolve(documents);
    });
  });
}

module.exports = {
  connect: connect,
  getGathererConfig: getGathererConfig,
  getJobByITJobsID: getJobByITJobsID,
  insertJob: insertJob,
  getJobsNotUpdated: getJobsNotUpdated,
  updateJob: updateJob,
  getJobs: getJobs,
}
