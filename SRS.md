# Software Requirements Specification (SRS) - IRONFORGE

## 1. Introduction

### 1.1 Purpose
The purpose of this document is to provide a detailed description of the IRONFORGE Gym Membership System. It covers functional and non-functional requirements, system architecture, and user interfaces.

### 1.2 Scope
IRONFORGE is a web-based platform designed to automate gym membership registration, authentication, and management. It provides a professional interface for members and a powerful command center for administrators to manage gym data.

---

## 2. Overall Description

### 2.1 Product Perspective
IRONFORGE is a standalone web application built using modern full-stack technologies. It integrates with Supabase for real-time database management and secure authentication.

### 2.2 User Classes and Characteristics
1.  **Members**: Individuals who register to join the gym. They can view their profile, membership status, and stats.
2.  **Administrator**: The gym owner or staff who manages members, updates details, and monitors gym statistics.

### 2.3 Operating Environment
-   **Client Side**: Modern web browsers (Chrome, Firefox, Safari, Edge).
-   **Server Side**: Cloudflare Workers / Node.js runtime.
-   **Database**: Supabase PostgreSQL.

---

## 3. System Features

### 3.1 User Registration & Authentication
-   **Feature**: Secure Sign-up and Login.
-   **Description**: Users can create accounts by providing personal details. Authentication is handled via Supabase Auth.
-   **Functional Requirements**:
    -   Validate email and password strength.
    -   Prevent duplicate email registrations.
    -   Smart unified login for both Admin and Members.

### 3.2 Member Dashboard
-   **Feature**: Personal Profile Management.
-   **Description**: Registered members can view their membership plan, workout goals, and joining rank.
-   **Functional Requirements**:
    -   Display real-time member statistics.
    -   Show joined date and personal information.

### 3.3 Admin Command Center (CRUD)
-   **Feature**: Member Management.
-   **Description**: Admin can perform full CRUD operations on member data.
-   **Functional Requirements**:
    -   **Read**: View a list of all registered members.
    -   **Update**: Edit member details (Name, Age, Plan, etc.).
    -   **Delete**: Remove members from the system.
    -   **Analytics**: View total members and plan distributions.

---

## 4. Interface Requirements

### 4.1 User Interface (UI)
-   **Design**: Professional "Deep Slate & Electric Cyan" theme.
-   **UX**: 3D hover effects, smooth transitions, and blinking notifications.
-   **Responsiveness**: Mobile-first responsive design using Tailwind CSS.

### 4.2 Database Interface
-   **Database**: Supabase (PostgreSQL).
-   **Tables**: `gym_users` for storing member metadata.
-   **Security**: Row Level Security (RLS) to protect data integrity.

---

## 5. Non-functional Requirements

### 5.1 Security
-   Passwords must be hashed (handled by Supabase Auth).
-   RLS policies must prevent unauthorized data access.
-   Admin credentials must be protected.

### 5.2 Performance
-   Optimized SSR (Server Side Rendering) using TanStack Start.
-   Fast database queries with indexed fields.

### 5.3 Usability
-   Intuitive navigation menu.
-   Clear feedback through toast notifications (Sonner).

---

## 6. System Architecture

-   **Frontend**: React 19, Tailwind CSS 4.
-   **Backend**: TanStack Start (Server Functions).
-   **Database**: Supabase.
-   **Deployment**: Cloudflare Pages / Vercel.

---
**Version**: 1.0.0  
**Status**: Finalized  
**Author**: IRONFORGE Development Team
