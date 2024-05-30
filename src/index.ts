import { Market } from "@openbook-dex/openbook";
import {
    Liquidity,
    MAINNET_PROGRAM_ID,
    LIQUIDITY_STATE_LAYOUT_V4,
    LiquidityPoolKeys
} from '@raydium-io/raydium-sdk';
import {
    Connection,
    PublicKey
} from '@solana/web3.js'
import { RAYDIUM_LIQUIDITY_POOL_V4_ADDRESS, WSOL_ADDRESS } from "./constants";

export async function getMarketIdForTokenAddress(connection: Connection, tokenaddress: string): Promise<PublicKey | null> {
    const poolid = await getPoolID(tokenaddress, connection)
    if (poolid) {
        return await getMarketIdFromPool(poolid, connection);
    }
    return null;
}

export async function getPoolKeysForTokenAddress(connection: Connection, tokenaddress: string): Promise<LiquidityPoolKeys | null> {
    var foundMarketId = null;

    const poolid = await getPoolID(tokenaddress, connection)
    if (poolid) {
        foundMarketId = await getMarketIdFromPool(poolid, connection);
    }
    if (foundMarketId != null) {
        const { decoded } = await Market.load(
            connection,
            foundMarketId,
            { commitment: "confirmed", skipPreflight: true },
            MAINNET_PROGRAM_ID.OPENBOOK_MARKET
        );

        const {

            baseVault,
            quoteVault,
            bids,
            asks,
            eventQueue,
        } = decoded;


        var poolKeys = Liquidity.getAssociatedPoolKeys({
            version: 4,
            marketVersion: 3,
            marketId: foundMarketId,
            baseMint: new PublicKey(tokenaddress),
            quoteMint: new PublicKey('So11111111111111111111111111111111111111112'),
            baseDecimals: 6,
            quoteDecimals: 9,
            programId: MAINNET_PROGRAM_ID.AmmV4,
            marketProgramId: MAINNET_PROGRAM_ID.OPENBOOK_MARKET,
        });

        const liquidityPoolKeys = {
            ...poolKeys,
            marketAsks: asks,
            marketBids: bids,
            marketEventQueue: eventQueue,
            marketQuoteVault: quoteVault,
            marketBaseVault: baseVault,
        };
        return liquidityPoolKeys;
    }

    return null;
}

async function getPoolID(tokenaddress: string, connection: Connection) {
    let base = new PublicKey(tokenaddress);
    const quote = new PublicKey(WSOL_ADDRESS);
    const commitment = "confirmed";

    try {

        // First try with base
        const baseAccounts = await connection.getProgramAccounts(new PublicKey(RAYDIUM_LIQUIDITY_POOL_V4_ADDRESS), {
            commitment,
            filters: [
                { dataSize: LIQUIDITY_STATE_LAYOUT_V4.span },
                {
                    memcmp: {
                        offset: LIQUIDITY_STATE_LAYOUT_V4.offsetOf("baseMint"),
                        bytes: base.toBase58(),
                    },
                },
                {
                    memcmp: {
                        offset: LIQUIDITY_STATE_LAYOUT_V4.offsetOf("quoteMint"),
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
        const quoteAccounts = await connection.getProgramAccounts(new PublicKey(RAYDIUM_LIQUIDITY_POOL_V4_ADDRESS), {
            commitment,
            filters: [
                { dataSize: LIQUIDITY_STATE_LAYOUT_V4.span },
                {
                    memcmp: {
                        offset: LIQUIDITY_STATE_LAYOUT_V4.offsetOf("baseMint"),
                        bytes: quote.toBase58(),
                    },
                },
                {
                    memcmp: {
                        offset: LIQUIDITY_STATE_LAYOUT_V4.offsetOf("quoteMint"),
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
    } catch (error) {
        console.error("Error fetching Market accounts:", error);
        return null;
    }
}

async function getMarketIdFromPool(poolId: string, connection: Connection): Promise<PublicKey | null> {
    const version = 4;

    const account = await connection.getAccountInfo(new PublicKey(poolId));
    const { state: LiquidityStateLayout } = Liquidity.getLayouts(version);

    const poolState = account?.data ? LiquidityStateLayout.decode(account.data) : null;
    return poolState ? poolState.marketId : null;
}