import cors from 'cors';
import https from 'https';
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

import parksRouter from './routes/parks.js';
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
  res.send('<h1>Camping v2</h1><a href="/docs">Docs</a>')
);

app.use('/docs', swagger.serve, swagger.setup(swaggerDoc));

app.get('/ping', (req, res) => {
  console.log('ping');
  res.send();
});

app.use(
  auth({
    users: { harsh: process.env.PASSWORD },
    unauthorizedResponse: { error: 'lol fuck off' },
  })
);

app.get('/login', (req, res) => {
  res.send();
});

app.use('/parks', parksRouter);

app.use(errorHandler);

setInterval(() => {
  https.get('https://aqueous-temple-20353.herokuapp.com/ping');
}, 540000);

const start = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    await reschedule();
    app.listen(port, console.log(`Listening on port ${port}`));
  } catch (error) {
    console.error(error);
  }
};

start();
