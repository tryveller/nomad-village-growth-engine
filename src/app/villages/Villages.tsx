import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { MapPin, Building2, FileText } from "lucide-react";
import { useState } from "react";

interface Village {
  id: string;
  state: string;
  district: string;
  name: string;
  profile: string | null;
}

export default function Villages() {
  const [selectedState, setSelectedState] = useState<string>("all");

  const { data: villages, isLoading } = useQuery({
    queryKey: ["villages"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("villages")
        .select("*")
        .order("state")
        .order("district")
        .order("name");
      if (error) throw error;
      return data as Village[];
    },
  });

  const states = villages
    ? [...new Set(villages.map((v) => v.state))].sort()
    : [];

  const filtered =
    selectedState === "all"
      ? villages
      : villages?.filter((v) => v.state === selectedState);

  const stateCounts = villages?.reduce(
    (acc, v) => {
      acc[v.state] = (acc[v.state] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Villages</h2>
        <p className="text-sm text-muted-foreground">
          {villages?.length || 0} villages discovered across {states.length} states/UTs
        </p>
      </div>

      {/* State filter pills */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedState("all")}
          className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
            selectedState === "all"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-accent"
          }`}
        >
          All ({villages?.length || 0})
        </button>
        {states.map((state) => (
          <button
            key={state}
            onClick={() => setSelectedState(state)}
            className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
              selectedState === state
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-accent"
            }`}
          >
            {state} ({stateCounts?.[state] || 0})
          </button>
        ))}
      </div>

      {/* Village grid */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse rounded-lg border bg-card p-5">
              <div className="h-4 w-3/4 rounded bg-muted" />
              <div className="mt-3 h-3 w-1/2 rounded bg-muted" />
              <div className="mt-2 h-3 w-full rounded bg-muted" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered?.map((village) => (
            <div
              key={village.id}
              className="group rounded-lg border bg-card p-5 transition-shadow hover:shadow-md"
            >
              <h3 className="font-semibold text-lg">{village.name}</h3>
              <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                <Building2 className="h-3.5 w-3.5" />
                <span>{village.district}</span>
              </div>
              <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" />
                <span>{village.state}</span>
              </div>
              {village.profile && (
                <div className="mt-3 flex items-start gap-2 text-sm text-muted-foreground">
                  <FileText className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  <p className="line-clamp-3">{village.profile}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {filtered?.length === 0 && !isLoading && (
        <div className="rounded-lg border bg-card p-8 text-center">
          <p className="text-muted-foreground">No villages found for this state.</p>
        </div>
      )}
    </div>
  );
}