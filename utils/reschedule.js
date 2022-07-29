import Park from "../models/park.js";
import createJob from "./create-job.js";

const reschedule = async () => {
  // TODO: handle errors
  console.log('Rescheduling jobs');
  const parks = await Park.find({});
  parks.forEach((park) => {
    park.dates.forEach(async (dates) => {
      await createJob(park.parkID, dates._id.toString());
    });
  });
}

export default reschedule;
