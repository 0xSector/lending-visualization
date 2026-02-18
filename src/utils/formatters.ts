import type { Asset } from '../types/transaction';

export function truncateAddress(address: string): string {
  if (address.length <= 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatAmount(amount: number, asset: Asset): string {
  const isStablecoin = ['USDC', 'DAI', 'USDT'].includes(asset);

  if (isStablecoin) {
    return new Intl.NumberFormat('en-US', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  }

  // For crypto assets, show more precision for small amounts
  if (amount < 1) {
    return amount.toFixed(4);
  } else if (amount < 100) {
    return amount.toFixed(3);
  }

  return new Intl.NumberFormat('en-US', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatUSD(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatAPY(apy: number): string {
  return `${apy.toFixed(2)}%`;
}

export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);

  if (diffSeconds < 60) {
    return `${diffSeconds}s ago`;
  } else if (diffMinutes < 60) {
    return `${diffMinutes}m ago`;
  } else if (diffHours < 24) {
    return `${diffHours}h ago`;
  }

  return date.toLocaleDateString();
}

export function getAssetColor(asset: Asset): string {
  const colors: Record<Asset, string> = {
    'USDC': '#2775CA',
    'ETH': '#627EEA',
    'WBTC': '#F7931A',
    'DAI': '#F5AC37',
    'USDT': '#26A17B',
    'WETH': '#627EEA',
    'cbETH': '#0052FF',
    'stETH': '#00A3FF',
  };
  return colors[asset] || '#6B7280';
}
