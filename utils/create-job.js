import schedule from 'node-schedule';
import runScraper from './run-scraper.js'
const createJob = async (park) => {
  console.log('scheduling job');
  // TODO: might be some problem here
  const job = schedule.scheduleJob('*/5 * * * *', () => {
    runScraper(park);
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
}

export default createJob;
