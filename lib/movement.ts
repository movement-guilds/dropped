import { Movement, MovementConfig, Network } from "@moveindustries/ts-sdk";

const rpcMainnet = process.env.MOVEMENT_RPC_MAINNET ?? "https://mainnet.movementnetwork.xyz/v1";
const rpcTestnet = process.env.MOVEMENT_RPC_TESTNET ?? "https://testnet.movementnetwork.xyz/v1";

export const movementMainnet = new Movement(
  new MovementConfig({ network: Network.CUSTOM, fullnode: rpcMainnet })
);

export const movementTestnet = new Movement(
  new MovementConfig({ network: Network.CUSTOM, fullnode: rpcTestnet })
);

// Default export — mainnet for production
export const movement = movementMainnet;
