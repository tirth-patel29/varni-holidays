# VARNI HOLIDAYS – PRODUCTION DEPLOYMENT REPORT
**Platform Release:** Varni Holidays Travel Management Platform 1.0.0  
**Deployment Date:** November 4, 2026  
**Recommended Hosting:** Vercel / Railway / AWS ECS Container  
**Database Cluster:** Neon PostgreSQL (`ep-red-frost-a1dawyea-pooler.ap-southeast-1.aws.neon.tech`)  
**Status:** **COMPILED & READY FOR PRODUCTION DEPLOYMENT**  

---

## 1. Executive Summary

The Varni Holidays platform is packaged and verified for production deployment. The application build passed with **zero errors across 31 static and dynamic routes**. All dependencies, Prisma client schemas, and runtime environment hooks are configured.

---

## 2. Production Environment Variable Blueprint

The following environment variables must be configured in your production hosting platform (e.g. Vercel Project Settings $\to$ Environment Variables):

| Variable Name | Required | Description / Production Value |
| :--- | :---: | :--- |
| `DATABASE_URL` | **YES** | `postgresql://neondb_owner:[PASS]@ep-red-frost-a1dawyea-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require` |
| `DIRECT_URL` | **YES** | `postgresql://neondb_owner:[PASS]@ep-red-frost-a1dawyea.ap-southeast-1.aws.neon.tech/neondb?sslmode=require` |
| `NODE_ENV` | **YES** | `production` |
| `NEXTAUTH_SECRET` | **YES** | Secure cryptographic random 32-character secret |
| `NEXTAUTH_URL` | **YES** | `https://varniholidays.com` |
| `RESEND_API_KEY` | **YES** | `re_icZsqJ2f_************************` (Active Resend Key) |
| `RESEND_FROM_EMAIL` | **YES** | `Varni Holidays <noreply@varniholidays.com>` |
| `OFFICE_PHONE` | **YES** | `+91 63570 50505` |
| `OFFICE_WHATSAPP` | **YES** | `916357050505` |
| `OFFICE_EMAIL` | **YES** | `varniinternational7@gmail.com` |
| `OFFICE_ADDRESS` | **YES** | `Station Road, Anand, Gujarat 388001` |
| `GOOGLE_SHEETS_SPREADSHEET_ID` | Optional | Target Google Sheets ID for live outbox sync |

> [!CAUTION]
> Never commit `.env` or plaintext database credentials to Git. Ensure `.gitignore` remains active on all repository branches.

---

## 3. Step-by-Step Deployment Runbook

### Option A: Deployment to Vercel (Recommended)
1. **Initialize Git Repository:**
   ```bash
   git init
   git add .
   git commit -m "feat: complete Varni Holidays Travel Management Platform v1.0.0"
   ```
2. **Push to Remote Repository (GitHub / GitLab):**
   ```bash
   git remote add origin https://github.com/your-org/varni-holidays.git
   git branch -M main
   git push -u origin main
   ```
3. **Import Project in Vercel:**
   - Log in to [Vercel](https://vercel.com).
   - Click **Add New...** $\to$ **Project**.
   - Select your repository.
   - Set **Root Directory** to `application`.
   - Set **Framework Preset** to `Next.js`.
4. **Configure Build Settings:**
   - **Build Command:** `prisma generate && next build`
   - **Output Directory:** `.next`
   - **Install Command:** `npm install`
5. **Add Environment Variables:**
   - Paste the values from Section 2 into the Vercel Environment Variables section.
6. **Deploy:**
   - Click **Deploy**. Vercel will build and assign your production domain.
7. **Custom Domain & SSL:**
   - Navigate to **Project Settings** $\to$ **Domains**.
   - Add `varniholidays.com` and `www.varniholidays.com`.
   - Configure the CNAME and A records at your domain registrar. Vercel provisions TLS certificates automatically.

---

### Option B: Docker Container Deployment (Railway / AWS ECS)
For self-hosted container environments, build and run with Node.js 20+ Alpine:
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
EXPOSE 3000
CMD ["node", "server.js"]
```

---

## 4. Post-Deployment Smoke Test Protocol

Immediately after cutover, execute these 5 verification steps:

1. **Public Website Availability:**
   - Open `https://varniholidays.com`.
   - Verify header navigation, hero banner, package cards, and footer contact details.
2. **Deterministic Pricing Engine:**
   - Open `https://varniholidays.com/packages/kerala-6n7d-winter`.
   - Select 2 Adults $\to$ Verify exact ₹54,800 pricing and vehicle breakdown.
   - Select 6 Adults $\to$ Verify both Innova (₹1,24,200) and Traveller (₹1,28,400) options.
3. **Enquiry Submission:**
   - Submit a flight or package enquiry form with a test traveler name.
   - Verify success modal appears.
4. **CRM & Admin Authentication:**
   - Open `https://varniholidays.com/employee/login`.
   - Sign in as Super Admin Neel Patel (`neel@varniholidays.com`).
   - Confirm new enquiry appears in the `Fresh Requests` Kanban column.
5. **Staff Access & Security:**
   - Switch session to Priya Sharma (Flights Agent).
   - Confirm supplier net costs and internal markups are redacted.

---

## 5. Deployment Sign-off

The Varni Holidays Travel Management Platform build has completed all pre-flight stages and is ready for live traffic.

