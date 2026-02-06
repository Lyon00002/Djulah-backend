# Scripts (Auth-only)

This directory contains **utility scripts** for the Djulah client authentication backend.

## Available Scripts

### `verify-user.js`

Manually marks a user as verified in MongoDB by setting `isVerified = true`.

Use cases:
- Local testing (skip email verification)
- Support/debug when a user is blocked on verification

Run:

```bash
node scripts/verify-user.js <email>
```
