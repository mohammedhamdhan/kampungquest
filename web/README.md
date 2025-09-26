# KampungQuest Frontend

A Vue 3 + Vite application for sharing wisdom and knowledge across generations.

## Features

- 🎤 **Audio Recording**: Record teachings and stories with Web Audio API
- 🤖 **AI Summarization**: Transform spoken wisdom into structured lessons using AI
- 🔐 **Supabase Authentication**: Secure email OTP authentication
- 📱 **Responsive Design**: Beautiful UI with Tailwind CSS
- 🎯 **TypeScript**: Full type safety throughout the application

## Prerequisites

- Node.js 20.19+ or 22.12+
- A Supabase project
- Access to the KampungQuest API endpoints

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   Copy the `.env.local` file and update with your actual values:
   ```bash
   # Supabase Configuration
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

   # API Configuration
   VITE_API_BASE=your_api_base_url
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Build for production:**
   ```bash
   npm run build
   ```

## Project Structure

```
src/
├── components/          # Reusable Vue components
│   ├── AudioRecorder.vue   # Audio recording component
│   └── TextSummarizer.vue  # Text input and AI summarization
├── composables/         # Vue 3 composition functions
│   └── useAuth.ts          # Authentication logic
├── pages/              # Route pages
│   ├── LandingPage.vue     # Home page
│   ├── AuthPage.vue        # Login/OTP verification
│   ├── DashboardPage.vue   # Main app interface
│   └── ProfilePage.vue     # User profile
├── router/             # Vue Router configuration
│   └── index.ts
├── services/           # API and external services
│   ├── supabase.ts         # Supabase client
│   └── api.ts              # API calls
├── types/              # TypeScript definitions
│   └── index.ts
└── main.ts             # App entry point
```

## Key Components

### Audio Recording
- Uses Web Audio API for high-quality recording
- Supports recording controls (start/stop/playback)
- Outputs WebM audio format

### AI Summarization
- Integrates with existing `/api/summarise` endpoint
- Supports multiple locales (SG, MY, ID, TH, PH)
- Generates structured teaching materials with steps, materials, and tags

### Authentication
- Email-based OTP authentication via Supabase
- Automatic session management
- Route protection for authenticated areas

## Environment Notes

This project uses the latest Vite 7.x and Vue 3.5.x which require Node.js 20.19+ or 22.12+. If you encounter Node.js version errors, please upgrade your Node.js version to a supported version.

## Development

The application is structured as a single-page application with the following main routes:

- `/` - Landing page with app introduction
- `/auth` - Authentication flow (email → OTP)
- `/dashboard` - Main application interface
- `/profile` - User profile and settings

All routes except landing and auth require authentication.
