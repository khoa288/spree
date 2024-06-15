const axios = require("axios");
const fs = require("fs");
const { Blob } = require("buffer");

const { confirmTransactionFromBackend } = require("./signer");

const YOUR_WALLET_ADDRESS = "JA6ySU1aLuTzqfGoC1rmpokv7SjMZnrx3Tcg2WfEBh53";
const network = "devnet";
const X_API_KEY = "";
const secret_key = "";

var encodedTransaction = "";

async function mintCollectionNFT() {
	const buffer = fs.readFileSync("svw.jpg");
	const blob = new Blob([buffer]);

	const formdata = new FormData();
	formdata.append("network", network);
	formdata.append("creator_wallet", YOUR_WALLET_ADDRESS);
	formdata.append("name", "SPREE - SVW Collection");
	formdata.append("symbol", "SPREE");
	formdata.append("description", "Turning NFTs into wildlife saviors!");
	formdata.append(
		"attributes",
		'[ {    "trait_type": "Location",    "value": "Cuc Phuong National Park, Vietnam"  }]'
	);
	formdata.append("image", blob, "svw.jpg");
	formdata.append("fee_payer", YOUR_WALLET_ADDRESS);
	const response = await axios
		.post("https://api.shyft.to/sol/v2/nft/create", formdata, {
			headers: {
				"x-api-key": X_API_KEY,
			},
		})
		.then(async (res) => {
			console.log(res.data);
			encodedTransaction = res.data.result.encoded_transaction;
			//encoded transaction received in response
			console.log(encodedTransaction);
			const confirmTransaction = await confirmTransactionFromBackend(
				network,
				encodedTransaction,
				secret_key
			);
			console.log(confirmTransaction);
		})
		.catch((err) => {
			console.warn(err);
		});
}

async function mintCNFT() {
	try {
		const response = await axios.post(
			"https://api.shyft.to/sol/v1/nft/compressed/mint",
			{
				network: network,
				creator_wallet: YOUR_WALLET_ADDRESS,
				metadata_uri:
					"https://gateway.pinata.cloud/ipfs/bafkreihy6hrkx74myfuogtjtzy7nej6kpinpnjwuzsxutcj3xkp32xytpe",
				merkle_tree: "GwTNzrEv5vSX7pzuMWdnhQXWZRAhjx5NZ4aKeqqDXwVS",
				collection_address:
					"Gn5qUfvHT2f5r2GFz59hPasYgs1DgUTaTE2hUNXfAjTM",
				receiver: YOUR_WALLET_ADDRESS,
				fee_payer: YOUR_WALLET_ADDRESS,
				priority_fee: 1000,
			},
			{
				headers: {
					"x-api-key": X_API_KEY,
					"Content-Type": "application/json",
				},
			}
		);
		console.log(response.data);
		const encodedTransaction = response.data.result.encoded_transaction;
		console.log(encodedTransaction);
		const confirmTransaction = await confirmTransactionFromBackend(
			network,
			encodedTransaction,
			secret_key
		);
		console.log(confirmTransaction);
	} catch (err) {
		console.warn(err);
	}
}

async function createMerkleTree() {
	const response = await axios
		.post(
			"https://api.shyft.to/sol/v1/nft/compressed/create_tree",
			{
				network,
				wallet_address: YOUR_WALLET_ADDRESS,
				max_depth_size_pair: {
					max_depth: 14,
					max_buffer_size: 64,
				},
				canopy_depth: 10,
			},
			{
				headers: {
					"x-api-key": X_API_KEY,
				},
			}
		)
		.then(async (res) => {
			console.log(res.data);
			encodedTransaction = res.data.result.encoded_transaction;
			//encoded transaction received in response
			console.log(encodedTransaction);
			const confirmTransaction = await confirmTransactionFromBackend(
				network,
				encodedTransaction,
				secret_key
			);
			console.log(confirmTransaction);
		})
		.catch((err) => {
			console.warn(err);
		});
}

async function mintCNFTs() {
	for (let i = 0; i < 9; i++) {
		await mintCNFT();
	}
}

mintCNFTs();
