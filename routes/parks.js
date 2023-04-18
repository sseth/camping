import { BadRequestError, NotFoundError } from '../errors/index.js';
import { createJob, runScraper } from '../utils/index.js';
import Park from '../models/park.js';
import express from 'express';
import https from 'https';

const router = express.Router();

const getThumbnail = async (id) => {
  const sendRequest = (id) => {
    return new Promise((resolve, reject) => {
      https
        .get(
          'https://ridb.recreation.gov' +
            `/api/v1/facilities/${id}/media` +
            '?limit=50&offset=0',
          { headers: { apikey: process.env.REC_GOV_API_KEY } },
          (res) => {
            let body = '';
            res.on('data', (d) => (body += d));
            res.on('end', () => resolve(JSON.parse(body)));
          }
        )
        .on('error', (e) => reject(e));
    });
  };
  
  const data = await sendRequest(id);
  if (!data) return null;
  // console.log(data);
  const thumb = data.RECDATA.find((img) => img.IsPreview);
  return thumb ? thumb.URL : null;
};

// Adds a park or updates it with a new set of dates
// TODO: bunch of bs if a request for the same park is sent
// before another has been processed
const addPark = async (req, res) => {
  let { parkID, start, end, nights } = req.body;
  parkID = req.params.parkID ? req.params.parkID : parkID;

  let park = await Park.findOne({ parkID });
  if (!park) park = new Park({ parkID, dates: [] });
  park.dates.push({ start, end, nights });
  await park.validate();

  const dates = park.dates[park.dates.length - 1];
  const { name, sent } = await runScraper({ parkID, start, end, nights });
  if (sent) dates.lastNotif = sent;
  // await createJob(parkID, dates._id.toString()); TODO
  park.name = name;
  park.thumbnailUrl = await getThumbnail(parkID);
  await park.save();

  res.status(201).json({ success: true });
};

const removeDates = async (req, res) => {
  const { parkID, dateID } = req.params;
  let park = await Park.findOne({ parkID });
  if (!park) throw new NotFoundError(`${parkID} not found`);
  if (park.dates.length === 1) {
    await park.remove();
    return res.json({ deleted: parkID });
  }
  await park.dates.id(dateID).remove();
  await park.save();
  res.json({ deleted: dateID });
};

const deletePark = async (req, res) => {
  const { parkID } = req.params;
  const park = await Park.findOne({ parkID });
  if (!park) throw new NotFoundError(`${parkID} not found`);
  const del = await park.remove();
  res.json({ deleted: del.parkID });
};

// remove lastNotif from dates?
const getPark = async (req, res) => {
  const { parkID } = req.params;
  const park = await Park.findOne({ parkID });
  if (!park) throw new NotFoundError(`${parkID} not found`);
  res.json({ park });
};

const getAllParks = async (req, res) => {
  const parks = await Park.find({});
  /*
    const parks = temp.map((park) => {
    const dates = park.dates.map((ob) => ({
      id: ob._id.toString(),
      start: ob.start,
      end: ob.end,
      nights: ob.nights !== '' ? ob.nights : undefined,
    }));
    return { parkID: park.parkID, dates };
  });
  */
  res.json({ count: parks.length, parks });
};

router.route('/').post(addPark).get(getAllParks);
router.route('/:parkID').post(addPark).delete(deletePark).get(getPark);
router.route('/:parkID/:dateID').delete(removeDates);

export default router;
