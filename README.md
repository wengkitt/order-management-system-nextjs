This is an order management system built with Next.js App Router. PostgreSQL
access is configured with Drizzle ORM and Neon's serverless driver.

## Database setup

1. Copy `.env.example` to `.env.local`.
2. Set `DATABASE_URL` to the pooled connection string from your Neon project.
3. Add table definitions under `db/schema/` and export them from
   `db/schema/index.ts`.
4. Generate and apply migrations:

```bash
pnpm db:generate
pnpm db:migrate
```

Useful database commands:

```bash
pnpm db:generate # generate SQL migrations from schema changes
pnpm db:migrate  # apply generated migrations
pnpm db:push     # push schema changes directly (development only)
pnpm db:studio   # open Drizzle Studio
```

Import the typed, server-only client with `import { db } from "@/db"` in
Server Components, Server Actions, Route Handlers, or other server-only data
access modules.

## Getting Started

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

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
