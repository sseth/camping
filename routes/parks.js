import { BadRequestError, NotFoundError } from '../errors/index.js';
import { createJob, runScraper } from '../utils/index.js';
import Park from '../models/Park.js';
import schedule from 'node-schedule';
import express from 'express';
const router = express.Router();

const test = async (req, res) => {
  console.log('test');
  res.send();
};

const addPark = async (req, res, next) => {
  // TODO: write custom errors for mongoose validation, 404s on parkIDs
  const park = new Park(req.body);
  await park.validate(); // duplicate key error not thrown here
  // duplicate create request leads to the new job being scheduled under the same name
  // which results in the old job being fired twice at its scheduled time
  // (this gets fixed on restart)
  // TODO: multiple jobs for different date ranges for each park + specific campsites

  // temporary fix to prevent duplicate parks: TODO
  const test = await Park.findOne({ parkID: park.parkID });
  if (test) throw new BadRequestError(`${park.parkID} already added`);

  // run once (before scheduling job) to check for errors
  const sent = await runScraper(park);
  const jobID = await createJob(park.parkID);
  park.jobID = jobID;
  if (sent) park.lastNotif = sent;
  await park.save();
  res.json({ success: true, park });
};

const deletePark = async (req, res) => {
  const { parkID } = req.params;
  const doc = await Park.findOne({ parkID });
  if (!doc) throw new NotFoundError(`${parkID} not found`);
  const del = await doc.remove();
  res.json({ deleted: del.parkID });
};

const updatePark = async (req, res) => {
  const { parkID } = req.params;
  let park = await Park.findOne({ parkID });
  if (!park) throw new NotFoundError(`${parkID} not found`);

  Object.assign(park, req.body);
  await park.validate();
  const sent = await runScraper(park, true);
  const newJob = await createJob(parkID);
  if (park.jobID in schedule.scheduledJobs) {
    console.log(`[${parkID}] removing old job:`, park.jobID);
    const cancelled = schedule.cancelJob(park.jobID);
    if (!cancelled) console.error('failed');
  }
  park.jobID = newJob;
  if (sent) park.lastNotif = sent;

  await park.save();
  res.json({ success: true, park });
};

router.route('/').post(addPark);
router.route('/:parkID').put(updatePark).delete(deletePark);
router.route('/test').get(test);

export default router;
