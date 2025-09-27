import { type MaybeRef, get } from '@vueuse/core';

export interface JsonParseLocation {
  line: number
  column: number
  message: string
  preview?: string
}

// Tries to extract line/column info from an error thrown by JSON5/JSON.parse
export function getJsonParseLocation(error: unknown, rawJson: string): JsonParseLocation | undefined {
  if (!error) {
    return undefined;
  }

  const message = String((error as any)?.message ?? error);

  // Try common patterns produced by JSON5 errors: e.g. "JSON5: invalid character '}' at 3:12"
  const lineColRegexes = [
    /(\d+):(\d+)/, // generic "3:12"
    /line\s*(\d+)\s*column\s*(\d+)/i, // "line 3 column 12"
  ];

  for (const re of lineColRegexes) {
    const m = message.match(re);
    if (m) {
      const line = Number(m[1]);
      const column = Number(m[2]);
      return {
        line,
        column,
        message,
        preview: getPreview(rawJson, line, column),
      };
    }
  }

  // Fallback: compute rough line by counting newlines up to position if index present
  const posMatch = message.match(/position\s*(\d+)/i);
  if (posMatch) {
    const index = Number(posMatch[1]);
    const { line, column } = computeLineColumnFromIndex(rawJson, index);
    return {
      line,
      column,
      message,
      preview: getPreview(rawJson, line, column),
    };
  }

  return undefined;
}

export function computeLineColumnFromIndex(text: string, index: number): { line: number, column: number } {
  // 1-based line/column
  const clamped = Math.max(0, Math.min(index, text.length));
  let line = 1;
  let lastLineBreak = -1;
  for (let i = 0; i < clamped; i++) {
    const ch = text.charCodeAt(i);
    if (ch === 10 /* \n */) {
      line += 1;
      lastLineBreak = i;
    }
  }
  const column = clamped - lastLineBreak;
  return { line, column };
}

function getPreview(text: string, line: number, column: number): string {
  const lines = text.split(/\r?\n/);
  const idx = Math.max(0, Math.min(line - 1, lines.length - 1));
  const snippet = lines[idx] ?? '';
  // Build a caret line to indicate column, avoiding negative or very large values
  const caretPos = Math.max(1, Math.min(column, snippet.length + 1));
  const caretLine = `${' '.repeat(caretPos - 1)}^`;
  return `${snippet}\n${caretLine}`;
}


