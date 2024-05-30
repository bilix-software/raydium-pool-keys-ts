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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPoolKeysForTokenAddress = exports.getMarketIdForTokenAddress = void 0;
const openbook_1 = require("@openbook-dex/openbook");
const raydium_sdk_1 = require("@raydium-io/raydium-sdk");
const web3_js_1 = require("@solana/web3.js");
const constants_1 = require("./constants");
function getMarketIdForTokenAddress(connection, tokenaddress) {
    return __awaiter(this, void 0, void 0, function* () {
        const poolid = yield getPoolID(tokenaddress, connection);
        if (poolid) {
            return yield getMarketIdFromPool(poolid, connection);
        }
        return null;
    });
}
exports.getMarketIdForTokenAddress = getMarketIdForTokenAddress;
function getPoolKeysForTokenAddress(connection, tokenaddress) {
    return __awaiter(this, void 0, void 0, function* () {
        var foundMarketId = null;
        const poolid = yield getPoolID(tokenaddress, connection);
        if (poolid) {
            foundMarketId = yield getMarketIdFromPool(poolid, connection);
        }
        if (foundMarketId != null) {
            const { decoded } = yield openbook_1.Market.load(connection, foundMarketId, { commitment: "confirmed", skipPreflight: true }, raydium_sdk_1.MAINNET_PROGRAM_ID.OPENBOOK_MARKET);
            const { baseVault, quoteVault, bids, asks, eventQueue, } = decoded;
            var poolKeys = raydium_sdk_1.Liquidity.getAssociatedPoolKeys({
                version: 4,
                marketVersion: 3,
                marketId: foundMarketId,
                baseMint: new web3_js_1.PublicKey(tokenaddress),
                quoteMint: new web3_js_1.PublicKey('So11111111111111111111111111111111111111112'),
                baseDecimals: 6,
                quoteDecimals: 9,
                programId: raydium_sdk_1.MAINNET_PROGRAM_ID.AmmV4,
                marketProgramId: raydium_sdk_1.MAINNET_PROGRAM_ID.OPENBOOK_MARKET,
            });
            const liquidityPoolKeys = Object.assign(Object.assign({}, poolKeys), { marketAsks: asks, marketBids: bids, marketEventQueue: eventQueue, marketQuoteVault: quoteVault, marketBaseVault: baseVault });
            return liquidityPoolKeys;
        }
        return null;
    });
}
exports.getPoolKeysForTokenAddress = getPoolKeysForTokenAddress;
function getPoolID(tokenaddress, connection) {
    return __awaiter(this, void 0, void 0, function* () {
        let base = new web3_js_1.PublicKey(tokenaddress);
        const quote = new web3_js_1.PublicKey(constants_1.WSOL_ADDRESS);
        const commitment = "confirmed";
        try {
            // First try with base
            const baseAccounts = yield connection.getProgramAccounts(new web3_js_1.PublicKey(constants_1.RAYDIUM_LIQUIDITY_POOL_V4_ADDRESS), {
                commitment,
                filters: [
                    { dataSize: raydium_sdk_1.LIQUIDITY_STATE_LAYOUT_V4.span },
                    {
                        memcmp: {
                            offset: raydium_sdk_1.LIQUIDITY_STATE_LAYOUT_V4.offsetOf("baseMint"),
                            bytes: base.toBase58(),
                        },
                    },
                    {
                        memcmp: {
                            offset: raydium_sdk_1.LIQUIDITY_STATE_LAYOUT_V4.offsetOf("quoteMint"),
                            bytes: quote.toBase58(),
                        },
                    },
                ],
            });
            if (baseAccounts.length > 0) {
                const { pubkey } = baseAccounts[0];
                return pubkey.toString();
            }
            // If base fails, try with quote
            const quoteAccounts = yield connection.getProgramAccounts(new web3_js_1.PublicKey(constants_1.RAYDIUM_LIQUIDITY_POOL_V4_ADDRESS), {
                commitment,
                filters: [
                    { dataSize: raydium_sdk_1.LIQUIDITY_STATE_LAYOUT_V4.span },
                    {
                        memcmp: {
                            offset: raydium_sdk_1.LIQUIDITY_STATE_LAYOUT_V4.offsetOf("baseMint"),
                            bytes: quote.toBase58(),
                        },
                    },
                    {
                        memcmp: {
                            offset: raydium_sdk_1.LIQUIDITY_STATE_LAYOUT_V4.offsetOf("quoteMint"),
                            bytes: base.toBase58(),
                        },
                    },
                ],
            });
            if (quoteAccounts.length > 0) {
                const { pubkey } = quoteAccounts[0];
                return pubkey.toString();
            }
            return null;
        }
        catch (error) {
            console.error("Error fetching Market accounts:", error);
            return null;
        }
    });
}
function getMarketIdFromPool(poolId, connection) {
    return __awaiter(this, void 0, void 0, function* () {
        const version = 4;
        const account = yield connection.getAccountInfo(new web3_js_1.PublicKey(poolId));
        const { state: LiquidityStateLayout } = raydium_sdk_1.Liquidity.getLayouts(version);
        const poolState = (account === null || account === void 0 ? void 0 : account.data) ? LiquidityStateLayout.decode(account.data) : null;
        return poolState ? poolState.marketId : null;
    });
}
