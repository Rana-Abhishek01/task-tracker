require("dotenv").config();

const app = require("./app");

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Task Tracker API running on http://localhost:${PORT}`);
});

server.on("error", (error) => {
  console.error("Server error:", error);
});

setInterval(() => {
  // Keep the backend process alive
}, 1000);