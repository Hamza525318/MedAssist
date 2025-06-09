# MedAssist - Healthcare Assistant Dashboard

A modern, mobile-responsive frontend UI for a healthcare assistant dashboard built with Next.js, TypeScript, and TailwindCSS.

## Project Overview

MedAssist is designed for healthcare professionals to manage patients, chat with an AI assistant, and handle medical reports. The dashboard provides an intuitive interface for doctors to streamline their workflow and improve patient care.

### Features

- **Authentication**: Login and registration pages with role selection
- **Dashboard**: Overview with summary cards and recent activity
- **Patient Management**: Search, view, and add patients with detailed profiles
- **Chat Assistant**: AI-powered chat interface with patient context selection
- **Report Upload**: Upload and manage patient lab reports with preview functionality
- **Responsive Design**: Mobile-friendly interface that adapts to all screen sizes

### Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: TailwindCSS for utility-first styling
- **Icons**: Lucide React for consistent iconography
- **State Management**: React hooks for local state management

## Getting Started

### Prerequisites

- Node.js 18.17.0 or later
- npm, yarn, or pnpm

### Installation

```bash
# Clone the repository (if you haven't already)
# git clone <repository-url>

# Navigate to the project directory
cd health-care-bot/frontend

# Install dependencies
npm install
# or
yarn install
# or
pnpm install
```

### Development

```bash
# Run the development server
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Project Structure

```
src/
├── app/                  # Next.js app router pages
│   ├── auth/             # Authentication pages (login, register)
│   ├── dashboard/        # Dashboard page
│   ├── patients/         # Patients management page
│   ├── chat/             # Chat assistant page
│   ├── upload-report/    # Report upload page
│   ├── globals.css       # Global styles
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Root page (redirects to login)
├── components/           # Reusable components
│   ├── layout/           # Layout components (DashboardLayout, AuthLayout)
│   ├── patients/         # Patient-related components
│   ├── chat/             # Chat-related components
│   └── upload/           # Upload-related components
└── ...
```

## Design System

- **Colors**: Teal (#008080) as primary, Emerald green (#10B981) as accent
- **Typography**: Poppins for headings, Inter for body text
- **Components**: Consistent card-based UI with shadows for depth
- **Accessibility**: Minimum touch target size of 44px for buttons and inputs

## Current Status

This is a frontend UI implementation with mock data. Backend integration is planned for future development.

## Future Enhancements

- Backend API integration
- Authentication with JWT
- Real-time chat with WebSockets
- File storage integration
- Advanced patient search and filtering
- Appointment scheduling
- Notifications system

## License

[MIT](https://choosealicense.com/licenses/mit/)
