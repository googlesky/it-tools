import { pki, asn1, md, util } from 'node-forge';

export interface CertificateInfo {
  subject: Record<string, string>
  issuer: Record<string, string>
  serialNumberHex: string
  validFrom: string
  validTo: string
  signatureAlgorithm: string
  publicKeyAlgorithm: string
  san?: string[]
  fingerprintSHA1?: string
  fingerprintSHA256?: string
}

export interface CsrInfo {
  subject: Record<string, string>
  attributes: Record<string, string>
  san?: string[]
}

export function parseCertificatePem(pem: string): CertificateInfo {
  const cert = pki.certificateFromPem(pem.trim());

  const subject: Record<string, string> = {};
  for (const attr of cert.subject.attributes) {
    subject[attr.shortName ?? attr.name] = attr.value;
  }

  const issuer: Record<string, string> = {};
  for (const attr of cert.issuer.attributes) {
    issuer[attr.shortName ?? attr.name] = attr.value;
  }

  const sanExt = cert.getExtension('subjectAltName') as undefined | { altNames?: Array<{ type: number; value?: string; ip?: string }> };
  const san = sanExt?.altNames?.map(n => n.value ?? n.ip ?? '').filter(Boolean);

  const signatureAlgorithm = cert.siginfo?.algorithmOid ?? '';
  const publicKeyAlgorithm = (cert.publicKey as any)?.algorithm?.name ?? 'RSA/ECDSA';

  const validFrom = cert.validity.notBefore.toISOString();
  const validTo = cert.validity.notAfter.toISOString();

  const der = asn1.toDer(pki.certificateToAsn1(cert)).getBytes();
  const sha1 = md.sha1.create();
  sha1.update(der);
  const fingerprintSHA1 = util.bytesToHex(sha1.digest().getBytes()).toUpperCase().match(/.{2}/g)?.join(':');
  const sha256 = md.sha256.create();
  sha256.update(der);
  const fingerprintSHA256 = util.bytesToHex(sha256.digest().getBytes()).toUpperCase().match(/.{2}/g)?.join(':');

  return {
    subject,
    issuer,
    serialNumberHex: cert.serialNumber?.toUpperCase() ?? '',
    validFrom,
    validTo,
    signatureAlgorithm,
    publicKeyAlgorithm,
    san,
    fingerprintSHA1,
    fingerprintSHA256,
  };
}

export function parseCsrPem(pem: string): CsrInfo {
  const csr = pki.certificationRequestFromPem(pem.trim());
  const subject: Record<string, string> = {};
  for (const attr of csr.subject.attributes) {
    subject[attr.shortName ?? attr.name] = attr.value;
  }

  const attributes: Record<string, string> = {};
  for (const attr of csr.attributes ?? []) {
    if ((attr as any).name && (attr as any).value) {
      attributes[(attr as any).name] = (attr as any).value as string;
    }
  }

  // Try to extract SAN from CSR (extensionRequest)
  let san: string[] | undefined;
  const extReq = (csr.getAttribute({ name: 'extensionRequest' }) as any)?.extensions as any[] | undefined;
  const sanExt = extReq?.find(e => e.name === 'subjectAltName');
  if (sanExt?.altNames?.length) san = sanExt.altNames.map((n: any) => n.value ?? n.ip).filter(Boolean);

  return { subject, attributes, san };
}

export interface GenerateCsrInput {
  privateKeyPem: string
  subject: Partial<Record<'CN' | 'O' | 'OU' | 'C' | 'ST' | 'L' | 'emailAddress', string>>
  san?: string[]
  hash?: 'sha256' | 'sha384' | 'sha512'
}

export function generateCsr(input: GenerateCsrInput): string {
  const { privateKeyPem, subject, san = [], hash = 'sha256' } = input;

  const privateKey = pki.privateKeyFromPem(privateKeyPem.trim());
  const csr = pki.createCertificationRequest();
  csr.publicKey = pki.setRsaPublicKey((privateKey as any).n, (privateKey as any).e);
  csr.setSubject(
    Object.entries(subject)
      .filter(([, v]) => Boolean(v))
      .map(([k, v]) => ({ name: nameFromShortName(k), shortName: k, value: v as string })),
  );

  if (san.length) {
    csr.setAttributes([
      {
        name: 'extensionRequest',
        extensions: [
          {
            name: 'subjectAltName',
            altNames: san.map(value => (isIp(value) ? { type: 7, ip: value } : { type: 2, value })),
          },
        ],
      },
    ] as any);
  }

  const hashMap: Record<string, any> = { sha256: md.sha256.create(), sha384: md.sha384.create(), sha512: md.sha512.create() };
  csr.sign(privateKey, hashMap[hash]);
  return pki.certificationRequestToPem(csr);
}

function nameFromShortName(short: string) {
  switch (short) {
    case 'CN': return 'commonName';
    case 'O': return 'organizationName';
    case 'OU': return 'organizationalUnitName';
    case 'C': return 'countryName';
    case 'ST': return 'stateOrProvinceName';
    case 'L': return 'localityName';
    case 'emailAddress': return 'emailAddress';
    default: return short;
  }
}

function isIp(value: string) {
  return /^(\d{1,3}\.){3}\d{1,3}$/.test(value) || value.includes(':');
}


