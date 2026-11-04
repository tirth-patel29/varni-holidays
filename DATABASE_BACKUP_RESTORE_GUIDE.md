# VARNI HOLIDAYS – DATABASE BACKUP & RESTORE RUNBOOK
**Operational Document:** Production Disaster Recovery Standard Operating Procedure  
**Applies To:** Neon PostgreSQL (`neondb`), Prisma ORM, JSON State Backups  
**Last Verified:** November 4, 2026  

---

## 1. Overview & Recovery Objectives

This document establishes the official backup, snapshot, and recovery procedures for the Varni Holidays production database.

- **Recovery Point Objective (RPO):** < 15 minutes.
- **Recovery Time Objective (RTO):** < 10 minutes.
- **Primary Database Engine:** PostgreSQL 18.6 hosted on Neon AWS Southeast Asia (`ap-southeast-1`).
- **Pre-Migration Snapshot Archive:** `application/data/backups/backup_pre_neon_2026-11-04T11-44-54-258Z.json` (SHA-256 verified).

---

## 2. Automated & Manual Backup Procedures

### 2.1 Complete JSON Application State Backup
The platform includes an automated multi-entity snapshot script that exports all tables (Customers, Leads, Quotations, Bookings, Payments, Rate Cards, Users, Audit Logs) into timestamped, structured JSON:

```bash
cd application
npx tsx scripts/backup-state.ts
```
Output location:
`application/data/backups/backup_state_<TIMESTAMP>.json`

### 2.2 Native PostgreSQL `pg_dump` Backup
To extract a full binary or SQL dump directly from the direct Neon connection endpoint:

```bash
# Using direct connection string (Bypasses PgBouncer pooler)
pg_dump "postgresql://neondb_owner:[PASSWORD]@ep-red-frost-a1dawyea.ap-southeast-1.aws.neon.tech/neondb?sslmode=require" \
  --format=custom \
  --file="varniholidays_prod_$(date +%Y%m%d_%H%M%S).dump" \
  --verbose
```

### 2.3 Neon Point-In-Time Restore (PITR) & Branching
Neon provides continuous WAL archiving with instantaneous point-in-time recovery:
1. Log in to the [Neon Console](https://console.neon.tech).
2. Navigate to **Branches** -> **Create Branch**.
3. Select **Time Travel** and specify the exact UTC minute prior to any accidental data modification or corruption.
4. Promote the new branch to primary or swap the connection string in your deployment environment variables.

---

## 3. Database Restoration Procedures

### 3.1 Restoring from Full JSON Backup
To restore data from an existing verified JSON backup archive:

```bash
cd application
npx tsx scripts/restore-state.ts --file=data/backups/backup_pre_neon_2026-11-04T11-44-54-258Z.json
```
**Safety Safeguards:**
- Performs foreign key dependency sequencing (Users & Roles $\to$ Customers $\to$ Packages $\to$ Pricing Matrix $\to$ Leads $\to$ Quotations $\to$ Bookings $\to$ Payments $\to$ Components).
- Executes within an atomic database transaction.
- Prompts for Super Admin confirmation when running in production.

### 3.2 Restoring from `pg_dump` Custom Archive

```bash
pg_restore \
  --dbname="postgresql://neondb_owner:[PASSWORD]@ep-red-frost-a1dawyea.ap-southeast-1.aws.neon.tech/neondb?sslmode=require" \
  --clean \
  --if-exists \
  --no-owner \
  --no-privileges \
  --verbose \
  "varniholidays_prod_20261104.dump"
```

---

## 4. Disaster Recovery Checklist

In the event of database failure or regional disruption:

1. **Assess Disruption:** Determine whether the issue is transient connection loss, schema corruption, or accidental deletion.
2. **Switch Connection:** If an instant Neon branch was created, update `DATABASE_URL` and `DIRECT_URL` in the deployment settings (e.g. Vercel / Railway).
3. **Verify Integrity:** Run the automated end-to-end test suite:
   ```bash
   cd application
   npx tsx scripts/test-phase2-crm.ts
   npx tsx scripts/test-phase3.ts
   ```
4. **Notify Management:** Super Admin Neel Patel receives an audit summary report of the restore event.

