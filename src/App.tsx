import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { TaskProvider } from "./contexts/TaskContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { ConfirmationProvider } from "./contexts/ConfirmationContext";

import Layout from "./components/Layout";
import { PageTransition } from "./components/ui/page-transition";

// Import page components
import TodayPage from "./pages/TodayPage";
import InboxPage from "./pages/InboxPage";
import AllTasksPage from "./pages/AllTasksPage";
import CompletedPage from "./pages/CompletedPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import ProjectPage from "./pages/ProjectPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ThemeProvider>
          <NotificationProvider>
            <TaskProvider>
              <ConfirmationProvider>
                <Layout>
                <PageTransition>
                  <Routes>
                    <Route path="/" element={<TodayPage />} />
                    <Route path="/inbox" element={<InboxPage />} />
                    <Route path="/all-tasks" element={<AllTasksPage />} />
                    <Route path="/completed" element={<CompletedPage />} />
                    <Route path="/analytics" element={<AnalyticsPage />} />
                    <Route path="/project/:slug" element={<ProjectPage />} />
                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </PageTransition>
                </Layout>
              </ConfirmationProvider>
            </TaskProvider>
          </NotificationProvider>
        </ThemeProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
