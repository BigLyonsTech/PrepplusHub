# 🌿 PrepplusHub — Premium Multi-Vendor Marketplace

Welcome to **PrepplusHub**, a next-generation, high-fidelity multi-vendor e-commerce marketplace built by **Prepplus Global Limited**. PrepplusHub is built with an **"Apple-style confidence"** aesthetic, featuring large elegant display typography, generous white-space, a refined organic color palette, and micro-interactions that elevate the standard shopping experience into something tactile and premium.

This project is a full-stack, cohesive application consisting of a modern **React (Vite) Frontend** loaded with performance-optimized animations (using Framer Motion & GSAP) and a robust **Spring Boot + MongoDB Backend** utilizing JWT authentication and secure, audited workflows.

---

## 🎨 Design Philosophy & UI Craft

PrepplusHub's identity is defined by restraint, editorial clarity, and subtle tactile details:
*   **Typography:** We use **Fraunces** as a high-character serif display font for headlines, balanced by **Inter** for clean, legible body text.
*   **Color Palette (Warm Organic):**
    *   `#0C120E` (**Ink**) — Deep green-black charcoal for immersive/dark hero sections.
    *   `#F6F8F5` (**Paper**) — Warm off-white for content grids and backgrounds.
    *   `#3FBF6B` (**Leaf**) — Vibrant electric green for primary CTAs and success states.
    *   `#123D0A` (**Canopy**) — Rich forest green for accents, highlights, and badges.
*   **Tactile Texture (SVG Noise Grain):** A CSS-noise overlay is applied at low opacity using `mix-blend-mode: overlay` to give the interfaces a physical, premium feel without dragging down web performance.
*   **Ambient Glow & Pedestals:** Custom blurred radial-ellipse glows beneath floating products create high-end studio lighting effects.
*   **Spring Physics:** Hover lifts and button shadows utilize custom spring-based easing instead of standard linear transitions to feel active and responsive.

---

## ⚡ Tech Stack

### Frontend (`/marketplace-frontend`)
*   **Framework & Bundler:** React 18, Vite (for ultra-fast Hot Module Replacement)
*   **State Management:** Redux Toolkit (`@reduxjs/toolkit` & `react-redux`)
*   **Styling:** Tailwind CSS v4 (with native custom `@theme` variables)
*   **Animations:** Framer Motion (for UI micro-interactions, modals, state transitions) & GSAP with ScrollTrigger (for elegant scroll reveals)
*   **Routing:** React Router v6 (lazy loaded & code-split)
*   **Icons:** Lucide React

### Backend (`/backend`)
*   **Framework:** Spring Boot 3.x (compiled & optimized under Java 21+)
*   **Database:** MongoDB (using Spring Data MongoDB repositories)
*   **Security:** Spring Security with JWT (JSON Web Tokens)
*   **Validation:** Spring Validation Starter
*   **Dev Productivity:** Project Lombok

---

## 🧭 The 14-Screen Interactive Workflow

The application implements the complete onboarding and e-commerce lifecycle across **14 distinct routes**, fully wired to Redux state and backed by API persistence:

```
                  ┌──────────────────────┐
                  │ 1. Landing Page (/)  │
                  └──────────┬───────────┘
                             │ (Get Started)
                             ▼
                  ┌──────────────────────┐
                  │ 2. Auth Choice       │
                  │    (/auth, /login)   │
                  └──────────┬───────────┘
                             │
                             ▼
                  ┌──────────────────────┐
                  │ 3. KYC Registration │
                  │     (/register)      │
                  └──────────┬───────────┘
                             │
                             ▼
                  ┌──────────────────────┐
                  │ 4. OTP Verification  │
                  │    (/verify-otp)     │
                  └──────────┬───────────┘
                             │
                             ▼
                  ┌──────────────────────┐
                  │ 5. Role Confirmation │
                  │ (/role-confirmation) │
                  └────┬────────────┬────┘
                       │            │
         (As Customer) │            │ (As Vendor)
                       ▼            ▼
 ┌─────────────────────────┐    ┌─────────────────────────┐
 │ 6. Personalization Quiz │    │ 7. Eligibility Flow     │
 │    (/onboarding/quiz)   │    │   (/onboarding/vendor)  │
 └─────────────┬───────────┘    └────────────┬────────────┘
               │                             │
               ▼                             ▼
 ┌─────────────────────────┐    ┌─────────────────────────┐
 │ 8. Customer Dashboard   │    │ 9. Vendor Dashboard     │
 │  (/customer/dashboard)  │    │   (/vendor/dashboard)   │
 └──────┬────────────┬─────┘    └─────────────────────────┘
        │            │
        ▼            ▼
┌──────────────┐ ┌──────────────┐
│12. Prod/Vend │ │13. Checkout  │
│    Reviews   │ │    Flow      │
└──────────────┘ └──────────────┘

  *   *   *   *   *   *   *   *   *   *   *   *   *   *   *   *
┌─────────────────────────┐    ┌─────────────────────────┐
│ 10. Admin Dashboard     │    │ 11. Profile Customizer  │
│        (/admin)         │    │       (/profile)        │
└─────────────────────────┘    └─────────────────────────┘
┌─────────────────────────┐
│ 14. Terms & Conditions  │
│        (/terms)         │
└─────────────────────────┘
```

1.  **Landing Page (`/`):** Full-bleed immersive marketing showcase with autoplaying hero slideshow, parallax scroll fades, category spotlights, countdown timers, and trending carousels.
2.  **Auth Entry (`/auth`, `/login`):** A beautiful entry portal to either register or log in.
3.  **Registration Form (`/register`):** Collects standard credentials *plus* comprehensive KYC (Identity type, ID number, Address, DOB) in a unified, single-form experience.
4.  **OTP Verification (`/verify-otp`):** Dev-friendly verification screen with a soft pulsing status display.
5.  **Role Confirmation (`/role-confirmation`):** Smart logic determines referrer context (e.g. if the user registered after clicking a specific product CTA, it automatically pre-selects "Customer" while leaving an option to swap).
6.  **Customer Onboarding Quiz (`/onboarding/quiz`):** Dynamic multi-step interest, budget, and frequency selector that customizes the user's Dashboard Feed. Completely skippable to prevent blocking.
7.  **Vendor Eligibility Flow (`/onboarding/vendor`):** Secure questionnaire confirming legitimacy, uploading registration files via Cloudinary, and setting the account to a calm, pulsing `pending` review state.
8.  **Customer Dashboard (`/customer/dashboard`):** Tailored "For You Page" based on onboarding profile, featuring featured categories, products list, live cart operations, and past orders.
9.  **Vendor Dashboard (`/vendor/dashboard`):** Shows a restricted, greyed-out view with clear tooltips if the application is still `pending` review. Unlocks product creation and financial metrics once approved.
10. **Admin Dashboard (`/admin`):** Powerful oversight center comprising:
    *   *Vendor & Customer Verification Queues* with quick Approve/Reject buttons (rejections prompt a required reason).
    *   *Activity/Audit Log Monitor* showing critical events (logins, uploads, purchases) without exposing raw sensitive personal details.
    *   *Curation Tools* to toggle featured catalog banners.
11. **Profile Customization (`/profile`):** Unified editor giving customers light theme controls, and vendors full "shop-page" aesthetic customization (banners, descriptions, shop accents).
12. **Product Detail Page (`/products/:id`):** Split screen showcasing interactive alpha-transparent product imagery, deep specifications, and separate rating systems for both the *product* and the *selling vendor*.
13. **Checkout Flow (`/checkout`):** Secure multi-stage cart-validation, billing setup, and a simulated payment gateway.
14. **Terms & Conditions (`/terms`):** Detailed corporate policy document referenced during registration.

---

## 📁 Repository Structure

```
frnt-end/
├── backend/                       # Spring Boot API Application
│   ├── src/main/java/...          # Java controllers, models, DTOs, security, repositories
│   ├── src/main/resources/        # Application properties & config
│   ├── mvnw.cmd                   # Maven wrapper for Windows
│   └── pom.xml                    # Maven build file (Java 21, Spring Boot 4.x)
│
├── marketplace-frontend/          # React + Vite Frontend
│   ├── src/
│   │   ├── assets/                # Local high-quality alphas and icons
│   │   ├── components/            # Reusable visual UI blocks (Hero, Navbar, Carousels)
│   │   ├── hooks/                 # Custom state hooks
│   │   ├── lib/                   # API clients and utility classes
│   │   ├── pages/                 # Full 14 page templates
│   │   └── store/                 # Redux Toolkit store + modular slices
│   ├── index.html                 # Entry point with Fraunces/Inter font imports
│   ├── package.json               # Frontend dependencies (Framer Motion, GSAP, etc.)
│   └── vite.config.js             # Dev-server proxy to route '/api' -> 'localhost:8080'
│
└── Frontend_Build_Brief.md        # Technical product spec and wireframe brief
```

---

## 🚀 How to Build & Run Locally

### 1. Prerequisite: Run MongoDB
Ensure you have a MongoDB instance running on your default local port:
```bash
# Connection URI:
mongodb://localhost:27017
```

### 2. Run the Spring Boot Backend
From the root workspace directory, navigate to the backend folder and compile/run the application:
```powershell
cd backend
.\mvnw.cmd spring-boot:run
```
*   **Base URL:** `http://localhost:8080/api`
*   **Database Seeding:** On the very first launch, the backend will automatically seed 12 demo products and the primary Admin account if the database collection is empty.
*   **Seeded Admin Credentials:** email is always `admin@prepplushub.com`. The password comes from the `ADMIN_SEED_PASSWORD` env var if set; otherwise a random 16-character password is generated at boot and printed once to the console (`[PrepplusHub Seed] Generated admin password...`) — check the logs right after first boot if you didn't set one.
*   **Dev OTP Mode:** if no SMTP is configured (`MAIL_HOST`/`MAIL_USERNAME`/`MAIL_PASSWORD`), OTPs are printed to the server console log (`[PrepplusHub OTP] email => code`) and returned in the registration JSON response so registration can still be tested end-to-end. Once SMTP is configured, OTPs are emailed instead and no longer appear in the response.

### 3. Run the React Frontend
Open a new terminal window, navigate to the frontend directory, install dependencies, and spin up the Vite development server:
```powershell
cd marketplace-frontend
npm install
npm run dev
```
*   **Local URL:** `http://localhost:5173`
*   **API Proxying:** All frontend calls to `/api` are automatically proxied to `http://localhost:8080/api` by Vite.

---

## 🛠️ Verification & Build Commands

To ensure full type-safety and bundle efficiency, you can execute production-level compiles:

*   **Compile Backend:**
    ```powershell
    cd backend
    .\mvnw.cmd clean compile
    ```
*   **Build Frontend Bundle:**
    ```powershell
    cd marketplace-frontend
    npm run build
    ```
*   **Lint Frontend Code:**
    ```powershell
    cd marketplace-frontend
    npm run lint
    ```

---

🌿 *PrepplusHub — Experience e-commerce crafted with confidence and design precision.*
