# Authorization Audit and Safe Implementation Plan

## Objective

Document the current controller authorization state, identify areas where role-based access should be tightened, and propose safe changes that preserve the existing Clean Architecture.

This file is a detailed plan for what will be done next without breaking the current architecture.

---

## Current Middleware and Auth Contract

### Custom middleware behavior
- The middleware is active in `EventManagementApi/Program.cs`.
- It bypasses `/api/auth` routes.
- For other `/api` routes, if the request is authenticated, it requires:
  - `X-Session-Id` header
  - an active Redis session stored at `session:{sessionId}`
- If the header is missing or session is inactive, the request returns `401 Unauthorized`.

### Recommendation
- Preserve the middleware as-is for production.
- Add a configuration switch so development can bypass session validation without deleting or disabling the middleware permanently.
- This keeps the architecture intact while allowing local testing.

Example config:
- `Security:ValidateSession = true` in production
- `Security:ValidateSession = false` in development

Then in `Program.cs`, conditionally execute the middleware only when enabled.

---

## Controller Audit Summary

### Controllers with role-based authorization already applied
- `EventManagementApi/API/Controllers/AdminController.cs`
  - `[Authorize(Roles = "Admin")]`
- `EventManagementApi/API/Controllers/PlannerController.cs`
  - `[Authorize(Roles = "Planner")]`
- `EventManagementApi/API/Controllers/RoleController.cs`
  - `[Authorize(Roles = "Admin")]`
- `EventManagementApi/API/Controllers/UserController.cs`
  - `[Authorize(Roles = "Admin")]`

### Controllers requiring authentication only
- `EventManagementApi/API/Controllers/VendorController.cs`
- `EventManagementApi/API/Controllers/ServiceProviderController.cs`
- `EventManagementApi/API/Controllers/EventServiceController.cs`
- `EventManagementApi/API/Controllers/EventVendorController.cs`
- `EventManagementApi/API/Controllers/InvitationController.cs`
- `EventManagementApi/API/Controllers/EventRegistrationController.cs`
- `EventManagementApi/API/Controllers/EventController.cs`
- `EventManagementApi/API/Controllers/PaymentController.cs`

### Anonymous endpoints
- `EventManagementApi/API/Controllers/AuthController.cs`
  - `POST /api/auth/register`
  - `POST /api/auth/login`

---

## Role-Based Access Recommendations by Controller

### `EventController`
- Keep `GET /api/events` and `GET /api/events/{id}` available to all authenticated users.
- Restrict `POST`, `PUT`, and `DELETE` to `Planner` and possibly `Admin` only.
- This prevents attendees and vendors from creating or modifying events while allowing browsing.

### `EventRegistrationController`
- `POST /api/event-registrations`: should be allowed for authenticated users, especially `Attendee`.
- `GET /api/event-registrations`: currently returns all registrations to any authenticated user.
  - Recommend restricting this to `Admin` and `Planner` only.
- `GET /api/event-registrations/mine`: keep available to any authenticated user, returning only their own registrations.
- `GET /api/event-registrations/{id}` and `DELETE /api/event-registrations/{id}` should probably be restricted to owners or admin/Planner.

### `PaymentController`
- `POST /api/payments`: keep authenticated only.
- `GET /api/payments`: currently returns all payments to any authenticated user.
  - Recommend restricting to `Admin` and maybe `Planner`.
- `GET /api/payments/mine`: keep available for authenticated users to view their own payments.
- `GET /api/payments/{id}`: restrict to the payment owner and/or admin.
- `POST /api/payments/redeem`: keep available to authenticated users only.

### `VendorController` and `ServiceProviderController`
- `GET` operations may remain authenticated only to allow browsing.
- `POST`, `PUT`, and `DELETE` operations should likely be restricted to:
  - `Admin` for management
  - or the user associated with the vendor/service provider record
- This avoids unauthorized profile creation or modification.

### `EventVendorController` and `EventServiceController`
- These endpoints pair vendors/service providers with events.
- Strong recommendation:
  - restrict `POST` and `DELETE` to `Planner` and/or `Admin`
  - keep `GET` available to authenticated users for browsing associations

### `InvitationController`
- Likely should be restricted to authorized event organizers or admin.
- At minimum, `POST` and `GET` should not be publicly available to all authenticated roles.

---

## Safe Implementation Plan

### Phase A: Preserve current architecture
- Do not remove or bypass the custom middleware permanently.
- Add a configuration flag for `Security:ValidateSession` so the middleware stays in the pipeline but can be disabled in local testing.
- Keep the global authorization fallback policy in place.

### Phase B: Harden controller access gradually
- Apply role filters only where required:
  - `EventController` for modifications
  - `EventRegistrationController` for admin-level listing
  - `PaymentController` for admin-level listing
  - `EventVendorController` and `EventServiceController` creation/deletion
  - `VendorController` and `ServiceProviderController` write operations
- Do not change the DTO layer, AutoMapper mappings, or repository interfaces.
- Keep existing service and controller contracts intact.

### Phase C: Verify session flow
- Confirm `www/js/api.js` already sends `X-Session-Id` on every request.
- Ensure login response stores `sessionId` and session is valid in Redis.
- If any frontend path misses the header, fix only the fetch wrapper in `api.js`.

### Phase D: Testing and documentation
- Test login and JWT flow manually for each seeded role:
  - Admin, Planner, Vendor, ServiceProvider, Attendee
- Test forbidden actions for unauthorized roles.
- Keep behavior consistent with current frontend routes.
- Document completed changes in `FIXES_APPLIED.md` and `TEST_REPORT.md` once work is done.

---

## Proposed Files / Changes

The plan includes the following safe changes:

1. `EventManagementApi/Program.cs`
   - Add `Security:ValidateSession` support
   - Condition the session middleware on that flag

2. `EventManagementApi/appsettings.Development.json`
   - set `Security:ValidateSession = false`

3. `EventManagementApi/appsettings.json`
   - set `Security:ValidateSession = true`

4. `EventManagementApi/API/Controllers/EventController.cs`
   - add `[Authorize(Roles = "Planner,Admin")]` to `POST`, `PUT`, `DELETE`

5. `EventManagementApi/API/Controllers/EventRegistrationController.cs`
   - restrict `GET /api/event-registrations`
   - possibly restrict `GET /api/event-registrations/{id}` and `DELETE /api/event-registrations/{id}`

6. `EventManagementApi/API/Controllers/PaymentController.cs`
   - restrict `GET /api/payments` and `GetPaymentById`

7. `EventManagementApi/API/Controllers/EventVendorController.cs`
   - restrict write operations to `Planner`/`Admin`

8. `EventManagementApi/API/Controllers/EventServiceController.cs`
   - restrict write operations to `Planner`/`Admin`

9. `EventManagementApi/API/Controllers/VendorController.cs`
   - restrict write operations to authorized user roles or Admin

10. `EventManagementApi/API/Controllers/ServiceProviderController.cs`
    - restrict write operations to authorized user roles or Admin

11. `EventManagementApi/API/Controllers/InvitationController.cs`
    - restrict invitation creation/retrieval to appropriate roles

12. `www/js/api.js`
    - verify `X-Session-Id` header is always sent (already present)

---

## Next Update Schedule

I will keep you updated in the following steps:

1. Confirm the middleware configuration flag is added safely.
2. Apply role-based restriction changes in a minimal way.
3. Run auth and controller access tests.
4. Report any fixes required before final verification.

---

## Notes

- No architecture-breaking refactor is planned.
- No entity relationship or AutoMapper mapping will be changed in this audit.
- The focus is on authorization boundaries and preserving the existing API contract.
