import { BarChart3, Users, Send, MessageSquare, MapPin, PieChart, List, Clock, TrendingUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

interface Village {
  id: string;
  state: string;
  district: string;
  name: string;
  profile: string | null;
  tags: string[] | null;
  notes: string | null;
  updated_at: string;
  created_at: string;
}

interface VillageStats {
  totalVillages: number;
  villagesByState: Array<{ state: string; count: number }>;
  villagesByTag: Array<{ tag: string; count: number }>;
  villagesWithData: number; // villages with profile, tags, or notes
  recentVillages: Village[];
}

export default function Dashboard() {
  const { data: stats = null, isLoading, error } = useQuery({
    queryKey: ["dashboardStats"],
    queryFn: async () => {
      // Get all villages for aggregation
      const { data: allVillages, error: villagesError } = await supabase
        .from("villages")
        .select("*")
        .order("created_at", { ascending: false });

      if (villagesError) throw villagesError;

      const villages = allVillages || [];

      // Calculate total villages
      const totalVillages = villages.length;

      // Calculate villages by state
      const stateCounts: Record<string, number> = {};
      villages.forEach((v) => {
        stateCounts[v.state] = (stateCounts[v.state] || 0) + 1;
      });
      const villagesByState = Object.entries(stateCounts)
        .map(([state, count]) => ({ state, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5); // Top 5 states

      // Count villages by tag
      const tagCounts: Record<string, number> = {};
      villages.forEach((v) => {
        if (v.tags && v.tags.length > 0) {
          v.tags.forEach((tag) => {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1;
          });
        }
      });
      const villagesByTag = Object.entries(tagCounts)
        .map(([tag, count]) => ({ tag, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5); // Top 5 tags

      // Count villages with meaningful data (profile, tags, or notes)
      const villagesWithData = villages.filter(
        (v) =>
          (v.profile && v.profile.trim() !== "") ||
          (v.tags && v.tags.length > 0) ||
          (v.notes && v.notes.trim() !== "")
      ).length;

      // Get recent villages (last 5 added)
      const recentVillages = villages.slice(0, 5);

      return {
        totalVillages,
        villagesByState,
        villagesByTag,
        villagesWithData,
        recentVillages,
      };
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Finding Nomad Villages</h2>
          <p className="text-sm text-muted-foreground">
            Discover and manage villages across India for Nomad Village outreach.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-lg border bg-card p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Loading...</span>
                <div className="h-5 w-5 animate-pulse bg-muted"></div>
              </div>
              <p className="mt-2 text-2xl font-bold animate-pulse h-6 w-24 bg-muted rounded"></p>
            </div>
          ))}
        </div>
        <div className="rounded-lg border bg-card p-8 text-center">
          <p className="text-muted-foreground">
            Loading dashboard data...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    console.error("Dashboard error:", error);
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Finding Nomad Villages</h2>
          <p className="text-sm text-muted-foreground">
            Discover and manage villages across India for Nomad Village outreach.
          </p>
        </div>
        <div className="rounded-lg border bg-card p-8 text-center text-destructive">
          <p>Error loading dashboard data: {(error as Error).message}</p>
          <p className="mt-2">
            <button
              onClick={() => window.location.reload()}
              className="btn btn-sm btn-primary"
            >
              Retry
            </button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Finding Nomad Villages Dashboard</h2>
        <p className="text-sm text-muted-foreground">
          Overview of village discovery and outreach progress
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Total Villages</span>
            <MapPin className="h-5 w-5 text-blue-500" />
          </div>
          <p className="mt-2 text-3xl font-bold">{stats.totalVillages}</p>
        </div>

        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">With Complete Data</span>
            <MessageSquare className="h-5 w-5 text-emerald-500" />
          </div>
          <p className="mt-2 text-3xl font-bold">
            {stats.villagesWithData}/{stats.totalVillages}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {Math.round((stats.villagesWithData / Math.max(1, stats.totalVillages)) * 100)}%
            complete
          </p>
        </div>

        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Top State</span>
            <Users className="h-5 w-5 text-violet-500" />
          </div>
          <p className="mt-2 text-2xl font-bold">
            {stats.villagesByState[0]?.state || "N/A"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {stats.villagesByState[0]?.count || 0} villages
          </p>
        </div>

        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Most Common Tag</span>
            <PieChart className="h-5 w-5 text-amber-500" />
          </div>
          <p className="mt-2 text-2xl font-bold">
            {stats.villagesByTag[0]?.tag || "N/A"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {stats.villagesByTag[0]?.count || 0} villages
          </p>
        </div>
      </div>

      {/* Village Distribution */}
      <div className="grid gap-6">
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Villages by State</h3>
          </div>
          {stats.villagesByState.map((item, index) => (
            <div key={index} className="flex items-center justify-between py-2 border-t first:border-t-0">
              <div className="flex items-center gap-3">
                <div
                  className={`w-3 h-3 rounded-full ${
                    ["bg-blue-500", "bg-green-500", "bg-yellow-500", "bg-red-500", "bg-purple-500"][
                      index % 5
                    ]
                  }`}
                />
                <span className="font-medium">{item.state}</span>
              </div>
              <span className="text-right font-mono">{item.count}</span>
            </div>
          ))}
          {stats.villagesByState.length === 0 && (
            <p className="text-center text-muted-foreground py-4">No village data available</p>
          )}
        </div>

        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Villages by Category</h3>
          </div>
          {stats.villagesByTag.map((item, index) => (
            <div key={index} className="flex items-center justify-between py-2 border-t first:border-t-0">
              <div className="flex items-center gap-3">
                <div
                  className={`w-3 h-3 rounded-full ${
                    ["bg-pink-500", "bg-indigo-500", "bg-teal-500", "bg-orange-500", "bg-fuchsia-500"][
                      index % 5
                    ]
                  }`}
                />
                <span className="font-medium">{item.tag.replace(/_/g, " ")}</span>
              </div>
              <span className="text-right font-mono">{item.count}</span>
            </div>
          ))}
          {stats.villagesByTag.length === 0 && (
            <p className="text-center text-muted-foreground py-4">No tag data available</p>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="rounded-lg border bg-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Recently Added Villages</h3>
          <a href="/villages" className="text-sm text-muted-foreground hover:text-primary">
            View All Villages
          </a>
        </div>
        {stats.recentVillages.length > 0 ? (
          <div className="space-y-4">
            {stats.recentVillages.map((village) => (
              <div key={village.id} className="flex items-start gap-3 p-3 border rounded-md hover:bg-muted/50 transition-colors">
                <MapPin className="h-4 w-4 flex-shrink-0 text-primary/50" />
                <div className="flex-1">
                  <div className="flex justify-between">
                    <h4 className="font-medium">{village.name}</h4>
                    <span className="text-xs text-muted-foreground">
                      {new Date(village.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                      <span>{village.state}</span>
                    </div>
                    {village.district && (
                      <>
                        <span className="mx-1">/</span>
                        <span>{village.district}</span>
                      </>
                    )}
                  </div>
                  {village.tags && village.tags.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {village.tags.map((tag) => (
                        <span key={tag} className="rounded bg-primary/10 px-2 py-0.5 text-xs text-primary">
                          {tag.replace(/_/g, " ")}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-4">No recent activity</p>
        )}
      }
    );
}
}