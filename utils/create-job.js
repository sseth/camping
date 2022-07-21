import Park from '../models/Park.js';
import schedule from 'node-schedule';
import runScraper from './run-scraper.js';
const createJob = async (parkID) => {
  console.log('scheduling job for', parkID);
  const job = schedule.scheduleJob('*/5 * * * *', async () => {
    const park = await Park.findOne({ parkID });
    const sent = await runScraper(park);
    if (sent) {
      park.lastNotif = sent;
      await park.save();
    }
  });

  // save only if job is successfully scheduled
  if (!job) throw new Error('could not schedule job, try again');
  job.addListener('error', (error) => {
    console.error(error);
    // TODO: cancel job?
  });
  
  return job.name;
};

export default createJob;
