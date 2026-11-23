# WeFix — On-Demand Smart Device & Home Appliance Repair Platform

> **Live application:** https://wefix-orcin.vercel.app

## Purpose

WeFix is a full-stack, on-demand repair marketplace that connects customers with verified technicians for smartphones, laptops, TVs, ACs, refrigerators, washing machines, and electrical appliances.

The platform runs on a **pay-after-completion** model:

1. A customer browses approved services and submits a repair request.
2. The assigned technician accepts the request and progresses the job through a server-enforced status pipeline.
3. Once the technician marks the job completed with a final amount, the customer pays securely through **Stripe Checkout**.
4. Payment is verified and recorded only after completion — no upfront charges.

The frontend is built with **Next.js 16 (App Router)**, **React 19**, **TypeScript**, and **Tailwind CSS v4**. Authentication uses **BetterAuth**, images are hosted through **ImgBB**, and notifications use **Sonner**.

---

## Test Credentials

> Passwords are intentionally **not committed to this repository**. Use the credentials supplied with the assignment submission, or create a fresh account from `/sign-up` in under a minute.

| Role | Name | Email | Password |
| :--- | :--- | :--- | :--- |
| **Admin** | Alamin | `alamin@example.com` | Password1 |
| **Technician** | Rafi | `sn@ts.com` | Password1 |
| **Customer** | User | `user1@gmail.com` | Password |

### Quick test flow (2 minutes)

1. Open https://wefix-orcin.vercel.app and sign up as a **Customer**.
2. Browse **Services**, open any approved service, and submit a booking with a future date and a 20+ character problem description.
3. Sign in as the matching **Technician**, accept the request, start the repair, then mark it **Completed** with a final amount.
4. Sign back in as the **Customer**, open **My Bookings**, and click **Pay Now**.
5. Use Stripe's test card:

   | Field | Value |
   | :--- | :--- |
   | Card number | `4242 4242 4242 4242` |
   | Expiry | Any future date (e.g. `12/34`) |
   | CVC | Any 3 digits |
   | Name / ZIP | Any value |

6. After payment you are redirected to the success page and the booking appears as **Paid** in **Payment History**.

> **Admin review:** sign in with the admin account to approve/reject technician services, change user roles, and inspect all bookings, users, and Stripe transactions.

---

## Roles & Key Features

### Customer
- Browse public services with server-side **search, category filter, service-mode filter, and price/newest sorting**.
- View service details, technician profile, price, area, duration, and availability.
- Submit repair requests with contact number, address, preferred future date, and problem description.
- **Duplicate-request protection** — one active request per service per customer.
- Cancel a booking while it is still in `requested` status.
- Track the full status timeline: `requested → accepted → in-progress → completed` (or `rejected` / `cancelled`).
- **Pay after completion** via Stripe Checkout, and review itemized payment history.

### Technician
- Publish repair services with title, category, description, price, duration, service area, mode, and ImgBB image.
- New or edited services enter **pending admin approval** before appearing publicly.
- Toggle service availability on/off instantly.
- Accept or reject incoming requests, then progress jobs through a **server-enforced pipeline**:
  - `requested → accepted` or `rejected`
  - `accepted → in-progress`
  - `in-progress → completed` (requires a positive final amount)
- Illegal status jumps are rejected by the API, not just the UI.
- Dashboard with assigned jobs, earnings, and service counts.

### Administrator
- Platform overview: total users, technicians, services, pending approvals, bookings, and revenue.
- Approve or reject technician service listings.
- Search users and change roles (`customer`, `technician`, `admin`) with self-role-change protection.
- Audit every booking across the platform.
- Audit Stripe transactions and revenue.

### Cross-cutting UX
- Role-aware navigation and route guards.
- JWT session verification on protected API routes.
- Toast notifications (Sonner) for success and error feedback.
- Loading skeletons, empty states, error boundaries, and a custom 404 page.
- Responsive dark theme with mobile navigation.

---

## Frontend Pages

| Route | Description |
| :--- | :--- |
| `/` | Landing page with hero, categories, how-it-works, and trust sections |
| `/services` | Searchable, filterable, sortable service catalogue |
| `/services/[id]` | Service details and booking form |
| `/about` | Platform story, categories, and contact information |
| `/sign-in`, `/sign-up` | BetterAuth authentication |
| `/dashboard/customer` | Customer overview and stats |
| `/dashboard/customer/bookings` | Booking list, status timeline, and payment entry point |
| `/dashboard/customer/payments` | Payment history |
| `/dashboard/technician` | Technician overview and earnings |
| `/dashboard/technician/add-service` | Create a new service |
| `/dashboard/technician/my-services` | Manage, edit, toggle, and delete services |
| `/dashboard/technician/requests` | Accept/reject/progress assigned jobs |
| `/dashboard/admin` | Platform metrics and charts |
| `/dashboard/admin/users` | User list and role management |
| `/dashboard/admin/services` | Service approval queue |
| `/dashboard/admin/bookings` | All platform bookings |
| `/dashboard/admin/transactions` | Stripe transaction audit |
| `/dashboard/profile` | Shared profile editor |
| `/payment/success`, `/payment/cancel` | Stripe return pages |

---

## Frontend npm Packages

### Runtime dependencies
| Package | Version | Purpose |
| :--- | :--- | :--- |
| `next` | `16.4.6` | App Router framework and server rendering |
| `react` | `19.3.0` | UI runtime |
| `react-dom` | `19.3.0` | DOM renderer |
| `better-auth` | `^1.7.27` | Authentication, sessions, and role fields |
| `mongodb` | `^7.9.1` | MongoDB driver used by the BetterAuth adapter |
| `lucide-react` | `^1.77.0` | Icon set |
| `sonner` | `^2.0.8` | Toast notifications |

### Development dependencies
| Package | Version | Purpose |
| :--- | :--- | :--- |
| `typescript` | `^5` | Type safety |
| `tailwindcss` | `4.3.3` | Utility-first styling |
| `@tailwindcss/turbopack` | `4.3.3` | Tailwind integration for Turbopack |
| `eslint` | `^9` | Linting |
| `eslint-config-next` | `16.4.6` | Next.js lint rules |
| `@types/node` | `^20` | Node type definitions |
| `@types/react` | `^19` | React type definitions |
| `@types/react-dom` | `^19` | React DOM type definitions |
| `babel-plugin-react-compiler` | `1.0.0` | React Compiler transform |

---

## Local Development

```bash
# 1. Install dependencies
npm install

# 2. Configure environment (see below)
#    Create .env.local in this folder.

# 3. Start the frontend
npm run dev
```

Open http://localhost:3000.

### Required environment variable names

Create `wefix-client/.env.local` with the following **names** (values are never committed):

```env
NEXT_PUBLIC_API_URL=
NEXT_PUBLIC_IMGBB_API_KEY=
BETTER_AUTH_URL=
BETTER_AUTH_SECRET=
MONGODB_URI=
```

The matching Express API lives in the sibling `wefix-server` folder and expects its own `.env` (`PORT`, `CLIENT_URL`, `MONGODB_URI`, `STRIPE_SECRET_KEY`, `BETTER_AUTH_SECRET`).

### Available scripts

```bash
npm run dev     # Start the development server
npm run build   # Create a production build
npm run start   # Serve the production build
npm run lint    # Run ESLint
```

---

## Data Model

MongoDB collections used by the platform:

- **`user`** — BetterAuth users with `role` (`customer` | `technician` | `admin`), phone, area, and bio.
- **`services`** — technician listings with pricing, category, mode, availability, and `approvalStatus`.
- **`bookings`** — repair requests, snapshots, status history, final amount, and payment status.
- **`payments`** — Stripe checkout session, payment intent, amount, currency, and paid timestamp.

---

## Deployment

| Component | URL |
| :--- | :--- |
| Frontend (Vercel) | https://wefix-orcin.vercel.app |
| Backend API (Vercel) | https://wefix-server.vercel.app |

The deployed frontend reads `NEXT_PUBLIC_API_URL=https://wefix-server.vercel.app`. Server-side CORS and BetterAuth must allow the production frontend origin for authentication to work.
