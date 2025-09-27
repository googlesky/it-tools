import { generateKeyPair as joseGenerateKeyPair, exportPKCS8, exportSPKI, exportJWK } from 'jose';

export type Algorithm = 'EdDSA' | 'ES256' | 'ES384' | 'ES512';

export interface KeyPairResult {
  privateKeyPem: string;
  publicKeyPem: string;
  privateKeyJwk: string;
  publicKeyJwk: string;
}

/**
 * Generate EC/Ed25519 key pair using JOSE library
 */
export async function generateKeyPair(algorithm: Algorithm): Promise<KeyPairResult> {
  try {
    // Generate key pair using JOSE with extractable keys
    const { privateKey, publicKey } = await joseGenerateKeyPair(algorithm, { 
      extractable: true 
    });
    
    // Export to different formats
    const [privateKeyPem, publicKeyPem, privateKeyJwk, publicKeyJwk] = await Promise.all([
      exportPKCS8(privateKey),
      exportSPKI(publicKey),
      exportJWK(privateKey),
      exportJWK(publicKey),
    ]);

    return {
      privateKeyPem,
      publicKeyPem,
      privateKeyJwk: JSON.stringify(privateKeyJwk, null, 2),
      publicKeyJwk: JSON.stringify(publicKeyJwk, null, 2),
    };
  } catch (error) {
    throw new Error(`Failed to generate key pair: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get the curve name for display purposes
 */
export function getCurveName(algorithm: Algorithm): string {
  switch (algorithm) {
    case 'EdDSA': return 'Ed25519';
    case 'ES256': return 'P-256';
    case 'ES384': return 'P-384';
    case 'ES512': return 'P-521';
    default: return algorithm;
  }
}