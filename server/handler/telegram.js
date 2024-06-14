const NodeCache = require("node-cache");
const { telegramAxiosInstance } = require("../axios/telegram");
const payOS = require("./payos");

const sessionCache = new NodeCache({ stdTTL: 600 }); // Session timeout set to 5 minutes

async function sendMessage(messageObject, messageText) {
	if (!messageText) {
		console.error("sendMessage called with empty messageText");
		return;
	}
	try {
		const response = await telegramAxiosInstance.get("sendMessage", {
			params: {
				chat_id: messageObject.chat.id,
				text: messageText,
			},
		});
		console.log("Message sent successfully:", response.data);
	} catch (error) {
		console.error(
			"Error sending message:",
			error.response ? error.response.data : error
		);
	}
}

async function handleMessage(messageObject) {
	const messageText = messageObject.text || "";
	const chatId = messageObject.chat.id;
	const session = sessionCache.get(chatId) || {};

	console.log("Handling message:", messageText);
	console.log("Current session:", session);

	if (messageText.charAt(0) === "/") {
		const command = messageText.substr(1).trim();
		console.log("Command received:", command);
		switch (command) {
			case "start":
				sessionCache.del(chatId); // Clear session for a fresh start
				await sendMessage(messageObject, "Welcome!");
				break;
			case "payment":
				session.state = "awaitingAmount";
				sessionCache.set(chatId, session);
				await sendMessage(
					messageObject,
					"Please enter the NFTs amount:"
				);
				break;
			default:
				await sendMessage(messageObject, "Coming soon...");
				break;
		}
	} else {
		switch (session.state) {
			case "awaitingAmount":
				if (!messageText) {
					await sendMessage(
						messageObject,
						"Please enter a valid amount."
					);
					break;
				}
				session.amount = messageText;
				session.state = "awaitingWallet";
				sessionCache.set(chatId, session);
				await sendMessage(
					messageObject,
					"Please enter your Solana wallet address:"
				);
				break;
			case "awaitingWallet":
				if (!messageText) {
					await sendMessage(
						messageObject,
						"Please enter a valid wallet address."
					);
					break;
				}
				session.wallet = messageText;
				session.state = "paymentLinkGenerated";
				sessionCache.set(chatId, session);

				// Generate the payment link
				const paymentData = {
					orderCode: Date.now(), // TODO: hash(Contract Address + Token ID + Wallet Address + Amount)
					amount: parseFloat(session.amount * 20000), // 20.000VND each NFT
					description: `Payment for NFTs`,
					cancelUrl: `${process.env.DOMAIN}/cancel.html`,
					returnUrl: `${process.env.DOMAIN}/return.html`,
				};

				try {
					const paymentLinkResponse = await payOS.createPaymentLink(
						paymentData
					);
					const paymentLink = paymentLinkResponse.checkoutUrl;

					sessionCache.set(paymentData.orderCode, {
						chatId,
						amount: session.amount,
						wallet: session.wallet,
					});

					await sendMessage(
						messageObject,
						`Here is your payment link: ${paymentLink}`
					);
				} catch (error) {
					console.error("Error generating payment link:", error);
					await sendMessage(
						messageObject,
						"Sorry, there was an error generating the payment link."
					);
				}
				break;
			default:
				await sendMessage(messageObject, "Invalid message");
				break;
		}
	}
}

async function telegramHandler(body) {
	if (body && body.message) {
		const messageObject = body.message;
		await handleMessage(messageObject);
	} else {
		console.error("telegramHandler received invalid body:", body);
	}
}

module.exports = { telegramHandler };
