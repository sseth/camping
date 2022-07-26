import cors from 'cors';
import yaml from 'yamljs';
import xss from 'xss-clean';
import dotenv from 'dotenv';
import helmet from 'helmet';
import express from 'express';
import 'express-async-errors';
import mongoose from 'mongoose';
import auth from 'express-basic-auth';
import swagger from 'swagger-ui-express';
import rateLimiter from 'express-rate-limit';
import errorHandler from './middleware/error-handler.js';

import parks from './routes/parks.js';
import { reschedule } from './utils/index.js';

const swaggerDoc = yaml.load('./swagger.yaml');

dotenv.config();
const app = express();

app.use(xss());
app.use(cors());
app.use(helmet());
app.set('trust proxy', 1);
app.use(
  rateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 100,
  })
);

app.use(express.json());
const port = process.env.PORT || 5000;
console.log(process.env.NODE_ENV);

app.get('/', (req, res) =>
  res.send('<h1>Camping v1</h1><a href="/docs">Docs</a>')
);

app.use('/docs', swagger.serve, swagger.setup(swaggerDoc));

app.use(
  auth({
    users: { harsh: process.env.PASSWORD },
    unauthorizedResponse: { error: 'lol fuck off' },
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
