import Park from '../models/park.js';
import schedule from 'node-schedule';
import runScraper from './run-scraper.js';

const createJob = async (parkID, jobID) => {
  console.log('scheduling job for', parkID);
  const job = schedule.scheduleJob(jobID, '*/1 * * * *', async () => {
    const park = await Park.findOne({ parkID });
    const dates = park.dates.id(jobID);
    const { start, end, nights, lastNotif } = dates;
    const sent = await runScraper({
      parkID,
      jobID,
      start,
      end,
      nights,
      lastNotif,
    });
    if (sent) {
      dates.lastNotif = sent;
      await park.save();
    }
  });
  
  if (!job) throw new Error('could not schedule job, try again');
  job.addListener('error', (error) => {
    console.error(error);
  });
};

export default createJob;
