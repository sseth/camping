import { BadRequestError, NotFoundError } from '../errors/index.js';
import { createJob, runScraper } from '../utils/index.js';
import Park from '../models/park.js';
import express from 'express';
const router = express.Router();

const test = async (req, res) => {
  console.log('test');
  res.send();
};

// Adds a park or updates it with a new set of dates
const addPark = async (req, res) => {
  let { parkID, start, end, nights } = req.body;
  parkID = req.params.parkID ? req.params.parkID : parkID;
  let park = await Park.findOne({ parkID });
  if (!park) park = new Park({ parkID, dates: [] });
  park.dates.push({ start, end, nights });
  await park.validate();

  const dates = park.dates[park.dates.length - 1];
  const sent = await runScraper({ parkID, start, end, nights });
  await createJob(parkID, dates._id.toString());
  if (sent) dates.lastNotif = sent;
  await park.save();
  
  res.status(201).json({ success: true });
};

/*
  const addPark = async (req, res) => {
  const { parkID, start, end, nights } = req.body;
  let park = await Park.findOne({ parkID });
  if (park) {
    throw new BadRequestError(`${parkID} already added`);
    // TODO: update with additional dates? remove addDates?
    // check if dates already added
    // park.dates.push({ start, end, nights });
    // await park.validate();
    // ^need to test this
    // run once to test
    // schedule job
    // await park.save();
    // return res.json({ success: true });
  }

  park = new Park({ parkID, dates: [{ start, end, nights }] });
  await park.validate();
  // run once to check for errors
  const dates = park.dates[0];
  const sent = await runScraper({ parkID, start, end, nights });
  await createJob(parkID, dates._id.toString());
  if (sent) dates.lastNotif = sent; // TODO: test
  await park.save();
  res.status(201).json({ success: true });
}; */

// TODO:
// what happens if the last dates ob is removed?
// will it mess with the reschedule script?
// delete park if park.dates.length === 1?
const removeDates = async (req, res) => {
  const { parkID, dateID } = req.params;
  res.send();
};

const deletePark = async (req, res) => {
  const { parkID } = req.params;
  const doc = await Park.findOne({ parkID });
  if (!doc) throw new NotFoundError(`${parkID} not found`);
  const del = await doc.remove();
  res.json({ deleted: del.parkID });
};

// TODO:
// use a projection/aggregation to remove lastNotif from dates
// test with multiple dates
// send ids as `id` or `_id`?
const getPark = async (req, res) => {
  const { parkID } = req.params;
  const park = await Park.findOne({ parkID });
  if (!park) throw new NotFoundError(`${parkID} not found`);
  res.json({ park });
};

// TODO:
// use a projection/aggregation to remove lastNotif from dates
// nights only if defined
// send ids as `id` or `_id`?
// okay to send everything as is?
// test
const getAllParks = async (req, res) => {
  const temp = await Park.find({});
  const parks = temp.map((park) => {
    const dates = park.dates.map((ob) => ({
      id: ob._id.toString(),
      start: ob.start,
      end: ob.end,
      nights: ob.nights !== '' ? ob.nights : undefined,
    }));
    return { parkID: park.parkID, dates };
  });
  res.json({ count: parks.length, parks });
};

router.route('/').post(addPark).get(getAllParks);
router.route('/test').get(test);
router.route('/:parkID').post(addPark).delete(deletePark).get(getPark);
router.route('/:parkID/:dateID').delete(removeDates);

export default router;
