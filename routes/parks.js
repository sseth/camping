import { createJob, runScraper } from '../utils/index.js';
import Park from '../models/Park.js';
import schedule from 'node-schedule';
import express from 'express';
const router = express.Router();

const test = async (req, res) => {
  const job = schedule.scheduleJob('name', '*/1 * * * * *', () => {
    console.log('test');
  });
  
  setTimeout(() =>  {
    // schedule.cancelJob('name')
    const job2 = schedule.scheduleJob('name', '*/1 * * * * *', () => {
    console.log('test2');
  });
  }, 5000);
  // job.prependOnceListener('success', () => {
  //   console.log('scheduled');
  // });
  res.send();
};

const addPark = async (req, res, next) => {
  // TODO: write custom errors for mongoose validation, 404s on parkIDs
  const park = new Park(req.body);
  await park.validate();

  // run once (before scheduling job) to check for errors
  const sent = await runScraper(park);
  // [errors to watch out for: wrong python path, 404 from rec.gov]
  const jobID = await createJob(park.parkID);
  park.jobID = jobID;
  if (sent) park.lastNotif = sent;
  await park.save();
  res.json({ success: true, park });
};

const deletePark = async (req, res) => {
  const doc = await Park.findOne({ parkID: req.params.parkID });
  if (!doc) throw new Error('not found');
  const del = await doc.remove();
  res.json({ deleted: del.parkID });
};

const updatePark = async (req, res) => {
  let park = await Park.findOne({ parkID: req.params.parkID });
  if (!park) throw new Error('not found');
  
  Object.assign(park, req.body);
  await park.validate();
  const sent = await runScraper(park);
  const newJob = await createJob(park.parkID);
  if (park.jobID in schedule.scheduledJobs) {
    // cancel old job
    console.log('removing old job:', park.jobID);
    const cancelled = schedule.cancelJob(park.jobID);
    if (!cancelled) throw new Error('unable to cancel old job');
  }
  park.jobID = newJob;
  if (sent) park.lastNotif = sent;

  await park.save();
  res.json({ success: true, park });
};

router.route('/').post(addPark);
router.route('/:parkID').patch(updatePark).delete(deletePark);
router.route('/test').get(test);

export default router;
