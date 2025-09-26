const createServer = require("../web/createServer");

const app = createServer();
const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
  console.log(`Backend server running on port ${port}`);
});

server.on("error", (err) => {
  console.error("Server error:", err);
});

server.on("listening", () => {
  console.log(`Server is listening on port ${port}`);
});
