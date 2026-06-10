# LifeOS Assistant - Project TODO

## Core Infrastructure
- [x] Database schema for reminders, notes, finances, goals, job applications, personal memory
- [x] tRPC routers for all modules
- [x] Authentication and user context setup

## UI Foundation
- [x] Premium dark-mode glassmorphism theme with Tailwind
- [x] Animated tabs, cards, progress bars, and transitions
- [x] Mobile-first responsive layout for iPhone
- [x] DashboardLayout integration with sidebar navigation

## Dashboard Module
- [x] Today's reminders widget
- [x] Overdue reminders display
- [ ] Upcoming deadlines widget
- [ ] Weekly/monthly spending snapshot
- [ ] Savings progress tracker
- [x] Active goals summary
- [x] Job application follow-ups widget
- [ ] Quick-add widgets for reminders, notes, expenses

## Reminders Module
- [x] Add/edit/delete reminders
- [x] Due date support
- [x] Category system (University, Career, Finance, Health, Personal, Life Admin)
- [x] Priority levels
- [ ] Progress tracking
- [ ] Overdue detection
- [ ] Swipe-right-to-complete gesture
- [ ] Swipe-left-to-delete gesture
- [x] Reminder list view with filtering

## Notes Module
- [x] Add/edit/delete notes
- [x] Note categories (quick notes, study notes, ideas, life admin)
- [x] Full-text search functionality
- [x] Smart tags system
- [ ] Convert note to reminder action
- [x] Notes list view with search and filtering

## Finance Module
- [ ] Add/edit/delete transactions
- [ ] Monthly income tracking
- [ ] Monthly expenses tracking
- [ ] Weekly spending view
- [ ] Category breakdown (Rent, Groceries, Transport, Food, Subscriptions, Shopping, Entertainment, Study, Travel, Health, Bills, Other)
- [ ] Recurring bills management
- [ ] Savings tracker
- [ ] Budget warnings and alerts
- [ ] Spending trends visualization
- [ ] Interactive Recharts charts (pie, bar, line)
- [ ] Finance dashboard with summaries

## Goals Module
- [ ] Add/edit/delete goals
- [ ] Goal categories (University, Career, Fitness, Finance, Personal)
- [ ] Goal fields: title, why-it-matters, progress %, next action, deadline, milestones, status
- [ ] Progress tracking and visualization
- [ ] Milestone management
- [ ] Goals list view with filtering

## Job Application Tracker
- [ ] Add/edit/delete job applications
- [ ] Job fields: company, role, location, link, date applied, status, follow-up date, resume version, cover letter version, interview stages, notes, outcome
- [ ] Kanban pipeline: Saved → Applying → Applied → Interview → Offer → Rejected
- [ ] Drag-and-drop between pipeline stages
- [ ] Follow-up date tracking
- [ ] Job application list and board views

## Personal Memory System
- [ ] Store resume details, education, work history, achievements
- [ ] Store preferred answers and custom responses
- [ ] Store salary preferences and work rights/visa details
- [ ] Store skills and writing tone preferences
- [ ] Store recurring information
- [ ] Show stored memory before reuse
- [ ] Allow editing and disabling of saved entries
- [ ] Approval-based memory learning

## LLM-Powered Tools
- [ ] Generate tailored cover letters
- [ ] Generate tailored resumes
- [ ] Answer uncertain job application questions
- [ ] Score and summarize job opportunities
- [ ] Learn from approved responses
- [ ] Always require approval before actions

## Notifications
- [ ] Push notifications for overdue reminders
- [ ] Push notifications for upcoming deadlines
- [ ] Push notifications for job follow-up dates
- [ ] Push notifications for budget warnings
- [ ] Email notification integration
- [ ] Notification settings and preferences

## Animations & Polish
- [ ] Smooth animated tabs
- [ ] Animated card transitions
- [ ] Animated progress bars
- [ ] Tap effects and feedback
- [ ] Completion celebrations
- [ ] Satisfying swipe gesture feedback
- [ ] Page transition animations
- [ ] Loading states and skeletons

## Testing & Quality
- [ ] Vitest unit tests for core features
- [ ] Error handling and edge cases
- [ ] Mobile responsiveness testing
- [ ] Accessibility review

## CSV Import Feature (NEW)
- [x] Create CSV parser for CommBank NetBank format
- [x] Implement auto-categorization logic for transactions
- [x] Add CSV import UI to Finance module with file upload
- [x] Update Dashboard to show weekly/monthly spend breakdown
- [x] Display subscription tracking and savings updates

## Deployment & Documentation
- [ ] Setup instructions
- [ ] Deployment guide
- [ ] Feature documentation
- [ ] User onboarding flow


## Dashboard Improvements (NEW)
- [x] Make dashboard stats cards clickable and navigable to Finance module
- [x] Add weekly spending breakdown/summary view
- [x] Add weekly category breakdown chart
- [x] Make dashboard fully responsive on mobile


## Color & Dynamic UI Enhancement (NEW)
- [x] Remove "Add" button from Dashboard today's reminders section
- [x] Display all today's reminders with priority color coding (red=high, yellow=medium, blue=low)
- [x] Add vibrant gradient backgrounds and accent colors throughout app
- [x] Color-code priority badges across all modules (Reminders, Goals, Job Applications)
- [x] Add dynamic hover effects and transitions for better interactivity
- [x] Enhance cards with gradient borders and shadow effects


## Automation Features (NEW)
- [x] Google Sheets export - export all data (reminders, finance, goals, jobs)
- [x] Reminder notifications at specific times with browser/push notifications
- [x] Budget alerts when spending crosses category limits
- [ ] Auto-categorization of transactions with ML/rules
- [ ] CareerOps integration - pull job matches and sync to Jobs module
- [ ] Scheduled job search - run at 4am nightly, find 1 job matching resume
- [ ] Auto-add matched jobs to Jobs module for morning review
- [ ] Spending insights and trend analysis
- [x] Settings page with notification controls
- [x] Test notification functionality


## Manus Brief Implementation (NEW)

### Part 1: Module Colors & Theme
- [x] Define module accent colors in index.css as CSS variables
- [x] Create moduleColors.ts with module hues and category color map
- [x] Apply module colors to page headers (gradient text/underline)
- [x] Update sidebar nav icons to show module color when active
- [ ] Apply category colors to Finance charts (pie, bars, legend)

### Part 2: Animations
- [x] Add page class to all page roots for fade+rise transitions
- [x] Implement staggered card entrance animations (50-70ms stagger)
- [x] Create CountUp component for animated stat values
- [ ] Enable recharts animations on all charts (~800ms)
- [ ] Add progress bar fill animations from 0 to value
- [ ] Wire completion celebrations (confetti + checkmark) for reminders/goals
- [x] Verify prefers-reduced-motion guard disables all animations

### Part 3: Google Sheets Live Sync
- [x] Create sheetsSync.ts with webhook management functions
- [ ] Integrate syncAddTransaction/syncUpdateTransaction/syncDeleteTransaction into Finance
- [ ] Update transaction toasts to show "synced to Google Sheets" when enabled
- [x] Add Settings UI card for webhook URL input and status
- [ ] Add "Sync all transactions now" button in Settings
- [ ] Relabel "Export to Google Sheets" button to "Download CSV"

### Part 4: Finance Visualizations
- [ ] Add monthly income vs expense grouped bar chart (last 6 months)
- [ ] Add balance trend line/area chart (cumulative, last 6 months)
- [ ] Add budget progress bars (animated, color-coded by category)
- [ ] Add top stat cards (Income, Expenses, Net, Savings %) with CountUp
- [ ] Add compact finance widget to Dashboard (4-week spending + Net)
- [ ] Add empty state messages to all charts

### Part 5: Final Verification
- [ ] Run pnpm check (zero errors)
- [ ] Run pnpm build (success)
- [ ] Test all 9 pages (add/edit/delete items)
- [ ] Test Finance webhook (with URL and without)
- [ ] Test mobile 375px (sidebar, no horizontal scroll, dialogs fit)
- [ ] Test reduced-motion toggle
- [ ] Report any incomplete items
