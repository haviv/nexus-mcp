#!/usr/bin/env python3
"""
Seed script: Inserts simulated SAP events into ClickHouse for
Abhishek Chakraborty (ABHISHEKC) — IT Security Admin, SAP ECC BBD.

Story:
  - NORMAL BASELINE: Business-hours IT support activity, Mar 3–14 2026
  - SUSPICIOUS INCIDENT: Night of Mar 20–21 2026 — high-risk tcodes from
    an external IP, strongly deviating from normal behavior
  - NON-HUMAN IDENTITY: Service account SVC_BATCH_INT (batch-only account)
    appears alongside ABHISHEKC's suspicious session, same external IP —
    suggesting credential theft or account hijacking
"""
import urllib.request
import urllib.error
import json
import sys

CLICKHOUSE_URL = "http://localhost:8123/"
CLICKHOUSE_USER = "default"
CLICKHOUSE_PASS = ""

TENANT = "demo-tenant"
MANDT = "100"
ENV   = "PRD"

# ABHISHEKC's known-good fingerprint
NORMAL_TERMINAL = "PC-ECC-ABH01"
NORMAL_IP       = "10.20.15.43"

# Attacker fingerprint (shared between ABHISHEKC's hijacked session and SVC_BATCH)
ATTACKER_IP       = "185.220.101.45"   # known Tor exit node range
ATTACKER_TERMINAL = "PC-VPN-EXTERNAL"

SESSION_NORMAL    = "SES-ABH-NORMAL"
SESSION_ATTACK    = "SES-ABH-ATTACK-0320"
SESSION_SVC       = "SES-SVC-BATCH-0321"


def ch_row(ts, user_id, user_type, dept, location, tcode, program, module,
           action, resp_ms, db_ms, cpu_ms, wait_ms, net_ms, db_reads,
           db_changes, mem_kb, rfc_calls, session_id, terminal, ip,
           risk_level, is_sensitive, is_after_hours, is_weekend,
           return_code, records_processed, perf_cat, raw_note):
    """Return a CSV row matching the plk_enriched_events schema."""
    fields = [
        TENANT, ts, "audit", ENV, MANDT,
        user_id, user_type, dept, location,
        tcode, program, module, action,
        resp_ms, db_ms, cpu_ms, wait_ms, net_ms,
        db_reads, db_changes, mem_kb, rfc_calls,
        session_id, terminal, ip, "SAP GUI 7.60",
        risk_level, is_sensitive, is_after_hours, is_weekend,
        return_code, records_processed, perf_cat, raw_note
    ]
    return "\t".join(str(f) for f in fields)


rows = []

# ─────────────────────────────────────────────────────────────────────────────
# BLOCK 1: NORMAL BASELINE — ABHISHEKC, business hours, Mar 3–14 2026
# Profile: IT SAP consultant, read-only admin tasks during work hours
# ─────────────────────────────────────────────────────────────────────────────
normal_days = [
    # (date, times_UTC)  — US-NY EST = UTC-5 → 09:00-17:00 EST = 14:00-22:00 UTC
    ("2026-03-03", ["14:12:05", "15:45:22", "17:03:11", "19:20:44"]),
    ("2026-03-04", ["13:55:10", "15:10:30", "17:40:50", "20:05:15"]),
    ("2026-03-05", ["14:30:00", "16:20:10", "18:50:25"]),
    ("2026-03-06", ["14:05:33", "15:55:42", "17:15:00", "19:45:00"]),
    ("2026-03-07", ["14:22:17", "16:40:05", "19:10:30"]),
    ("2026-03-10", ["14:08:00", "15:30:45", "17:55:20", "20:15:00"]),
    ("2026-03-11", ["13:50:10", "15:00:20", "18:30:55"]),
    ("2026-03-12", ["14:45:00", "16:10:30", "18:20:10", "21:00:00"]),
    ("2026-03-13", ["14:03:22", "15:40:00", "17:25:15"]),
    ("2026-03-14", ["14:15:10", "16:05:40", "18:45:00", "20:30:10"]),
]

# Routine IT tcode mix: user display/info, table browse (read), view maintenance
normal_tcodes = [
    ("SU01",  "RSUSR000",  "Basis",    "DISPLAY", 320,  80,  60,  80, 100,  150, 0, 2048, 0, "low",    0),
    ("SE16N", "RSEN00000", "Basis",    "DISPLAY", 890, 400, 180, 200, 110, 3200, 0, 4096, 0, "medium", 0),
    ("SUIM",  "RSUSR200",  "Basis",    "DISPLAY", 450, 100,  90, 160, 100,  800, 0, 3072, 0, "low",    0),
    ("SU3",   "RSUSR000",  "Basis",    "DISPLAY", 210,  40,  50,  80,  40,   50, 0, 1024, 0, "low",    0),
    ("SM30",  "SAPM06MD",  "Basis",    "DISPLAY", 380, 120,  80, 100,  80,  400, 0, 2048, 0, "low",    0),
]

for date, times in normal_days:
    wday = 0  # all are Mon-Fri
    for i, t in enumerate(times):
        tc = normal_tcodes[i % len(normal_tcodes)]
        tcode, prog, mod, act, resp, db_ms, cpu, wait, net, reads, changes, mem, rfc, risk, sensitive = tc
        rows.append(ch_row(
            ts=f"{date} {t}",
            user_id="ABHISHEKC",
            user_type="Dialog",
            dept="IT (SAP)",
            location="US-NY",
            tcode=tcode,
            program=prog,
            module=mod,
            action=act,
            resp_ms=resp,
            db_ms=db_ms,
            cpu_ms=cpu,
            wait_ms=wait,
            net_ms=net,
            db_reads=reads,
            db_changes=changes,
            mem_kb=mem,
            rfc_calls=rfc,
            session_id=f"{SESSION_NORMAL}-{date.replace('-','')}",
            terminal=NORMAL_TERMINAL,
            ip=NORMAL_IP,
            risk_level=risk,
            is_sensitive=sensitive,
            is_after_hours=0,
            is_weekend=wday,
            return_code=0,
            records_processed=reads,
            perf_cat="normal",
            raw_note=f"[BASELINE] {tcode} DISPLAY by ABHISHEKC from internal workstation"
        ))

print(f"  Normal baseline rows: {len(rows)}")

# ─────────────────────────────────────────────────────────────────────────────
# BLOCK 2: SUSPICIOUS INCIDENT — ABHISHEKC, night of Mar 20-21 2026
# External IP, after-hours, high-impact tcodes totally outside IT-admin scope
# Pattern: recon → privilege escalation → data access → finance tampering → backdoor
# ─────────────────────────────────────────────────────────────────────────────
attack_events = [
    # (time,    tcode,  program,      module,   action,   resp,  db,  cpu, wait, net, reads, changes, mem,   rfc, risk,     sensitive, rc,  records, perf,         note)
    ("23:45:03", "SU53", "RSUSR400",   "Security","REJECT",  180,  20,  40,  80, 40,    20,       0, 1024, 0, "high",    1,         12,  0,      "slow",   "Auth probe - checking accessible transactions"),
    ("23:45:31", "SU01", "RSUSR000",   "Basis",   "DISPLAY", 310,  90,  70, 100, 50,   150,       0, 2048, 0, "high",    1,          0,  0,      "normal", "User lookup - victim account recon"),
    ("23:46:10", "SU01", "RSUSR000",   "Basis",   "MODIFY",  420, 180, 100, 100, 40,   150,      12, 3072, 0, "critical",1,          0, 12,      "normal", "!!! User account MODIFICATION - NOT normal for this user"),
    ("23:47:02", "SU10", "RSUSR405",   "Basis",   "MODIFY",  890, 400, 200, 200, 90,   500,      47, 6144, 0, "critical",1,          0, 47,      "slow",   "!!! MASS user changes (SU10) - 47 records modified"),
    ("23:48:44", "PFCG", "SAPLPRGN",   "Basis",   "MODIFY", 1200, 600, 300, 200, 100,  800,      35, 8192, 0, "critical",1,          0, 35,      "slow",   "!!! Role MAINTENANCE (PFCG) - potential backdoor role creation"),
    ("23:50:15", "SE16N","RSEN00000",  "Basis",   "UPDATE",  980, 500, 250, 150, 80,  4500,     120, 5120, 0, "critical",1,          0,120,      "slow",   "!!! Table browser in UPDATE mode - data tampering"),
    ("23:52:30", "SE38", "RSDBRUNT",   "Basis",   "EXECUTE",1450, 800, 400, 150, 100, 2000,       0,12288, 2, "critical",1,          0,  0,      "critical","!!! ABAP program execution (SE38) with RFC calls"),
    ("23:54:00", "SM59", "RSRFCCLIENT","Basis",   "MODIFY",  760, 300, 180, 200, 80,   300,       8, 4096, 0, "critical",1,          0,  8,      "normal", "!!! RFC destination MODIFIED - external connection setup"),
    ("23:56:12", "FB01", "SAPMF05A",   "Finance", "POST",    650, 280, 140, 160, 70,   420,      18, 3072, 0, "critical",1,          0, 18,      "normal", "!!! Finance POSTING (FB01) - completely out of scope for IT dept"),
    ("23:58:30", "F-02", "SAPMF05A",   "Finance", "POST",    810, 350, 160, 200, 100,  380,      22, 3072, 0, "critical",1,          0, 22,      "slow",   "!!! Finance journal entry - ABHISHEKC has no finance role"),
    ("00:01:05", "SU01", "RSUSR000",   "Basis",   "MODIFY",  390, 160,  90, 100, 40,   150,       5, 2048, 0, "critical",1,          0,  5,      "normal", "!!! Second user modification - covering tracks / re-enabling account"),
    ("00:03:40", "SE38", "RSDBRUNT",   "Basis",   "EXECUTE",1820,900, 500, 300, 120, 3500,        0,16384, 4, "critical",1,          0,  0,      "critical","!!! Second ABAP execution - exfiltration program, high RFC activity"),
    ("00:05:22", "SM21", "RSLG0400",   "Basis",   "DISPLAY",  220, 60,  50,  80, 30,   100,       0, 1024, 0, "high",    1,          0,  0,      "normal", "System log REVIEW - attacker checking if detected"),
    ("00:07:10", "SE16N","RSEN00000",  "Basis",   "UPDATE", 1100, 600, 280, 150, 70,  5200,     230, 6144, 0, "critical",1,          0,230,      "critical","!!! Second table UPDATE - large-scale data modification (230 records)"),
    ("00:09:55", "SU53", "RSUSR400",   "Security","DISPLAY",  150, 10,  30,  70, 40,    10,       0,  512, 0, "high",    1,          0,  0,      "normal", "Final auth check - confirming access before exiting"),
]

for time_str, tcode, prog, mod, act, resp, db, cpu, wait, net, reads, changes, mem, rfc, risk, sensitive, rc, records, perf, note in attack_events:
    # 23:xx is still Mar 20; 00:xx rolls to Mar 21
    if time_str.startswith("00:"):
        date_str = "2026-03-21"
        is_weekend = 1  # Saturday
    else:
        date_str = "2026-03-20"
        is_weekend = 0  # Friday

    rows.append(ch_row(
        ts=f"{date_str} {time_str}",
        user_id="ABHISHEKC",
        user_type="Dialog",
        dept="IT (SAP)",
        location="UNKNOWN",
        tcode=tcode,
        program=prog,
        module=mod,
        action=act,
        resp_ms=resp,
        db_ms=db,
        cpu_ms=cpu,
        wait_ms=wait,
        net_ms=net,
        db_reads=reads,
        db_changes=changes,
        mem_kb=mem,
        rfc_calls=rfc,
        session_id=SESSION_ATTACK,
        terminal=ATTACKER_TERMINAL,
        ip=ATTACKER_IP,
        risk_level=risk,
        is_sensitive=sensitive,
        is_after_hours=1,
        is_weekend=is_weekend,
        return_code=rc,
        records_processed=records,
        perf_cat=perf,
        raw_note=note
    ))

print(f"  After attack rows so far: {len(rows)}")

# ─────────────────────────────────────────────────────────────────────────────
# BLOCK 3: NON-HUMAN IDENTITY — SVC_BATCH_INT service account
# This account is ONLY supposed to run batch jobs (SBWP, SM36, SM37) overnight.
# On the same night it suddenly performs user-admin and finance transactions
# from the SAME external IP as ABHISHEKC's suspicious session — strongly
# suggesting the attacker also compromised or impersonated the service account.
# ─────────────────────────────────────────────────────────────────────────────

# Normal SVC_BATCH_INT events (legitimate batch window: 02:00-04:00)
svc_normal = [
    ("2026-03-03 02:05:10", "SM37",  "RSBDCSUB",  "Basis",   "EXECUTE", 210, 40,  50, 80,  40,  120, 0, 2048, 0, "low",    0, 0, 0, "normal"),
    ("2026-03-04 02:10:30", "SM36",  "RSBDCSUB",  "Basis",   "EXECUTE", 190, 30,  45, 75,  40,   90, 0, 1536, 0, "low",    0, 0, 0, "normal"),
    ("2026-03-05 02:08:00", "SBWP",  "RSBCSSEND", "Basis",   "EXECUTE", 250, 50,  60, 90,  50,  130, 0, 1024, 0, "low",    0, 0, 0, "normal"),
    ("2026-03-06 02:12:45", "SM37",  "RSBDCSUB",  "Basis",   "EXECUTE", 200, 35,  55, 70,  40,  100, 0, 2048, 0, "low",    0, 0, 0, "normal"),
    ("2026-03-07 02:07:20", "SM36",  "RSBDCSUB",  "Basis",   "EXECUTE", 215, 40,  50, 85,  40,  110, 0, 1536, 0, "low",    0, 0, 0, "normal"),
    ("2026-03-10 02:09:00", "SM37",  "RSBDCSUB",  "Basis",   "EXECUTE", 205, 38,  52, 75,  40,   95, 0, 2048, 0, "low",    0, 0, 0, "normal"),
    ("2026-03-11 02:11:30", "SBWP",  "RSBCSSEND", "Basis",   "EXECUTE", 240, 45,  58, 87,  50,  125, 0, 1024, 0, "low",    0, 0, 0, "normal"),
    ("2026-03-12 02:06:15", "SM36",  "RSBDCSUB",  "Basis",   "EXECUTE", 195, 32,  48, 75,  40,   88, 0, 1536, 0, "low",    0, 0, 0, "normal"),
    ("2026-03-13 02:13:00", "SM37",  "RSBDCSUB",  "Basis",   "EXECUTE", 208, 36,  51, 81,  40,   92, 0, 2048, 0, "low",    0, 0, 0, "normal"),
    ("2026-03-14 02:10:00", "SM37",  "RSBDCSUB",  "Basis",   "EXECUTE", 202, 38,  50, 74,  40,  100, 0, 2048, 0, "low",    0, 0, 0, "normal"),
]

for ts, tcode, prog, mod, act, resp, db, cpu, wait, net, reads, changes, mem, rfc, risk, sensitive, ah, rc, perf in svc_normal:
    rows.append(ch_row(
        ts=ts, user_id="SVC_BATCH_INT", user_type="Service",
        dept="IT (SAP)", location="US-DC",
        tcode=tcode, program=prog, module=mod, action=act,
        resp_ms=resp, db_ms=db, cpu_ms=cpu, wait_ms=wait, net_ms=net,
        db_reads=reads, db_changes=changes, mem_kb=mem, rfc_calls=rfc,
        session_id=f"SES-SVC-NORMAL-{ts[:10].replace('-','')}",
        terminal="SRV-BATCH-01", ip="10.20.10.5",
        risk_level=risk, is_sensitive=sensitive,
        is_after_hours=ah, is_weekend=0,
        return_code=rc, records_processed=reads,
        perf_cat=perf,
        raw_note=f"[NORMAL BATCH] Scheduled {tcode} by SVC_BATCH_INT from batch server"
    ))

# Suspicious SVC_BATCH_INT events — same night as attack, same external IP
svc_attack = [
    # (time,     tcode,  prog,         mod,       act,       resp,  db,  cpu, wait, net, reads, changes, mem,   rfc, risk,      sensitive, rc,  records, perf,     note)
    ("00:15:30", "SU01", "RSUSR000",   "Basis",   "MODIFY",  610, 280, 150, 130, 50,   200,      18, 4096, 0, "critical",1,          0, 18,   "normal", "!!! SVC_BATCH doing USER MODIFICATION - never done before, same external IP as ABHISHEKC attack session"),
    ("00:17:05", "SE38", "RSDBRUNT",   "Basis",   "EXECUTE",1650, 820, 420, 310, 100, 3800,       0,14336, 5, "critical",1,          0,  0,   "critical","!!! SVC_BATCH executing ABAP program via SE38 - service accounts should never do this"),
    ("00:18:40", "FB01", "SAPMF05A",   "Finance", "POST",    720, 300, 155, 175, 90,   450,      21, 3584, 0, "critical",1,          0, 21,   "normal", "!!! SVC_BATCH posting to FINANCE (FB01) - impossible for a batch service account"),
    ("00:20:10", "PFCG", "SAPLPRGN",   "Basis",   "MODIFY",  950, 450, 230, 220, 50,   700,      28, 7168, 0, "critical",1,          0, 28,   "slow",   "!!! SVC_BATCH modifying ROLES (PFCG) - strongly indicates credential hijack"),
    ("00:22:55", "SM59", "RSRFCCLIENT","Basis",   "MODIFY",  680, 290, 160, 180, 50,   280,       6, 3584, 0, "critical",1,          0,  6,   "normal", "!!! SVC_BATCH modifying RFC destinations - same attacker pattern as ABHISHEKC"),
]

for time_str, tcode, prog, mod, act, resp, db, cpu, wait, net, reads, changes, mem, rfc, risk, sensitive, rc, records, perf, note in svc_attack:
    rows.append(ch_row(
        ts=f"2026-03-21 {time_str}",
        user_id="SVC_BATCH_INT",
        user_type="Service",
        dept="IT (SAP)",
        location="UNKNOWN",
        tcode=tcode, program=prog, module=mod, action=act,
        resp_ms=resp, db_ms=db, cpu_ms=cpu, wait_ms=wait, net_ms=net,
        db_reads=reads, db_changes=changes, mem_kb=mem, rfc_calls=rfc,
        session_id=SESSION_SVC,
        terminal=ATTACKER_TERMINAL,
        ip=ATTACKER_IP,
        risk_level=risk, is_sensitive=sensitive,
        is_after_hours=1, is_weekend=1,
        return_code=rc, records_processed=records,
        perf_cat=perf,
        raw_note=note
    ))

print(f"  Total rows to insert: {len(rows)}")

# ─────────────────────────────────────────────────────────────────────────────
# INSERT into ClickHouse
# ─────────────────────────────────────────────────────────────────────────────
cols = (
    "tenant_id,ts,log_type,env,mandt,user_id,user_type,department,location,"
    "tcode,program,module,action,"
    "response_time_ms,db_time_ms,cpu_time_ms,wait_time_ms,network_time_ms,"
    "db_reads,db_changes,memory_kb,rfc_calls,"
    "session_id,terminal,ip,gui_version,"
    "risk_level,is_sensitive,is_after_hours,is_weekend,"
    "return_code,records_processed,performance_category,raw"
)

tsv_body = "\n".join(rows)
query = f"INSERT INTO plk_enriched_events ({cols}) FORMAT TSV\n{tsv_body}"

url = CLICKHOUSE_URL
req = urllib.request.Request(
    url,
    data=query.encode("utf-8"),
    method="POST",
    headers={"Content-Type": "text/plain; charset=utf-8"}
)
import base64
credentials = base64.b64encode(f"{CLICKHOUSE_USER}:{CLICKHOUSE_PASS}".encode()).decode()
req.add_header("Authorization", f"Basic {credentials}")

try:
    with urllib.request.urlopen(req) as resp:
        print(f"\n✅ INSERT succeeded — HTTP {resp.status}")
        print(f"   {len(rows)} rows inserted.")
except urllib.error.HTTPError as e:
    body = e.read().decode()
    print(f"\n❌ INSERT failed — HTTP {e.code}: {body}", file=sys.stderr)
    sys.exit(1)

print("""
Summary of seeded data
─────────────────────
ABHISHEKC (Abhishek Chakraborty, IT SAP dept):
  • ~43 normal business-hours events (Mar 3–14): SU01/SE16N/SUIM display tasks
    from PC-ECC-ABH01 / 10.20.15.43 (internal)
  • 15 suspicious after-hours events (Mar 20-21, 23:45–00:10 UTC):
    from PC-VPN-EXTERNAL / 185.220.101.45 (external/Tor)
    Tcodes: SU01 MODIFY, SU10, PFCG, SE16N UPDATE, SE38 EXECUTE,
            SM59 MODIFY, FB01 POST, F-02 POST, SM21
    → Finance tcodes completely out of scope for an IT person

SVC_BATCH_INT (Service account, normally batch jobs only):
  • 10 normal batch events (Mar 3–14): SM37/SM36/SBWP from SRV-BATCH-01 / 10.20.10.5
  • 5 suspicious events (Mar 21, 00:15–00:22 UTC):
    SAME EXTERNAL IP as ABHISHEKC attack (185.220.101.45)
    Tcodes: SU01 MODIFY, SE38 EXECUTE, FB01 POST, PFCG MODIFY, SM59 MODIFY
    → Service account performing interactive user-admin and finance transactions
    → Indicates same attacker hijacked / pivoted to the service account
""")
