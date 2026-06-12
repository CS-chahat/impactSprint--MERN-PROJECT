# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.
<p align="center">
  <h1 align="center">🌿 ImpactSprint</h1>
  <p align="center">
    <strong>Big Impact. Small Sprints.</strong><br/>
    A full-stack micro-volunteering platform connecting skilled professionals with NGOs through focused, time-bounded sprints.
  </p>
  <p align="center">
  <a href="https://impactsprint.onrender.com" target="_blank">
    <img src="https://img.shields.io/badge/Live%20Demo-Visit%20App-brightgreen?style=for-the-badge&logo=render" alt="Live Demo" />
  </a>
</p>
</p>

Currently, two official plugins are available:
<p align="center">
  <img src="https://img.shields.io/badge/React-18.2-61dafb?logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/Node.js-Express-339933?logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/MongoDB-Mongoose-47A248?logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/JWT-Auth-000000?logo=jsonwebtokens&logoColor=white" alt="JWT" />
  <img src="https://img.shields.io/badge/Vite-5.0-646CFF?logo=vite&logoColor=white" alt="Vite" />
</p>

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)
---

## React Compiler
## 📋 Table of Contents

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).
- [Overview](#overview)
- [Key Features](#key-features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [API Reference](#api-reference)
- [User Roles & Workflows](#user-roles--workflows)
- [Screenshots](#screenshots)
- [Contributing](#contributing)
- [License](#license)

## Expanding the ESLint configuration
---

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
## Overview

**ImpactSprint** reimagines volunteering for the modern professional. Instead of asking for weeks of commitment, it breaks social impact work into **focused 2–5 hour micro-sprints**. NGOs post bounded tasks with clear deliverables, our AI-powered matching engine connects them with the right professionals, and upon completion, a **cryptographically signed digital certificate** is issued — permanent proof of impact for any portfolio.

### The Sprint Lifecycle

```
NGO Posts Sprint → AI Matches Professionals → Professional Accepts →
Live Timer Starts → Work Submitted → NGO Reviews → Certificate Issued
```

---

## Key Features

### 🤖 AI-Powered Matching
- Skill-to-task matching algorithm that scores professionals against sprint requirements
- Recommendation engine surfaces the most relevant sprints for each professional

### ⏱️ Live Sprint Timer
- Real-time countdown tracking with bounded 2–5 hour windows
- Both NGOs and professionals see synchronized progress

### 📜 Cryptographic Certificates
- SHA-256 hashed digital certificates generated upon NGO approval
- Downloadable as PDF with unique verification hashes
- Permanent, tamper-proof proof of contribution

### 👥 Three-Role System
| Role | Dashboard | Capabilities |
|------|-----------|-------------|
| **Admin (Orchestrator)** | Platform analytics, user management | Verify NGOs, monitor sprints, manage users, view certificates |
| **NGO** | Sprint management portal | Create sprints, review submissions, approve/request revisions, issue certificates |
| **Professional** | Task discovery & portfolio | Browse sprints, accept tasks, submit work, earn certificates |

### 🎨 Premium UI/UX
- Glassmorphism design with backdrop blur and transparency layers
- World-map foliage background with role-specific color tinting
- Responsive layouts with smooth micro-animations
- Dynamic entry cards with intersection observer animations

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                        Frontend                         │
│  React 18 + Vite │ SPA with custom routing              │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────┐ │
│  │ Landing  │ │ NGO      │ │ Pro      │ │ Admin      │ │
│  │ Page     │ │ Dashboard│ │ Dashboard│ │ Dashboard  │ │
│  └──────────┘ └──────────┘ └──────────┘ └────────────┘ │
│         │          │            │              │        │
│         └──────────┴────────────┴──────────────┘        │
│                        │                                │
│              Vite Dev Proxy (/api →)                    │
└────────────────────────┬────────────────────────────────┘
                         │ HTTP (JSON)
┌────────────────────────┴────────────────────────────────┐
│                     Backend API                         │
│  Express.js │ JWT Auth │ RBAC Middleware                 │
│  ┌──────────────┐  ┌───────────────┐                   │
│  │ Auth Routes  │  │ Sprint Routes │                   │
│  │  /api/auth/* │  │ /api/sprints/*│                   │
│  └──────┬───────┘  └───────┬───────┘                   │
│         └──────────┬───────┘                            │
│              Mongoose ODM                               │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────┴────────────────────────────────────┐
│                    MongoDB                              │
│   Collections: users, sprints, certificates             │
└─────────────────────────────────────────────────────────┘
```

---

## Tech Stack

### Frontend
| Technology | Purpose |
|-----------|---------|
| **React 18** | Component-based UI with hooks |
| **Vite 5** | Lightning-fast dev server & bundler |
| **Vanilla CSS** | Custom glassmorphism design system |
| **Clash Display + DM Sans** | Premium typography (Google Fonts) |

### Backend
| Technology | Purpose |
|-----------|---------|
| **Node.js + Express** | RESTful API server |
| **MongoDB + Mongoose** | Document database with schema validation |
| **JWT (jsonwebtoken)** | Stateless authentication with Bearer tokens |
| **bcryptjs** | Password hashing (12 salt rounds) |
| **cookie-parser** | HTTP-only cookie fallback for auth |
| **morgan** | HTTP request logging |
| **cors** | Cross-origin resource sharing |

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 18.x
- **MongoDB** ≥ 6.x (running locally or Atlas URI)
- **npm** ≥ 9.x

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/impactsprint.git
cd impactsprint
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory:

```env
PORT=5001
MONGO_URI=mongodb://127.0.0.1:27017/ImpactSprint
JWT_SECRET=your_secret_key_here
JWT_EXPIRE=7d
CORS_ORIGIN=http://localhost:5173,http://localhost:5174
```

Start the backend:

```bash
# Development (with hot reload)
npm run dev

# Production
npm start
```

You should see:
```
✅ MongoDB Connected: 127.0.0.1
🔑 Admin account seeded
🚀 Backend running on http://127.0.0.1:5001
```

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The app will be available at `http://localhost:5173` (or `5174`).

### 4. Default Admin Account

An admin account is automatically seeded on every server boot:

| Field | Value |
|-------|-------|
| Email | `admin@impactsprint.com` |
| Password | `Admin@2026!#` |
| Role | Orchestrator |

---

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Backend server port | `5001` |
| `MONGO_URI` | MongoDB connection string | `mongodb://127.0.0.1:27017/ImpactSprint` |
| `JWT_SECRET` | Secret key for signing JWTs | — (required) |
| `JWT_EXPIRE` | Token expiration duration | `7d` |
| `CORS_ORIGIN` | Comma-separated allowed origins | `http://localhost:5173` |

---

## Project Structure

```
impactsprint/
├── backend/
│   ├── config/
│   │   └── db.js                  # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js      # Register, login, profile, admin ops
│   │   └── sprintController.js    # CRUD, workflow, AI match, certificates
│   ├── middleware/
│   │   └── auth.js                # JWT protect + role-based authorize
│   ├── models/
│   │   ├── User.js                # User schema (Professional/NGO/Orchestrator)
│   │   ├── Sprint.js              # Sprint schema with workflow states
│   │   └── Certificate.js         # Cryptographic certificate schema
│   ├── routes/
│   │   ├── authRoutes.js          # /api/auth/*
│   │   └── sprintRoutes.js        # /api/sprints/*
│   ├── server.js                  # Express app entry point
│   ├── .env                       # Environment configuration
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx         # Navigation + Login/Register modal
│   │   │   ├── ProfileModal.jsx   # Edit profile modal
│   │   │   ├── CertModal.jsx      # Certificate viewer modal
│   │   │   └── UI.jsx             # Shared UI primitives & design tokens
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx    # Hero, features, registration, role cards
│   │   │   ├── NgoDashboard.jsx   # NGO sprint management portal
│   │   │   ├── ProDashboard.jsx   # Professional task discovery portal
│   │   │   ├── AdminDashboard.jsx # Platform analytics & user management
│   │   │   ├── LiveTracking.jsx   # Real-time sprint timer & tracking
│   │   │   └── RegisterPage.jsx   # Dedicated registration page
│   │   ├── utils/
│   │   │   └── cert.js            # Client-side certificate generation
│   │   ├── api.js                 # Centralized API client
│   │   ├── AuthContext.jsx        # Authentication state provider
│   │   ├── GlobalModalContext.jsx # App-wide modal system
│   │   ├── App.jsx                # Root component & routing
│   │   ├── main.jsx               # React entry point
│   │   └── index.css              # Global styles & CSS variables
│   ├── vite.config.js             # Vite config with API proxy
│   └── package.json
│
└── README.md
```

---

## API Reference

### Authentication — `/api/auth`

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `POST` | `/register` | Public | Register as Professional or NGO |
| `POST` | `/login` | Public | Authenticate and receive JWT |
| `GET` | `/me` | Private | Get current user profile |
| `PUT` | `/profile` | Private | Update profile fields |
| `POST` | `/logout` | Private | Clear auth cookie |
| `GET` | `/users` | Admin | List all users |
| `DELETE` | `/users/:id` | Admin | Delete a user |

### Sprints — `/api/sprints`

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `POST` | `/` | NGO | Create a new sprint |
| `GET` | `/` | Private | List all sprints |
| `GET` | `/:id` | Private | Get sprint details |
| `PUT` | `/:id/accept` | Professional | Accept and start a sprint |
| `PUT` | `/:id/submit` | Professional | Submit completed work |
| `PUT` | `/:id/stop` | Professional | Abandon a sprint |
| `PUT` | `/:id/verify-impact` | NGO | Approve work and issue certificate |
| `PUT` | `/:id/disagree` | NGO | Request revision with notes |
| `GET` | `/ai-recommendations` | Professional | Get AI-matched sprint suggestions |

### Certificates — `/api/sprints/certificates`

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `GET` | `/me` | Professional | List my earned certificates |
| `GET` | `/all` | Admin | List all platform certificates |
| `GET` | `/:id/pdf` | Private | Download certificate as PDF |

### Admin Feed — `/api/sprints/admin`

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `GET` | `/feed` | Admin | Platform-wide activity feed & stats |

---

## User Roles & Workflows

### 🏢 NGO Workflow
```
Register → Create Sprint (title, description, skills, time) →
Wait for Professional Match → Monitor Progress →
Review Submission → Approve (→ Certificate) or Request Revision
```

### 👤 Professional Workflow
```
Register → Browse / Get AI Recommendations →
Accept Sprint → Live Timer Starts →
Submit Work (note + URL) → Await NGO Approval →
Receive Certificate → Download PDF
```

### ⚙️ Admin Workflow
```
Login (seeded account) → View Platform Analytics →
Monitor Active Sprints → Verify NGOs →
Manage Users → View All Certificates
```

### Sprint State Machine

```
POSTED ──(accept)──→ IN_PROGRESS ──(submit)──→ PENDING_APPROVAL
  │                      │                          │
  │                    (stop)                    (verify)──→ COMPLETED
  │                      │                          │
  │                      ↓                      (disagree)──→ IN_PROGRESS
  │                   POSTED                        │           (revision)
  │                                                 ↓
  └─────────────────────────────────────── Certificate Issued
```

---

## Design System

ImpactSprint uses a custom CSS variable-driven design system:

| Token | Value | Usage |
|-------|-------|-------|
| `--sage` | `#5B7C61` | Primary green accent |
| `--moss` | `#3D5A42` | Dark green text |
| `--amber` | `#E07A2F` | NGO accent / warnings |
| `--ink` | `#2C2A27` | Primary text |
| `--stone` | `#8B8680` | Secondary text |
| `--linen` | `#FAFAF7` | Input backgrounds |
| Button CTA | `#4A7C59` | "Create Account" buttons |

### Glassmorphism Pattern
```css
background: rgba(255, 255, 255, 0.7);
backdrop-filter: blur(16px);
-webkit-backdrop-filter: blur(16px);
border: 1px solid rgba(255, 255, 255, 0.8);
border-radius: var(--radius);
box-shadow: 0 12px 40px rgba(0, 0, 0, 0.1);
```

---

## Scripts

### Backend

| Command | Description |
|---------|-------------|
| `npm start` | Start production server |
| `npm run dev` | Start with nodemon (hot reload) |

### Frontend

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Code Style
- React components use JSX with inline styles (design system tokens)
- Backend follows Express controller pattern with try-catch error handling
- All API responses follow `{ success: boolean, ...data }` shape

---

## License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  <sub>Built for the planet. 🌍 One sprint at a time.</sub>
</p>
