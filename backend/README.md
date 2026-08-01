# Aro Marketplace Backend

Spring Boot API for the Aro multi-vendor marketplace. MongoDB + JWT auth.

## Requirements

- Java 21+
- MongoDB running locally (`mongodb://localhost:27017`)
- Maven (or use `./mvnw`)

## Run

```bash
# From this directory (backend/backend)
./mvnw spring-boot:run
# Windows:
mvnw.cmd spring-boot:run
```

API base: `http://localhost:8080/api`

## Seeded accounts

| Email | Password | Role |
|---|---|---|
| `admin@prepplushub.com` | from `ADMIN_SEED_PASSWORD`, or a random one printed once at first boot | admin |

On first start, 12 demo products are seeded if the products collection is empty.

## Dev OTP

If SMTP isn't configured (`MAIL_HOST`/`MAIL_USERNAME`/`MAIL_PASSWORD`), registration returns `devOtp` in the JSON response and prints it to the server console as `[PrepplusHub OTP] email => code`. Once SMTP is configured, OTPs are emailed instead and no longer appear in the response.

## API map

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/health` | public | Health check |
| POST | `/api/auth/register` | public | Register + send OTP |
| POST | `/api/auth/verify-otp` | public | Verify OTP → JWT |
| POST | `/api/auth/login` | public | Login → JWT |
| POST | `/api/auth/resend-otp` | public | Resend OTP |
| GET | `/api/auth/me` | JWT | Current user |
| POST | `/api/users/role` | JWT | Confirm customer/vendor |
| POST | `/api/users/personalization` | JWT | Customer quiz |
| POST | `/api/users/vendor-eligibility` | JWT | Vendor application |
| PUT | `/api/users/profile` | JWT | Profile customization |
| GET | `/api/products` | public | List products |
| GET | `/api/products/{id}` | public | Product detail |
| POST | `/api/products` | vendor verified | Create listing |
| GET/POST/DELETE | `/api/cart/**` | JWT | Cart |
| GET/POST | `/api/orders/**` | JWT | Orders + checkout |
| GET/POST | `/api/reviews/**` | public GET / JWT POST | Reviews |
| GET | `/api/admin/dashboard` | admin | Admin panels |
| POST | `/api/admin/vendors/{id}/approve` | admin | Approve vendor |
| POST | `/api/admin/vendors/{id}/reject` | admin | Reject vendor |

## Config

See `src/main/resources/application.properties`:

- `spring.data.mongodb.uri`
- `app.jwt.secret`
- `app.cors.allowed-origins`
