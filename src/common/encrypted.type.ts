import { Type, Platform, EntityProperty } from '@mikro-orm/core';
import * as crypto from 'crypto';

// Use a fixed key for demo purposes if env var is missing. 
// IN PRODUCTION, THIS MUST BE A SECURE RANDOM STRING IN ENV VARS.
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || '12345678901234567890123456789012'; // 32 chars
const IV_LENGTH = 16;
// Fixed IV for deterministic encryption (required for unique constraints/lookups)
const FIXED_IV = Buffer.from('1234567890123456'); // 16 chars

export class EncryptedType extends Type<string | undefined, string | undefined> {
  convertToDatabaseValue(value: string | undefined, platform: Platform): string | undefined {
    if (!value) return value;
    try {
      const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), FIXED_IV);
      let encrypted = cipher.update(value);
      encrypted = Buffer.concat([encrypted, cipher.final()]);
      return encrypted.toString('hex');
    } catch (e) {
      console.error('Encryption failed', e);
      return value; // Fallback or throw?
    }
  }

  convertToJSValue(value: string | undefined, platform: Platform): string | undefined {
    if (!value) return value;
    try {
      const encryptedText = Buffer.from(value, 'hex');
      const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), FIXED_IV);
      let decrypted = decipher.update(encryptedText);
      decrypted = Buffer.concat([decrypted, decipher.final()]);
      return decrypted.toString();
    } catch (e) {
      // If decryption fails (e.g. data wasn't encrypted yet), return original
      return value;
    }
  }

  getColumnType(prop: EntityProperty, platform: Platform) {
    return 'text';
  }
}
