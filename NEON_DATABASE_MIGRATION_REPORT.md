# VARNI HOLIDAYS – NEON DATABASE MIGRATION REPORT
**Migration Phase:** Phase 4 Production Cutover  
**Target Cluster:** Neon Serverless PostgreSQL (`ap-southeast-1.aws.neon.tech`)  
**Database Name:** `neondb`  
**Execution Timestamp:** November 4, 2026  
**Status:** **SUCCESSFUL & RECONCILED (100% PASS)**  

---

## 1. Migration Overview

The Varni Holidays Travel Management Platform database was migrated from local development state to Neon Serverless PostgreSQL in the AWS Southeast Asia (`ap-southeast-1`) region.

### Target Environment Specifications
- **PostgreSQL Version:** PostgreSQL 18.6 on x86_64-pc-linux-gnu.
- **Pooled Connection (`DATABASE_URL`):**  
  `postgresql://neondb_owner:***@ep-red-frost-a1dawyea-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require`
- **Direct Connection (`DIRECT_URL`):**  
  `postgresql://neondb_owner:***@ep-red-frost-a1dawyea.ap-southeast-1.aws.neon.tech/neondb?sslmode=require`
- **ORM / Migration Tooling:** Prisma ORM 5.22.0.

---

## 2. Migration Execution Phases

### Phase 1: Pre-Migration Backup & Safety Snapshot
Prior to modifying any remote schema or applying table structures, a complete cryptographic snapshot was taken of all application records:
- **Archive Path:** [`application/data/backups/backup_pre_neon_2026-11-04T11-44-54-258Z.json`](file:///d:/VARNI-HOLIDAYS/application/data/backups/backup_pre_neon_2026-11-04T11-44-54-258Z.json)
- **Size:** 46,793 bytes.
- **Checksum:** Verified and archived for disaster recovery.

### Phase 2: Schema Push to Neon
Schema definitions were deployed using Prisma against the direct connection (`DIRECT_URL`):
```bash
npx prisma db push
```
**Deployed Database Tables (26 total):**
1. `audit_logs`
2. `booking_service_components`
3. `bookings`
4. `customer_updates`
5. `customers`
6. `flight_enquiry_details`
7. `flight_segments`
8. `follow_ups`
9. `hotel_tiers`
10. `lead_activities`
11. `leads`
12. `package_enquiry_details`
13. `package_itinerary_days`
14. `package_pricing_matrix`
15. `package_supplements`
16. `packages`
17. `payment_records`
18. `permissions`
19. `quotation_line_items`
20. `quotations`
21. `role_permissions`
22. `roles`
23. `system_settings`
24. `user_roles`
25. `users`
26. `visa_enquiry_details`

---

## 3. Data Transfer & Entity Seeding

Data seeding and transfer were executed via [`application/scripts/migrate-data-to-neon.ts`](file:///d:/VARNI-HOLIDAYS/application/scripts/migrate-data-to-neon.ts):

| Entity / Table | Records Migrated | Description |
| :--- | :---: | :--- |
| **System Roles** | 7 | `SUPER_ADMIN`, `BRANCH_MANAGER`, `MANAGER`, `PACKAGES_AGENT`, `FLIGHTS_AGENT`, `VISA_AGENT`, `ACCOUNTANT` |
| **Staff Users** | 5 | Neel Patel (Super Admin), Branch Manager, Priya Sharma (Flights), Harshil Desai (Packages), Ananya Joshi (Visas) |
| **User Role Mappings** | 5 | Relation joins connecting user accounts to system roles |
| **Packages** | 1 | Kerala 6N/7D Winter CPAI (`kerala-6n7d-winter`) with complete destination/pickup metadata |
| **Hotel Tiers** | 5 | Standard 3★, Deluxe 4★, Super Deluxe, Premium Luxury, Heritage Boutique |
| **Pricing Matrix Entries** | 30 | Exact rate cards (2 to 10 Pax), vehicle configs (Sedan, Innova, Traveller), supplier costs, rack rates, and margins |
| **Customer Directory** | 5 | High-intent Gujarat customers with normalized phone & email indexes |
| **Leads Pipeline** | 6 | Multi-stage leads across `REQUESTS`, `GENERAL`, `PRIORITY`, and `CONVERTED` |
| **Quotations** | 1 | Multi-service quotation (₹1,41,400) with immutable encrypted JSON pricing snapshot |
| **Quotation Line Items** | 3 | Package tour, houseboat upgrade, and custom day-trips |
| **Bookings** | 1 | Confirmed Kerala package booking (`VH-BKG-202610-0012`) |
| **Payment Records** | 1 | Advance deposit receipt (`VH-PAY-202610-0005`, ₹50,000) |
| **Service Components** | 3 | Hotel vouchers, Cab allocation, and Houseboat confirmations |

---

## 4. Reconciliation & Verification Results

A reconciliation audit script was run against Neon PostgreSQL to verify that all foreign keys, constraints, and record counts matched expected parameters:

```text
--- RECONCILING NEON DATABASE RECORDS ---
Users: 5
Roles: 7
Packages: 1
Hotel Tiers: 5
Pricing Matrix Entries: 30
Customers: 5
Leads: 6
Quotations: 1
Bookings: 1
Payments: 1
Service Components: 3
Status: 100% RECONCILED (All entities present, zero orphan keys)
```

---

## 5. Migration Conclusion

The Neon PostgreSQL migration is complete, verified, and active. All CRM queries, customer enquiries, quotation engines, and booking actions now execute against the production Neon cluster.

