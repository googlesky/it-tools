<script setup lang="ts">
import { withDefaultOnError } from '@/utils/defaults';
import SpanCopyable from '@/components/SpanCopyable.vue';

const input = ref('2001:db8::/48');

interface Ipv6Info {
  normalized: string
  network: string
  prefixLength: number
  first: string
  last: string
  size: string
  reversePtrZone: string
}

function expandIpv6(ip: string) {
  const [addr, prefix] = ip.split('/');
  const hextets = addr.split('::');
  const left = hextets[0] ? hextets[0].split(':') : [];
  const right = hextets[1] ? hextets[1].split(':') : [];
  const missing = 8 - (left.length + right.length);
  const full = [...left, ...Array(Math.max(0, missing)).fill('0'), ...right].map(h => h.padStart(4, '0'));
  return { full, prefix: Number(prefix ?? 128) };
}

function ipv6ToBigint(parts: string[]) {
  return parts.reduce((acc, h) => (acc << 16n) + BigInt(parseInt(h, 16)), 0n);
}

function bigintToIpv6(value: bigint) {
  const parts: string[] = [];
  for (let i = 0; i < 8; i++) {
    const shift = BigInt(16 * (7 - i));
    const part = Number((value >> (shift)) & 0xFFFFn);
    parts.push(part.toString(16).padStart(4, '0'));
  }
  // compress simple: replace first longest run of :0000:
  const s = parts.join(':');
  return s.replace(/(^|:)0{1,3}/g, '$1');
}

function networkInfo(ip: string): Ipv6Info {
  const { full, prefix } = expandIpv6(ip.trim());
  const addr = ipv6ToBigint(full);
  const mask = (prefix === 0 ? 0n : (~0n << BigInt(128 - prefix)) & ((1n << 128n) - 1n));
  const network = addr & mask;
  const size = 1n << BigInt(128 - prefix);
  const first = network;
  const last = network + (size - 1n);

  const networkStr = bigintToIpv6(network);
  const firstStr = bigintToIpv6(first);
  const lastStr = bigintToIpv6(last);
  const normalized = full.join(':');

  const nibbles = network.toString(16).padStart(32, '0').slice(0, prefix === 0 ? 0 : Math.ceil(prefix / 4));
  const reversePtrZone = nibbles.split('').reverse().join('.') + '.ip6.arpa';

  return { normalized, network: `${networkStr}/${prefix}`, prefixLength: prefix, first: firstStr, last: lastStr, size: size.toString(), reversePtrZone };
}

const info = computed(() => withDefaultOnError(() => networkInfo(input.value), undefined));
</script>

<template>
  <div>
    <c-input-text v-model:value="input" label="IPv6 prefix" placeholder="2001:db8::/48" />
    <div v-if="info" mt-4>
      <n-table>
        <tbody>
          <tr><td>Normalized</td><td><SpanCopyable :value="info.normalized" /></td></tr>
          <tr><td>Network</td><td><SpanCopyable :value="info.network" /></td></tr>
          <tr><td>First</td><td><SpanCopyable :value="info.first" /></td></tr>
          <tr><td>Last</td><td><SpanCopyable :value="info.last" /></td></tr>
          <tr><td>Size</td><td>{{ info.size }}</td></tr>
          <tr><td>PTR zone</td><td><SpanCopyable :value="info.reversePtrZone" /></td></tr>
        </tbody>
      </n-table>
    </div>
  </div>
</template>


