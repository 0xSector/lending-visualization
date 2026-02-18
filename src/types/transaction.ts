export type ActionType = 'supply' | 'borrow' | 'repay' | 'withdraw' | 'liquidation';

export type Network = 'Ethereum' | 'Base' | 'Arbitrum' | 'Optimism';

export type Asset = 'USDC' | 'ETH' | 'WBTC' | 'DAI' | 'USDT' | 'WETH' | 'cbETH' | 'stETH';

export interface Transaction {
  id: string;
  action: ActionType;
  asset: Asset;
  amount: number;
  walletAddress: string;
  network: Network;
  timestamp: Date;
  apy?: number;
  marketName?: string;
  collateralAsset?: Asset;
  collateralAmount?: number;
  healthFactor?: number;
}

export interface TransactionCardProps {
  transaction: Transaction;
  onClick: (transaction: Transaction) => void;
  isNew?: boolean;
}

export interface TransactionModalProps {
  transaction: Transaction | null;
  isOpen: boolean;
  onClose: () => void;
}

export interface NetworkBadgeProps {
  network: Network;
}
