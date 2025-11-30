# Security Implementation Guide

## Overview
This document outlines the security measures implemented in EazyCertify to protect personal data and ensure database security.

## 1. Data Encryption

### Personal Data Encryption
All personal information (emails) is encrypted at rest using AES-256-CBC encryption.

**Implementation:**
- Custom MikroORM Type: `EncryptedType` (src/common/encrypted.type.ts)
- Encryption Algorithm: AES-256-CBC
- Deterministic encryption (fixed IV) to maintain unique constraints

**Encrypted Fields:**
- `admin_user.email`

### Encryption Key Setup
**CRITICAL:** Add the following to your `.env` file:

```env
# Generate a secure 32-character key for production:
# node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"
ENCRYPTION_KEY=your-secure-32-character-key-here
```

**For Production:**
```bash
# Generate a secure key
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"
```

## 2. Row Level Security (RLS)

### Enabled on Tables
RLS is enabled on all tables to ensure data access is controlled at the database level:
- `admin_user`
- `exam`
- `provider`
- `question`
- `question_group`
- `question_option`

### RLS Policies

#### Service Role Policy (Backend API)
- **Who:** `service_role` (Supabase backend role)
- **Access:** Full CRUD operations
- **Reason:** Backend API needs full access to manage data

#### Public Read Policy
- **Who:** `public` (anonymous and authenticated users)
- **Access:** Read-only (SELECT)
- **Tables:** `exam`, `provider`, `question`, `question_group`, `question_option`
- **Reason:** Users need to view exams and questions

#### Admin User Protection
- **Table:** `admin_user`
- **Access:** Only `service_role` can access
- **Reason:** Admin credentials must be protected

## 3. Database Connection

### Supabase Configuration
Your backend must connect using the **service_role** key to bypass RLS for API operations.

**In your API `.env` file:**
```env
# Use the SERVICE_ROLE key (not the anon key)
DATABASE_URL=postgresql://postgres:[password]@[host]:5432/postgres
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**Find your service_role key:**
1. Go to Supabase Dashboard
2. Project Settings → API
3. Copy the `service_role` key (secret)

## 4. Migration Instructions

### Apply the Security Migration

```bash
# Navigate to API directory
cd eazycertify-api

# Run the migration
npm run migration:up
```

### Verify RLS is Enabled

```sql
-- Connect to your database and run:
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('admin_user', 'exam', 'provider', 'question', 'question_group', 'question_option');

-- Check policies:
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public';
```

## 5. Testing

### Test Encryption
```typescript
// Create an admin user
const admin = new AdminUser();
admin.email = 'test@example.com'; // Will be encrypted in DB
admin.password = hashedPassword;
admin.role = 'admin';
await em.persistAndFlush(admin);

// Verify in database - email should be hex-encoded encrypted string
// When queried via API, it will be automatically decrypted
```

### Test RLS
```sql
-- Try to access as anon user (should fail for admin_user)
SET ROLE anon;
SELECT * FROM admin_user; -- Should return 0 rows or error

-- Try to access as service_role (should succeed)
SET ROLE service_role;
SELECT * FROM admin_user; -- Should return all rows
```

## 6. Security Checklist

- [ ] Add `ENCRYPTION_KEY` to production `.env` (32 characters)
- [ ] Use `service_role` key for DATABASE_URL connection
- [ ] Run the RLS migration
- [ ] Verify RLS policies are active
- [ ] Test encryption on personal data fields
- [ ] Ensure frontend uses `anon` key (NEXT_PUBLIC_SUPABASE_ANON_KEY)
- [ ] Never expose `service_role` key to frontend
- [ ] Regularly rotate encryption keys (requires data re-encryption)

## 7. Important Notes

### Encryption Key Rotation
If you need to rotate the encryption key:
1. Decrypt all data with old key
2. Update ENCRYPTION_KEY
3. Re-encrypt all data with new key
4. This requires a custom migration script

### RLS and Backend API
- The backend API connects with `service_role` privileges
- This bypasses RLS, allowing full CRUD operations
- Frontend connects with `anon` key, subject to RLS policies

### Data Migration
If you have existing data:
1. The encryption will apply on next update
2. Old unencrypted data can still be read (decryption fails gracefully)
3. Consider running a data migration to encrypt existing records

## 8. Compliance

This implementation provides:
- ✅ Data encryption at rest (AES-256)
- ✅ Row-level access control
- ✅ Separation of privileges (service vs public)
- ✅ Protection of personal information (email)

**Note:** For full GDPR/HIPAA compliance, also implement:
- Audit logging
- Data retention policies
- Right to erasure (delete user data)
- Data export functionality
