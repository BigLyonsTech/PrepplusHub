# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

PrepplusHub (built by Prepplus Global Limited) is a full-stack multi-vendor e-commerce marketplace: a React (Vite) frontend in `marketplace-frontend/` and a Spring Boot + MongoDB backend in `backend/`. See `README.md` for the design philosophy and the full 14-screen user-flow map (landing → auth → KYC registration → OTP → role confirmation → customer/vendor onboarding → dashboards → checkout → admin). `Frontend_Build_Brief.md` has the original product/wireframe spec.

## Commands

### Backend (`backend/`)
```powershell
cd backend
.\mvnw.cmd compile          # compile only — prefer this over `clean compile`
.\mvnw.cmd spring-boot:run   # run the API on :8080 (requires MongoDB, see Known Issues)
.\mvnw.cmd test              # run tests (requires MongoDB, see Known Issues)
```
Run a single test class: `.\mvnw.cmd test -Dtest=BackendApplicationTests`

### Frontend (`marketplace-frontend/`)
```powershell
cd marketplace-frontend
npm install
npm run dev      # Vite dev server on :5173, proxies /api -> localhost:8080
npm run build    # production bundle to dist/
npm run lint     # currently broken, see Known Issues
```

## Architecture

**Auth & request flow.** The frontend never talks to Mongo directly — everything goes through `src/lib/api.js`, a single fetch wrapper that reads `VITE_API_URL` (default `/api`), attaches `Authorization: Bearer <token>` from `localStorage` (`prepplushub_token`), and centralizes JSON parsing/error handling. All backend routes are namespaced under `/api` and Vite's dev proxy (`vite.config.js`) forwards them to `localhost:8080`. On the backend, `JwtAuthFilter` runs once per request, resolves the user from the JWT, and populates `SecurityContextHolder` with a `UserPrincipal` — no sessions are used (`SessionCreationPolicy.STATELESS`). `SecurityConfig` is the single source of truth for which routes are public (`/api/auth/**`, `/api/health`, GET on `/api/products/**` and `/api/reviews/**`) vs. authenticated vs. `ROLE_ADMIN`-only (`/api/admin/**`).

**Mongo database selection is pinned explicitly, not left to Boot.** `config/MongoConfig.java` defines the `MongoDatabaseFactory` bean by hand (`SimpleMongoClientDatabaseFactory(client, database)`) instead of relying on Spring Boot's autoconfiguration. This project is pinned to Spring Boot 4.1.0 / spring-data-mongodb 5.1.0, and in that combo `MongoAutoConfiguration` does not reliably pick up the database name from either `spring.data.mongodb.uri`'s path segment or an explicit `spring.data.mongodb.database` property — both resolve correctly at the `Environment` level (confirmed with a temporary `@Value`-injecting diagnostic bean) but the autoconfigured factory still silently connects to Mongo's default `test` database instead. If Mongo writes ever seem to vanish or turn up empty again, check `test` in `mongosh` before assuming data loss — and don't remove `MongoConfig.java` without re-verifying the underlying Boot/Spring Data versions have actually fixed this.

**Onboarding state machine.** The core domain concept is a multi-stage onboarding flow tracked server-side on the `User` model (see `onboardingStage`) and driven by role (`customer` / `vendor` / `admin`). The frontend's route structure in `App.jsx` mirrors this stage machine 1:1 (register → verify-otp → role-confirmation → onboarding/quiz | onboarding/vendor → dashboards). When adding a step to the flow, both the backend stage transitions (`AuthService`/`UserService`) and the corresponding route/page in `App.jsx` need updating together.

**Vendor approval gating.** Vendors are not immediately active — `VendorEligibilityFlow` submits to `/users/vendor-eligibility`, which sets the account to a `pending` state. `AdminService`/`AdminController` expose the approve/reject queue; only after admin approval does the vendor dashboard unlock product creation. Rejections require a reason (`RejectRequest`).

**Data seeding is not optional.** `DataSeeder` (`CommandLineRunner`) runs on every backend boot when `app.seed.enabled=true` (default) and seeds the admin account (`admin@prepplushub.com` / `admin12345`), demo products, and `PlatformSettings` — but only if they don't already exist. Because it runs inside `SpringApplication.run`, a Mongo connection failure at boot fails the *entire* application context (this also means `BackendApplicationTests.contextLoads` requires a live MongoDB — see Known Issues).

**OTP is dev-mode by default.** `app.otp.expose-in-response=true` returns the OTP code directly in the registration API response (also printed to the console as `[PrepplusHub OTP] email => code`) instead of emailing it, so registration can be tested end-to-end without SMTP configured.

**Redux is intentionally thin.** `src/store/index.js` only wires three slices — `auth`, `admin`, `catalog` (`src/store/slices/`). Page-local state (forms, wizards) stays in component state; Redux is reserved for cross-page session/catalog/admin data.

**Frontend routing/perf.** Every route in `App.jsx` is `lazy()`-loaded and wrapped in a shared `Suspense`/`AnimatePresence` for page transitions — GSAP is scoped to the landing page only so dashboards/forms stay light (see the comment at the top of `App.jsx`).

## Known Issues / Environment Notes

- **MongoDB is installed locally** as a Windows service (`MongoDB`, MongoDB Server 8.3.4, StartType Automatic) and normally already running on `mongodb://localhost:27017` — check `Get-Service MongoDB` before assuming it's down. `mongosh` (2.9.2) is also on PATH for inspecting data directly. Docker Desktop is installed too but its service is stopped by default; MongoDB doesn't need it. See the `MongoConfig.java` note above — always double-check `mongosh`'s `test` database when Mongo data looks wrong, since the autoconfigured database-selection bug means old data can be sitting there instead of in `prepplushub_marketplace`.
- **`npm run lint` is currently broken**: `eslint` is referenced in the `lint` script but is not listed in `devDependencies` and no eslint config file exists in `marketplace-frontend/`. Either add `eslint` (+ config) as a dev dependency or treat lint as not-yet-wired-up.
- **Do not run `npm install` on top of a stale `node_modules`** in `marketplace-frontend/` without checking first — this repo has both `pnpm-lock.yaml` and `package-lock.json`, and `node_modules` can end up in pnpm's `.pnpm` virtual-store layout while `npm` tries to manage it, producing a broken hybrid install (symptom: Vite build fails with `ERR_MODULE_NOT_FOUND` for `rollup/dist/es/parseAst.js`). If frontend commands fail with module-not-found errors, `rm -r node_modules` and reinstall with `npm install` (npm is what README/CI expect) rather than debugging the partial install in place.
- Repo lives under a OneDrive-synced path (`OneDrive\Desktop\frnt-end`) — `mvnw.cmd clean` can intermittently fail to delete `target/classes/...` if OneDrive has a file locked mid-sync. Retrying, or using `mvnw.cmd compile` without `clean`, works around it.
- Java 21 is the declared target (`pom.xml` `java.version`); the environment's installed JDK is newer (26) and compiles fine against it.
