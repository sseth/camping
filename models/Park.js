import mongoose from 'mongoose';
import schedule from 'node-schedule';


const park = mongoose.Schema({
  parkID: {
    type: String,
    required: [true, 'Please provide a campground ID'],
    match: [/^\d{6}$/, 'invalid'],
    unique: true,
    immutable: true,
  },
  start: {
    type: String,
    required: [true, 'Please provide a start date'],
    match: [/^\d{4}-\d{2}-\d{2}$/, 'invalid'],
  },
  end: {
    type: String,
    required: [true, 'Please provide an end date'],
    match: [/^\d{4}-\d{2}-\d{2}$/, 'invalid'],
  },
  nights: {
    type: String,
    match: [/^\d{1,2}$/, 'invalid'],
  },
  jobID: String,
  lastNotif: Date,
});

park.pre('remove', function (next) {
  // console.log('in pre delete hook:', this);
  console.log(`deleting ${this.jobID}`);
  const deleted = schedule.cancelJob(this.jobID);
  if (!deleted) throw new Error('delete unsuccessful');
  next();
});

export default mongoose.model('Park', park);
