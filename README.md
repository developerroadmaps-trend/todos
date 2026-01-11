This is a [React Router v7](https://reactrouter.com) Todo application with [Supabase](https://supabase.com) integration.

## Getting Started

### 1. Environment Setup

Copy the example environment file:

```bash
cp .env.local.example .env.local
```

Add your Supabase credentials to `.env.local`:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Get these values from your Supabase project settings.

### 2. Run the Development Server

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:5173](http://localhost:5173) with your browser to see the result.

## Project Structure

- `/app` - Remix routes and components
- `/app/components/TodoList.tsx` - Main Todo list component with Supabase integration
- `/lib/supabase.ts` - Supabase client configuration
- `.env.local.example` - Environment variables template

## Features

- ✅ Create, read, update, and delete todos
- 🎨 Built with Tailwind CSS for responsive design
- 🗄️ Supabase backend integration (ready to connect to database)
- ⚡ TypeScript support

## Learn More

To learn more about Remix, take a look at the following resources:

- [Remix Documentation](https://remix.run/docs) - learn about Remix features and API.
- [Supabase Documentation](https://supabase.com/docs) - learn about Supabase backend.
- [React Router](https://reactrouter.com) - understand the routing library powering Remix.

## Deploy

The easiest way to deploy your Remix app is to use platforms like [Vercel](https://vercel.com) or [Netlify](https://netlify.com).

Check out the [Remix deployment documentation](https://remix.run/docs/en/main/start/deploy) for more details.
