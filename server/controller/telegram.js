const router = require("express").Router();
const { telegramHandler } = require("../handler/telegram");

router.post("/", async (req, res) => {
	console.log(req.body);
	await telegramHandler(req.body);
	res.sendStatus(200); // Respond with 200 OK
});

router.get("/", (req, res) => {
	res.send("Telegram bot is running.");
});

module.exports = router;
