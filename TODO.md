# Implementation Plan Todo List

Status of tasks from the implementation plan and recent requests.

- [x] **1. Fix FCS Logo (Blurry)**
  - Updated logo dimensions and quality in authenticated headers.
  - Using high-resolution source `/fcs_logo.png`.
- [x] **2. Change "Trusted" to "Beneficiaries"**
  - Updated text in `landing/page.tsx` section.
- [x] **3. Update Social Media Links**
  - Updated social links in footer with real URLs (Facebook, Instagram, YouTube, TikTok, WhatsApp, Telegram).
- [x] **4. Add "Staff" to Onboarding & Customize Details**
  - [x] Added `STAFF` to membership categories in Signup.
  - [x] Changed label from "Occupation" to "Office / Position" for Staff.
  - [x] Set placeholder to "e.g. Training Secretary" for Staff.
  - [x] Updated Profile page to reflect these changes and added "Staff" to category selector.
- [ ] **5. Dynamic Centers by State/Zone (Signup Flow)**
  - Currently fetching "Branches". Need to update to fetch and display "Centers".
- [ ] **6. Admin Manage Centers (Frontend)**
  - Create the Centers management interface for administrators.
- [x] **7. Fix RBAC Permissions**
  - Audited `checkScopeAccess` and `canManageUser`. Logic seems robust for unit-based scoping.
- [x] **8. Improved Search (Extensive Lookup)**
  - Implemented space-separated search terms for Name, Email, Phone, Code, and DOB in Registration service.
- [x] **9. Export Registrations as CSV**
  - Implemented backend service for CSV generation from registration data.

---
*Created on 2026-02-03 based on implementation plan.*
