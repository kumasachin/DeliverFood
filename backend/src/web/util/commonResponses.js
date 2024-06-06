function sendNotFound(res) {
  res.status(404).json({ error: "Not found" });
}

function sendAccessDenied(res) {
  res.status(403).json({ error: "Forbidden" });
}

module.exports = {
  sendNotFound,
  sendAccessDenied,
};
