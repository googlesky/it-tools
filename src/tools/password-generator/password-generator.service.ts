import { shuffleString } from '@/utils/random';

function removeAmbiguousChars(source: string): string {
  // Common ambiguous characters: Il1l0Oo, vertical bar and bracket-like punctuation
  const AMBIGUOUS = "Il1l0Oo|{}[]()/\\;:,.<>";
  return [...source].filter(c => !AMBIGUOUS.includes(c)).join('');
}

function pickOneCharFrom(set: string): string {
  if (!set) return '';
  const idx = Math.floor(Math.random() * set.length);
  return set[idx] ?? '';
}

export function createPassword({
  withUppercase = true,
  withLowercase = true,
  withNumbers = true,
  withSymbols = false,
  excludeAmbiguous = true,
  ensureEachSelected = true,
  length = 16,
  customAlphabet,
}: {
  withUppercase?: boolean
  withLowercase?: boolean
  withNumbers?: boolean
  withSymbols?: boolean
  excludeAmbiguous?: boolean
  ensureEachSelected?: boolean
  length?: number
  customAlphabet?: string
}) {
  // Character sets
  const UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const LOWER = 'abcdefghijklmnopqrstuvwxyz';
  const NUMBERS = '0123456789';
  // Symbols kept readable and commonly allowed in password policies
  const SYMBOLS = '!@#$%^&*()-_=+[]{}:,.<>/?\\|';

  const selectedSetsRaw = [
    withUppercase ? UPPER : '',
    withLowercase ? LOWER : '',
    withNumbers ? NUMBERS : '',
    withSymbols ? SYMBOLS : '',
  ].filter(Boolean) as string[];

  const selectedSets = (excludeAmbiguous
    ? selectedSetsRaw.map(removeAmbiguousChars)
    : selectedSetsRaw).filter(s => s.length > 0);

  // When custom alphabet is provided, it overrides selected sets
  const unionAlphabet = (customAlphabet && customAlphabet.length > 0)
    ? (excludeAmbiguous ? removeAmbiguousChars(customAlphabet) : customAlphabet)
    : selectedSets.join('');

  if (unionAlphabet.length === 0 || length <= 0) {
    return '';
  }

  const chars: string[] = [];

  if (ensureEachSelected && !customAlphabet && selectedSets.length > 0) {
    // If there are more sets than length, we still do our best and fill the length
    const maxPicks = Math.min(length, selectedSets.length);
    for (let i = 0; i < maxPicks; i++) {
      chars.push(pickOneCharFrom(selectedSets[i]!));
    }
  }

  // Fill remaining characters from union alphabet
  while (chars.length < length) {
    chars.push(pickOneCharFrom(unionAlphabet));
  }

  return shuffleString(chars.join(''));
}


