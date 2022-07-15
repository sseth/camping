import Park from "../models/Park.js";
import createJob from "./create-job.js";

const reschedule = async () => {
  // TODO: handle errors
  console.log('in reschedule script');
  const all = await Park.find({});
  all.forEach(async (park) => {
    const doc = await Park.findOne({ parkID: park.parkID });
    doc.jobID = await createJob(park);
    await doc.save();
  });
}

export default reschedule;
