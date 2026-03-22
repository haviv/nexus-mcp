# Demo Questions — Analytics Assistant

Simulated data covers **ABHISHEKC** (Abhishek Chakraborty, IT SAP dept) and service account **SVC_BATCH_INT**.
Attack night: **March 20–21, 2026 · external IP 185.220.101.45**.

---

## Warm-up / Discovery

- Show me all after-hours access in the last month
- Which users were active between midnight and 6am this month?
- Show me all sensitive transactions executed in the last 30 days

---

## ABHISHEKC — Baseline vs Anomaly

- Show me ABHISHEKC's activity this month and flag anything unusual
- What transactions did ABHISHEKC normally do, and how does March 20th compare?
- Show ABHISHEKC's activity grouped by hour — is anything outside normal working hours?
- What did ABHISHEKC do on March 20th after 10pm?
- Cross-reference ABHISHEKC with the SoD violations database — what risks does he carry?

---

## Attack Flow Visualization

- Show the attack flow of ABHISHEKC on March 20th as a step-by-step diagram
- Show me a timeline of all actions ABHISHEKC took after 11pm on March 20th
- What finance transactions did ABHISHEKC perform — and is that normal for an IT user?
- Show me all database changes (db_changes > 0) ABHISHEKC made on March 20th

---

## IP / Device Pivot

- Which users share the same external IP 185.220.101.45?
- Show me all events from IP 185.220.101.45 in chronological order
- Which terminals or IPs are outside the normal corporate network range (not 10.x.x.x)?

---

## Non-Human Identity — SVC_BATCH_INT

- Show me SVC_BATCH_INT's normal activity pattern over the last month
- What did SVC_BATCH_INT do on March 21st, and how does it compare to its usual batch jobs?
- Compare SVC_BATCH_INT's normal activity vs what it did on March 21
- Show the flow diagram of SVC_BATCH_INT events on March 21st
- Which service accounts performed interactive (non-batch) transactions after hours?

---

## Threat Hunting / Combined

- Show me all users who accessed finance transactions (FB01, F-02) AND are in the IT department
- Find users who changed their own roles or user profiles (PFCG, SU01 MODIFY, SU10)
- Are there any users with active SoD violations who also had after-hours activity this month?
- Show me all ABAP program executions (SE38) after business hours — who ran them and when?
- Which users modified RFC destinations (SM59) — a potential exfiltration setup?
- Show all events where db_changes > 50 — large-scale data modifications
