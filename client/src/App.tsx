import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ErrorBoundary } from "@/components/error-boundary";
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import AgentsPage from "@/pages/agents";
import ExecutionsPage from "@/pages/executions";
import ExecutionDetailsPage from "@/pages/execution-details";
import TemplatesPage from "@/pages/templates";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/agents" component={AgentsPage} />
      <Route path="/executions" component={ExecutionsPage} />
      <Route path="/executions/:id" component={ExecutionDetailsPage} />
      <Route path="/templates" component={TemplatesPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
