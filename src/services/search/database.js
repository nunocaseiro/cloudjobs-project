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

const parseSearchResults = (data) => {
  console.log("Parsing data");
  return new Promise((resolve, reject) => {
    const jobs = [];
    for (let job of data) {
      let locations = '';
      if (job.itjobs.locations) {
        for (let location of job.itjobs.locations) {
          locations += `${location.name}, `
        }
        locations = locations.slice(0, -2);
      }
      jobs.push({
        publishedAt: job.itjobs.publishedAt,
        title: job.itjobs.title,
        company: job.itjobs.company.name,
        remote: job.itjobs.allowRemote,
        locations: locations,
        id: job.itjobs.id,
        body: job.bodyCleaned
      });
    }

    return resolve(jobs);
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

      return resolve({
        client: client,
        db: db
      });
    });
  })
}


const searchJobs = (db, keywords, forFrontend) => {
  return new Promise((resolve, reject) => {
    const jobs = db.collection('jobs');
    jobs.find({ removedOn: { $exists: false }, bodyCleaned: { $regex: new RegExp(keywords, 'ig') } }).toArray(async (err, jobs) => {
      if (err) return reject(err);
      if (forFrontend) {
        return resolve(await parseSearchResults(jobs));
      }
      return resolve(jobs);
    });
  });
}

module.exports = {
  connect: connect,
  searchJobs: searchJobs,
}
