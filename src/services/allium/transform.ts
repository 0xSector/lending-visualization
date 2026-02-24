/**
 * Data transformation utilities for Allium lending events
 *
 * Maps raw Allium API responses to the app's Transaction interface.
 */

import type { Transaction, ActionType, Asset, Network } from '../../types/transaction';
import type { AlliumLendingEvent } from './types';

/**
 * Map Allium action types to app ActionTypes
 */
function mapAction(action: string): ActionType {
  const actionMap: Record<string, ActionType> = {
    supply: 'supply',
    borrow: 'borrow',
    repay: 'repay',
    withdraw: 'withdraw',
  };
  return actionMap[action.toLowerCase()] || 'supply';
}

/**
 * Map Allium chain names to app Network type
 */
function mapNetwork(chain: string): Network {
  const networkMap: Record<string, Network> = {
    ethereum: 'Ethereum',
    base: 'Base',
    arbitrum: 'Arbitrum',
    optimism: 'Optimism',
  };
  return networkMap[chain.toLowerCase()] || 'Ethereum';
}

/**
 * Normalize token symbol to app Asset type
 */
function mapAsset(tokenSymbol: string): Asset {
  const symbol = tokenSymbol.toUpperCase();
  const assetMap: Record<string, Asset> = {
    USDC: 'USDC',
    USDT: 'USDT',
    PYUSD: 'PYUSD',
    ETH: 'ETH',
    WETH: 'WETH',
    WBTC: 'WBTC',
    DAI: 'DAI',
    CBETH: 'cbETH',
    STETH: 'stETH',
  };
  return assetMap[symbol] || 'USDC';
}

/**
 * Generate a unique ID from transaction hash
 */
function generateId(event: AlliumLendingEvent): string {
  // Use tx hash + action + wallet for uniqueness (same tx can have multiple events)
  return `${event.transaction_hash}-${event.action}-${event.wallet.slice(-8)}`;
}

/**
 * Format protocol name for display
 */
function formatProtocol(project: string): string {
  if (!project) return 'Unknown';
  // Capitalize first letter of each word
  return project
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Transform a single Allium lending event to a Transaction
 */
export function transformEvent(event: AlliumLendingEvent): Transaction {
  return {
    id: generateId(event),
    action: mapAction(event.action),
    asset: mapAsset(event.token_symbol),
    amount: event.usd_amount,
    walletAddress: event.wallet,
    network: mapNetwork(event.chain),
    timestamp: new Date(event.block_timestamp),
    marketName: formatProtocol(event.project),
    transactionHash: event.transaction_hash,
    protocol: event.project,
    dataSource: 'allium',
  };
}

/**
 * Transform an array of Allium lending events to Transactions
 */
export function transformEvents(events: AlliumLendingEvent[]): Transaction[] {
  return events.map(transformEvent);
}

/**
 * Deduplicate transactions by ID, keeping newer ones
 */
export function deduplicateTransactions(
  newTxs: Transaction[],
  existingTxs: Transaction[]
): Transaction[] {
  const existingIds = new Set(existingTxs.map(tx => tx.id));
  return newTxs.filter(tx => !existingIds.has(tx.id));
}
