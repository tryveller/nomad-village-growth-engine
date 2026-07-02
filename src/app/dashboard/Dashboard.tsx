import { BarChart3, Users, Send, MessageSquare } from "lucide-react";

export default function Dashboard() {
  const stats = [
    { label: "Total Leads", value: "0", icon: Users, color: "text-blue-500" },
    { label: "Emails Sent", value: "0", icon: Send, color: "text-emerald-500" },
    { label: "Replies", value: "0", icon: MessageSquare, color: "text-violet-500" },
    { label: "Reply Rate", value: "0%", icon: BarChart3, color: "text-amber-500" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Finding Nomad Villages</h2>
        <p className="text-sm text-muted-foreground">
          Discover and manage villages across India for Nomad Village outreach.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="rounded-lg border bg-card p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{label}</span>
              <Icon className={`h-5 w-5 ${color}`} />
            </div>
            <p className="mt-2 text-2xl font-bold">{value}</p>
          </div>
        ))}
      </div>
      <div className="rounded-lg border bg-card p-8 text-center">
        <p className="text-muted-foreground">
          Connect your data sources to populate the dashboard. Start by{" "}
          <a href="/leads" className="underline text-primary">importing leads</a>.
        </p>
      </div>
    </div>
  );
}