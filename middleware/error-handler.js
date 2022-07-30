const errorHandler = (err, req, res, next) => {
  console.error(err);
  const error = {
    status: err.statusCode || 500,
    msg: err.message || 'Something went wrong',
  };

  if (err.type && err.type === 'entity.parse.failed') {
    error.msg = `Invalid JSON in request body`;
  }

  if (err.name === 'ValidationError') {
    error.status = 400;
    error.msg = Object.values(err.errors).map((e) => e.message);
  }

  if (err.stderr && err.stderr.includes('404')) {
    error.status = 400;
    error.msg = 'invalid parkID';
  }

  if (err.stderr && err.stderr.includes('Not a valid date')) {
    error.status = 400;
    error.msg = `invalid ${
      err.stderr.includes('error: argument --start-date')
        ? 'start date'
        : 'end date'
    }`;
  }

  res.status(error.status).json({ error: error.msg });
};

export default errorHandler;
