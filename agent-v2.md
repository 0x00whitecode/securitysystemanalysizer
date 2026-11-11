# AGENT.MD (v2): Bolt.new Master System Specification & Build Instructions
## Automated Visitor Record Management System with Real-Time Alerts and Video Capturing

> **SYSTEM INSTRUCTION FOR BOLT.NEW AI AGENT**: You are an expert full-stack web architect and software engineer executing a project build on **bolt.new**. Your task is to construct the complete, fully functional **Automated Visitor Record Management System** grounded in the research requirements of Chapters 1 and 3. Follow the software architecture, database schemas, component trees, and feature workflows defined in this document.

---

## 1. System Mission & Operational Context

### 1.1 Project Overview
The **Automated Visitor Record Management System (VMS)** modernizes institutional security and guest management by replacing slow, vulnerable, and illegible paper logbooks with a web-based, role-driven platform. The application provides digital visitor enrolment, identity verification using national credentials (such as the Nigerian National Identification Number / NIN), real-time host arrival alerts, live webcam photo snapshot and video recording, gate approval workflows, and printable visitor badges.

### 1.2 Core Research Objectives & Scope
- **Problem Statement**: Traditional paper logbooks suffer from queue congestion, illegible entries, unverified guest identities, vulnerability to physical damage or theft, inability to rapidly search historical logs, and a complete lack of automated notifications to host staff.
- **Key Objectives**:
  1. Implement automated visitor enrolment and staff availability check.
  2. Integrate video capturing technology (webcam photo snapshot and video recording) for identity verification and audit trails.
  3. Deploy a real-time alert engine notifying host employees via app notifications, SMS, or email upon guest arrival or booking.
  4. Enable security gatekeepers to verify identity credentials (NIN), approve or reject entry, and issue custom visitor passes.
  5. Provide administrators with access control management, user blocking/unblocking, and comprehensive security reporting.
- **Development Methodology**: **Iterative Waterfall Model**, progressing through requirements analysis, system design, iterative component build, testing, and usability evaluation.

---

## 2. Technology Stack Selection for Bolt.new

To ensure seamless execution within Bolt.new's browser-based WebContainer environment while maintaining full fidelity to the underlying research design, the system utilizes a modern full-stack web architecture:

### 2.1  Native Stack (Primary Deployment)
- **Frontend Framework**: React 18 with TypeScript & Vite
- **Styling**: Tailwind CSS with custom print media styles (`@media print`)
- **Icons & UI Components**: Lucide React (`lucide-react`)
- **State & Local Storage Layer**: React Context API + Persistent IndexedDB / LocalStorage database engine (simulating MySQL tables)
- **Media Hardware Integration**: HTML5 WebRTC (`navigator.mediaDevices.getUserMedia`) for webcam preview, photo snapshot canvas rendering, and `MediaRecorder` API for video clip recording
- **Notification Engine**: Browser Notifications API + Event-driven Toast Notification System (simulating SMS/Email alerts)

### 2.2 Source Legacy Stack Reference (Chapter 3 Architecture)
- **Backend**: PHP (PHP 4.2.1+ / PHP 8.x)
- **Database Engine**: MySQL 5+ / MariaDB (managed via phpMyAdmin)
- **Web Server**: Apache Web Server (WAMP / XAMPP stack)
- **Frontend**: HTML5, CSS3, JavaScript (ES6+ AJAX polling)

---

## 3. Database Architecture & Relational Schema

The database architecture consists of six interconnected relational tables as defined in Chapter 3 research specifications.

### 3.1 Relational Schema Definitions (MySQL DDL)

```sql
-- Database Name: vms_db
CREATE DATABASE IF NOT EXISTS `vms_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `vms_db`;

-- 1. User Table (Authentication & System Access Modes)
CREATE TABLE IF NOT EXISTS `user` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `Name` VARCHAR(50) NOT NULL COMMENT 'Full name of the user',
  `Username` VARCHAR(50) NOT NULL UNIQUE COMMENT 'Username ID',
  `Password` VARCHAR(50) NOT NULL COMMENT 'Password (stored as MD5 or bcrypt hash)',
  `Access` VARCHAR(50) NOT NULL COMMENT 'Access privilege mode: Admin, Security, Staff, Visitor',
  `Staff_No` VARCHAR(50) NOT NULL COMMENT 'Associated Staff ID number'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Staff Table (Organizational Hierarchy & Employee Details)
CREATE TABLE IF NOT EXISTS `staff` (
  `Staff_No` VARCHAR(50) NOT NULL PRIMARY KEY COMMENT 'Staff identity number',
  `Name` VARCHAR(50) NOT NULL COMMENT 'Staff full name',
  `Email` VARCHAR(50) NOT NULL COMMENT 'Email address',
  `Dob` VARCHAR(50) NOT NULL COMMENT 'Date of birth',
  `Address` VARCHAR(50) NOT NULL COMMENT 'Physical address',
  `Degree` VARCHAR(50) NOT NULL COMMENT 'Highest qualification / degree',
  `POS` VARCHAR(50) NOT NULL COMMENT 'Position in organization structure',
  `Phone_No` VARCHAR(50) NOT NULL COMMENT 'Mobile phone number',
  `Sex` VARCHAR(50) NOT NULL COMMENT 'Gender'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Registration Table (Visitor Information & Visit Reasons)
CREATE TABLE IF NOT EXISTS `registration` (
  `R_id` INT AUTO_INCREMENT PRIMARY KEY COMMENT 'Primary key registration ID',
  `Name` VARCHAR(50) NOT NULL COMMENT 'Visitor full name',
  `Dated` VARCHAR(50) NOT NULL COMMENT 'Date of visit (YYYY-MM-DD)',
  `Vtime` TIME NOT NULL COMMENT 'Time of visit',
  `Purpose` VARCHAR(100) NOT NULL COMMENT 'Reason for visit (Personal or Official)',
  `Staff_No` VARCHAR(50) NOT NULL COMMENT 'Staff number of target host',
  `Phone` VARCHAR(50) NOT NULL COMMENT 'Visitor phone number',
  `Email` VARCHAR(50) NOT NULL COMMENT 'Visitor email address',
  `Sex` VARCHAR(50) NOT NULL COMMENT 'Visitor gender',
  FOREIGN KEY (`Staff_No`) REFERENCES `staff`(`Staff_No`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Security Table (Screening, NIN Verification & Decision Logs)
CREATE TABLE IF NOT EXISTS `security` (
  `Security_ID` INT AUTO_INCREMENT PRIMARY KEY COMMENT 'Unique security check ID',
  `R_id` INT NOT NULL COMMENT 'Registration ID being verified',
  `Staff_No` VARCHAR(50) NOT NULL COMMENT 'Staff No of screening security officer',
  `Visitor_Status` VARCHAR(30) NOT NULL DEFAULT 'Pending' COMMENT 'Status: Pending, Approved, Rejected',
  `ID_Type` VARCHAR(50) NOT NULL COMMENT 'Type of ID: NIN, Drivers License, Voters Card, Passport',
  `ID_Number` VARCHAR(100) NOT NULL COMMENT 'Identification credential number',
  `Check_Date` DATE NOT NULL COMMENT 'Date screening took place',
  `Check_Time` TIME NOT NULL COMMENT 'Time screening took place',
  `Security_Action` VARCHAR(100) NOT NULL COMMENT 'Action recorded by officer',
  `Remarks` TEXT DEFAULT NULL COMMENT 'Additional security notes',
  `Alert_Status` VARCHAR(30) NOT NULL DEFAULT 'Pending' COMMENT 'Alert state: Pending, Sent, Resolved',
  FOREIGN KEY (`R_id`) REFERENCES `registration`(`R_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Alert Table (Real-Time Arrival & Booking Notifications)
CREATE TABLE IF NOT EXISTS `alert` (
  `Alert_ID` INT AUTO_INCREMENT PRIMARY KEY COMMENT 'Unique alert ID',
  `R_id` INT NOT NULL COMMENT 'Associated visitor registration ID',
  `Staff_No` VARCHAR(50) NOT NULL COMMENT 'Host staff identity number to notify',
  `Alert_Type` VARCHAR(50) NOT NULL COMMENT 'Type: Arrival, Booking, Security',
  `Alert_Message` VARCHAR(255) NOT NULL COMMENT 'Notification message text',
  `Alert_Date` DATE NOT NULL COMMENT 'Alert generation date',
  `Alert_Time` TIME NOT NULL COMMENT 'Alert generation time',
  `Delivery_Status` VARCHAR(30) NOT NULL DEFAULT 'Pending' COMMENT 'Status: Pending, Sent, Failed, Delivered',
  `Response_Status` VARCHAR(30) NOT NULL DEFAULT 'Pending' COMMENT 'Response: Pending, Acknowledged, Resolved',
  FOREIGN KEY (`R_id`) REFERENCES `registration`(`R_id`) ON DELETE CASCADE,
  FOREIGN KEY (`Staff_No`) REFERENCES `staff`(`Staff_No`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Video Capture Table (Webcam Snapshot & Recording Media)
CREATE TABLE IF NOT EXISTS `video_capture` (
  `Capture_ID` INT AUTO_INCREMENT PRIMARY KEY,
  `R_id` INT NOT NULL,
  `Photo_Path` LONGTEXT NOT NULL COMMENT 'Base64 image string or file storage path',
  `Video_Path` LONGTEXT DEFAULT NULL COMMENT 'Base64 video string or video clip path',
  `Captured_At` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`R_id`) REFERENCES `registration`(`R_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### 3.2 TypeScript Interfaces (for Bolt.new Codebase)

```typescript
// src/types/vms.ts

export type AccessLevel = 'Admin' | 'Security' | 'Staff' | 'Visitor';
export type VisitorStatus = 'Pending' | 'Approved' | 'Rejected';
export type AlertStatus = 'Pending' | 'Sent' | 'Failed' | 'Delivered';
export type ResponseStatus = 'Pending' | 'Acknowledged' | 'Resolved';

export interface User {
  id: number;
  Name: string;
  Username: string;
  Password: string; // MD5 or hashed
  Access: AccessLevel;
  Staff_No: string;
  isBlocked?: boolean;
}

export interface Staff {
  Staff_No: string;
  Name: string;
  Email: string;
  Dob: string;
  Address: string;
  Degree: string;
  POS: string; // Position in organization
  Phone_No: string;
  Sex: string;
  isAvailable?: boolean;
}

export interface Registration {
  R_id: number;
  Name: string;
  Dated: string;
  Vtime: string;
  Purpose: string; // Personal or Official
  Staff_No: string;
  Phone: string;
  Email: string;
  Sex: string;
}

export interface SecurityRecord {
  Security_ID: number;
  R_id: number;
  Staff_No: string; // Security officer ID
  Visitor_Status: VisitorStatus;
  ID_Type: string; // NIN, Passport, etc.
  ID_Number: string;
  Check_Date: string;
  Check_Time: string;
  Security_Action: string;
  Remarks: string;
  Alert_Status: AlertStatus;
}

export interface Alert {
  Alert_ID: number;
  R_id: number;
  Staff_No: string;
  Alert_Type: string;
  Alert_Message: string;
  Alert_Date: string;
  Alert_Time: string;
  Delivery_Status: AlertStatus;
  Response_Status: ResponseStatus;
}

export interface VideoCapture {
  Capture_ID: number;
  R_id: number;
  Photo_Path: string; // Base64 data URL
  Video_Path?: string; // Base64 data URL or blob URL
  Captured_At: string;
}
```

---

## 4. Directory Structure & File Map

should assemble the application according to the following file tree:

```
/
├── index.html
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── vite.config.ts
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── index.css
    ├── types/
    │   └── vms.ts                  # TypeScript interfaces matching all 6 tables
    ├── context/
    │   ├── AuthContext.tsx         # User authentication & session state
    │   └── VMSContext.tsx          # Relational database store & CRUD actions
    ├── components/
    │   ├── Navigation.tsx          # Top nav bar with role switcher / login status
    │   ├── WebcamCapture.tsx       # WebRTC camera capture & video recording modal
    │   ├── VisitorBadge.tsx        # Printable visitor pass card with QR/photo
    │   ├── AlertToast.tsx          # Toast notification for host alerts
    │   ├── SearchBar.tsx           # Quick search component for staff & visitors
    │   └── ProtectedRoute.tsx      # Role-based route guard
    ├── pages/
    │   ├── HomePage.tsx            # Public portal & quick navigation
    │   ├── AdminDashboard.tsx      # Admin panel: Staff, Users, Block status, Audit Reports
    │   ├── SecurityDashboard.tsx   # Gatekeeper workstation: Enrolment, NIN, Media, Pass
    │   ├── HostDashboard.tsx       # Host Employee panel: Arrival alerts, Booking approval
    │   ├── VisitorPortal.tsx       # Self-service registration & staff availability
    │   └── LoginPage.tsx           # Universal login endpoint
    └── utils/
        ├── dbStorage.ts            # IndexedDB / LocalStorage relational store initializers
        ├── formatters.ts           # Date, time, and credential masking helpers
        └── printHelper.ts          # Window print trigger for visitor pass
```

---

## 5. Subsystem Implementation Specifications for Bolt.new

### 5.1 WebRTC Webcam Photo Snapshot & Video Capture Subsystem
- **Component**: `src/components/WebcamCapture.tsx`
- **Capabilities**:
  1. Request camera access using `navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 }, audio: false })`.
  2. Live stream video preview in a HTML5 `<video>` element.
  3. **Photo Capture**: Render current video frame to HTML5 `<canvas>`, convert frame to `image/jpeg` Base64 string via `canvas.toDataURL()`, and save string to `video_capture` table.
  4. **Video Recording**: Initialize `MediaRecorder(stream)`. Allow 5-10 second clip recording, encode to `video/webm` Blob, convert to Base64 data URL, and link to `video_capture` record.
  5. Provide fallback upload option if no physical camera hardware is detected.

### 5.2 Security Screening & NIN Credential Verification Subsystem
- **Component**: `src/pages/SecurityDashboard.tsx`
- **Workflow Steps**:
  1. **Visitor Enrolment Form**: Capture `Name`, `Phone`, `Email`, `Sex`, `Purpose` (Personal / Official), and target host (`Staff_No`).
  2. **Media Capture Modal**: Trigger `WebcamCapture` component to capture visitor snapshot photo and optional short video clip.
  3. **Identification Check**: Record `ID_Type` (e.g., Nigerian National Identification Number - NIN, Driver's License, Voter's Card, International Passport) and `ID_Number`.
  4. **Decision Handler**:
     - **Approve**: Updates `security.Visitor_Status` = 'Approved'. Automatically generates an `alert` record for host staff, dispatches a real-time toast alert, and unlocks the **Print Visitor Badge** action.
     - **Reject**: Updates `security.Visitor_Status` = 'Rejected'. Records `Remarks` and `Security_Action` (e.g., "Invalid NIN credential"), generates alert for security log, and denies access.

### 5.3 Real-Time Host Alert & Notification Subsystem
- **Context & Components**: `src/context/VMSContext.tsx` and `src/components/AlertToast.tsx`
- **Workflow**:
  1. When security approves a visitor or a visitor pre-books an appointment, an `alert` record is inserted with `Delivery_Status` = 'Pending'.
  2. An internal subscriber loop / event listener detects pending alerts for the active host `Staff_No`.
  3. Displays an on-screen toast notification card detailing:
     - Visitor Name & Photo thumbnail
     - Purpose of Visit (Personal/Official)
     - Timestamp
     - Action Buttons: "Acknowledge" / "Accept Visit" / "Reject Request"
  4. Also triggers native browser sound and `Notification.requestPermission()` browser push notification.

### 5.4 Custom Visitor Pass / Badge Generator & Printing
- **Component**: `src/components/VisitorBadge.tsx`
- **Badge Content Requirements** (as specified in Chapter 1 & 3):
  - Organization / University Header & Logo
  - Captured Visitor Photo Snapshot
  - Visitor Full Name & Registration ID (`R_id`)
  - Identity Credential Tag (e.g., NIN verified badge)
  - Visit Details: Purpose, Target Host Name, Department/Position
  - Issue Timestamp (`Date_In`, `Time_In`) & Expiration Time
  - Pass Status (e.g., APPROVED VISITOR)
- **CSS Print Formatting**:
  ```css
  @media print {
    body * { visibility: hidden; }
    #printable-visitor-badge, #printable-visitor-badge * { visibility: visible; }
    #printable-visitor-badge { position: absolute; left: 0; top: 0; width: 3.5in; height: 5in; border: 2px solid #000; padding: 16px; }
  }
  ```

### 5.5 Admin Panel & User Privilege Management
- **Component**: `src/pages/AdminDashboard.tsx`
- **Features**:
  - **Staff Registration**: Create staff records (`Staff_No`, `Name`, `Email`, `POS`, `Phone_No`, `Degree`).
  - **User Access Control**: Assign role access (`Admin`, `Security`, `Staff`, `Visitor`) and set credentials in `user` table.
  - **Block / Unblock Management**: Toggle user access state. Blocked accounts are immediately denied login.
  - **Audit & Analytics Reports**: Filter visitor logs by date range, host employee, purpose, or security approval status. Export report to CSV/Print.

---

## 6. Sequential Step-by-Step Build Checklist for Bolt.new

Execute the build in the following sequential order:

- [ ] **Phase 1: Project Setup & Core Types**
  - Initialize React + TypeScript + Vite project with Tailwind CSS and Lucide React.
  - Create `src/types/vms.ts` defining all database entity interfaces.
  - Set up persistent IndexedDB/LocalStorage mock database layer in `src/utils/dbStorage.ts` populated with initial mock data (Admin, Security officer, Staff members).

- [ ] **Phase 2: Authentication & Context Layer**
  - Implement `AuthContext.tsx` for login, user session persistence, role-based navigation guards, and block status verification.
  - Implement `VMSContext.tsx` exposing CRUD methods for staff, visitor registrations, security verification logs, alerts, and captured media.

- [ ] **Phase 3: WebRTC Webcam Subsystem**
  - Build `WebcamCapture.tsx` supporting live camera stream, snapshot photo generation via HTML5 canvas, and video clip recording via MediaRecorder.
  - Test camera permissions and fallback photo upload handling.

- [ ] **Phase 4: Security Gatekeeper Workstation**
  - Build `SecurityDashboard.tsx` with visitor enrolment, photo/video capture modal integration, NIN credential entry, and Approve/Reject decision workflow.

- [ ] **Phase 5: Real-Time Alert Engine & Host Dashboard**
  - Implement event dispatching system for alerts in `VMSContext`.
  - Build `HostDashboard.tsx` featuring real-time arrival toast notifications, appointment request approval, and host visitor history.

- [ ] **Phase 6: Visitor Badge Printing Subsystem**
  - Build `VisitorBadge.tsx` formatted with printable CSS `@media print` rules.
  - Verify badge rendering includes photo, NIN credential status, host details, and expiration timestamp.

- [ ] **Phase 7: Admin Panel & Reporting**
  - Build `AdminDashboard.tsx` for registering staff, managing user access privileges, blocking/unblocking accounts, and generating visitor audit reports.

- [ ] **Phase 8: Visitor Self-Service Portal & Final UI Polish**
  - Build `VisitorPortal.tsx` enabling visitors to check employee availability and submit pre-booking requests.
  - Polish UI with responsive Tailwind styling, accessible form validation, and complete workflow testing.
