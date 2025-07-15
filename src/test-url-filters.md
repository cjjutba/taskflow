# URL Filtering Test Guide

## Test the URL-based filtering functionality:

### 1. Search Filter
- Navigate to: `http://localhost:8081/?search=test`
- Should filter tasks containing "test" in title or description

### 2. Priority Filter
- Navigate to: `http://localhost:8081/?priority=high`
- Should show only high priority tasks

### 3. Status Filter
- Navigate to: `http://localhost:8081/?status=completed`
- Should show only completed tasks
- Navigate to: `http://localhost:8081/?status=pending`
- Should show only pending tasks

### 4. Combined Filters
- Navigate to: `http://localhost:8081/?search=task&priority=high&status=pending`
- Should apply all filters simultaneously

### 5. View Filter
- Navigate to: `http://localhost:8081/?view=board`
- Should switch to board view
- Navigate to: `http://localhost:8081/?view=list`
- Should switch to list view

### 6. Sort Filters
- Navigate to: `http://localhost:8081/?sortBy=priority&sortOrder=desc`
- Should sort by priority in descending order

### 7. Project Filter (for All Tasks page)
- Navigate to: `http://localhost:8081/all-tasks?project=PROJECT_ID`
- Should filter tasks by specific project

## Page Transitions
- Navigate between pages to see smooth transitions
- Check: Today → Inbox → All Tasks → Completed → Analytics

## Loading States
- Refresh any page to see loading spinner
- Should show page-specific loading messages

## Features Implemented:
✅ Page-specific loading states with realistic timing
✅ URL-based filtering with search parameters
✅ Smooth page transitions using Framer Motion
✅ Cleanup of old view components
✅ Filter state persistence in URL
✅ Combined filter support
✅ Loading states for stats recalculation
