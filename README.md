# Raydium Pool Keys Fetcher
[![npm version](https://img.shields.io/npm/v/raydium-pool-keys.svg)](https://www.npmjs.com/package/raydium-pool-keys)
[![npm downloads](https://img.shields.io/npm/dm/raydium-pool-keys.svg)](https://www.npmjs.com/package/raydium-pool-keys)
[![license](https://img.shields.io/npm/l/raydium-pool-keys.svg)](https://www.npmjs.com/package/raydium-pool-keys)

A TypeScript utility for fetching Raydium pool keys for a given token address on the Solana blockchain. This package allows you to get market IDs and liquidity pool keys using the Raydium SDK and Solana web3.js. 
Important: You need an RPC that has the RPC call "getProgramAccounts" enabled. This will not work with the public mainnet-beta rpc, but will work fine free tier RPC's from [Helius](https://www.helius.dev/) for example.

## Installation

```bash
npm install raydium-pool-keys
```

## Usage

### Importing the Package

```typescript
import { Connection, PublicKey } from '@solana/web3.js';
import { getMarketIdForTokenAddress, getPoolKeysForTokenAddress } from 'raydium-pool-keys';
```

### Fetching Market ID for a Token Address

```typescript
const connection = new Connection('https://api.mainnet-beta.solana.com');
const tokenAddress = 'YourTokenAddressHere';

getMarketIdForTokenAddress(connection, tokenAddress)
  .then((marketId) => {
    if (marketId) {
      console.log('Market ID:', marketId.toString());
    } else {
      console.log('Market ID not found for the provided token address.');
    }
  })
  .catch((error) => {
    console.error('Error fetching Market ID:', error);
  });
```

### Fetching Pool Keys for a Token Address

```typescript
getPoolKeysForTokenAddress(connection, tokenAddress)
  .then((poolKeys) => {
    if (poolKeys) {
      console.log('Pool Keys:', poolKeys);
    } else {
      console.log('Pool Keys not found for the provided token address.');
    }
  })
  .catch((error) => {
    console.error('Error fetching Pool Keys:', error);
  });
```

## API

### `getMarketIdForTokenAddress(connection: Connection, tokenaddress: string): Promise<PublicKey | null>`

Fetches the market ID for a given token address.

- `connection`: An instance of `Connection` from `@solana/web3.js`.
- `tokenaddress`: The token address for which to fetch the market ID.

Returns a `Promise` that resolves to a `PublicKey` if found, otherwise `null`.

### `getPoolKeysForTokenAddress(connection: Connection, tokenaddress: string): Promise<LiquidityPoolKeys | null>`

Fetches the liquidity pool keys for a given token address.

- `connection`: An instance of `Connection` from `@solana/web3.js`.
- `tokenaddress`: The token address for which to fetch the pool keys.

Returns a `Promise` that resolves to `LiquidityPoolKeys` if found, otherwise `null`.

## Constants

You can define constants in a separate file (e.g., `constants.ts`) and import them as needed. Here's an example of what your `constants.ts` might look like:

```typescript
export const RAYDIUM_LIQUIDITY_POOL_V4_ADDRESS = 'YourRaydiumLiquidityPoolV4AddressHere';
export const WSOL_ADDRESS = 'YourWrappedSOLAddressHere';
```

## Example `constants.ts`

```typescript
export const RAYDIUM_LIQUIDITY_POOL_V4_ADDRESS = 'RAYDIUM_LIQUIDITY_POOL_V4_ADDRESS_HERE';
export const WSOL_ADDRESS = 'So11111111111111111111111111111111111111112';
```

## Contributing

Contributions are welcome! Please open an issue or submit a pull request with any improvements or bug fixes.

## License

This project is licensed under the MIT License.

---

This README provides a clear guide on how to install, use, and understand your package. Adjust the example addresses and constants as needed to match your actual configuration and data.
