/**
 * Allium API Client
 *
 * HTTP client for querying Allium's Explorer SQL API.
 * Uses the VITE_ALLIUM_API_KEY environment variable for authentication.
 */

import type { AlliumLendingEvent, AlliumResult } from './types';
import { STABLECOIN_LENDING_QUERY, getLendingQueryWithWindow } from './queries';

const ALLIUM_EXPLORER_URL = 'https://api.allium.so/api/v1/explorer/queries/run';

// Maximum retry attempts for transient errors
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

/**
 * Get the API key from environment variables
 */
function getApiKey(): string | undefined {
  return import.meta.env.VITE_ALLIUM_API_KEY;
}

/**
 * Check if Allium API is configured
 */
export function isAlliumConfigured(): boolean {
  const apiKey = getApiKey();
  return typeof apiKey === 'string' && apiKey.length > 0;
}

/**
 * Sleep utility for retry delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Execute a SQL query against Allium's Explorer API
 */
async function executeQuery(sql: string, retryCount = 0): Promise<AlliumResult> {
  const apiKey = getApiKey();

  if (!apiKey) {
    return {
      success: false,
      error: 'Allium API key not configured. Set VITE_ALLIUM_API_KEY in your environment.',
    };
  }

  try {
    const response = await fetch(ALLIUM_EXPLORER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey,
      },
      body: JSON.stringify({ sql }),
    });

    if (!response.ok) {
      // Handle rate limiting with retry
      if (response.status === 429 && retryCount < MAX_RETRIES) {
        const retryAfter = response.headers.get('Retry-After');
        const delay = retryAfter ? parseInt(retryAfter, 10) * 1000 : RETRY_DELAY_MS * (retryCount + 1);
        await sleep(delay);
        return executeQuery(sql, retryCount + 1);
      }

      // Handle server errors with retry
      if (response.status >= 500 && retryCount < MAX_RETRIES) {
        await sleep(RETRY_DELAY_MS * (retryCount + 1));
        return executeQuery(sql, retryCount + 1);
      }

      const errorText = await response.text();
      return {
        success: false,
        error: `Allium API error (${response.status}): ${errorText}`,
      };
    }

    const result = await response.json();

    // The Explorer API returns data directly as an array
    const data: AlliumLendingEvent[] = Array.isArray(result) ? result : (result.data || []);

    return {
      success: true,
      data,
    };
  } catch (error) {
    // Retry on network errors
    if (retryCount < MAX_RETRIES && error instanceof TypeError) {
      await sleep(RETRY_DELAY_MS * (retryCount + 1));
      return executeQuery(sql, retryCount + 1);
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Fetch stablecoin lending events from the last 5 minutes
 */
export async function fetchLendingEvents(): Promise<AlliumResult> {
  return executeQuery(STABLECOIN_LENDING_QUERY);
}

/**
 * Fetch stablecoin lending events from a custom time window
 */
export async function fetchLendingEventsWithWindow(minutes: number): Promise<AlliumResult> {
  const query = getLendingQueryWithWindow(minutes);
  return executeQuery(query);
}
