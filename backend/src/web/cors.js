module.exports = function cors(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Methods",
    "GET, HEAD, PUT, POST, PATCH, DELETE, OPTIONS"
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Cache-Control, Pragma, Origin, Authorization, Content-Type, X-Requested-With"
  );

  // Handle preflight OPTIONS requests
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  return next();
};
