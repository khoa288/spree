const axios = require("axios");
require("dotenv").config();
const { confirmTransactionFromBackend } = require("../util/signer");

const SHYFT_X_API_KEY = process.env.SHYFT_X_API_KEY;
const NETWORK = process.env.NETWORK;
const WALLET_ADDRESS = process.env.WALLET_ADDRESS;
const WALLET_SECRET_KEY = process.env.WALLET_SECRET_KEY;

const headers = {
	"Content-Type": "application/json",
	"x-api-key": SHYFT_X_API_KEY,
};

const baseURL = "https://api.shyft.to/sol/v1/nft/compressed";

// Function to read all cNFTs
const readCNFTs = async (walletAddress, collection = null, refresh = false) => {
	try {
		const url = `${baseURL}/read_all`;
		const params = {
			network: NETWORK,
			wallet_address: walletAddress,
			...(collection && { collection }),
			...(refresh && { refresh: true }),
		};

		const response = await axios.get(url, { headers, params });
		return response.data;
	} catch (error) {
		throw new Error(`Failed to read cNFTs: ${error.message}`);
	}
};

// Function to transfer cNFT
const transferCNFT = async (
	nftAddress,
	receiver,
	sender = WALLET_ADDRESS,
	feePayer = WALLET_ADDRESS,
	priorityFee = 1000
) => {
	try {
		const url = `${baseURL}/transfer`;
		const body = {
			network: NETWORK,
			sender,
			nft_address: nftAddress,
			receiver,
			fee_payer: feePayer,
			priority_fee: priorityFee,
		};

		const response = await axios.post(url, body, { headers });
		const { encoded_transaction } = response.data.result;

		const confirmTransaction = await confirmTransactionFromBackend(
			NETWORK,
			encoded_transaction,
			WALLET_SECRET_KEY
		);

		return { ...response.data, confirmTransaction };
	} catch (error) {
		throw new Error(`Failed to transfer cNFT: ${error.message}`);
	}
};

module.exports = { readCNFTs, transferCNFT };
