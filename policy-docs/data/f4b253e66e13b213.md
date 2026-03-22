# SOX Access Control Policy

**Policy ID:** POL-SOX-001  
**Effective Date:** January 1, 2025  
**Review Date:** January 1, 2026  
**Owner:** Chief Information Security Officer (CISO)  
**Classification:** Confidential  

## 1. Purpose

This policy establishes access control requirements for all information systems that process, store, or transmit financial data subject to the Sarbanes-Oxley Act (SOX) Section 404. The goal is to ensure the integrity and reliability of financial reporting through appropriate access controls.

## 2. Scope

This policy applies to:
- All employees, contractors, and third-party users with access to financial systems
- All IT systems involved in financial reporting, including ERP (SAP, Oracle), general ledger, accounts payable/receivable, and treasury systems
- All environments: production, staging, and disaster recovery

## 3. Access Control Requirements

### 3.1 Least Privilege Principle
All users must be granted the minimum level of access necessary to perform their job functions. Access to financial systems must be approved by the data owner and the user's direct manager.

### 3.2 Segregation of Duties (SoD)
Critical financial processes must enforce segregation of duties to prevent fraud and errors:
- **AP Process:** The person who creates a vendor cannot approve payments to that vendor
- **AR Process:** The person who records receivables cannot approve write-offs
- **GL Process:** Journal entry creators cannot be journal entry approvers
- **Procurement:** Requisition creators cannot approve purchase orders above $10,000
- **User Administration:** System administrators cannot approve their own access requests

### 3.3 Access Reviews
- Quarterly access reviews must be performed for all SOX-critical applications
- Reviews must be completed within 15 business days of initiation
- Access for terminated employees must be revoked within 24 hours
- Dormant accounts (no login for 90 days) must be disabled automatically

### 3.4 Privileged Access
- Privileged accounts (admin, root, superuser) require dual approval
- All privileged access sessions must be logged and monitored
- Emergency/break-glass access must be documented and reviewed within 48 hours
- Service accounts must have passwords rotated every 90 days

## 4. Authentication Requirements

- Multi-factor authentication (MFA) is required for all SOX-critical systems
- Passwords must be at least 12 characters with complexity requirements
- Account lockout after 5 failed attempts for 30 minutes
- Session timeout after 15 minutes of inactivity

## 5. Monitoring and Logging

- All access to financial data must be logged with user ID, timestamp, action, and data accessed
- Logs must be retained for 7 years per SOX requirements
- Anomalous access patterns must trigger real-time alerts to the Security Operations Center (SOC)
- Monthly access anomaly reports must be reviewed by IT Security and Internal Audit

## 6. Violations and Remediation

- SoD violations must be remediated within 5 business days or documented with a compensating control
- Unauthorized access incidents must be reported to Internal Audit within 24 hours
- Repeat violations may result in disciplinary action up to and including termination

## 7. Exceptions

Exceptions to this policy require written approval from the CISO and CFO, with a documented compensating control and a maximum exception period of 6 months.
