# Password and Authentication Policy

**Policy ID:** POL-SEC-003  
**Effective Date:** February 1, 2025  
**Review Date:** February 1, 2026  
**Owner:** IT Security Director  
**Classification:** Internal  

## 1. Purpose

This policy establishes minimum requirements for password management and authentication across all organizational systems. It aligns with NIST SP 800-63B Digital Identity Guidelines and supports compliance with SOX, GDPR, HIPAA, and PCI-DSS.

## 2. Scope

This policy applies to:
- All user accounts (employees, contractors, service accounts, vendor accounts)
- All systems, applications, and network devices
- Cloud services (SaaS, IaaS, PaaS) used by the organization
- Remote access and VPN connections

## 3. Password Requirements

### 3.1 Password Composition
| Requirement | Standard Accounts | Privileged Accounts |
|-------------|-------------------|---------------------|
| Minimum Length | 12 characters | 16 characters |
| Complexity | At least 3 of: uppercase, lowercase, digits, special characters | All 4 categories required |
| Maximum Age | 365 days | 90 days |
| History | Cannot reuse last 12 passwords | Cannot reuse last 24 passwords |
| Dictionary Check | Enabled — common passwords are rejected | Enabled |

### 3.2 Password Storage
- Passwords must be hashed using bcrypt, scrypt, or Argon2id with appropriate work factors
- Plaintext password storage is strictly prohibited
- Password databases must be encrypted at rest using AES-256
- Salting is required for all password hashes (minimum 128-bit random salt)

### 3.3 Password Transmission
- Passwords must only be transmitted over encrypted channels (TLS 1.2+)
- Initial/temporary passwords must be delivered out-of-band (not via email)
- Password reset links must expire within 1 hour and be single-use

## 4. Multi-Factor Authentication (MFA)

### 4.1 MFA Requirements
MFA is mandatory for:
- All remote access (VPN, cloud portals)
- All privileged/admin accounts
- All SOX-critical financial applications
- Email access from outside the corporate network
- Any system processing PCI cardholder data

### 4.2 Approved MFA Methods
| Method | Tier | Use Case |
|--------|------|----------|
| Hardware security key (FIDO2/WebAuthn) | Tier 1 (Preferred) | All users, especially privileged |
| Authenticator app (TOTP) | Tier 2 | General workforce |
| Push notification (Microsoft Authenticator, Duo) | Tier 2 | General workforce |
| SMS one-time code | Tier 3 (Discouraged) | Only as fallback, being phased out by Q4 2025 |

### 4.3 MFA Recovery
- Each user must register at least 2 MFA methods
- Recovery codes must be stored securely (encrypted, offline)
- MFA reset requires identity verification by IT Service Desk with manager approval

## 5. Account Lockout and Monitoring

### 5.1 Lockout Policy
- Lock accounts after 5 consecutive failed login attempts
- Lockout duration: 30 minutes (auto-unlock) or manual unlock by IT
- Privileged accounts: Lock after 3 failed attempts, require manual unlock

### 5.2 Session Management
- Idle session timeout: 15 minutes for financial systems, 30 minutes for standard
- Maximum session duration: 8 hours (re-authentication required)
- Concurrent sessions: Limited to 3 per user (configurable per application)

### 5.3 Monitoring
- Failed authentication attempts must be logged and monitored in real-time
- Alerts generated for: brute force attacks (10+ failures/minute), credential stuffing patterns, impossible travel scenarios
- Authentication logs retained for minimum 1 year

## 6. Service Account Management

- Service accounts must follow the same password complexity as privileged accounts
- Service account passwords must be stored in an approved secrets management vault (HashiCorp Vault, Azure Key Vault, AWS Secrets Manager)
- Service account access must be reviewed quarterly
- Interactive login for service accounts is prohibited
- API keys and tokens must expire and be rotated every 90 days

## 7. Single Sign-On (SSO)

- SSO via SAML 2.0 or OpenID Connect is required for all SaaS applications that support it
- SSO reduces password fatigue and centralizes authentication logging
- Applications not supporting SSO must be documented and reviewed for risk

## 8. Compliance Mapping

| Requirement | SOX | GDPR | HIPAA | PCI-DSS | NIST 800-63B |
|-------------|-----|------|-------|---------|--------------|
| MFA for privileged access | ✓ | ✓ | ✓ | ✓ | ✓ |
| Password complexity | ✓ | ✓ | ✓ | ✓ | ✓ |
| Account lockout | ✓ | — | ✓ | ✓ | ✓ |
| Session timeout | ✓ | — | ✓ | ✓ | ✓ |
| Log retention | 7yr | Varies | 6yr | 1yr | — |

## 9. Violations

Failure to comply with this policy may result in:
- Immediate account suspension
- Mandatory security awareness retraining
- Formal disciplinary action
- For contractors: termination of contract
