# FCS Registration System - Implementation Plan

## 1. Backend Schema & Database Updates
**Goal:** Support new fields for Staff, detailed Intent, and updated Group types.

- **File:** `prisma/schema.prisma`
  - **Model `Member`:**
    - Add `department String?` (Explicit field for Staff department/unit).
    - *Note:* `membershipCategory` is a String, so "STAFF" requires no schema change, just application-level validation.
  - **Model `Registration`:**
    - Add `attendanceIntent String?` (Values: "CONFIRMED", "TENTATIVE").
  - **Model `EventGroup`:**
    - Update documentation/comments for `type`: Replace `BREAKOUT` with `SEMINAR`.
    - *Action:* We will treat the string "SEMINAR" as the valid value going forward.

- **Migration:**
  - Create and run migration to add columns.
  - Update any existing `BREAKOUT` groups to `SEMINAR` in the database (if applicable).

## 2. Backend Logic & API Updates
**Goal:** Enforce new business rules and auto-assignment.

- **Refactor Enums (Application Level):**
  - Update `MembershipCategory` enum to include `STAFF`.
  - Update `EventGroupType` enum to replace `BREAKOUT` with `SEMINAR`.
- **Bible Study Auto-Assignment:**
  - Create a utility/service method `assignToBibleStudy(eventId, registrationId)` that:
    - Finds all groups of type `BIBLE_STUDY` for the event.
    - Assigns the user using a load-balancing strategy (e.g., Round Robin or filling up to capacity).
- **Registration Service:**
  - Update `createRegistration` to accept `attendanceIntent`.
  - Update `createRegistration` to trigger auto-assignment if `BIBLE_STUDY` groups exist and are mandatory.

## 3. Frontend Type Definitions (`frontend/src/types/api.ts`)
**Goal:** Sync frontend types with backend changes.

- **Update `Member` Interface:**
  - Add `department?: string`.
  - Update `MembershipCategory` type to include `'STAFF'`.
- **Update `Registration` Interface:**
  - Add `attendanceIntent?: 'CONFIRMED' | 'TENTATIVE'`.
- **Update `EventGroup` Interface:**
  - Change `type` union: `'BIBLE_STUDY' | 'WORKSHOP' | 'SEMINAR'` (Remove `BREAKOUT`).

## 4. Frontend UI/UX Enhancements

### A. Profile & Personal Details
- **Staff Specifics:**
  - When Category is `STAFF`, show an explicit "Department / Unit" input field.
- **Tertiary Students:**
  - Ensure `Institution Type` dropdown includes: University, Polytechnic, College of Education, Other.
  - Ensure `Level / Year` dropdown includes: 100/Year 1, 200/Year 2, etc.
- **Age & Guardian Logic:**
  - **Auto-Calculation:** User selects DOB -> System calculates Age.
  - **Guardian Trigger:** If Age < 18, `Guardian Information` section becomes visible and required.
  - **Fields:** Guardian Name, Phone, Email, Relationship.

### B. Registration Wizard Updates
- **Step: Participation Details**
  - Add **"Attendance Intent"** selection radio group:
    - 🟢 **Confirmed** (I will definitely attend)
    - 🟡 **Tentative** (I am hoping to attend)
- **Step: Location Selector**
  - **Condition:** Only render this step/section if `Participation Mode` is **ONSITE** or **HYBRID**.
  - Hide completely for **ONLINE**.
- **Step: Group Selection (Dynamic Rendering)**
  - **Bible Study:**
    - Display as **"Bible Study Group"**.
    - **UI:** Read-only field or Badge saying "⚠️ Auto-assigned by System". User cannot select manually.
  - **Workshops:**
    - Display as **"Workshop Selection"**.
    - **UI:** Dropdown of available Workshop groups.
  - **Seminars (formerly Breakout):**
    - Display as **"Seminar Selection"**.
    - **UI:** Dropdown of available Seminar groups.

## 5. Execution Order
1.  **Backend:** Apply Prisma schema changes (Migration).
2.  **Backend:** Update API types and validation logic.
3.  **Frontend:** Update Type Definitions.
4.  **Frontend:** Implement Profile form updates (Staff/Tertiary fields).
5.  **Frontend:** Implement Registration Wizard logic (Age trigger, Intent, Location visibility, Group logic).
6.  **Verify:** Test full flow for Primary (Guardian trigger), Staff (Department), and Student (Tertiary details).
