import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import DashboardLayout from "./components/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import Reminders from "./pages/Reminders";
import Notes from "./pages/Notes";
import Finance from "./pages/Finance";
import Goals from "./pages/Goals";
import JobApplications from "./pages/JobApplications";
import Memory from "./pages/Memory";
import Home from "./pages/Home";
import AIAssistant from "./pages/AIAssistant";
import NotFound from "./pages/NotFound";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/reminders" component={Reminders} />
      <Route path="/notes" component={Notes} />
      <Route path="/finance" component={Finance} />
      <Route path="/goals" component={Goals} />
      <Route path="/jobs" component={JobApplications} />
      <Route path={"\\"} component={Home} />
      <Route path={"/ai-assistant"} component={AIAssistant} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <DashboardLayout>
            <Router />
          </DashboardLayout>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
