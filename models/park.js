import mongoose from 'mongoose';
import schedule from 'node-schedule';

const dateRange = new mongoose.Schema({
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
    default: '',
  },
  lastNotif: Date,
});

const park = new mongoose.Schema({
  parkID: {
    type: String,
    required: [true, 'Please provide a campground ID'],
    match: [/^\d{6}$/, 'invalid'],
    unique: true,
    immutable: true,
  },
  name: String,
  dates: [dateRange],
  thumbnailUrl: String, // TODO validation etc.
});

// TODO: add pre save hook to prevent adding duplicate date sets

dateRange.pre('remove', function (next) {
  console.log(`deleting job ${this._id} (park ${this.parent().parkID})`);
  const deleted = schedule.cancelJob(this._id.toString());
  if (!deleted) throw new Error('delete unsuccessful');
  next();
});

export default mongoose.model('Park', park);
