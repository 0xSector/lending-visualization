import type { Transaction, ActionType, Network, Asset } from '../types/transaction';

const ACTIONS: ActionType[] = ['supply', 'borrow', 'repay', 'withdraw', 'liquidation'];
const NETWORKS: Network[] = ['Ethereum', 'Base', 'Arbitrum', 'Optimism'];
const ASSETS: Asset[] = ['USDC', 'ETH', 'WBTC', 'DAI', 'USDT', 'WETH', 'cbETH', 'stETH'];

const MARKET_NAMES = [
  'USDC/ETH (90% LLTV)',
  'WBTC/USDC (85% LLTV)',
  'ETH/DAI (86% LLTV)',
  'stETH/ETH (94.5% LLTV)',
  'cbETH/USDC (86% LLTV)',
];

function generateRandomHex(length: number): string {
  let result = '';
  const characters = '0123456789abcdef';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

function generateWalletAddress(): string {
  return `0x${generateRandomHex(40)}`;
}

function generateAmount(asset: Asset): number {
  const ranges: Record<Asset, [number, number]> = {
    'USDC': [100, 500000],
    'ETH': [0.1, 100],
    'WBTC': [0.01, 10],
    'DAI': [100, 500000],
    'USDT': [100, 500000],
    'WETH': [0.1, 100],
    'cbETH': [0.1, 50],
    'stETH': [0.1, 100],
  };
  const [min, max] = ranges[asset];
  return Math.round((Math.random() * (max - min) + min) * 100) / 100;
}

function generateAPY(action: ActionType): number {
  if (action === 'supply') {
    return Math.round((Math.random() * 8 + 1) * 100) / 100; // 1-9%
  }
  if (action === 'borrow') {
    return Math.round((Math.random() * 12 + 3) * 100) / 100; // 3-15%
  }
  return Math.round((Math.random() * 10 + 2) * 100) / 100;
}

function generateHealthFactor(): number {
  return Math.round((Math.random() * 2 + 1) * 100) / 100; // 1.0 - 3.0
}

export function generateTransaction(): Transaction {
  const action = ACTIONS[Math.floor(Math.random() * ACTIONS.length)];
  const asset = ASSETS[Math.floor(Math.random() * ASSETS.length)];
  const network = NETWORKS[Math.floor(Math.random() * NETWORKS.length)];

  const transaction: Transaction = {
    id: `tx-${Date.now()}-${generateRandomHex(8)}`,
    action,
    asset,
    amount: generateAmount(asset),
    walletAddress: generateWalletAddress(),
    network,
    timestamp: new Date(),
    apy: generateAPY(action),
    marketName: MARKET_NAMES[Math.floor(Math.random() * MARKET_NAMES.length)],
    healthFactor: generateHealthFactor(),
  };

  // Add collateral info for liquidations
  if (action === 'liquidation') {
    const collateralAssets = ASSETS.filter(a => a !== asset);
    transaction.collateralAsset = collateralAssets[Math.floor(Math.random() * collateralAssets.length)];
    transaction.collateralAmount = generateAmount(transaction.collateralAsset);
  }

  return transaction;
}

export function generateInitialTransactions(count: number): Transaction[] {
  const transactions: Transaction[] = [];
  const now = Date.now();

  for (let i = 0; i < count; i++) {
    const tx = generateTransaction();
    // Stagger timestamps for initial load
    tx.timestamp = new Date(now - (count - i) * 3000);
    transactions.push(tx);
  }

  return transactions;
}
