const express = require("express");
const path = require("path");

require("dotenv").config();

const telegramRouter = require("./controller/telegram");
const payosRouter = require("./controller/payos");

// Initialize Express app.
const app = express();
app.use(express.json());

// Log requests
app.use((req, res, next) => {
	console.log(`${req.method} ${req.url}`);
	next();
});

app.use(express.static(path.join(__dirname, "public")));

// Telegram route
app.use("/telegram", telegramRouter);
app.use("/payos", payosRouter);

// Default route for unmatched routes
app.all("*", (req, res) => {
	res.status(404).json({ message: "Route not found" });
});

// Error handling middleware
app.use((err, req, res, next) => {
	console.error(err.stack);
	res.status(500).json({ message: "Internal server error" });
});

module.exports = app;
