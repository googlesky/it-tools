import { parse as shellParse } from 'shell-quote';

export interface HttpRequestIR {
  method: string
  url: string
  headers: Record<string, string>
  body?: string
}

function base64Encode(text: string): string {
  try {
    // Browser
    // eslint-disable-next-line no-undef
    return btoa(text);
  }
  catch {
    // Node fallback
    return Buffer.from(text, 'utf-8').toString('base64');
  }
}

function unquote(value: string): string {
  if (!value) return value;
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    return value.slice(1, -1);
  }
  return value;
}

export function parseCurlCommand(curlText: string): HttpRequestIR | null {
  if (!curlText.trim()) return null;
  const tokens = shellParse(curlText).map(t => typeof t === 'object' && 'pattern' in (t as any) ? (t as any).pattern : String(t)) as string[];
  if (tokens.length === 0) return null;
  // drop initial 'curl'
  if (tokens[0] && tokens[0].toLowerCase() === 'curl') tokens.shift();

  const headers: Record<string, string> = {};
  let url = '';
  let method = 'GET';
  let body: string | undefined;

  const readNext = (i: number): [string | undefined, number] => [tokens[i + 1], i + 1];

  for (let i = 0; i < tokens.length; i++) {
    const tok = tokens[i];
    if (!tok) continue;
    switch (tok) {
      case '--url': {
        const [val, ni] = readNext(i);
        if (val) url = unquote(val);
        i = ni;
        break;
      }
      case '-X':
      case '--request': {
        const [val, ni] = readNext(i);
        if (val) method = unquote(val).toUpperCase();
        i = ni;
        break;
      }
      case '-H':
      case '--header': {
        const [val, ni] = readNext(i);
        if (val) {
          const hv = unquote(val);
          const idx = hv.indexOf(':');
          if (idx !== -1) {
            const name = hv.slice(0, idx).trim();
            const value = hv.slice(idx + 1).trim();
            headers[name] = value;
          }
        }
        i = ni;
        break;
      }
      case '-d':
      case '--data':
      case '--data-raw':
      case '--data-binary':
      case '--data-ascii': {
        const [val, ni] = readNext(i);
        if (val !== undefined) {
          body = unquote(val);
          if (!headers['Content-Type']) headers['Content-Type'] = 'application/x-www-form-urlencoded';
          if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) method = 'POST';
        }
        i = ni;
        break;
      }
      case '--json': {
        const [val, ni] = readNext(i);
        if (val !== undefined) {
          body = unquote(val);
          headers['Content-Type'] = 'application/json';
          if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) method = 'POST';
        }
        i = ni;
        break;
      }
      case '-u':
      case '--user': {
        const [val, ni] = readNext(i);
        const cred = val ? unquote(val) : '';
        if (cred) headers['Authorization'] = `Basic ${base64Encode(cred)}`;
        i = ni;
        break;
      }
      case '-I':
      case '--head': {
        method = 'HEAD';
        break;
      }
      case '-b':
      case '--cookie': {
        const [val, ni] = readNext(i);
        if (val) headers['Cookie'] = unquote(val);
        i = ni;
        break;
      }
      case '--compressed':
      case '-k':
      case '--insecure': {
        // hints only, ignore in generators or show comment
        break;
      }
      default: {
        // First non-flag token treated as URL (if not set yet)
        if (!tok.startsWith('-') && !url) url = unquote(tok);
      }
    }
  }

  return { method, url, headers, body };
}

export function generateFetch(ir: HttpRequestIR): string {
  const headerLines = Object.entries(ir.headers || {})
    .map(([k, v]) => `    '${k}': '${v.replace(/'/g, "\\'")}',`)
    .join('\n');
  const hasHeaders = headerLines.length > 0;
  const bodyLine = ir.body !== undefined ? `\n  body: ${formatBodyValue(ir)},` : '';
  return `const url = '${ir.url.replace(/'/g, "\\'")}';\nconst options = {\n  method: '${ir.method.toUpperCase()}',${hasHeaders ? `\n  headers: {\n${headerLines}\n  },` : ''}${bodyLine}\n};\n\nfetch(url, options)\n  .then(res => res.json().catch(() => res.text()))\n  .then(console.log)\n  .catch(console.error);`;
}

export function generateAxios(ir: HttpRequestIR): string {
  const headerLines = Object.entries(ir.headers || {})
    .map(([k, v]) => `    '${k}': '${v.replace(/'/g, "\\'")}',`)
    .join('\n');
  const hasHeaders = headerLines.length > 0;
  const dataLine = ir.body !== undefined ? `\n  data: ${formatBodyValue(ir)},` : '';
  return `import axios from 'axios';\n\nconst res = await axios.request({\n  url: '${ir.url.replace(/'/g, "\\'")}',\n  method: '${ir.method.toUpperCase()}',${hasHeaders ? `\n  headers: {\n${headerLines}\n  },` : ''}${dataLine}\n});\nconsole.log(res.data);`;
}

export function generateHttpie(ir: HttpRequestIR): string {
  const method = ir.method.toUpperCase();
  const parts: string[] = ['http'];
  if (method !== 'GET') parts.push(method);
  parts.push(`'${ir.url.replace(/'/g, "'\\''")}'`);
  for (const [k, v] of Object.entries(ir.headers || {})) {
    parts.push(`'${k.replace(/'/g, "'\\''")}:${v.replace(/'/g, "'\\''")}'`);
  }
  if (ir.body !== undefined) {
    const body = ('' + ir.body).replace(/'/g, "'\\''");
    parts.push('<<<');
    parts.push(`'${body}'`);
  }
  return parts.join(' ');
}

export function generateSqlmap(ir: HttpRequestIR): string {
  const method = ir.method.toUpperCase();
  const parts: string[] = ['sqlmap'];
  // URL
  parts.push('-u');
  parts.push(`'${ir.url.replace(/'/g, "'\\''")}'`);

  if (method !== 'GET') {
    parts.push('--method');
    parts.push(`'${method}'`);
  }

  // Body
  if (ir.body !== undefined) {
    const bodyEsc = String(ir.body).replace(/'/g, "'\\''");
    parts.push('--data');
    parts.push(`'${bodyEsc}'`);
  }

  // Minimal headers allowlist
  const allow = new Set(['authorization', 'user-agent', 'referer', 'content-type', 'cookie']);
  const minimalHeaders: Record<string, string> = {};
  for (const [k, v] of Object.entries(ir.headers || {})) {
    const lk = k.toLowerCase();
    if (allow.has(lk)) minimalHeaders[k] = v;
  }

  // Cookie as dedicated option
  const cookieKey = Object.keys(minimalHeaders).find(k => k.toLowerCase() === 'cookie');
  if (cookieKey) {
    const cookieVal = minimalHeaders[cookieKey] ?? '';
    const cookieEsc = cookieVal.replace(/'/g, "'\\''");
    parts.push('--cookie');
    parts.push(`'${cookieEsc}'`);
    delete minimalHeaders[cookieKey];
  }

  // Remaining headers in --headers
  const headerLines = Object.entries(minimalHeaders)
    .map(([k, v]) => `${k}: ${v}`)
    .join('\n')
    .replace(/'/g, "'\\''");
  if (headerLines) {
    parts.push('--headers');
    parts.push(`'${headerLines}'`);
  }

  return parts.join(' ');
}

function isJsonContent(ir: HttpRequestIR): boolean {
  const ct = Object.keys(ir.headers || {}).find(h => h.toLowerCase() === 'content-type');
  const v = ct ? ir.headers[ct] : '';
  return typeof v === 'string' && v.toLowerCase().includes('application/json');
}

function formatBodyValue(ir: HttpRequestIR): string {
  if (ir.body === undefined) return 'undefined';
  if (isJsonContent(ir)) {
    try {
      const obj = JSON.parse(ir.body);
      return JSON.stringify(obj, null, 2);
    }
    catch {
      // fallback to raw string
    }
  }
  return `'${String(ir.body).replace(/'/g, "\\'")}'`;
}


