const errorHandler = (err, req, res, next) => {
  // console.error('in error handler');
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
    // error.msg = Object.keys(err.errors)
    //   .map((field) => `${field}: ${err.errors[field].message}`)
    //   .join('; ');
  }

  if (err.stderr && err.stderr.includes('404')) {
    error.status = 400;
    error.msg = 'invalid parkID';
  }

  res.status(error.status).json({ error: error.msg });
};

export default errorHandler;
