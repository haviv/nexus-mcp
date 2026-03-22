# Security Incident Response Policy

**Policy ID:** POL-SEC-005  
**Effective Date:** April 1, 2025  
**Review Date:** April 1, 2026  
**Owner:** Chief Information Security Officer (CISO)  
**Classification:** Internal  

## 1. Purpose

This policy establishes a structured approach to detecting, responding to, containing, and recovering from security incidents. It ensures compliance with regulatory notification requirements under SOX, GDPR, HIPAA, PCI-DSS, and SEC cybersecurity disclosure rules.

## 2. Scope

This policy covers all security incidents affecting:
- Information systems owned or operated by the organization
- Third-party systems processing organizational data
- Physical security events impacting IT assets
- Cloud environments (AWS, Azure, GCP)

## 3. Incident Classification

### 3.1 Severity Levels

| Severity | Description | Examples | Response SLA |
|----------|-------------|----------|--------------|
| **P1 - Critical** | Active breach, data exfiltration, ransomware, system compromise affecting financial data | Ransomware encrypting ERP, unauthorized access to SOX systems, massive data leak | Immediate (< 15 min) |
| **P2 - High** | Attempted breach, malware detected, unauthorized access to sensitive non-financial data | Phishing campaign with credential harvest, malware on endpoint, DDoS attack | < 1 hour |
| **P3 - Medium** | Policy violation, suspicious activity, vulnerability exploitation attempt | Failed brute force attack, unauthorized software installation, policy bypass | < 4 hours |
| **P4 - Low** | Minor policy deviation, informational security event | Accidental email to wrong recipient (non-sensitive), minor misconfiguration | < 24 hours |

### 3.2 Incident Categories
- **Malware/Ransomware**: Virus, worm, trojan, ransomware, cryptominer
- **Unauthorized Access**: Compromised credentials, privilege escalation, insider threat
- **Data Breach**: Unauthorized disclosure, exfiltration, or loss of sensitive data
- **Denial of Service**: DDoS, application-layer attacks, resource exhaustion
- **Phishing/Social Engineering**: Email phishing, vishing, pretexting, BEC
- **Physical Security**: Unauthorized facility access, stolen devices, tailgating
- **Supply Chain**: Third-party compromise, software supply chain attack

## 4. Incident Response Process

### Phase 1: Detection and Identification
- Security Operations Center (SOC) monitors 24/7 via SIEM (Splunk/Sentinel)
- Automated detection from EDR (CrowdStrike), network monitoring (Darktrace), and cloud security tools
- Employee reporting via security hotline or email (security@company.com)
- Threat intelligence feeds for proactive detection

### Phase 2: Containment
**Immediate containment (Short-term):**
- Isolate affected systems from the network
- Block malicious IPs/domains at firewall and proxy
- Disable compromised accounts
- Preserve volatile evidence (memory dumps, running processes)

**Extended containment (Long-term):**
- Apply emergency patches
- Implement additional monitoring on affected segments
- Rotate credentials for affected systems and service accounts
- Engage forensic investigation if needed

### Phase 3: Eradication
- Remove malware and persistence mechanisms
- Rebuild compromised systems from known-good images
- Patch exploited vulnerabilities across all affected systems
- Verify complete removal through endpoint and network scans

### Phase 4: Recovery
- Restore systems from verified clean backups
- Implement enhanced monitoring for the recovered environment
- Gradually restore network connectivity with validation checks
- Conduct user acceptance testing before returning to production

### Phase 5: Post-Incident Review
- Complete within 10 business days of incident closure
- Document root cause, timeline, and lessons learned
- Update runbooks and playbooks based on findings
- Present findings to the GRC Committee

## 5. Regulatory Notification Requirements

| Regulation | Notification Requirement | Timeline |
|------------|--------------------------|----------|
| GDPR | Notify supervisory authority and affected data subjects | 72 hours from discovery |
| SOX | Report material weakness in internal controls to Audit Committee | Immediate |
| HIPAA | Notify HHS, affected individuals, and media (if > 500 people) | 60 days |
| PCI-DSS | Notify card brands and acquiring bank | Immediate |
| SEC | File Form 8-K for material cybersecurity incidents | 4 business days from materiality determination |
| State breach laws | Varies by state (e.g., CA: expedient, NY: 72 hours) | Varies |

## 6. Roles and Responsibilities

| Role | Responsibility |
|------|---------------|
| CISO | Overall incident response authority, regulatory communication |
| SOC Manager | Day-to-day incident coordination and escalation |
| Incident Commander | Leads response for P1/P2 incidents |
| IT Operations | System isolation, recovery, and restoration |
| Legal Counsel | Regulatory notification, privilege, and liability assessment |
| Communications | Internal and external messaging, media handling |
| HR | Employee-related incidents, insider threat cases |
| Internal Audit | Post-incident control effectiveness review |

## 7. Evidence Handling

- Chain of custody must be maintained for all digital evidence
- Forensic images must be created using write-blockers or forensic tools (EnCase, FTK)
- Evidence must be stored in tamper-evident containers with restricted access
- Hash values (SHA-256) must be computed for all collected evidence
- Evidence retention: minimum 7 years or as required by ongoing legal proceedings

## 8. Communication Plan

### Internal Communication
- P1 incidents: Immediate notification to CISO, CIO, CEO, Legal, and Board (if material)
- P2 incidents: Notification to CISO and affected business unit leaders within 2 hours
- All employees: General awareness communication within 24 hours (if applicable)

### External Communication
- All external communications must be approved by Legal and Communications
- No employee may communicate with media about security incidents without authorization
- Regulatory notifications must be reviewed by Legal before submission

## 9. Testing and Exercises

- Tabletop exercises: Quarterly, covering different scenarios
- Technical simulation: Semi-annually (red team/purple team exercises)
- Full incident response drill: Annually, including executive participation
- Lessons from exercises must be incorporated into updated playbooks within 30 days
