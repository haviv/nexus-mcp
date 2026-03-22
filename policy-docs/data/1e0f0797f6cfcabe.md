# Segregation of Duties (SoD) Policy

**Policy ID:** POL-GRC-004  
**Effective Date:** January 15, 2025  
**Review Date:** January 15, 2026  
**Owner:** VP of Governance, Risk & Compliance  
**Classification:** Confidential  

## 1. Purpose

This policy defines the requirements for Segregation of Duties (SoD) controls across all business processes and IT systems. SoD is a fundamental internal control that prevents any single individual from having the ability to both perpetrate and conceal fraud or errors within a business process.

## 2. Scope

This policy applies to:
- All business processes involving financial transactions, procurement, HR, and IT operations
- All users with access to ERP systems (SAP, Oracle, Microsoft Dynamics)
- All applications that enforce role-based access control (RBAC)
- Automated workflows and approval chains

## 3. SoD Principles

### 3.1 Four-Eyes Principle
No single person should control more than one phase of a critical transaction:
- **Authorization**: Approving a transaction
- **Custody**: Having physical or logical access to assets
- **Recording**: Creating or modifying records
- **Reconciliation**: Verifying accuracy of records

### 3.2 Critical SoD Conflict Matrix

The following role combinations are considered **high-risk SoD conflicts**:

#### Financial Processes (SAP)
| Conflict ID | Role A | Role B | Risk Level | Business Risk |
|-------------|--------|--------|------------|---------------|
| SOD-FIN-001 | Vendor Master Maintenance | AP Invoice Processing | Critical | Fictitious vendor fraud |
| SOD-FIN-002 | AP Invoice Processing | AP Payment Processing | Critical | Unauthorized payments |
| SOD-FIN-003 | Customer Master Maintenance | AR Credit Memo Processing | High | Revenue manipulation |
| SOD-FIN-004 | GL Journal Entry Creation | GL Journal Entry Posting | Critical | Fraudulent journal entries |
| SOD-FIN-005 | Bank Master Maintenance | Payment Processing | Critical | Embezzlement risk |
| SOD-FIN-006 | Fixed Asset Acquisition | Fixed Asset Retirement | High | Asset theft concealment |

#### Procurement Processes
| Conflict ID | Role A | Role B | Risk Level | Business Risk |
|-------------|--------|--------|------------|---------------|
| SOD-PRC-001 | Purchase Requisition Creation | Purchase Order Approval | High | Unauthorized procurement |
| SOD-PRC-002 | Purchase Order Creation | Goods Receipt | High | Fictitious receipt fraud |
| SOD-PRC-003 | Vendor Selection | Contract Management | Medium | Kickback risk |
| SOD-PRC-004 | Goods Receipt | Invoice Verification | High | Three-way match bypass |

#### IT Operations
| Conflict ID | Role A | Role B | Risk Level | Business Risk |
|-------------|--------|--------|------------|---------------|
| SOD-IT-001 | Code Development | Production Deployment | Critical | Unauthorized code changes |
| SOD-IT-002 | User Access Administration | Access Review/Audit | High | Self-approval of access |
| SOD-IT-003 | Database Administration | Security Log Administration | High | Evidence tampering |
| SOD-IT-004 | System Configuration | Security Configuration | Medium | Security bypass |

## 4. SoD Enforcement

### 4.1 Preventive Controls
- SoD rules must be enforced at the role/permission level in all ERP and financial systems
- The GRC platform (Pathlock) must perform real-time SoD analysis during role assignment
- Role changes that introduce SoD conflicts must be blocked unless a compensating control is approved

### 4.2 Detective Controls
- Monthly SoD analysis must be run across all critical applications
- Cross-application SoD analysis must be performed quarterly (e.g., SAP + banking system)
- Pathlock continuous monitoring must flag new SoD violations in real-time

### 4.3 Compensating Controls
When SoD separation is not feasible (e.g., small teams), compensating controls must be implemented:

| Compensating Control | Description | Review Frequency |
|---------------------|-------------|------------------|
| Transaction monitoring | All transactions by the conflicted user are reviewed by an independent party | Weekly |
| Dual approval | A second approver is required for all transactions in the conflicted area | Per transaction |
| Periodic reconciliation | Independent reconciliation of all transactions in the conflicted area | Monthly |
| Enhanced logging | Detailed audit trail with automated anomaly detection | Continuous |

### 4.4 Compensating Control Requirements
- Must be documented with a formal risk acceptance signed by the process owner and Internal Audit
- Must be reviewed and re-approved every 6 months
- Must reduce residual risk to an acceptable level as determined by the Risk Committee
- Cannot exceed 12 months without executive re-approval from the CFO

## 5. Role Design Standards

### 5.1 Role Naming Convention
- Roles must follow the format: `[Module]-[Process]-[Function]-[Level]`
- Example: `FI-AP-InvoiceEntry-User`, `FI-AP-PaymentApproval-Manager`

### 5.2 Role Certification
- All roles must be certified by the business process owner before deployment
- Composite/aggregate roles must be analyzed for embedded SoD conflicts
- Firefighter/emergency roles must have a defined expiration (maximum 24 hours)

## 6. Monitoring and Reporting

### 6.1 Key Risk Indicators (KRIs)
| KRI | Threshold | Escalation |
|-----|-----------|------------|
| Number of open critical SoD violations | > 5 | CISO and CFO |
| Average remediation time for critical violations | > 10 days | VP GRC |
| Compensating controls expiring within 30 days | > 3 | GRC team |
| Users with firefighter access in last 30 days | > 10 | IT Security |

### 6.2 Reporting
- Monthly SoD dashboard report to GRC Committee
- Quarterly SoD report to Audit Committee and Board
- Annual SoD risk assessment as part of SOX 404 testing
- Real-time alerts for critical SoD violations to IT Security and Internal Audit

## 7. Remediation Process

1. **Identification**: SoD conflict detected by automated analysis or access review
2. **Risk Assessment**: GRC team assesses the risk level and potential impact
3. **Remediation Plan**: Options include role redesign, access removal, or compensating control
4. **Approval**: Risk acceptance approved by appropriate authority based on risk level
5. **Implementation**: Changes implemented within SLA (Critical: 5 days, High: 10 days, Medium: 20 days)
6. **Validation**: Post-implementation review to confirm conflict is resolved

## 8. Exceptions

- Exceptions for Critical-level SoD conflicts require CFO and CISO joint approval
- All exceptions must have a compensating control and an expiration date
- The exception register must be reviewed quarterly by Internal Audit
