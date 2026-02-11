# CIO-Relevant Queries by Category

The following queries are organized by strategic business area to help CIOs understand their organization's identity and compliance posture at an executive level. All questions can be answered using the available Pathlock database.

## 1. Overall Risk Exposure & Posture
- How many total violations do we have across all systems, broken down by severity (Critical, High, Medium, Low)?
- What is the trend in violation counts over the last 12 months by severity level?
- What percentage of our violations are Critical or High severity?
- Which systems have the highest number of Critical and High severity violations?
- How many users have Critical violations and what systems are they in?
- What percentage of our violations have active mitigations vs. unmitigated?

## 2. Compliance & Audit Readiness
- What is the status of all access certification campaigns (completed, in progress, overdue)?
- How many certification campaigns are past their expected end date?
- What percentage of users have been reviewed in the current certification cycle?
- Which systems have not had an access certification in the last 12 months?
- How many mitigations are expiring in the next 30/60/90 days?
- What is the completion rate for access certifications this quarter vs. last quarter?

## 3. Violation Distribution & Impact
- Which SoD rules generate the most violations?
- What are the top 10 violations by user count that could impact financial processes?
- Which departments have the highest concentration of Critical violations?
- How many violations are related to payment, procurement, or financial close processes?
- What is the distribution of violations across business units/departments?
- Which violations have been open the longest without mitigation?

## 4. Program Effectiveness & Trends
- How has the total violation count changed quarter over quarter?
- What is the trend in new violations detected vs. violations mitigated over the last 6 months?
- What percentage of violations are mitigated within 30 days of detection?
- How many violations were resolved/mitigated this quarter vs. last quarter?
- What is the average time from violation detection to mitigation?
- Are we reducing the number of unmitigated Critical violations over time?

## 5. Strategic Priorities & Focus Areas
- Which SoD rules should be prioritized based on violation count and severity?
- Which systems have the most unmitigated Critical violations?
- What are the top 10 users with the most Critical and High violations?
- Which departments need the most attention based on violation severity and count?
- What roles are causing the most violations and should be reviewed?
- Which mitigations are expiring soon that need renewal?

## 6. Key Metrics Summary
- Total violations by severity level (Critical, High, Medium, Low)
- Total users with violations by system
- Percentage of violations with active mitigations
- Number of overdue certification campaigns
- Count of expiring mitigations in next 30 days
- Violation count trend over last 12 months

## 7. Business Process Risk
- How many violations involve roles related to financial transactions?
- Which SoD rules related to payment processing have the most violations?
- How many users have violations in procurement-related roles?
- What violations exist in roles with vendor master data access?
- Which critical financial system roles have the most SoD conflicts?
- How many violations affect users with journal entry or posting access?

## 8. Organizational Risk Profile
- What is the violation count by department?
- Which departments have users with the most Critical violations?
- How many violations exist for users without a manager assigned?
- What is the distribution of high-risk role assignments by department?
- Which organizational units have the highest concentration of privileged access?
- How many orphaned accounts (no HR link) have active violations?

## 9. System Landscape & Coverage
- How many users and roles exist in each connected system?
- What is the violation count by system type (SAP, Workday, etc.)?
- Which systems have the highest ratio of violations to users?
- How many critical/high-risk roles exist in each system?
- What is the access certification coverage by system?
- Which systems have users with the most role assignments?

## 10. Violation & Mitigation Trends
- What is the month-over-month trend in new violations?
- How many mitigations were added vs. expired each month?
- What is the trend in unmitigated violations over the last year?
- How has the distribution of violations by severity changed over time?
- What is the average mitigation validity period?
- How many violations were resolved through role removal vs. mitigation?

## 11. Permission Analysis & Role Optimization

### Over-Permissions (Excessive Access)
- Which users have excessive permissions beyond their job requirements (more roles than department average)?
- What percentage of users have significantly more roles than peers in the same department?
- Which users have critical/high-risk roles they haven't used (no login in 90+ days)?
- What roles contain permissions that users are not actively using?
- Which users have roles assigned that don't align with their department or job function?
- How many users have dormant access to sensitive systems (assigned but never logged in)?
- What is the gap between role assignments and actual usage patterns by department?

### Under-Permissions (Insufficient Access)
- Which users have fewer roles than the average for their department and job function?
- What access requests are frequently submitted by users in specific departments (indicates missing access)?
- Which departments have the most pending access requests (potential under-provisioning)?

### Role Mining & RBAC/ABAC Policy Design
- What are the most common role combinations assigned to users in each department?
- What roles are typically assigned together (role clusters) that could form a baseline?
- What access patterns exist for users by department that can inform default role design?
- Which role assignments are consistent across a department vs. one-off assignments?
- What is the typical role profile for new hires by department?

### Default Access by Team (Role Matrix Planning)
- What access should engineering teams have by default based on current patterns?
- What access should finance teams have by default based on current patterns?
- What access should HR teams have by default based on current patterns?
- What access should procurement teams have by default based on current patterns?
- Prepare a role matrix showing typical role assignments by department for baseline definition.
- What are the standard access patterns for each department that we should use as a baseline?
- Which roles are assigned to 80%+ of users in a department (candidate default roles)?

### General Role Optimization
- Which users have significantly more roles than the average for their department?
- What roles have the most users assigned but appear in violations?
- Which users have roles that are expiring in the next 30 days?
- What is the average number of roles per user by department?
- Which roles are marked as critical/high-risk and how many users have them?
- What users have access to multiple critical systems?
- Which roles are involved in the most SoD rule violations?
- What is the distribution of role assignments by department?
- Which users have not logged in for 90+ days but still have active roles?

## 12. Access Anomaly & Outlier Detection

### Anomalous Access by System
- Who has anomalous access to SAP ERP system compared to their department peers?
- Who has anomalous access to Workday compared to their department peers?
- Who has anomalous access to financial systems but is not in a finance-related department?
- Which users have access to critical systems that others in their role don't have?

### Role Assignment Anomalies
- Which users have more roles than 2x the average for their department?
- Which users have role assignments that don't match their job title or department?
- Who has privileged/critical roles but is not in a management position?
- Which users have significantly different access patterns than others in their department?
- What users have roles that no one else in their department has?

### Cross-System & SoD Anomalies
- Which users have cross-system access that their department peers don't have?
- What users have both requestor and approver roles (potential SoD risk)?
- Which users have roles in multiple systems that could create cross-system SoD risks?

### Dormant & Orphaned Access Risks
- What users have critical role access but haven't logged in recently (90+ days)?
- What orphaned accounts (no HR link) have critical or high-risk role assignments?
- What users have dormant access (no recent login) to critical systems?
- Which inactive users still have access to sensitive financial transactions?
