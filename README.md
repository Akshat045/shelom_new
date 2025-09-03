# Inventory & Dieline Management System

A full-stack web application for managing dielines and cartons with role-based authentication.

## Features

- **Authentication System**: Admin and Employee roles
- **Dieline Management**: Add, edit, delete dielines with dimensions and tolerance
- **Carton Management**: Track carton inventory with quantities
- **Smart Matching**: Auto-match cartons to dielines based on size tolerance
- **Usage Tracking**: Complete audit trail of assignments
- **Role-based Dashboards**: Different views for Admin and Employee

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Express.js, Node.js, TypeScript
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT tokens

## Project Structure

```
├── frontend/          # Next.js application
├── backend/           # Express.js API
└── README.md
```

## Getting Started

### Backend Setup
```bash
cd backend
npm install
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
