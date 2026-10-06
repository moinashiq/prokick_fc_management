# On-Demand Excel Database & Bi-Directional Roster Storage

Convert the Excel management system into a persistent in-app temporary database: eliminate auto-downloads on new player registrations, enable on-demand Microsoft Excel (`.xlsx`) exports, and introduce Excel spreadsheet import to load and restore player rosters directly into the touchline Attendance screen.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> **No Automatic File Downloads**: Registering a player will no longer trigger a browser file download prompt. Instead, new registrations will immediately commit to the application's local persistent database (`localStorage`) and instantly show up on the Attendance roll-call screen.
> **On-Demand Excel Data Management**: Users can export the complete up-to-date `.xlsx` workbook at any time via a dedicated "Export Excel Database" button, or import an existing Excel spreadsheet (`.xlsx`) to instantly restore or populate players into the roster.

- **Confirmed Decision 1**: Stop auto-downloading `.xlsx` files upon clicking "Issue Digital Pass & Enroll". Downloads will occur strictly on user demand via explicit buttons.
- **Confirmed Decision 2**: Support both **Export (.xlsx)** and **Import (.xlsx)** so coaches can back up squad databases to their device and re-import rosters anytime.
- **Confirmed Decision 3**: Synchronize all new player registrations (Name, Primary Position, Age Category, Kit Number, Emergency Contact) directly into the active squad database and display them immediately in the Attendance screen.

---

## 1. Overview & Core Concept

- **What It Does**:
  1. **Silent Local Registration Storage**: Submitting a player profile saves the record directly into the client database (`localStorage`) without interrupting the coach with unexpected file downloads.
  2. **Instant Attendance Roster Propagation**: The newly registered recruit immediately appears in their corresponding age bracket tab (`U-10 kids`, `U-15 Boys`, `U-17 Academy`, `Girls Elite`, `U-19 Reserves`) with one-tap attendance marking buttons (`Present`, `Absent`, `Late`).
  3. **On-Demand Excel Export**: A dedicated "Export Excel (.xlsx)" action allows coaches to download the full, multi-sheet workbook (Registrations + Attendance Roll Call) whenever they wish.
  4. **Excel Spreadsheet Import**: Allows uploading an `.xlsx` file to parse and merge player records into the active touchline roster with immediate validation and count feedback.
- **Target Audience / Persona**: Coach Rajnish Shankar and academy staff running touchline operations on field tablets or laptops.
- **Key Value**: Clean, distraction-free registration flow with robust data persistence, zero unwanted download popups, and flexible Excel backup and restore capabilities.

---

## 2. User Experience & Visual Design

### Key User Flows

1. **Player Registration Flow**:
   - The user fills out player details (Name, Nickname, DOB, Division, Position, Kit No, Guardian details).
   - The user taps **"ISSUE DIGITAL PASS & ENROLL"**.
   - The pass is generated, the record is committed to the local database, and a sleek confirmation card appears: `"Player Enrolled & Active in Squad"`.
   - **No file download prompt appears**.
   - An optional **"Download Current Excel (.xlsx)"** button remains accessible on the card if the coach desires a physical copy.
   - A **"Go to Roll Call"** button lets the coach instantly jump to the Attendance screen to see the player listed.

2. **Attendance Roll-Call Flow**:
   - The Attendance screen immediately displays the new player under their squad category tab.
   - The card shows their **Full Legal Name**, **Primary Position** (e.g., `MID • Central Playmaker`), **Age Category** (e.g., `U-10 kids • 10 yrs`), and kit number badge.
   - The coach can tap `Present`, `Absent`, or `Late`, updating live metric counters in real time.
   - Status updates are preserved in the persistent database.

3. **Excel Import & Export Flow**:
   - On the Attendance screen and Registration header, a compact **Data Hub** section provides:
     - **Export Excel (.xlsx)**: Generates and downloads the current squad workbook with all player records and attendance states.
     - **Import Excel (.xlsx)**: Opens a file picker allowing coaches to upload an existing `.xlsx` file.
   - When a file is imported, SheetJS parses the rows, validates required fields, adds or updates the players in the squad database, and shows a toast: `"Successfully imported X players into the squad roster!"`

### Visual Identity & Theme
- Dark stadium dusk canvas (`#0b1326`), elevated slate tiles (`#171f33`, `#222a3d`), kinetic electric volt accents (`#c3f400`).
- Excel badge accent: High-contrast emerald green (`#107C41`) for Excel actions.
- Clean file input target with drag-and-drop or tap-to-upload affordance.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Elimination of Automatic Downloads**:
  - *Chosen Approach*: Remove the auto-download call from `handleEnrollSubmit` in `RegistrationScreen.tsx`. Keep manual export buttons.
  - *Why*: Browsers frequently block repeated automatic file downloads or clutter the user's Downloads folder with multiple files when enrolling multiple players in a row.
- **Decision 2: Local Storage as the Primary Data Store with Excel as Import/Export Layer**:
  - *Chosen Approach*: Treat browser persistent storage as the authoritative local database during the session, and use `.xlsx` as the external backup/restore medium.
  - *Why*: Fast, zero latency pitchside performance that works completely offline on touchline tablets.
- **Decision 3: Smart Excel Parser for Imports**:
  - *Chosen Approach*: Support both the official PROKICK FC exported format and common general spreadsheet columns (Name, Position, Squad Category / Age, Kit Number).
  - *Why*: Accommodates both restoring previous exports and importing rosters prepared in standard school/club spreadsheets.

---

## 4. Technical Architecture & Data Strategy

### System Architecture Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                        PROKICK FC ACADEMY APP                          │
└────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                       In-App Squad Storage                             │
│                  (localStorage: prokick_fc_squad_v2)                   │
└───────┬───────────────────────────┬────────────────────────────┬───────┘
        │                           │                            │
        ▼                           ▼                            ▼
┌──────────────┐            ┌──────────────┐             ┌───────────────┐
│ Registration │            │  Attendance  │             │   Excel Hub   │
│ Screen       │            │  Screen      │             │  (.xlsx)      │
├──────────────┤            ├──────────────┤             ├───────────────┤
│ Enrolls new  │            │ Displays     │             │ - Export on   │
│ player to    │            │ player tile, │             │   demand      │
│ database     │            │ marks roll   │             │ - Import file │
│ (No auto-dl) │            │ call status  │             │   to restore  │
└──────────────┘            └──────────────┘             └───────────────┘
```

### Component & State Mapping

1. **`src/services/excelExport.ts`**:
   - Maintain `exportRegistrationsToExcel(players, filename)` for on-demand downloads.
   - Add `importPlayersFromExcel(file: File): Promise<Player[]>`:
     - Uses `XLSX.read` on file array buffer.
     - Maps sheet rows to `Player` interface with sensible fallbacks (kitNumber, position, squadCategory, division).
     - Returns parsed array of `Player` objects.

2. **`src/components/RegistrationScreen.tsx`**:
   - In `handleEnrollSubmit`:
     - Keep `onRegisterPlayer(newPlayer)`.
     - Remove `exportRegistrationsToExcel(...)` from automatic submission.
     - Keep the manual `"Download Excel (.xlsx)"` button on the confirmation card and in the top management bar.

3. **`src/components/AttendanceScreen.tsx`**:
   - Maintain instant rendering of newly registered players (Name, Primary Position, Age Category).
   - In the top action bar:
     - Keep `"Export Excel (.xlsx)"`.
     - Add `"Import Excel (.xlsx)"` with hidden `<input type="file" accept=".xlsx, .xls">`.
   - When an Excel file is imported, call `onImportPlayers(newPlayers)` which merges records and updates the roster.

4. **`src/App.tsx`**:
   - Implement `handleImportPlayers(importedPlayers: Player[])`:
     - Merges imported players into `players` state (avoiding duplicates by name/id).
     - Persists to `localStorage`.
     - Displays toast: `"X players imported from Excel into Attendance roster!"`
