# Church Hub Frontend

A modern Next.js application for church community management, built with Mantine UI and Supabase.

## Features

### For Members
- **Daily Devotionals**: Read daily spiritual content with Bible verses and prayer points
- **Church Rota**: View and sign up for serving opportunities
- **Profile Management**: Update personal information and server status

### For Administrators
- **Admin Dashboard**: Overview of church statistics and quick actions
- **Devotional Management**: Create and manage daily devotionals with Bible API integration
- **Rota Management**: Manage ministries and serving slots
- **User Management**: Manage church members and their roles
- **Settings**: Configure application preferences

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **UI Library**: Mantine v7
- **Authentication**: Supabase Auth
- **Database**: Supabase (PostgreSQL)
- **Styling**: CSS Modules with Mantine theme
- **Icons**: Tabler Icons
- **Date Handling**: date-fns

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase project with the Church Hub backend setup

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
Create a `.env.local` file with your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
app/
├── auth/           # Authentication pages
├── admin/          # Admin management pages
├── devotionals/    # Devotional viewing
├── rota/           # Rota management
├── profile/        # User profile
└── layout.tsx      # Root layout
components/
├── Navigation/     # Main navigation component
├── ColorSchemeToggle/ # Theme toggle
└── Welcome/        # Welcome component
contexts/
└── AuthContext.tsx # Authentication context
lib/
└── supabase.ts     # Supabase client and types
```

## Authentication

The app uses Supabase Auth with email OTP (One-Time Password) for secure authentication. Users can:

- Sign in with their email address
- Receive a one-time password via email
- Access role-based features based on their profile

## Role-Based Access

- **Users**: Can view devotionals, sign up for rota slots, and manage their profile
- **Servers**: Additional access to sign up for serving opportunities
- **Admins**: Full access to all management features

## Bible API Integration

The devotional management system integrates with the Bible API to automatically fetch verses when creating devotionals. Supported features:

- Multiple Bible versions (KJV, NIV, ESV)
- Single verse and verse range lookups
- Automatic verse text retrieval

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

### Code Style

The project uses:
- TypeScript for type safety
- ESLint for code linting
- Prettier for code formatting
- Mantine's component library for consistent UI

## Deployment

The application can be deployed to any platform that supports Next.js:

- Vercel (recommended)
- Netlify
- Railway
- Self-hosted

Make sure to set the environment variables in your deployment platform.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
