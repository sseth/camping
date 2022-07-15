const errorHandler = (err, req, res, next) => {
  // TODO: send custom error message if the first test execution of the scraper
  // (before a job is scheduled) fails: invalid park id or whatever
  console.error('in error handler');
  console.error(err);
  res.status(500).json({ error: 'Something went wrong' });
}

export default errorHandler;
