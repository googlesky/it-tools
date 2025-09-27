import { describe, it, expect } from 'vitest';
import { generateKeyPair, getCurveName, type Algorithm } from './ec-ed25519-key-pair-generator.service';

describe('ec-ed25519-key-pair-generator.service', () => {
  describe('getCurveName', () => {
    it('should return correct curve names', () => {
      expect(getCurveName('EdDSA')).toBe('Ed25519');
      expect(getCurveName('ES256')).toBe('P-256');
      expect(getCurveName('ES384')).toBe('P-384');
      expect(getCurveName('ES512')).toBe('P-521');
    });
  });

  describe('generateKeyPair', () => {
    it('should generate Ed25519 key pair', async () => {
      const result = await generateKeyPair('EdDSA');
      
      expect(result).toHaveProperty('privateKeyPem');
      expect(result).toHaveProperty('publicKeyPem');
      expect(result).toHaveProperty('privateKeyJwk');
      expect(result).toHaveProperty('publicKeyJwk');
      
      // Check PEM format headers
      expect(result.privateKeyPem).toContain('-----BEGIN PRIVATE KEY-----');
      expect(result.privateKeyPem).toContain('-----END PRIVATE KEY-----');
      expect(result.publicKeyPem).toContain('-----BEGIN PUBLIC KEY-----');
      expect(result.publicKeyPem).toContain('-----END PUBLIC KEY-----');
      
      // Check JWK format
      const privateJwk = JSON.parse(result.privateKeyJwk);
      const publicJwk = JSON.parse(result.publicKeyJwk);
      expect(privateJwk).toHaveProperty('kty');
      expect(privateJwk).toHaveProperty('crv');
      expect(publicJwk).toHaveProperty('kty');
      expect(publicJwk).toHaveProperty('crv');
      
      // Ed25519 specific checks
      expect(privateJwk.kty).toBe('OKP');
      expect(privateJwk.crv).toBe('Ed25519');
      expect(publicJwk.kty).toBe('OKP');
      expect(publicJwk.crv).toBe('Ed25519');
    });

    it('should generate ES256 key pair', async () => {
      const result = await generateKeyPair('ES256');
      
      expect(result.privateKeyPem).toContain('-----BEGIN PRIVATE KEY-----');
      expect(result.publicKeyPem).toContain('-----BEGIN PUBLIC KEY-----');
      
      const privateJwk = JSON.parse(result.privateKeyJwk);
      const publicJwk = JSON.parse(result.publicKeyJwk);
      
      // ES256 specific checks
      expect(privateJwk.kty).toBe('EC');
      expect(privateJwk.crv).toBe('P-256');
      expect(publicJwk.kty).toBe('EC');
      expect(publicJwk.crv).toBe('P-256');
    });

    it('should generate ES384 key pair', async () => {
      const result = await generateKeyPair('ES384');
      
      const privateJwk = JSON.parse(result.privateKeyJwk);
      expect(privateJwk.kty).toBe('EC');
      expect(privateJwk.crv).toBe('P-384');
    });

    it('should generate ES512 key pair', async () => {
      const result = await generateKeyPair('ES512');
      
      const privateJwk = JSON.parse(result.privateKeyJwk);
      expect(privateJwk.kty).toBe('EC');
      expect(privateJwk.crv).toBe('P-521');
    });
  });
});