# Credex Systems Ideas Portal

A comprehensive Ideas Portal web application where clients can submit feature suggestions for Unity, vote on ideas, comment, and track progress. Built with React, Next.js 14+, and Firebase.

## 🚀 Features

- **Idea Submission**: Submit feature suggestions with detailed descriptions
- **Voting System**: Vote on ideas from other users
- **Comment System**: Threaded discussions on ideas
- **Admin Review**: Admin approval workflow for ideas
- **Real-time Updates**: Live updates using Firebase
- **Role-based Access**: Client and Admin user roles
- **Responsive Design**: Works on desktop and mobile

## 🛠️ Technology Stack

- **Frontend**: React 18, Next.js 14+ (App Router)
- **Backend**: Firebase (Firestore, Authentication)
- **Styling**: Tailwind CSS + shadcn/ui components
- **State Management**: Zustand
- **Email**: SendGrid (optional)
- **Deployment**: Vercel + Firebase

## 📋 Prerequisites

- Node.js 18+ and npm
- Firebase project
- SendGrid account (optional, for email notifications)

## 🚀 Quick Start

### 1. Clone & Install
```bash
git clone <your-repo-url>
cd credex-ideas-portal-main
npm install
```

### 2. Environment Setup
```bash
cp .env.example .env.local
```

Edit `.env.local` with your Firebase and SendGrid credentials:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdefghijklmnop

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000

# SendGrid (Optional - for email notifications)
SENDGRID_API_KEY=SG.your_sendgrid_api_key
SENDGRID_FROM_EMAIL=noreply@yourdomain.com
NOTIFICATION_EMAIL=admin@yourdomain.com
SENDGRID_IDEA_NOTIFICATION_TEMPLATE_ID=d-your_template_id
```

### 3. Firebase Setup
1. Create a Firebase project at https://console.firebase.google.com
2. Enable Authentication (Email/Password)
3. Create a Firestore database
4. Deploy security rules: `firebase deploy --only firestore:rules`
5. Create composite index: `status` ASC, `createdAt` DESC (Firebase will prompt you)

### 4. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## 📁 Project Structure

```
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── ideas/             # Ideas pages
│   ├── admin/             # Admin pages
│   └── auth/              # Authentication pages
├── components/            # Reusable components
│   ├── ui/               # shadcn/ui components
│   ├── ideas/            # Ideas-specific components
│   └── layout/           # Layout components
├── lib/                  # Utilities and configuration
│   ├── firebase.ts       # Firebase configuration
│   ├── auth.ts           # Authentication utilities
│   ├── store.ts          # Zustand state management
│   └── types.ts          # TypeScript type definitions
└── public/               # Static assets
```

## 🔐 User Roles

### Client Users
- Submit new ideas (private by default)
- Vote on public ideas
- Comment on ideas
- View their own ideas (public + private)

### Admin Users
- All client capabilities
- Review and approve private ideas
- Make ideas public/private
- Change idea status
- Delete inappropriate content
- Access admin dashboard

## 🚢 Deployment

### Vercel (Frontend)
1. Connect your GitHub repo to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main

### Firebase (Backend)
```bash
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes
```

## 🔧 Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Key Dependencies
- Next.js 14+ with App Router
- React 18
- Firebase SDK
- Tailwind CSS
- shadcn/ui components
- Zustand for state management

## 📝 License

This project is proprietary software developed by Credex Systems.