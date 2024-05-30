import { LiquidityPoolKeys } from '@raydium-io/raydium-sdk';
import { Connection, PublicKey } from '@solana/web3.js';
export declare function getMarketIdForTokenAddress(connection: Connection, tokenaddress: string): Promise<PublicKey | null>;
export declare function getPoolKeysForTokenAddress(connection: Connection, tokenaddress: string): Promise<LiquidityPoolKeys | null>;
