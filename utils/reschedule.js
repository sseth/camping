import Park from "../models/park.js";
import createJob from "./create-job.js";

const reschedule = async () => {
  // TODO: handle errors
  console.log('Rescheduling jobs');
  const all = await Park.find({});
  all.forEach(async (park) => {
    const doc = await Park.findOne({ parkID: park.parkID });
    doc.jobID = await createJob(park.parkID);
    await doc.save();
  });
}

export default reschedule;
