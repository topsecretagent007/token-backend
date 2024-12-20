"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const umi_bundle_defaults_1 = require("@metaplex-foundation/umi-bundle-defaults");
const mpl_token_metadata_1 = require("@metaplex-foundation/mpl-token-metadata");
const umi_1 = require("@metaplex-foundation/umi");
const digital_asset_standard_api_1 = require("@metaplex-foundation/digital-asset-standard-api");
const spl_token_1 = require("@solana/spl-token");
const web3_js_1 = require("@solana/web3.js");
const utils_1 = require("./utils");
const config_1 = require("./config");
const http_1 = __importDefault(require("http"));
const rpcUrl = process.env.RPC;
const connection = new web3_js_1.Connection(rpcUrl);
// Load environment variables from .env file
dotenv_1.default.config();
// Connect to the MongoDB database
(0, config_1.connectMongoDB)();
// Create an instance of the Express application
const app = (0, express_1.default)();
// Set up Cross-Origin Resource Sharing (CORS) options
const whitelist = [
    "http://localhost:5000",
    "https://explorer.mctoken.xyz"
];
const corsOptions = {
    origin: whitelist,
    credentials: false,
    sameSite: "none",
};
app.use((0, cors_1.default)(corsOptions));
// Serve static files from the 'public' folder
app.use(express_1.default.static(path_1.default.join(__dirname, './public')));
// Parse incoming JSON requests using body-parser
app.use(express_1.default.json({ limit: '50mb' }));
app.use(express_1.default.urlencoded({ limit: '50mb', extended: true }));
app.use(body_parser_1.default.json({ limit: '50mb' }));
app.use(body_parser_1.default.urlencoded({ limit: '50mb', extended: true }));
const server = http_1.default.createServer(app);
// Define routes for different API endpoints
app.use("/getTokens", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const options = { method: 'GET', headers: { 'X-API-KEY': String(process.env.BIRDEYE_KEY) } };
        const umi = (0, umi_bundle_defaults_1.createUmi)(new web3_js_1.Connection("https://mainnet.helius-rpc.com/?api-key=99c6d984-537e-4569-955b-5e4703b73c0d"));
        umi.use((0, digital_asset_standard_api_1.dasApi)());
        // The owner's public key
        const ownerPublicKey = (0, umi_1.publicKey)(req.body.walletAddress);
        const allFTs = yield (0, mpl_token_metadata_1.fetchAllDigitalAssetWithTokenByOwner)(umi, ownerPublicKey);
        let tokePrice;
        yield fetch(`https://public-api.birdeye.so/defi/price?address=${process.env.MINT_ADDRESS}`, options)
            .then(response => response.json())
            .then(response => {
            tokePrice = Number(response.data.value);
        })
            .catch(err => console.error(err));
        let j = 0;
        let datas = [];
        for (let i = 0; i < allFTs.length; i++) {
            if ((allFTs[i].mint.decimals > 0) && (allFTs[i].metadata.symbol !== 'USDC') && (allFTs[i].metadata.symbol !== 'USDT') && (allFTs[i].publicKey !== 'AmgUMQeqW8H74trc8UkKjzZWtxBdpS496wh4GLy2mCpo')) {
                let price;
                yield (0, utils_1.sleep)(200 * j);
                yield fetch(`https://public-api.birdeye.so/defi/price?address=${allFTs[i].publicKey}`, options)
                    .then(response => response.json())
                    .then(response => {
                    price = Number(response.data.value);
                    if (price > 0) {
                        datas.push({
                            id: allFTs[i].publicKey,
                            mintSymbol: allFTs[i].metadata.symbol,
                            decimal: Number(allFTs[i].mint.decimals),
                            balance: Number(allFTs[i].token.amount),
                            price: price,
                            balanceByToke: Math.floor(price * Number(allFTs[i].token.amount) / Math.pow(10, Number(allFTs[i].mint.decimals)) / tokePrice * 1000)
                        });
                    }
                })
                    .catch(err => console.error(err));
                j++;
            }
        }
        console.log('tokenData ===> ', datas);
        return res.json({ data: datas });
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: err });
    }
}));
app.use("/getTokensInBeta", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const options = { method: 'GET', headers: { 'X-API-KEY': String(process.env.BIRDEYE_KEY) } };
        const umi = (0, umi_bundle_defaults_1.createUmi)(new web3_js_1.Connection(String(process.env.RPC)));
        umi.use((0, digital_asset_standard_api_1.dasApi)());
        // The owner's public key
        const ownerPublicKey = (0, umi_1.publicKey)(req.body.walletAddress);
        let tokePrice;
        yield fetch(`https://public-api.birdeye.so/defi/price?address=${process.env.MINT_ADDRESS}`, options)
            .then(response => response.json())
            .then(response => {
            tokePrice = Number(response.data.value);
        })
            .catch(err => console.error(err));
        let nativePrice;
        yield fetch(`https://public-api.birdeye.so/defi/price?address=${spl_token_1.NATIVE_MINT}`, options)
            .then(response => response.json())
            .then(response => {
            nativePrice = Number(response.data.value);
        })
            .catch(err => console.error(err));
        const owner = new web3_js_1.PublicKey(req.body.walletAddress);
        let response = yield connection.getParsedTokenAccountsByOwner(owner, {
            programId: spl_token_1.TOKEN_PROGRAM_ID,
        });
        let tokenAccounts = [];
        for (let i = 0; i < response.value.length; i++) {
            try {
                if ((response.value[i].account.data.parsed.info.tokenAmount.decimals > 0) && (Number(response.value[i].account.data.parsed.info.tokenAmount.amount) === 0)) {
                    console.log(`loop:${response.value[i].account.data.parsed.info.mint}::::: `, 'decimal ===> ', response.value[i].account.data.parsed.info.tokenAmount.decimals, ", amount ===> ", Number(response.value[i].account.data.parsed.info.tokenAmount.amount));
                    yield fetch(`https://public-api.birdeye.so/defi/price?address=${response.value[i].account.data.parsed.info.mint}`, options)
                        .then(ret => ret.json())
                        .then((ret) => __awaiter(void 0, void 0, void 0, function* () {
                        const res = yield fetch(`${process.env.RPC}`, {
                            method: 'POST',
                            headers: {
                                "Content-Type": "application/json"
                            },
                            body: JSON.stringify({
                                "jsonrpc": "2.0",
                                "id": "text",
                                "method": "getAsset",
                                "params": { id: `${response.value[i].account.data.parsed.info.mint}` }
                            }),
                        });
                        const data = yield res.json();
                        // console.log('data for symbol ===> ', data);
                        const price = Number(ret.data.value);
                        tokenAccounts.push({
                            id: response.value[i].account.data.parsed.info.mint,
                            mintSymbol: data.result.token_info.symbol,
                            balance: Number(response.value[i].account.data.parsed.info.tokenAmount.amount),
                            decimal: response.value[i].account.data.parsed.info.tokenAmount.decimals,
                            price: price,
                            balanceByToke: 0.00203928 * nativePrice / tokePrice * 1000
                        });
                    }));
                }
            }
            catch (error) {
                console.log(`error during ${i}nd loop ===> `, error);
                continue;
            }
        }
        return res.json({ data: tokenAccounts });
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ error: err });
    }
}));
// Define a route to check if the backend server is running
app.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.send("Backend Server is Running now!");
}));
// Start the Express server to listen on the specified port
server.listen(config_1.PORT, () => {
    console.log(`Server is running on port ${config_1.PORT}`);
});
