/**
 * Allium API Response Types
 */

export interface AlliumLendingEvent {
  action: string;
  chain: string;
  project: string;
  token_symbol: string;
  usd_amount: number;
  wallet: string;
  block_timestamp: string;
  transaction_hash: string;
}

export interface AlliumQueryResponse {
  data: AlliumLendingEvent[];
  columns?: {
    name: string;
    type: string;
  }[];
  query_id?: string;
  run_time_ms?: number;
}

export interface AlliumError {
  error: string;
  message?: string;
  status?: number;
}

export type AlliumResult =
  | { success: true; data: AlliumLendingEvent[] }
  | { success: false; error: string };
