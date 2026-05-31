This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

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

## Architecture
````
autotrack-next
├── app
│   ├── page.tsx                  # landing entrance
│   ├── layout.tsx
│   ├── globals.css
│   │
│   ├── login                     # login page
│   │   └── page.tsx
│   ├── register                  # register page
│   │   └── page.tsx
│   ├── dashboard
│   │   └── page.tsx              # dashboard/summary page
│   ├── leads
│   │   ├── page.tsx              # leads list
│   │   └── [id]
│   │       └── page.tsx          # lead detail page
│   ├── agenda
│   │   └── page.tsx
│   ├── (analytics)
│   │   └── page.tsx
│   └── (settings)
│       └── page.tsx
│
├── components
│   ├── layout
│   │   ├── Sidebar.tsx
│   │   └── TopBar.tsx
│   ├── dashboard
│   │   ├── SummaryCard.tsx
│   │   └── RecentActivity.tsx
│   ├── leads
│   │   ├── LeadTable.tsx
│   │   ├── LeadCard.tsx
│   │   └── LeadBriefModal.tsx
│   ├── agenda
│   │   └── AgendaTaskCard.tsx
│   └── analytics
│       └── AnalyticsCard.tsx
│
├── domain
│   ├── objects
│   │   ├── Lead.ts
│   │   ├── Task.ts
│   │   ├── Vehicle.ts
│   │   ├── Notification.ts
│   │   └── Event.ts
│   └── business
│       ├── AccessObjects.ts
│       ├── ScoringService.ts
│       ├── PriorityManager.ts
│       ├── LeadInteractionManager.ts
│       └── AgendaService.ts
│
├── lib
│   ├── database.ts
│   └── persistence
│       └── interfaces
│       │   ├── LeadDataAccess.ts
│       │   ├── TaskDataAccess.ts
│       │   └── VehicleDataAccess.ts
│       ├── LeadRepository.ts
│       ├── TaskRepository.ts
│       └── VehicleRepository.ts
│
├── hooks
│   ├── useLeads.ts
│   ├── useAgenda.ts
│   └── useDashboard.ts
│
├── styles
│   ├── layout.module.css
│   ├── dashboard.module.css
│   └── leads.module.css
│
├── utils
│   ├── dateUtils.ts
│   └── scoreUtils.ts
│
└── public
    ├── images
    ├── icons
    └── favicon.ico
````

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
