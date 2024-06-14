const axios = require("axios");

const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_BASE_URL = `https://api.telegram.org/bot${telegramBotToken}`;

function getTelegramAxiosInstance() {
	return axios.create({
		baseURL: TELEGRAM_BASE_URL,
	});
}

module.exports = { telegramAxiosInstance: getTelegramAxiosInstance() };
