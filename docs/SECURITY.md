# Security Policy

## Never commit secrets

Do not commit:

- OAuth client secrets (Microsoft, GitHub, etc.)
- EmailJS private keys or email passwords
- reCAPTCHA secret key
- Firebase private keys or service account JSON
- `.env` files or any files that contain credentials

## Reporting a vulnerability

Please report vulnerabilities by opening a private issue (tag it `[SECURITY]`) or emailing the maintainers directly.

## Secret rotation

1. Revoke the exposed credential in the provider console.
2. Issue a new authentication key.
3. Update `.env` locally and update any CI/CD secrets (GitHub, Firebase, EmailJS).
4. Redeploy the site so the new key is loaded.
