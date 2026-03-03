# Security

## Never commit secrets

- `.env` and any variations (`.env.*`) stay out of version control. Use local environment files or secret managers.
- Do not commit API secrets (Firebase private keys, EmailJS private key, OAuth client secrets, reCAPTCHA secret). The only Firebase data that can be public are the config fields (`apiKey`, `authDomain`, etc.) because Firebase uses them for client initialization.

## How to rotate keys

1. Revoke the exposed key in the provider (Firebase console, EmailJS dashboard, etc.).
2. Generate a new key/secret.
3. Update the `.env` file locally.
4. Update GitHub repository secrets (FIREBASE_SERVICE_ACCOUNT, etc.) and redeploy CI/workflows.
5. Share the new value only through secure channels (password manager, secret manager, etc.).

## Safe front-end data

- Firebase config (`apiKey`, `projectId`, `authDomain`) is safe to publish; Firebase protects the backend with rules.
- The reCAPTCHA **site key** is public by design; do not publish the **secret key**.
- EmailJS **service ID** and **template IDs** can be public, but the **public key** is the only credential stored in the client; keep the **private key** secret.

## Secrets that must stay secret

| Secret                        | Reason                                   |
| ----------------------------- | ---------------------------------------- |
| Firebase service account JSON | Grants admin access to Firebase projects |
| Firebase private key          | Used in CI/deploy workflows              |
| EmailJS private key           | Allows sending emails from your account  |
| reCAPTCHA secret key          | Verifies tokens on your backend          |
| Any OAuth client/secret       | Prevents impersonation of your app       |

## Enforcement

- Audit the repo with tools like `git-secrets` or `truffleHog` before publishing.
- Remove any leaked secrets with `git filter-repo`.
- Use GitHub Actions secrets or environment variables in CI rather than storing credentials in plaintext.
