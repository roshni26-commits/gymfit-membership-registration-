# 🏋️‍♂️ IRONFORGE - Modern Gym Membership System

**IRONFORGE** is a premium, high-performance gym membership registration and management platform built with a modern tech stack and a professional UI. It features a secure authentication system, a smart unified login, and a powerful admin dashboard.

---

## 🚀 Key Features

### **🎨 Modern & Professional UI**
- **Premium Theme**: Sleek "Deep Slate & Electric Cyan" professional color palette.
- **Advanced Animations**: 3D perspective hover cards, blinking focus elements, and floating UI components.
- **Smart Borders**: Dynamic rotating gradient borders for a high-tech feel.
- **Responsive Design**: Fully optimized for mobile, tablet, and desktop.

### **🔐 Secure Authentication**
- **Supabase Auth**: Industry-standard secure login and registration.
- **Unified Login**: A single login entry point for both Admins and Members with automatic role detection.
- **RLS (Row Level Security)**: Strict database policies to ensure user data privacy.

### **🛠 Admin Pro Dashboard**
- **Member Management**: Complete CRUD (Create, Read, Update, Delete) operations.
- **Real-time Analytics**: Quick stats on total members, yearly plans, and latest registrations.
- **Profile Editing**: Admin can update any member's details directly from the command center.

### **📊 Member Dashboard**
- **Personal Stats**: View membership plan, workout goals, and preferred timing.
- **Rank Tracking**: Automatic member ranking based on joining order.

---

## 🛠 Tech Stack

- **Framework**: [TanStack Start](https://tanstack.com/start) (Full-stack React)
- **Frontend**: React 19, Tailwind CSS 4
- **Database & Auth**: [Supabase](https://supabase.com/)
- **State Management**: TanStack Query
- **Icons**: Lucide React
- **Notifications**: Sonner (Toast notifications)

---

## ⚙️ Setup Instructions

### **1. Environment Variables**
Create a `.env` file in the root directory and add your Supabase credentials:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### **2. Database Schema**
Run the following SQL in your Supabase SQL Editor to set up the tables and RLS policies:
```sql
create table public.gym_users (
  id uuid primary key,
  rank integer,
  full_name text not null,
  age integer not null,
  gender text not null,
  mobile text not null,
  email text not null unique,
  address text not null default '',
  plan text not null,
  goal text not null,
  timing text not null,
  created_at timestamptz not null default now()
);

alter table public.gym_users enable row level security;

-- Policies
create policy "Public Insert" on public.gym_users for insert with check (true);
create policy "Public Select" on public.gym_users for select using (true);
create policy "Public Update" on public.gym_users for update using (true);
create policy "Public Delete" on public.gym_users for delete using (true);
```

### **3. Installation**
```bash
npm install
npm run dev
```

---

## 👤 Admin Access
Admin access is restricted to authorized personnel only. Please contact the system administrator for credentials.

---

## 📄 License
This project is licensed under the MIT License.

---
Built with 💪 by **IRONFORGE Team**
