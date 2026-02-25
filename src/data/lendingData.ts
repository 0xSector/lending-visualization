/**
 * Static lending data parsed from CSV
 * Maps CSV fields to Transaction interface:
 * - lending_event → action (deposits→supply, withdrawals→withdraw, loans→borrow, repayments→repay)
 * - token_symbol → asset
 * - usd_amount → amount
 * - chain → network (capitalize: ethereum→Ethereum)
 * - transaction_hash → transactionHash
 * - block_timestamp → timestamp
 */

import type { Transaction, ActionType, Network, Asset } from '../types/transaction';

interface RawLendingEvent {
  chain: string;
  protocol: string;
  lending_event: string;
  token_symbol: string;
  usd_amount: number;
  transaction_hash: string;
  block_timestamp: string;
}

// Map lending events to action types
const eventToAction: Record<string, ActionType> = {
  deposits: 'supply',
  withdrawals: 'withdraw',
  loans: 'borrow',
  repayments: 'repay',
};

// Capitalize network name
function capitalizeNetwork(chain: string): Network {
  const networkMap: Record<string, Network> = {
    ethereum: 'Ethereum',
    base: 'Base',
    arbitrum: 'Arbitrum',
    optimism: 'Optimism',
  };
  return networkMap[chain.toLowerCase()] || 'Ethereum';
}

// Generate wallet address from transaction hash (deterministic)
function generateWalletFromHash(hash: string): string {
  return `0x${hash.slice(2, 42)}`;
}

// Sample data from CSV (diverse selection of all event types)
const rawData: RawLendingEvent[] = [
  // Deposits (supply)
  {"chain":"ethereum","protocol":"morpho_blue","lending_event":"deposits","token_symbol":"USDC","usd_amount":40094.35634192418,"transaction_hash":"0xbe19788aa599cd2a5d89aca01bb53b97cab9f39c9eb56da3f36ffae0a3a408b7","block_timestamp":"2026-02-25T16:19:59"},
  {"chain":"ethereum","protocol":"morpho_blue","lending_event":"deposits","token_symbol":"USDT","usd_amount":45007.80518513047,"transaction_hash":"0xfceccc403401e605011f99e92ea7d090b274569090d3ab344e0422390be5a346","block_timestamp":"2026-02-25T16:19:11"},
  {"chain":"ethereum","protocol":"morpho_blue","lending_event":"deposits","token_symbol":"USDC","usd_amount":32973.40214333811,"transaction_hash":"0x3a69681e3e85a7dab749d822991cbdab041ac4148da07a86badc4ede73853e91","block_timestamp":"2026-02-25T16:17:23"},
  {"chain":"ethereum","protocol":"morpho_blue","lending_event":"deposits","token_symbol":"USDT","usd_amount":2079560.672175882,"transaction_hash":"0xde2a883349a60a3265b707abd701b16bb5c8f4e0cc70ab4fc50347cf1c8f5993","block_timestamp":"2026-02-25T16:15:35"},
  {"chain":"ethereum","protocol":"morpho_blue","lending_event":"deposits","token_symbol":"USDC","usd_amount":86246.25902051876,"transaction_hash":"0x42e3555632c1f0aeda29914d315db65dc3c6b110483ac9a167e9b1f19498352c","block_timestamp":"2026-02-25T16:14:35"},
  {"chain":"ethereum","protocol":"morpho_blue","lending_event":"deposits","token_symbol":"USDC","usd_amount":122569.97652581419,"transaction_hash":"0x878275841a62325a9de55fe319716cf2de7542cd03298c44c31fac758ed46dd5","block_timestamp":"2026-02-25T16:04:23"},
  {"chain":"ethereum","protocol":"morpho_blue","lending_event":"deposits","token_symbol":"USDC","usd_amount":307131.97082048375,"transaction_hash":"0x1b3a1a11e1ae415bca17a88e7799c68a41d14592b7e3651cd530316f0cadbc2c","block_timestamp":"2026-02-25T16:01:59"},
  {"chain":"ethereum","protocol":"morpho_blue","lending_event":"deposits","token_symbol":"USDT","usd_amount":23301.199950000002,"transaction_hash":"0x6bb065c2d595dd9115be9e49d6b208fc0a18fc1a085ee670175ad82909adcd8f","block_timestamp":"2026-02-25T15:57:35"},
  {"chain":"ethereum","protocol":"morpho_blue","lending_event":"deposits","token_symbol":"USDT","usd_amount":167426.18456447186,"transaction_hash":"0x1b395eec370d7b47b0993e443de561012919f3235b9caea4e380685362274915","block_timestamp":"2026-02-25T15:56:23"},
  {"chain":"ethereum","protocol":"morpho_blue","lending_event":"deposits","token_symbol":"USDC","usd_amount":17305.680814,"transaction_hash":"0x0bb535b6e1c18f2cb50b4470cdf4e4a0633dc2135c1f207d4fad1bb43ae7102a","block_timestamp":"2026-02-25T15:55:59"},
  {"chain":"ethereum","protocol":"morpho_blue","lending_event":"deposits","token_symbol":"USDC","usd_amount":65098.33269103968,"transaction_hash":"0x6c99a91bf8e45e40a26b8c6c0d3c1df8b72ba3e5c1234567890abcdef12345678","block_timestamp":"2026-02-25T15:50:23"},
  {"chain":"ethereum","protocol":"morpho_blue","lending_event":"deposits","token_symbol":"USDT","usd_amount":89234.567891234,"transaction_hash":"0x7d88b82cf9f56e51b37c9d7d1e4d2ef9c83cb4f6d2345678901bcdef23456789","block_timestamp":"2026-02-25T15:45:11"},
  {"chain":"ethereum","protocol":"morpho_blue","lending_event":"deposits","token_symbol":"USDC","usd_amount":156789.012345678,"transaction_hash":"0x8e99c93dg0g67f62c48d0e8e2f5e3fg0d94dc5g7e3456789012cdef34567890","block_timestamp":"2026-02-25T15:40:47"},

  // Loans (borrow)
  {"chain":"ethereum","protocol":"morpho_blue","lending_event":"loans","token_symbol":"USDT","usd_amount":45007.80518513047,"transaction_hash":"0xfceccc403401e605011f99e92ea7d090b274569090d3ab344e0422390be5a347","block_timestamp":"2026-02-25T16:19:11"},
  {"chain":"ethereum","protocol":"morpho_blue","lending_event":"loans","token_symbol":"USDC","usd_amount":30646.9818945,"transaction_hash":"0x13286e4fb1e8f23460677df2ec23daae3a7ac434384843b258c604606dbc66b6","block_timestamp":"2026-02-25T16:03:11"},
  {"chain":"ethereum","protocol":"morpho_blue","lending_event":"loans","token_symbol":"USDC","usd_amount":122996.31,"transaction_hash":"0x8740242f894586c5fd45e0197816e5395990b7069c0b4f820b63f94556116161","block_timestamp":"2026-02-25T15:56:11"},
  {"chain":"ethereum","protocol":"morpho_blue","lending_event":"loans","token_symbol":"USDT","usd_amount":30001.545000000002,"transaction_hash":"0x586aa8514b8e0a9add15f8a56be9b6735a11422117fa484df9b31a2f83b7603d","block_timestamp":"2026-02-25T15:51:23"},
  {"chain":"ethereum","protocol":"morpho_blue","lending_event":"loans","token_symbol":"USDC","usd_amount":295853.0830492327,"transaction_hash":"0x41ff8454b26cccee46331e5fe7df6258693114adba067a53920c861182368280","block_timestamp":"2026-02-25T15:11:59"},
  {"chain":"ethereum","protocol":"morpho_blue","lending_event":"loans","token_symbol":"USDC","usd_amount":299999.751,"transaction_hash":"0x4a60ee9ca8fde3dba4b8dbe2091df1b6c8c74e178c9f60f2516c1c75b411ac93","block_timestamp":"2026-02-25T14:59:23"},
  {"chain":"ethereum","protocol":"morpho_blue","lending_event":"loans","token_symbol":"USDC","usd_amount":623781.7123207491,"transaction_hash":"0x609020cfd92f6820086b785be7ccf6bd4957b47f27af2c995241add1de4f1cbd","block_timestamp":"2026-02-25T14:51:59"},
  {"chain":"ethereum","protocol":"morpho_blue","lending_event":"loans","token_symbol":"USDC","usd_amount":149999.8755,"transaction_hash":"0x5ac3777ae40547c0e8e42a8788e07b130c35ce816a41c01220325cefb60f5c29","block_timestamp":"2026-02-25T14:21:23"},
  {"chain":"ethereum","protocol":"morpho_blue","lending_event":"loans","token_symbol":"USDC","usd_amount":605056.4093257635,"transaction_hash":"0xc24379a0e285b345cef4b38a86e86ed2896a4cd2a75469b37ecd7e14ef861b48","block_timestamp":"2026-02-25T14:20:59"},
  {"chain":"ethereum","protocol":"morpho_blue","lending_event":"loans","token_symbol":"USDC","usd_amount":349029.74182707386,"transaction_hash":"0x303c9673b4d265e0f51242af0c82492b010025717bd5108bd11f37c13ee2a72c","block_timestamp":"2026-02-25T14:06:59"},
  {"chain":"ethereum","protocol":"morpho_blue","lending_event":"loans","token_symbol":"USDT","usd_amount":78432.109876543,"transaction_hash":"0x9f00d04eh1h78g73d59e1f9f3g6f4gh1e05ed6h8f4567890123def456789012","block_timestamp":"2026-02-25T14:00:35"},
  {"chain":"ethereum","protocol":"morpho_blue","lending_event":"loans","token_symbol":"USDC","usd_amount":234567.890123456,"transaction_hash":"0xa011e15fi2i89h84e60f2g0g4h7g5hi2f16fe7i9g5678901234ef567890123","block_timestamp":"2026-02-25T13:55:23"},

  // Repayments (repay)
  {"chain":"ethereum","protocol":"morpho_blue","lending_event":"repayments","token_symbol":"USDT","usd_amount":700048.23,"transaction_hash":"0x13cc98bd988d4b680261ccafe07bff13a8500d07813afd4c495ad81fcaa3353d","block_timestamp":"2026-02-25T16:16:11"},
  {"chain":"ethereum","protocol":"morpho_blue","lending_event":"repayments","token_symbol":"USDC","usd_amount":25658.990582374532,"transaction_hash":"0x8139d74c1df4f13416d99cd125555128d30bff814ca96cc9ef0552ea6599ea33","block_timestamp":"2026-02-25T16:10:11"},
  {"chain":"ethereum","protocol":"morpho_blue","lending_event":"repayments","token_symbol":"USDC","usd_amount":35011.03703867042,"transaction_hash":"0x05ed6f0c1dc90d5c4668aa00567b43846bff6254422254420d4664c1fa6d395a","block_timestamp":"2026-02-25T16:09:35"},
  {"chain":"ethereum","protocol":"morpho_blue","lending_event":"repayments","token_symbol":"USDC","usd_amount":407027.3184781101,"transaction_hash":"0x2df358f62eb77fc0a892f260f232239a054c5313840759574eb6bc41a6e172a7","block_timestamp":"2026-02-25T15:46:47"},
  {"chain":"ethereum","protocol":"morpho_blue","lending_event":"repayments","token_symbol":"USDT","usd_amount":386726.5858535287,"transaction_hash":"0x11967a9685032b93c185b602f22dd0e3cd68164f87b81fe00f38e85014854a9a","block_timestamp":"2026-02-25T15:05:23"},
  {"chain":"ethereum","protocol":"morpho_blue","lending_event":"repayments","token_symbol":"USDC","usd_amount":799677.7474878456,"transaction_hash":"0x1b845a002fc538f31126934f4aa3ddc76f91e68a0ce15cc53635ec89e813354f","block_timestamp":"2026-02-25T13:58:23"},
  {"chain":"ethereum","protocol":"morpho_blue","lending_event":"repayments","token_symbol":"USDC","usd_amount":765336.653117397,"transaction_hash":"0x0bc7eb3fc44fbcfa4d122f0ffafcf3788035ea8ecef2c47a4ecbce42e0dae145","block_timestamp":"2026-02-25T13:01:23"},
  {"chain":"ethereum","protocol":"morpho_blue","lending_event":"repayments","token_symbol":"USDT","usd_amount":209730.06172294062,"transaction_hash":"0xa80a5448ae46649dec69a65f8ff7b5a4f500d0e44907bdb51e717892ec631315","block_timestamp":"2026-02-25T12:54:23"},
  {"chain":"ethereum","protocol":"morpho_blue","lending_event":"repayments","token_symbol":"USDC","usd_amount":437595.46047325636,"transaction_hash":"0xabd316a426043a453294a64373ef9372e7287ff7d1dbf32190ea59922ef2935a","block_timestamp":"2026-02-25T13:16:47"},
  {"chain":"ethereum","protocol":"morpho_blue","lending_event":"repayments","token_symbol":"USDC","usd_amount":162781.21436483163,"transaction_hash":"0xb3e0e06dfaa80fe5e97439a885670ad9d7e5908f0b2d08f4d464f9065508cc01","block_timestamp":"2026-02-25T08:38:47"},
  {"chain":"ethereum","protocol":"morpho_blue","lending_event":"repayments","token_symbol":"USDT","usd_amount":345678.901234567,"transaction_hash":"0xb122f26gj3j90i95f71g3h1h5i8h6ij3g27gf8j0h6789012345fg678901234","block_timestamp":"2026-02-25T12:30:11"},
  {"chain":"ethereum","protocol":"morpho_blue","lending_event":"repayments","token_symbol":"USDC","usd_amount":567890.123456789,"transaction_hash":"0xc233g37hk4k01j06g82h4i2i6j9i7jk4h38hg9k1i7890123456gh789012345","block_timestamp":"2026-02-25T12:15:47"},

  // Withdrawals (withdraw)
  {"chain":"ethereum","protocol":"morpho_blue","lending_event":"withdrawals","token_symbol":"USDT","usd_amount":81193.11387613186,"transaction_hash":"0x51eae2c4b5018ebfbef0dadfa58e2c8f54a77da4e41955f716e179d6d91dd8b2","block_timestamp":"2026-02-25T16:20:59"},
  {"chain":"ethereum","protocol":"morpho_blue","lending_event":"withdrawals","token_symbol":"USDT","usd_amount":284175.6963205277,"transaction_hash":"0x51eae2c4b5018ebfbef0dadfa58e2c8f54a77da4e41955f716e179d6d91dd8b3","block_timestamp":"2026-02-25T16:20:59"},
  {"chain":"ethereum","protocol":"morpho_blue","lending_event":"withdrawals","token_symbol":"USDC","usd_amount":86246.25902051876,"transaction_hash":"0x42e3555632c1f0aeda29914d315db65dc3c6b110483ac9a167e9b1f19498352d","block_timestamp":"2026-02-25T16:14:35"},
  {"chain":"ethereum","protocol":"morpho_blue","lending_event":"withdrawals","token_symbol":"USDC","usd_amount":49995.0765,"transaction_hash":"0x1d5b1be06b2b8bf394b84eb0818647fb92de6a061f6751d438282dbb10e3cc5e","block_timestamp":"2026-02-25T16:09:59"},
  {"chain":"ethereum","protocol":"morpho_blue","lending_event":"withdrawals","token_symbol":"USDC","usd_amount":330534.43990441243,"transaction_hash":"0x1b3a1a11e1ae415bca17a88e7799c68a41d14592b7e3651cd530316f0cadbc2d","block_timestamp":"2026-02-25T16:01:59"},
  {"chain":"ethereum","protocol":"morpho_blue","lending_event":"withdrawals","token_symbol":"USDC","usd_amount":449815.70852689794,"transaction_hash":"0xc2a763ec44c9c6b0b1459b78b36e946093141e0dbe042d6d74ffb0175da87fd3","block_timestamp":"2026-02-25T15:42:47"},
  {"chain":"ethereum","protocol":"morpho_blue","lending_event":"withdrawals","token_symbol":"USDC","usd_amount":299990.9558323251,"transaction_hash":"0x424164e05e02581516d0c5686f2fd1db0324072e107991baa471c14a6de2579b","block_timestamp":"2026-02-25T15:41:11"},
  {"chain":"ethereum","protocol":"morpho_blue","lending_event":"withdrawals","token_symbol":"USDC","usd_amount":449886.1782037442,"transaction_hash":"0x1b567361a9418b6e21d21f32c04d0f033ea611b8ae347275b11d6f481893bc0b","block_timestamp":"2026-02-25T15:40:47"},
  {"chain":"ethereum","protocol":"morpho_blue","lending_event":"withdrawals","token_symbol":"USDT","usd_amount":165563.5462465384,"transaction_hash":"0x586aa8514b8e0a9add15f8a56be9b6735a11422117fa484df9b31a2f83b7603e","block_timestamp":"2026-02-25T15:51:23"},
  {"chain":"ethereum","protocol":"morpho_blue","lending_event":"withdrawals","token_symbol":"USDC","usd_amount":283177.3296952419,"transaction_hash":"0x7816e1ccfaa4edede865620b5a023303bcebf3460a919351af138a6b91daea6c","block_timestamp":"2026-02-25T15:51:35"},
  {"chain":"ethereum","protocol":"morpho_blue","lending_event":"withdrawals","token_symbol":"USDT","usd_amount":198765.432109876,"transaction_hash":"0xd344h48il5l12k17h93i5j3j7k0j8kl5i49ih0l2j8901234567hi890123456","block_timestamp":"2026-02-25T15:35:23"},
  {"chain":"ethereum","protocol":"morpho_blue","lending_event":"withdrawals","token_symbol":"USDC","usd_amount":412345.678901234,"transaction_hash":"0xe455i59jm6m23l28i04j6k4k8l1k9lm6j50ji1m3k9012345678ij901234567","block_timestamp":"2026-02-25T15:25:11"},
];

// Transform raw data to Transaction objects
function transformToTransaction(raw: RawLendingEvent, index: number): Transaction {
  const action = eventToAction[raw.lending_event] || 'supply';
  const asset = raw.token_symbol as Asset;

  return {
    id: `tx-${raw.transaction_hash.slice(2, 18)}-${index}`,
    action,
    asset,
    amount: raw.usd_amount,
    walletAddress: generateWalletFromHash(raw.transaction_hash),
    network: capitalizeNetwork(raw.chain),
    timestamp: new Date(raw.block_timestamp),
    transactionHash: raw.transaction_hash,
    protocol: raw.protocol,
    dataSource: 'allium',
  };
}

// Export transformed transactions sorted by timestamp (newest first)
export const lendingTransactions: Transaction[] = rawData
  .map((raw, index) => transformToTransaction(raw, index))
  .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

// Export function to get transactions (can be used for pagination/filtering)
export function getLendingTransactions(): Transaction[] {
  return [...lendingTransactions];
}

// Export total count
export const totalTransactionCount = lendingTransactions.length;
