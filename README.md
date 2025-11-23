# Safe Request Checker 🔒

A simplified utility that provides check against Cross-Site Request Forgery (CSRF) by validating request safety using modern browser security headers.

Cross-origin requests are detected using:

- **HTTP Method:** GET, HEAD, and OPTIONS are always considered safe
- **Fetch Metadata:** Uses the Sec-Fetch-Site header (supported in all major browsers since 2023)
- **Origin Validation:** Compares the Origin header against your trusted origin

Inspired by [cross-origin-protection](https://pkg.go.dev/net/http#CrossOriginProtection)

## Installation

```sh
npm install @dimatakoy/csrf-protection
```

## Usage

```JS
import { isSafeRequest } from '@dimatakoy/csrf-protection';

const securityOptions = {
  trustedOrigin: 'https://yourdomain.com'
};

// Safe same-origin request
const safeRequest = {
  method: 'POST',
  headers: {
    'origin': 'https://yourdomain.com',
    'sec-fetch-site': 'same-origin'
  }
};

console.log(isSafeRequest(safeRequest, securityOptions)); // true

// Dangerous cross-origin request
const dangerousRequest = {
  method: 'POST',
  headers: {
    'origin': 'https://malicious-site.com',
    'sec-fetch-site': 'cross-site'
  }
};

console.log(isSafeRequest(dangerousRequest, securityOptions)); // false
```
## License

[MIT](./LICENSE)
