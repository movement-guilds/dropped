import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";

const rpcMainnet = process.env.MOVEMENT_RPC_MAINNET ?? "https://mainnet.movementnetwork.xyz/v1";
const rpcTestnet = process.env.MOVEMENT_RPC_TESTNET ?? "https://testnet.movementnetwork.xyz/v1";

export const movementMainnet = new Aptos(
  new AptosConfig({ network: Network.CUSTOM, fullnode: rpcMainnet })
);

export const movementTestnet = new Aptos(
  new AptosConfig({ network: Network.CUSTOM, fullnode: rpcTestnet })
);

// Default export — mainnet for production
export const movement = movementMainnet;
