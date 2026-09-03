# 🛡️ Cyber Telemetry Lab

> **Browser Profiler & Diagnostic Security Experiment**  
> An interactive cybersecurity research platform demonstrating what digital traces, hardware signatures, and network metadata web applications can legitimately detect from client environments upon user consent. Backed by a serverless **Neon PostgreSQL** cluster.

---

## 📑 Table of Contents

- [Overview](#-overview)
- [Architecture & Tech Stack](#-architecture--tech-stack)
- [Key Features](#-key-features)
  - [Public Client Profiler (`/`)](#1-public-client-profiler-)
  - [Protected Admin Console (`/admin`)](#2-protected-admin-console-admin)
- [Collected Telemetry Reference](#-collected-telemetry-reference)
- [Project Structure](#-project-structure)
- [Environment Configuration](#-environment-configuration)
- [Getting Started](#-getting-started)
- [Security, Privacy & Ethics](#-security-privacy--ethics)

---

## 🔭 Overview

Modern web browsers expose a rich set of non-sensitive diagnostic APIs (hardware specifications, graphics hardware, rendering engine variations, network hints) intended for adaptive rendering and performance optimization. However, when combined, these signals form unique digital signatures.

This project was built as an educational cybersecurity experiment to:
1. Demonstrate the scope of client-side browser interrogation under an explicit, opt-in **Consent Modal**.
2. Capture incoming server-side HTTP request headers (IP address, client hints, TLS metadata).
3. Securely store and index diagnostic records in a high-performance **Neon PostgreSQL** database.
4. Provide a restricted, authenticated **Admin Dashboard** for security researchers to search, filter, analyze, and export telemetry records.

---

## ⚡ Architecture & Tech Stack

| Layer | Technology | Role |
| :--- | :--- | :--- |
| **Framework** | **Next.js 16.3+ (App Router)** | Full-stack React framework with Turbopack for client views and serverless API endpoints. |
| **UI & Styling** | **Tailwind CSS v4 + Lucide Icons** | High-contrast dark cyber SOC / terminal interface with glowing indicators and scanline effects. |
| **Language** | **TypeScript 5+** | Strict typing for structured telemetry metrics and database payloads. |
| **Database** | **Neon PostgreSQL (Serverless)** | Cloud PostgreSQL cluster on AWS with native connection pooling via `@neondatabase/serverless`. |
| **Authentication** | **HMAC-SHA256 Session Cookies** | Lightweight, stateless administrative authentication with HTTP-only cookies. |

---

## 🚀 Key Features

### 1. Public Client Profiler (`/`)
* **Strict Opt-in Consent**: Visitors are presented with an educational consent modal explaining what will be analyzed.
* **No Database/Admin Clutter**: The public interface is completely clean of backend badges, administrative links, or database indicators.
* **Simulated Diagnostic Terminal**: Animated multi-stage scanning overlay tracking each interrogation step in real time.
* **Interactive Results Dashboard**:
  * **Hardware & Specs**: CPU cores, RAM memory, battery level & charging state, touch support.
  * **Graphics & Fingerprints**: Unmasked WebGL GPU card name, Canvas 2D render hash with sample thumbnail, and AudioContext spectral hash.
  * **Display & Viewport**: Resolution, HiDPI / Retina pixel ratio, color depth, orientation.
  * **Privacy & Heuristics**: Adblocker detection (DOM bait probing), Incognito/Private browsing check, Do Not Track (DNT) header status, and browser permissions states.
  * **HTTP Headers**: Table displaying what the server received during the request.
  * **Export Data**: Instant client-side download of the complete diagnostic profile as `.json`.

### 2. Protected Admin Console (`/admin`)
* **Authentication Gate**: Locked behind administrative credentials with secure session cookies.
* **Real-Time Telemetry Aggregations**:
  * Total logged scans in Neon PostgreSQL.
  * Unique visitor count (cryptographic visitor IDs).
  * AdBlocker adoption percentage.
  * Incognito / Private browsing rate.
  * Distribution breakdown bars for Browsers, Operating Systems, and unmasked GPUs.
* **Search & Filters**: Instant multi-field search across Client IP, Visitor ID, Browser, OS, and GPU models.
* **Forensic Dossier Modal**: Click any scan row to inspect the full record, complete headers, and formatted JSON document.
* **Data Management**:
  * **Export CSV**: Export all database records into an analysis spreadsheet.
  * **Delete Record**: Remove individual test records.
  * **Purge Database**: Clear all historical logs from Neon PostgreSQL with confirmation.

---

## 🔍 Collected Telemetry Reference

| Category | Properties Inspected | Source API |
| :--- | :--- | :--- |
| **Hardware** | Logical CPU Cores, Device Memory (GB), Touch Points, Battery % & Status | `navigator.hardwareConcurrency`, `navigator.deviceMemory`, `navigator.getBattery()` |
| **Graphics** | Unmasked GPU Vendor & Renderer, Max Texture Size, GL Version | `WEBGL_debug_renderer_info`, WebGL Context |
| **Signatures** | Canvas 2D cryptographic hash, AudioContext dynamic compressor hash | HTML5 `<canvas>`, Web Audio `OfflineAudioContext` |
| **Display** | Screen Width & Height, Available Space, Pixel Ratio, Color Depth | `window.screen`, `window.devicePixelRatio` |
| **Privacy** | Adblocker detection, Incognito quota check, DNT header, Permissions | DOM bait probe, `navigator.storage.estimate()`, Permissions API |
| **Network** | Public Client IP, Connection type, Downlink, Latency RTT, Timezone | HTTP Request Headers (`x-forwarded-for`), `navigator.connection`, `Intl` |

---

## 📁 Project Structure

```
cyber-project/
├── .env.local                     # Neon PostgreSQL & Admin credentials (git-ignored)
├── package.json                   # Dependencies and scripts
├── src/
│   ├── app/
│   │   ├── admin/
│   │   │   └── page.tsx           # Authenticated Admin Dashboard & Login Gate
│   │   ├── api/
│   │   │   ├── admin/
│   │   │   │   ├── auth/route.ts  # Admin session login, check, and logout
│   │   │   │   └── logs/route.ts  # Protected database query & deletion API
│   │   │   ├── inspect/route.ts   # Server-side header inspection & Neon logging
│   │   │   └── logs/route.ts      # Public aggregate logs API
│   │   ├── globals.css            # Cyber grid, glow borders, and scanline CSS
│   │   ├── layout.tsx             # Root layout with hydration mismatch guards
│   │   └── page.tsx               # Clean public-facing experiment page
│   ├── components/
│   │   ├── ConsentModal.tsx       # Cyber experiment opt-in modal
│   │   ├── LogsView.tsx           # Telemetry records viewer component
│   │   ├── ScanningOverlay.tsx    # Animated cyber progress overlay
│   │   └── TelemetryDashboard.tsx # Comprehensive client diagnostic dashboard
│   └── lib/
│       ├── auth.ts                # HMAC-SHA256 admin token signing & verification
│       ├── db.ts                  # Neon PostgreSQL client, queries, and schema init
│       └── telemetry.ts           # Safe client-side browser telemetry collector
```

---

## ⚙️ Environment Configuration

Create a `.env.local` file in the project root:

```env
# Neon PostgreSQL Connection Strings
DATABASE_URL=postgresql://neondb_owner:<password>@<neon-host>-pooler.tech/neondb?channel_binding=require&sslmode=require
DATABASE_URL_UNPOOLED=postgresql://neondb_owner:<password>@<neon-host>.tech/neondb?sslmode=require

# Admin Authentication
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_secure_admin_password
ADMIN_SECRET_KEY=your_random_hmac_secret_key
```

---

## 🛠️ Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Development Server
```bash
npm run dev
```

* **Public Experiment**: Open [http://localhost:3000](http://localhost:3000)
* **Admin Console**: Open [http://localhost:3000/admin](http://localhost:3000/admin)

### 3. Production Build
```bash
npm run build
npm run start
```

---

## 🔒 Security, Privacy & Ethics

1. **Explicit Opt-in**: Telemetry is only extracted after the visitor explicitly clicks **"ALLOW & INITIATE SCAN"**.
2. **Cross-Site History Boundary**: In accordance with the **Same-Origin Policy (SOP)** and web security standards, arbitrary cross-site browsing history is never accessible to web applications. Only origin-level navigation diagnostics (such as `history.length` depth and arrival type) can be inspected.
3. **Restricted Admin Access**: Database records and administrative endpoints are protected with signed HTTP-only cookies and reject unauthenticated requests with `401 Unauthorized`.
4. **No Sensitive PII**: The profiler targets environment and hardware metadata; no passwords, credentials, or session cookies are recorded.

---

## 📄 License
This project is licensed under the MIT License for educational and cybersecurity research purposes.
