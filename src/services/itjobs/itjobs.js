const axios = require('axios');
const ITJOBS_KEY = process.env.ITJOBS_KEY;
const ITJOBS_URL = process.env.ITJOBS_URL || 'http://api.sandbox.itjobs.pt';

const parseSearchResults = (data) => {
  console.log("Parsing data");
  return new Promise((resolve, reject) => {
    const jobs = [];
    for (let job of data) {
      let locations = '';
      if (job.locations) {
        for (let location of job.locations) {
          locations += `${location.name}, `
        }
        locations = locations.slice(0, -2);
      }
      let cleanBody = job.body.replace(/<br>/ig, '\n');
      cleanBody = cleanBody.replace(/<\/p>/ig, '\n');
      cleanBody = cleanBody.replace(/(<([^>]+)>)/ig, '');
      jobs.push({
        publishedAt: job.publishedAt,
        title: job.title,
        company: job.company.name,
        remote: job.allowRemote,
        locations: locations,
        id: job.id,
        body: cleanBody
      });
    }
    return resolve(jobs);
  })
}

const makeRequest = (requestOptions) => {
  return new Promise((resolve, reject) => {
    axios.get(requestOptions.url, requestOptions)
      .then(async (response) => {
        return resolve(response.data);
      })
      .catch(error => {
        console.log(error);
        return reject(error);
      });
  });
}

exports.getAllJobs = () => {
  console.log(ITJOBS_KEY);
  return new Promise(async (resolve, reject) => {
    const url = `${ITJOBS_URL}/job/search.json?api_key=${ITJOBS_KEY}`;
    const requestOptions = {
      url: url,
      method: 'GET',
      json: true,
      params: {
        api_key: ITJOBS_KEY,
        q: '',
        limit: 500,
        page: 1
      }
    };
    let resultsToGet = 1;
    let results = [];
    while (resultsToGet > 0) {
      let response = await makeRequest(requestOptions);
      results = results.concat(response.results);
      resultsToGet = response.total - (500 * response.page);
      requestOptions.params.page++;
    }
    resolve(results);
  });
}

exports.searchITJobs = (search, limit, page) => {
  return new Promise((resolve, reject) => {
    const url = `${ITJOBS_URL}/job/search.json?api_key=${ITJOBS_KEY}&q=${search}`;

    const requestOptions = {
      url: url,
      method: 'GET',
      json: true,
      params: {
        api_key: ITJOBS_KEY,
        q: search,
        limit: limit,
        page: page
      }
    };
    console.log(`[ITJOBS] getting ${url}`);
    axios(requestOptions.url, requestOptions)
      .then(async (response) => {
        if (response.data.error) {
          console.log("[ITJOBS] ERROR:", response.data.error)
          return reject(response.data.error);
        }
        if (!response.data.results) {
          console.log("[ITJOBS] ERROR: NO Data", response.data)
          return resolve({
            meta: {
              total: 1,
              page: 1,
              limit: 10,
              query: response.data.query
            },
            data: []
          });
        }
        console.log(`DATA received ${typeof response.data}`);
        const parsedData = await parseSearchResults(response.data.results);
        const returnData = {
          meta: {
            total: response.data.total,
            page: response.data.page,
            limit: response.data.limit,
            query: response.data.query
          },
          data: parsedData
        };
        return resolve(returnData);
      })
      .catch(error => {
        console.log(error);
        return reject(error);
      });
  });
}


