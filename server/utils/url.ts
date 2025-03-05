import { toASCII, toUnicode } from 'tr46';

export function normalizeUrl(url: string): string {
  const parsed = new URL(url);
  parsed.hostname = toASCII(parsed.hostname);
  return parsed.toString();
}

export function displayUrl(url: string): string {
  const parsed = new URL(url);
  parsed.hostname = toUnicode(parsed.hostname);
  return parsed.toString();
}