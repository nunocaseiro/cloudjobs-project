const { Agenda } = require('agenda');
const db = require('./database.js');
const axios = require('axios');

const dbUsername = process.env.DB_USERNAME || 'meicmproject2';
const dbPassword = process.env.DB_PASSWORD || 'meicm2021';
const dbName = process.env.DB_NAME || 'cloudjobs';

const ITJOBS_SERVICE_URL = process.env.ITJOBS_SERVICE_URL || 'http://cloudjobs-application-itjobs:8082'
const STATISTICS_SERVICE_URL = process.env.ITJOBS_STATISTICS_URL || 'http://cloudjobs-application-statistics:8083'
const SEARCH_SERVICE_URL = process.env.ITJOBS_SEARCH_URL || 'http://cloudjobs-application-search:8086'
const GATHERKEYWORDS_SERVICE_URL = process.env.ITJOBS_GATHERKEYWORDS_URL || 'http://cloudjobs-application-gatherkeywords:8085'

// Connection URL
const url = `mongodb+srv://${dbUsername}:${dbPassword}@cluster0.3ehfv.mongodb.net/${dbName}?retryWrites=true&w=majority`;

const start = async (mongo) => {
  const agenda = new Agenda({ db: { address: url, collection: 'agendaJobs', options: { useUnifiedTopology: true } } });

  agenda.define('gather data', async (job, done) => {

    console.log('[AGENDA] starting job - gather data');
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get keywords
    const gathererConfig = await db.getGathererConfig(mongo.db);
    
    // Get Full Job Data
    let jobs = [];
    //let results = await itJobs.getAllJobs();
    let results = (await axios.get(ITJOBS_SERVICE_URL+'/api/itjobs/getAllJobs')).data
    console.log(`[AGENDA|DG] got ${results.length} jobs from IT Jobs API`);
    const statistics = {
      date: today,
      deltas: {
        day: 0.0,
        week: 0.0,
        month: 0.0
      },
      keywords: {},
      totalJobs: 0,
      newJobs: 0,
      removedJobs: 0
    }
   
    // For Each Current Job on ITJobs
    for (let job of results) {
      let isCloudJob = false;
      for (let keyword of gathererConfig.config.keywords) {
        if (job.body.indexOf(keyword) >= 0) {
          isCloudJob = true;
        }
      }
      if (isCloudJob) {
        let cleanBody = job.body.replace(/<br>/ig, '\n');
        cleanBody = cleanBody.replace(/<\/p>/ig, '\n');
        cleanBody = cleanBody.replace(/(<([^>]+)>)/ig, '');
        let dbJob = await db.getJobByITJobsID(mongo.db, job.id);
        if (dbJob) {
          dbJob.itjobs = job;
          dbJob.bodyCleaned = cleanBody;
          dbJob.DGUpdatedOn = today;
          await db.updateJob(mongo.db, dbJob);
        } else {
          let dbJob = {
            itjobs: job,
            bodyCleaned: cleanBody,
            OnDbFrom: today,
            DGUpdatedOn: today
          }
          let result = await db.insertJob(mongo.db, dbJob);
          statistics.newJobs++;
        }
        statistics.totalJobs++;
      }
    }
    console.log('[AGENDA!GD] processed jobs');


    const removedJobs = await db.getJobsNotUpdated(mongo.db, today);
    for (let job of removedJobs) {
      job.removedOn = today;
      statistics.removedJobs++;
      await db.updateJob(mongo.db, job);
    }

    console.log('[AGENDA|GD] processed removed Jobs');


    // For each keyword 
    for (let keyword of gathererConfig.config.keywords) {
      //let jobs = await db.searchJobs(mongo.db, keyword);
      const parameters = {
        search: keyword,
        forFrontend: false
      }
      let jobs = await axios.post(SEARCH_SERVICE_URL+ '/api/search/local',parameters)
      
      statistics.keywords[keyword] = {
        totalJobs: jobs.data.length,
      }
    }

    console.log('[AGENDA|GD] processed keywords');

    let yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    let yesterdayStats = (await axios.get(STATISTICS_SERVICE_URL + '/api/statistics/byday/'+ yesterday)).data;
    //let yesterdayStats = await db.getStatisticsByDay(mongo.db, yesterday);
    if (yesterdayStats) {
      statistics.deltas.day = (statistics.totalJobs - yesterdayStats.totalJobs) / yesterdayStats.totalJobs;
    }
    
    let lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    lastWeek.setHours(0, 0, 0, 0);

    //let lastWeekStats = await db.getStatisticsByDay(mongo.db, lastWeek);
    let lastWeekStats = (await axios.get(STATISTICS_SERVICE_URL + '/api/statistics/byday/'+ lastWeek)).data;
    
    if (lastWeekStats) {
      statistics.deltas.week = (statistics.totalJobs - lastWeekStats.totalJobs) / lastWeekStats.totalJobs;
    }


    let lastMonth = new Date();
    lastMonth.setDate(lastMonth.getDate() - 30);
    lastMonth.setHours(0, 0, 0, 0);

    //let lastMonthStats = await db.getStatisticsByDay(mongo.db, lastMonth);
    let lastMonthStats = (await axios.get(STATISTICS_SERVICE_URL + '/api/statistics/byday/'+ lastMonth)).data;
    if (lastMonthStats) {
      statistics.deltas.month = (statistics.totalJobs - lastMonthStats.totalJobs) / lastMonthStats.totalJobs;
    }

    //let statResults = await db.insertStatistics(mongo.db, statistics);
    let statResults = await axios.post(STATISTICS_SERVICE_URL + '/api/statistics', {data : statistics}); 
    console.log('[AGENDA!GD] processed deltas');
    console.log('[AGENDA] ended job - gather data');
    return done(null, true);
  });

  console.log('Starting Agenda');
  await agenda.start();

  console.log('[Agenda] defining schedules');
  await agenda.every('0 6 * * *', 'gather data');
  //await agenda.every("one minute", 'gather data');

  let jobs = await db.getJobs(mongo.db);
  if (jobs.length < 1) {
    await agenda.now('gather data');
  }

}

module.exports = {
  start: start
}
