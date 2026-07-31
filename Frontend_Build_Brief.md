# Marketplace Frontend Build Brief
### For: Frontend Team (Nathan, Tolu, Lyon, Vera, Dclip3)
### From: Mtco (Backend Lead / Project Lead)

---

## 0. Read This First

This brief describes the **full vision** for the platform — a richer onboarding flow than what
we originally scoped for Phase 1, plus a full motion/3D design layer. To avoid stalling:

1. **Build the flow and logic first, with plain styling.** Every screen, every transition, every
   piece of state described below — working, but visually basic.
2. **Layer in animation second**, once the flow works end-to-end. Section 6 (Motion & Interaction)
   is written so it can be added on top of finished screens without restructuring them.
3. If the 2-week deadline is tight, cut animation scope before cutting flow scope. A working,
   plain-looking signup flow beats a beautiful one that's half-finished.

---

## 1. Technology Stack

Keep everything already in use, and add these for motion/3D (all npm-installable, all compatible
with the existing Vite + React + Redux Toolkit + Tailwind setup):

| Purpose | Library |
|---|---|
| General UI motion (fades, slides, hover states) | **Framer Motion** (`framer-motion`) |
| Scroll-triggered animations (Apple-style reveals) | **GSAP** + `ScrollTrigger` plugin |
| Smooth/inertia scrolling | **Lenis** (`@studio-freight/lenis`) |
| 3D elements (hero visuals, product showcases) | **React Three Fiber** + `drei` (`@react-three/fiber`, `@react-three/drei`) |

Backend stays Java + Spring Boot + MongoDB, as already planned — none of this changes that.

---

## 2. Design System

**Direction:** Apple-style confidence — large type, generous whitespace, restrained color, motion
that reveals content rather than decorates it.

**Color Palette:**

| Role | Color | Hex |
|---|---|---|
| Primary background (hero/dark sections) | Near-black charcoal | `#0B0B12` |
| Secondary background (content sections) | Off-white | `#F7F7F9` |
| Primary accent (CTAs, highlights) | Electric indigo | `#4361EE` |
| Success / verified states | Emerald | `#2E7D5B` |
| Warning / pending states | Amber | `#E0A030` |
| Error / rejected states | Coral red | `#E5484D` |
| Text on dark | Off-white | `#F4F4F7` |
| Text on light | Near-black | `#151521` |

**Typography:** One confident display font for headlines (e.g. a geometric sans like Inter Tight
or General Sans), body text in Inter. Large headline sizes on the landing page (48–72px desktop),
generous line-height.

**Spacing:** Err on the side of more whitespace than feels necessary — this is what makes a site
feel premium rather than cramped.

---

## 3. Full Page / Screen List (in flow order)

1. **Landing Page** — Apple-style marketing page (see Section 4.1)
2. **Auth Entry** — Sign Up / Log In choice, with smart role pre-selection (Section 4.3)
3. **Registration Form** — collects account + KYC info together
4. **OTP Verification**
5. **Role Confirmation** — "You're registering as a Customer / Vendor" with option to switch
6. **Customer Onboarding Quiz** — multi-step personalization (Section 4.4)
7. **Vendor Eligibility Flow** — identity verification + waiting state (Section 4.5)
8. **Customer Dashboard** — personalized feed ("FYP"), browsing, cart, orders
9. **Vendor Dashboard** — restricted pre-verification view -> full view post-verification
10. **Admin Dashboard** — includes new oversight panels (Section 4.6)
11. **Profile Customization** — shared by all roles, template-based (Section 4.7)
12. **Product Detail Page** — includes product + vendor reviews
13. **Checkout Flow**
14. **Terms & Conditions / Privacy** — shown at signup, must be accepted to proceed

---

## 4. Flow Logic

### 4.1 Landing Page

Apple-style structure, scroll-driven sections:

- **Hero:** Bold headline + subheadline about the marketplace's value. CTA buttons: **"View
  Products"** and **"Get Started"**.
- **Why Shop With Us** — section for prospective customers.
- **Why Sell With Us** — section for prospective vendors.
- **Partner With Us** — section for potential platform partners/investors.
- Each section reveals on scroll (see Section 6).
- **"View Products"** goes straight into product browsing *without* requiring login (matches
  real e-commerce norms — browsing is public, only checkout/selling requires an account).
- **"Get Started"** goes to Auth Entry.

### 4.2 Registration (KYC Collected Upfront)

Single registration form collects account basics **and** KYC fields together (name, email,
password, phone, ID type/number, date of birth, address) — no separate KYC step later. On submit:
CAPTCHA check -> account created (unverified) -> OTP emailed -> OTP verification screen -> account
becomes active.

### 4.3 Role Confirmation (Smart Entry Logic)

**This happens after account verification, not before** — the account exists first, then the
person chooses what to do with it.

- **Default path:** after verifying OTP, user is asked: *"Continue as a Customer or a Vendor?"*
- **Smart pre-selection:** if the user arrived at Auth Entry by clicking through from a **product
  page** (e.g. a shared product link, or clicking "Sign up to buy" on a product), pre-select
  **Customer** on this screen — since intent-to-buy is the likely reason they're here. Still show
  a visible, easy "Actually, I want to sell instead -> Vendor" toggle. Track this via a query
  param or referrer state (e.g. `?intent=customer` set when the link originates from a product
  page), not a hard restriction.
- Role is stored on the User document once confirmed; it can be changed later by request through
  Admin if truly needed, but isn't meant to be casually switched.

### 4.4 Customer Onboarding — Personalization Quiz

After choosing "Customer," a short multi-step quiz personalizes their feed:

- Step 1: Interests / categories (multi-select: Electronics, Fashion, Home, Beauty, etc.)
- Step 2: Budget range preference
- Step 3: Shopping frequency / style (browsing for deals vs. specific needs)
- Result: stored as `personalizationProfile` on the User, used to sort/filter what shows on their
  dashboard feed. Progress bar across steps, skippable with a "Skip for now" option so it never
  blocks someone from reaching the store.

### 4.5 Vendor Onboarding — Eligibility & Verification

After choosing "Vendor":

1. **Eligibility Test** — a short form/questionnaire confirming business legitimacy (business
   name, category, expected product range) plus identity document upload (ID + optional business
   registration doc, uploaded via Cloudinary).
2. On submission: `vendorVerificationStatus` = `pending`. Vendor is shown a **waiting state**
   with a clear message ("Your application is under review, typically within a few hours").
3. **Restricted Vendor Dashboard:** while pending, the vendor *can* log in and see their dashboard
   shell (so the account doesn't feel dead), but actions like adding products or accessing payouts
   are disabled/greyed out with a tooltip explaining why, until `vendorVerificationStatus` =
   `verified`.
4. Admin reviews the submitted eligibility test + documents (see 4.6) and approves/rejects.
5. On approval: vendor is notified, dashboard unlocks fully.

### 4.6 Admin Oversight (New Panels)

- **Vendor Verification Queue:** list of pending vendors with their submitted eligibility test
  answers and documents, Approve/Reject actions, rejection requires a reason (stored and shown to
  the vendor).
- **Customer Verification Queue:** same pattern, for any customer-side KYC review needed.
- **Activity Monitoring:** admin can view a log of user actions (logins, orders placed, products
  listed) for oversight — **but does not get raw access to sensitive personal data beyond what's
  operationally necessary.** Frame this clearly as activity/audit logs, not surveillance of private
  content.
- **Customer Page Customization:** admin can control what content/promotions appear on the
  customer dashboard feed (e.g. featured categories, banners) — this is platform-level curation,
  separate from each individual customer's own `personalizationProfile`.

### 4.7 Profile Customization (All Roles)

- Shared component, but scoped per role: customers customize a lighter profile (avatar, bio,
  theme accent); vendors get a fuller "shop page" customization (banner, shop description, social
  links, theme color) — this already exists in `profileCustomizations` in the schema, just needs
  the UI built out with template presets so it's not a blank slate.

### 4.8 Reviews

- **Product Reviews:** customers review purchased products (already scoped).
- **Vendor Reviews:** customers can also leave a rating/review on the *vendor* as a seller
  (separate from product reviews) — reflects delivery experience, communication, etc. New
  lightweight entity: `VendorReview { vendorId, customerId, rating, comment, orderId, createdAt }`.

### 4.9 Terms & Conditions

- Checkbox required at registration ("I agree to the Terms of Service and Privacy Policy"), link
  opens the actual document. Already partially covered by `kycDetails.agreedToTerms` in the
  schema — just needs the actual T&C content page and enforce the checkbox blocks submission
  if unchecked.

---

## 5. Updated Data Entities

Additions to the schema from the earlier workflow guide:

```
User (additions):
  onboardingStage        // "kyc_pending" | "role_selection" | "personalizing" | "active"
  personalizationProfile { interests[], budgetRange, shoppingStyle }
  vendorEligibility {
    businessName, businessCategory, expectedProductRange,
    documentUrls[], submittedAt, reviewedAt, reviewedBy, rejectionReason
  }
  registrationIntent      // "customer" | "vendor" | null -- set from referrer link, pre-selects role screen

VendorReview:
  id, vendorId, customerId, orderId, rating, comment, createdAt

ActivityLog (admin-facing):
  id, userId, action, metadata, createdAt
```

Everything else (Product, Order, Category, Review, Coupon, Notification, Transaction) stays as
already defined in the earlier workflow guide.

---

## 6. Motion & Interaction Direction (Layer On Top, Once Flow Works)

- **Landing page sections:** fade + slight upward slide as each section scrolls into view
  (GSAP ScrollTrigger). Hero headline can split into words/letters and stagger in on load.
- **Smooth scroll:** Lenis for the landing page specifically — inertia scrolling makes the whole
  page feel more premium immediately.
- **3D touch:** a single tasteful 3D element in the hero (e.g. a slowly rotating abstract shape
  or a stylized product mockup) via React Three Fiber — resist the urge to add 3D everywhere;
  one well-placed element reads as premium, many reads as gimmicky.
- **Micro-interactions:** Framer Motion for button hover/press states, modal open/close
  transitions, cart item add animation (item "flies" toward cart icon), progress bar transitions
  in the onboarding quiz.
- **Dashboard transitions:** subtle fade/slide when switching between dashboard sections, not
  full page reloads.
- **Loading/pending states:** the vendor "waiting for verification" screen is a good place for a
  calm, reassuring animation (e.g. a soft pulsing icon) rather than a static message.

Keep performance in mind: 3D and heavy scroll effects should be present mainly on the Landing
Page; dashboards (used repeatedly, daily) should stay snappy with lighter motion.

---

## 7. What to Start On Right Now

Given the team is currently blocked, here's the immediate unblock, in order:

1. **Vera:** Landing Page structure (Section 4.1) — plain styling first, sections and content only.
2. **Dclip3:** Registration form + OTP screen (Section 4.2) — this is closest to what's already
   built in `AuthModal.tsx`, just needs KYC fields merged into the same form instead of separate.
3. **Nathan + Tolu:** Role Confirmation screen + Customer Onboarding Quiz (Sections 4.3, 4.4).
4. **Lyon:** once free from backend duties — Vendor Eligibility flow + restricted dashboard state
   (Section 4.5), since this has the most new logic (document upload, status-based UI locking).
5. Once all of the above work end-to-end with plain styling, revisit as a team to layer in
   Section 6's motion/3D direction together.

---

*This brief expands the original Phase 1 scope. If the 2-week deadline holds, prioritize Sections
3 and 4 (flow and logic) as must-haves; treat Section 6 (motion/3D) as time-permitting polish.*
