import Park from '../models/Park.js';
import schedule from 'node-schedule';
import runScraper from './run-scraper.js';
const createJob = async (parkID) => {
  console.log('scheduling job for', parkID);
  // TODO: might be some problem here
  const job = schedule.scheduleJob('*/5 * * * *', async () => {
    const park = await Park.findOne({ parkID });
    const sent = await runScraper(park);
    if (sent) {
      // console.log('updating sent time');
      park.lastNotif = sent;
      await park.save();
    }
  });

  // save only if job is successfully scheduled
  if (!job) throw new Error('could not schedule');
  // console.log(schedule.scheduledJobs);
  // TODO:
  job.addListener('error', (error) => {
    console.log('in error listener');
    console.error(error);
    // next(error);
    // cancel job?
  });
  return job.name;
};

export default createJob;
