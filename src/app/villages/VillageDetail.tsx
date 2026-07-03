import { supabase } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";
import { Loader2, X, MapPin, Building2, Home, Phone, Mail, Globe, NotePen, Clock } from "lucide-react";

interface VillageDetailProps {
  village: {
    id: string;
    name: string;
    state: string;
    district: string;
    profile: string | null;
    notes: string | null;
  };
  onClose: () => void;
}

interface DistrictContact {
  id: string;
  state: string;
  district: string;
  dm_email: string | null;
  tourism_email: string | null;
  tourism_phone: string | null;
  tourism_website: string | null;
}

export default function VillageDetail({ village, onClose }: VillageDetailProps) {
  const { data: homestays, isLoading: hsLoading } = useQuery({
    queryKey: ["homestays", village.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("homestays")
        .select("*")
        .eq("village_id", village.id)
        .order("name");
      return data || [];
    },
  });

  const { data: districtContact, isLoading: dcLoading } = useQuery({
    queryKey: ["district_contact", village.state, village.district],
    queryFn: async () => {
      const { data } = await supabase
        .from("district_contacts")
        .select("*")
        .eq("state", village.state)
        .eq("district", village.district)
        .maybeSingle();
      return data as DistrictContact | null;
    },
  });

  // Fetch change log for this village
  const { data: changeLog = [], isLoading: clLoading } = useQuery({
    queryKey: ["village_changelog", village.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("village_changelog")
        .select("*")
        .eq("village_id", village.id)
        .order("changed_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4 pt-16"
         onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="relative w-full max-w-2xl rounded-xl border bg-card shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-start justify-between border-b bg-card p-6 rounded-t-xl">
          <div>
            <h2 className="text-2xl font-bold">{village.name}</h2>
            <div className="mt-1 flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Building2 className="h-3.5 w-3.5" /> {village.district}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" /> {village.state}
              </span>
            </div>
            {village.profile && (
              <p className="mt-2 text-sm text-muted-foreground">{village.profile}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 hover:bg-muted transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-6 p-6">
          {/* Homestays Section */}
          <div>
            <h3 className="flex items-center gap-2 text-lg font-semibold">
              <Home className="h-5 w-5 text-emerald-600" />
              Homestays
              {!hsLoading && homestays && (
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-sm text-emerald-800">
                  {homestays.length}
                </span>
              )}
            </h3>
            {hsLoading ? (
              <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading...
              </div>
            ) : homestays && homestays.length > 0 ? (
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {homestays.map((hs: any) => (
                  <div key={hs.id} className="rounded-lg border bg-muted/50 px-3 py-2 text-sm">
                    <span className="font-medium">{hs.name}</span>
                    {hs.type && (
                      <span className="ml-2 rounded bg-primary/10 px-1.5 py-0.5 text-xs text-primary">
                        {hs.type.replace(/_/g, " ")}
                      </span>
                    )}
                    {hs.contact && (
                      <div className="mt-0.5 text-xs text-muted-foreground">{hs.contact}</div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-sm text-muted-foreground italic">
                Homestay listings coming soon. Check back later.
              </p>
            )}
          </div>

          {/* District Contact Section */}
          <div>
            <h3 className="flex items-center gap-2 text-lg font-semibold">
              <Building2 className="h-5 w-5 text-blue-600" />
              District Administration — {village.district}
            </h3>
            {dcLoading ? (
              <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading...
              </div>
            ) : districtContact ? (
              <div className="mt-3 space-y-2">
                {districtContact.tourism_email && (
                  <a
                    href={`mailto:${districtContact.tourism_email}`}
                    className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors hover:bg-muted/50"
                  >
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Tourism Office:</span>
                    <span className="text-primary">{districtContact.tourism_email}</span>
                  </a>
                )}
                {districtContact.tourism_phone && (
                  <div className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Tourism Phone:</span>
                    <span>{districtContact.tourism_phone}</span>
                  </div>
                )}
                {districtContact.dm_email && (
                  <a
                    href={`mailto:${districtContact.dm_email}`}
                    className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors hover:bg-muted/50"
                  >
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">District Magistrate:</span>
                    <span className="text-primary">{districtContact.dm_email}</span>
                  </a>
                )}
                {districtContact.tourism_website && (
                  <a
                    href={districtContact.tourism_website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors hover:bg-muted/50"
                  >
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <span className="text-primary">{districtContact.tourism_website}</span>
                  </a>
                )}
              </div>
            ) : (
              <p className="mt-3 text-sm text-muted-foreground italic">
                District contact info coming soon.
              </p>
            )}
          </div>

          {/* Notes Section */}
          {village.notes && (
            <div>
              <h3 className="flex items-center gap-2 text-lg font-semibold">
                <NotePen className="h-5 w-5 text-blue-600" />
                Notes
              </h3>
              <div className="mt-3 space-y-2">
                <p className="whitespace-pre-line">{village.notes}</p>
              </div>
            </div>
          )}

          {/* Change Log Section */}
          <div>
            <h3 className="flex items-center gap-2 text-lg font-semibold">
              <Clock className="h-5 w-5 text-blue-600" />
              Change Log
            </h3>
            {clLoading ? (
              <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading...
              </div>
            ) : changeLog.length > 0 ? (
              <div className="mt-3 space-y-2">
                {changeLog.map((change, index) => (
                  <div key={index} className="border-b pb-2 last:border-b-0">
                    <div className="flex items-start gap-2">
                      <Clock className="h-3 w-3 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="font-medium text-sm">Changed {change.field_changed}</p>
                        <p className="text-sm text-muted-foreground">
                          {change.old_value === null ? '(empty)' : change.old_value} &rarr; 
                          {change.new_value === null ? '(empty)' : change.new_value}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(change.changed_at).toLocaleString()} by {change.changed_by}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-sm text-muted-foreground italic">
                No change history available.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}