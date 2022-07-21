import dotenv from 'dotenv';
import 'express-async-errors';
import express from 'express';
import mongoose from 'mongoose';
import auth from 'express-basic-auth';
import errorHandler from './middleware/error-handler.js';

import parks from './routes/parks.js';
import { reschedule } from './utils/index.js';

dotenv.config();
const app = express();
app.use(express.json()); // might not need this
const port = process.env.PORT || 5000;

app.get('/', (req, res) => res.send('lol'));

app.use(
  auth({
    users: { harsh: process.env.PASSWORD },
    unauthorizedResponse: 'lol fuck off',
  })
);

app.use('/parks', parks);

app.use(errorHandler);

const start = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    // TODO: figure out rescheduling on restart
    await reschedule();
    app.listen(port, console.log(`Listening on port ${port}`));
  } catch (error) {
    console.error(error);
  }
};

start();
