# TaskFlow - Modern Task Management

[![Live Demo](https://img.shields.io/badge/Live%20Demo-taskflow--web--app.vercel.app-blue)](https://taskflow-web-app.vercel.app/)
[![React](https://img.shields.io/badge/React-18.3.1-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.4.11-blue)](https://tailwindcss.com/)

## 📋 Table of Contents
- [📝 What is TaskFlow?](#-what-is-taskflow)
- [🌐 Live Demo](#-live-demo)
- [✨ Features](#-features)
- [🛠️ Technology Stack](#️-technology-stack)
- [🚀 Getting Started](#-getting-started)
- [📁 Project Structure](#-project-structure)
- [🎨 Design System](#-design-system)
- [📱 Responsive Breakpoints](#-responsive-breakpoints)
- [🔒 Data & Privacy](#-data--privacy)
- [🚀 Deployment](#-deployment)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)
- [👨‍💻 Author](#-author)
- [🙏 Acknowledgments](#-acknowledgments)

---

## 📝 What is TaskFlow?

TaskFlow is a clean, minimal, and professional task management application built for modern workflows. It combines intuitive design with powerful features to help you organize tasks, manage projects, and boost productivity. This project demonstrates advanced frontend development skills with React, TypeScript, and modern web technologies.

> **⚠️ Frontend-Only Implementation**: This project is a complete frontend demonstration using local storage for data persistence. It does not include backend services or databases. All data is stored locally in the browser for showcase purposes.

## 🌐 Live Demo
**Website**: [https://taskflow-web-app.vercel.app/](https://taskflow-web-app.vercel.app/)

---

## ✨ Features

### 📋 **Task Management Core**
- **Comprehensive Task Creation** - Rich task forms with title, description, priority, due dates, and project assignment
- **Multiple View Modes** - Switch between List and Kanban Board views for different workflows
- **Task Organization** - Organize tasks into custom sections with drag-and-drop functionality
- **Priority System** - Three-level priority system (Low, Medium, High) with visual indicators
- **Due Date Management** - Set and track due dates with overdue task highlighting

### 🗂️ **Project Organization**
- **Dynamic Projects** - Create unlimited projects with custom colors and automatic task counting
- **Project Pages** - Dedicated pages for each project with full task management capabilities
- **Project Analytics** - Track completion rates and progress for individual projects
- **Flexible Assignment** - Assign tasks to projects or keep them in the global inbox

### 📊 **Smart Views & Pages**
- **Today View** - Focus on tasks due today with smart filtering
- **Inbox** - Centralized location for unassigned tasks and quick capture
- **All Tasks** - Complete overview of all tasks across projects
- **Completed** - Archive of finished tasks with completion analytics
- **Analytics Dashboard** - Comprehensive productivity insights and statistics

### 🎯 **Kanban Board Features**
- **Drag & Drop** - Intuitive task movement between sections and reordering
- **Custom Sections** - Create unlimited sections to match your workflow
- **Visual Organization** - Clean, minimal cards with essential task information
- **Section Management** - Full CRUD operations for sections with inline editing
- **Responsive Design** - Optimized board experience across all device sizes

### 🔔 **Smart Notifications**
- **Real-time Updates** - Instant notifications for all CRUD operations (Create, Read, Update, Delete)
- **Persistent Storage** - Notifications persist through browser refreshes and sessions
- **Comprehensive Tracking** - Track task, section, and project changes with detailed context
- **Notification Management** - Mark as read, delete individual notifications, or clear all
- **Clean Interface** - Minimal dropdown with scrollable content and dedicated modal view

### 📱 **Responsive Design**
- **Mobile-First** - Optimized for all screen sizes from mobile to desktop
- **Adaptive Layout** - Collapsible sidebar and responsive navigation
- **Touch-Friendly** - Optimized interactions for touch devices
- **Consistent Experience** - Seamless functionality across all breakpoints
- **Performance Optimized** - Smooth animations and efficient rendering

### 🎨 **Modern UI/UX**
- **Clean & Minimal** - Professional design with focus on usability
- **Dark/Light Mode** - System-aware theme switching with manual override
- **Consistent Design System** - Unified spacing, colors, and typography
- **Accessibility** - ARIA labels, keyboard navigation, and screen reader support
- **Smooth Animations** - Subtle transitions and micro-interactions

### 📈 **Analytics & Insights**
- **Productivity Metrics** - Track completion rates, streaks, and daily averages
- **Project Analytics** - Individual project performance and progress tracking
- **Time Analysis** - Average completion times and task aging insights
- **Visual Charts** - Interactive charts and graphs for data visualization
- **Achievement System** - Gamified productivity tracking with unlockable achievements

---

## 🛠️ Technology Stack

### **Frontend**
- **React 18.3.1** - Modern React with hooks and functional components
- **TypeScript 5.5.3** - Type-safe development with strict typing
- **Vite 5.4.1** - Fast build tool and development server
- **React Router 6.26.2** - Client-side routing with dynamic project pages

### **UI & Styling**
- **Tailwind CSS 3.4.11** - Utility-first CSS framework
- **shadcn/ui** - High-quality, accessible React components
- **Lucide React** - Beautiful SVG icons with consistent styling
- **Framer Motion** - Smooth animations and page transitions

### **State Management**
- **React Context API** - Global state management for tasks, projects, and UI
- **Local Storage** - Persistent data storage without backend requirements
- **Custom Hooks** - Reusable logic for notifications, analytics, and UI interactions

### **Development Tools**
- **ESLint** - Code linting with TypeScript support
- **PostCSS** - CSS processing with Autoprefixer
- **Vite SWC** - Fast compilation with SWC

### **Key Libraries**
- **@dnd-kit** - Modern drag-and-drop functionality
- **@tanstack/react-query** - Data fetching and caching
- **date-fns** - Date manipulation and formatting
- **Recharts** - Interactive charts for analytics
- **Sonner** - Toast notifications

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Git

### Installation
1. **Clone the repository**
```bash
git clone https://github.com/christianjeraldjutba/taskflow.git
cd taskflow
```

2. **Install dependencies**
```bash
npm install
```

3. **Start development server**
```bash
npm run dev
```

4. **Open in browser**
```
http://localhost:8080
```

### Build for Production
```bash
# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

---

## 📁 Project Structure
```
src/
├── components/          # React components
│   ├── ui/             # shadcn/ui components
│   ├── BoardView/      # Kanban board components
│   ├── ListView/       # List view components
│   ├── DragDrop/       # Drag and drop functionality
│   ├── Header/         # Header and navigation
│   ├── NotificationDropdown/ # Notification system
│   └── ...
├── pages/              # Page components
│   ├── TodayPage.tsx   # Today's tasks view
│   ├── InboxPage.tsx   # Inbox/unassigned tasks
│   ├── AllTasksPage.tsx # All tasks overview
│   ├── CompletedPage.tsx # Completed tasks
│   ├── AnalyticsPage.tsx # Analytics dashboard
│   └── ProjectPage.tsx # Dynamic project pages
├── contexts/           # React Context providers
│   ├── TaskContext.tsx # Task and project state
│   ├── NotificationContext.tsx # Notification system
│   ├── ThemeContext.tsx # Theme management
│   └── ConfirmationContext.tsx # Confirmation dialogs
├── hooks/              # Custom React hooks
│   ├── useTaskNotifications.ts # Notification logic
│   ├── useProductivityAnalytics.ts # Analytics calculations
│   ├── useAchievementSystem.ts # Achievement tracking
│   └── ...
├── utils/              # Utility functions
├── types/              # TypeScript type definitions
└── services/           # Service layer for data operations
```

---

## 🎨 Design System

### **Color Palette**
- **Primary**: Clean blue tones for interactive elements
- **Secondary**: Neutral grays for text and backgrounds
- **Accent**: Subtle highlights for status and priority indicators
- **Status**: Success (green), warning (yellow), error (red)

### **Typography**
- **Headings**: Inter font family with consistent weight hierarchy
- **Body**: System font stack for optimal performance and readability
- **UI Elements**: Consistent sizing with 8px/16px/24px spacing grid

### **Components**
- **Cards**: Elevated surfaces with subtle shadows and rounded corners
- **Buttons**: Multiple variants (primary, secondary, outline, ghost)
- **Forms**: Accessible inputs with validation states and clear labels
- **Navigation**: Collapsible sidebar with hover states and active indicators

---

## 📱 Responsive Breakpoints

### **Tailwind CSS Breakpoints**
- **Mobile**: < 640px (sm)
- **Tablet**: 640px - 768px (md)
- **Laptop**: 768px - 1024px (lg)
- **Desktop**: 1024px - 1280px (xl)
- **Large Desktop**: 1280px+ (2xl)

### **Mobile Features**
- Collapsible sidebar with overlay
- Touch-optimized drag and drop
- Responsive task cards and forms
- Optimized navigation patterns

---

## 🔒 Data & Privacy
> **Note**: All data handling is client-side only for this demonstration project.

### **Local Storage**
- **Task Data** - All tasks, projects, and sections stored locally
- **User Preferences** - Theme settings, view preferences, and UI state
- **Notifications** - Notification history and settings
- **Analytics** - Productivity metrics and achievement progress

### **No Backend Required**
- **Frontend-Only** - Complete functionality without server dependencies
- **Privacy-First** - All data remains on the user's device
- **Offline Capable** - Full functionality without internet connection
- **No Registration** - Immediate access without account creation

---

## 🚀 Deployment
The application is deployed on **Vercel** with automatic deployments from the main branch. Since this is a frontend-only application, no backend infrastructure or database setup is required.

**Live URL**: [https://taskflow-web-app.vercel.app/](https://taskflow-web-app.vercel.app/)

### Deploy Your Own
1. Fork this repository
2. Connect to Vercel (or your preferred static hosting)
3. Deploy with default settings (static site)
4. Optional: Add custom domain

> **Note**: This is a static frontend deployment. For a production task management application, you would typically integrate with backend services and databases.

---

## 🤝 Contributing
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License
This project is open source and available under the [MIT License](LICENSE).

---

## 👨‍💻 Author

**CJ Jutba**
- 🌐 **Portfolio**: [https://cjjutba.com/](https://cjjutba.com/)
- 💼 **LinkedIn**: [https://www.linkedin.com/in/cjjutba/](https://www.linkedin.com/in/cjjutba/)
- 🐙 **GitHub**: [https://github.com/cjjutba](https://github.com/cjjutba)
- 📧 **Email**: [hello@cjjutba.com](mailto:hello@cjjutba.com)

---

## 🙏 Acknowledgments
- **shadcn/ui** for the beautiful and accessible component library
- **Tailwind CSS** for the utility-first CSS framework
- **Lucide** for the comprehensive icon set
- **@dnd-kit** for the modern drag-and-drop functionality
- **Vercel** for seamless deployment and hosting

---
**Built with ❤️ for modern productivity workflows**
