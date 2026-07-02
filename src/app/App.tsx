import { Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import AppLayout from "@/components/shared/AppLayout";
import Dashboard from "@/app/dashboard/Dashboard";
import Leads from "@/app/leads/Leads";
import Pipeline from "@/app/pipeline/Pipeline";
import Outreach from "@/app/outreach/Outreach";
import Communications from "@/app/communications/Communications";
import Organizations from "@/app/organizations/Organizations";
import Settings from "@/app/settings/Settings";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: 1 },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/leads" element={<Leads />} />
          <Route path="/pipeline" element={<Pipeline />} />
          <Route path="/outreach" element={<Outreach />} />
          <Route path="/communications" element={<Communications />} />
          <Route path="/organizations" element={<Organizations />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Routes>
      <Toaster position="bottom-right" />
    </QueryClientProvider>
  );
}