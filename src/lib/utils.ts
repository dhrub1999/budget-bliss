import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Narrow a caught value to a displayable string.
 *
 * `strict: true` enables `useUnknownInCatchVariables`, so a caught value is
 * `unknown` and `error.message` doesn't compile — which is why this codebase was
 * full of `catch (error: any)`. Use `catch (error: unknown)` plus this helper.
 *
 * **Client-side and server-log use only.** Never pass the result to an API
 * response: a `postgres.js` error message carries column names, constraint names
 * and sometimes the offending row values. Route handlers return a fixed fallback
 * string instead and keep the real error in `console.error`.
 */
export function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === 'string' && error) return error;
  return fallback;
}

export function formatBytes(
  bytes: number,
  opts: {
    decimals?: number;
    sizeType?: 'accurate' | 'normal';
  } = {}
) {
  const { decimals = 0, sizeType = 'normal' } = opts;

  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const accurateSizes = ['Bytes', 'KiB', 'MiB', 'GiB', 'TiB'];
  if (bytes === 0) return '0 Byte';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(decimals)} ${
    sizeType === 'accurate'
      ? (accurateSizes[i] ?? 'Bytest')
      : (sizes[i] ?? 'Bytes')
  }`;
}
