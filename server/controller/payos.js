const router = require("express").Router();
const payOS = require("../handler/payos");
const NodeCache = require("node-cache");
const { telegramAxiosInstance } = require("../axios/telegram");

const sessionCache = new NodeCache({ stdTTL: 600 });
function sendMessage(chatId, messageText) {
	return telegramAxiosInstance.get("sendMessage", {
		params: {
			chat_id: chatId,
			text: messageText,
		},
	});
}

router.post("/", async (req, res) => {
	try {
		const webhookData = req.body;
		console.log("Webhook received:", webhookData);

		const verifiedData = payOS.verifyPaymentWebhookData(webhookData);

		const orderCode = verifiedData.data.orderCode;
		const session = sessionCache.get(orderCode);

		if (session) {
			const chatId = session.chatId;
			if (verifiedData.data.code === "00") {
				await sendMessage(
					chatId,
					`Payment for order ${orderCode} succeeded.`
				);
			} else {
				await sendMessage(
					chatId,
					`Payment for order ${orderCode} failed.`
				);
			}
		} else {
			console.error(`No session found for order ${orderCode}`);
		}

		res.json({ status: "success" });
	} catch (error) {
		console.error("Error processing webhook:", error);
		res.status(500).json({ status: "error" });
	}
});

module.exports = router;
