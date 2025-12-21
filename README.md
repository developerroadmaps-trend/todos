This is a [Next.js](https://nextjs.org) Todo application with [Supabase](https://supabase.com) integration.

## Getting Started

### 1. Environment Setup

Copy the example environment file:

```bash
cp .env.local.example .env.local
```

Add your Supabase credentials to `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
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

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

- `/app` - Next.js App Router pages and components
- `/app/components/TodoList.tsx` - Main Todo list component with Supabase integration
- `/lib/supabase.ts` - Supabase client configuration
- `.env.local.example` - Environment variables template

## Features

- ✅ Create, read, update, and delete todos
- 🎨 Built with Tailwind CSS for responsive design
- 🗄️ Supabase backend integration (ready to connect to database)
- ⚡ TypeScript support

- ✅ Create, read, update, and delete todos
- 🎨 Built with Tailwind CSS for responsive design
- 🗄️ Supabase backend integration (ready to connect to database)
- ⚡ TypeScript support

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Supabase Documentation](https://supabase.com/docs) - learn about Supabase backend.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
