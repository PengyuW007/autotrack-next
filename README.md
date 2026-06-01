# AutoTrack Next.js & React
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
│       │   ├── DataAccessLead.ts
│       │   ├── DataAccessTask.ts
│       │   ├── DataAccessNotification.ts
│       │   └── DataAccessVehicle.ts
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
├── public
│   ├── images
│   ├── icons
│   └── favicon.ico
│
└── tests
    ├── unit
    ├── stub
    └── integration
````
## AutoTrack Next.js Development Roadmap

### Development Architecture

The project follows a layered architecture similar to the Android implementation.

```text
Presentation Layer
        ↓
Business Layer
        ↓
Persistence Layer
        ↓
Database Layer
```

## Development Procedure

### Phase 1 — Domain Objects

Goal:
Establish all business entities before implementing logic.

#### Objects

* Lead
* Vehicle
* Event
* Task
* Notification

#### Unit Tests

* Lead Tests
* Vehicle Tests
* Task Tests
* Notification Tests

Status:

```text
Completed
```

### Phase 2 — Business Layer

Goal:
Implement AutoTrack's core intelligence independent of UI and database.

### Components

#### LeadScoringEngine

Responsibilities:

* Lead prioritization
* Engagement scoring
* Time-decay scoring
* Follow-up urgency calculations

#### TaskScheduler

Responsibilities:

* Scientific follow-up generation
* Task creation
* Cadence management

Examples:

* 48 Hour Follow-Up
* Day 3 Follow-Up
* Day 7 Follow-Up
* Day 14 Follow-Up
* Monthly Follow-Up

#### AgendaManager

Responsibilities:

* Daily agenda generation
* Overdue task detection
* Task prioritization
* Dashboard agenda summary

### Unit Tests

```text
LeadScoringEngine.test.ts
TaskScheduler.test.ts
AgendaManager.test.ts
```

Status:

Current Development Phase

### Phase 3 — Persistence Layer

Goal:
Create repository interfaces and stub repositories.

#### Interfaces

```text
LeadDataAccess
TaskDataAccess
VehicleDataAccess
NotificationDataAccess
```

#### Repositories

```text
LeadRepository
TaskRepository
VehicleRepository
NotificationRepository
```

Initial implementation will use:

```text
Stub Database
```

instead of a real database.

Status:

```text
Pending
```

---

### Phase 4 — UI Components

Goal:
Build reusable React components.

#### Layout Components

```text
Sidebar
TopBar
```

#### Dashboard Components

```text
SummaryCard
RecentActivityCard
AgendaPreview
```

#### Lead Components

```text
LeadTable
LeadCard
LeadDetailPanel
LeadForm
```

#### Agenda Components

```text
TaskList
CalendarView
AgendaCard
```

Status:

```text
Pending
```

---

### Phase 5 — Page Integration

Goal:
Connect pages to business logic and repositories.

#### Dashboard

Features:

* Lead statistics
* Daily agenda
* Recent activities
* High-priority leads

#### Leads

Features:

* Lead table
* Filters
* Search
* Sorting

#### Lead Details

Features:

* Lead information
* Interaction history
* Tasks
* Notes

#### Agenda

Features:

* Daily tasks
* Overdue tasks
* Calendar navigation

Status:

```text
Pending
```

---

### Phase 6 — Database Integration

Goal:
Replace StubDB with real persistence.

Potential Technologies:

#### Option 1

```text
SQLite
```

#### Option 2

```text
PostgreSQL
```

#### Option 3

```text
Supabase
```

#### Option 4

```text
MySQL
```

Recommended for AutoTrack:

```text
MySQL
```

to maintain compatibility with future mobile and web synchronization.

Status:

```text
Pending
```

---

### Phase 7 — Advanced Features

#### AutoTrack Intelligence

* Priority Queue Ranking
* Scientific Follow-Up Engine
* Lead Score Calculation
* Missed Call Detection
* Notification Tagging

#### Analytics

* Conversion Tracking
* Lead Funnel Analysis
* Activity Reports
* Sales Performance Metrics

#### Security

* User Authentication
* Role Management
* Data Encryption
* Audit Logging

Status:

```text
Future Development
```

---

# Recommended Development Order

```text
1. Objects Layer                ✓
2. Unit Tests                   ✓
3. Business Layer               ← Current Focus
4. Business Tests
5. Persistence Interfaces
6. Stub Repositories
7. UI Components
8. Page Integration
9. Database Integration
10. Advanced Features
```
## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
