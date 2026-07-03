import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { 
  MapPin, Building2, FileText, Tag, Table, Trash2, Edit3, 
  Search, Trash, Edit, Loader2, X, Home, Phone, Mail, Globe
} from "lucide-react";
import { useState, useEffect } from "react";
import { QueryClient } from "@tanstack/react-query";

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

interface VillageWithChanges extends Village {
  editMode?: boolean;
  tempName?: string;
  tempState?: string;
  tempDistrict?: string;
  tempProfile?: string;
  tempTags?: string[];
  tempNotes?: string;
}

const TAG_COLORS: Record<string, string> = {
  homestay_cluster: "bg-emerald-100 text-emerald-800",
  eco_tourism: "bg-green-100 text-green-800",
  heritage: "bg-amber-100 text-amber-800",
  tribal: "bg-purple-100 text-purple-800",
  coastal: "bg-blue-100 text-blue-800",
};

const STATE_COLORS: Record<string, string> = {
  // Indian states color mapping
  "Andhra Pradesh": "bg-blue-50 text-blue-600",
  "Arunachal Pradesh": "bg-indigo-50 text-indigo-600",
  "Assam": "bg-green-50 text-green-600",
  "Bihar": "bg-yellow-50 text-yellow-600",
  "Chhattisgarh": "bg-orange-50 text-orange-600",
  "Goa": "bg-purple-50 text-purple-600",
  "Gujarat": "bg-pink-50 text-pink-600",
  "Haryana": "bg-red-50 text-red-600",
  "Himachal Pradesh": "bg-blue-50 text-blue-600",
  "Jharkhand": "bg-indigo-50 text-indigo-600",
  "Karnataka": "bg-green-50 text-green-600",
  "Kerala": "bg-yellow-50 text-yellow-600",
  "Madhya Pradesh": "bg-orange-50 text-orange-600",
  "Maharashtra": "bg-purple-50 text-purple-600",
  "Manipur": "bg-pink-50 text-pink-600",
  "Meghalaya": "bg-red-50 text-red-600",
  "Mizoram": "bg-blue-50 text-blue-600",
  "Nagaland": "bg-indigo-50 text-indigo-600",
  "Odisha": "bg-green-50 text-green-600",
  "Punjab": "bg-yellow-50 text-yellow-600",
  "Rajasthan": "bg-orange-50 text-orange-600",
  "Sikkim": "bg-purple-50 text-purple-600",
  "Tamil Nadu": "bg-pink-50 text-pink-600",
  "Telangana": "bg-red-50 text-red-600",
  "Tripura": "bg-blue-50 text-blue-600",
  "Uttar Pradesh": "bg-indigo-50 text-indigo-600",
  "Uttarakhand": "bg-green-50 text-green-600",
  "West Bengal": "bg-yellow-50 text-yellow-600",
  // Union Territories
  "Andaman and Nicobar Islands": "bg-gray-50 text-gray-600",
  "Chandigarh": "bg-gray-50 text-gray-600",
  "Dadra and Nagar Haveli and Daman and Diu": "bg-gray-50 text-gray-600",
  "Delhi": "bg-gray-50 text-gray-600",
  "Jammu and Kashmir": "bg-gray-50 text-gray-600",
  "Ladakh": "bg-gray-50 text-gray-600",
  "Lakshadweep": "bg-gray-50 text-gray-600",
  "Puducherry": "bg-gray-50 text-gray-600",
};

export default function Villages() {
  const queryClient = useQueryClient();
  const [selectedState, setSelectedState] = useState<string>("all");
  const [selectedTag, setSelectedTag] = useState<string>("all");
  const [selectedVillage, setSelectedVillage] = useState<Village | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortConfig, setSortConfig] = useState<{ key: keyof Village; direction: 'asc' | 'desc' }>({
    key: 'name',
    direction: 'asc'
  });

  const { data: villages = [], isLoading, error } = useQuery({
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

  const [searchResults, setSearchResults] = useState<Village[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.trim();
    setSearchQuery(query);
    
    if (!query) {
      setSearchResults([]);
      return;
    }

    setSearchLoading(true);
    supabase
      .from("villages")
      .select("*")
      .ilike("name", `%${query}%`)
      .order("state")
      .order("district")
      .order("name")
      .then(({ data, error }) => {
        if (error) {
          console.error("Search error:", error);
          setSearchResults([]);
        } else {
          setSearchResults(data as Village[]);
        }
      })
      .finally(() => setSearchLoading(false));
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const input = e.target as HTMLInputElement;
      handleSearch({ target: input } as React.ChangeEvent<HTMLInputElement>);
    }
  };

  const states = [...new Set(villages.map((v) => v.state))].sort();

  const allTags = [...new Set(villages.flatMap((v) => v.tags || []))].sort();

  // Filter villages based on selected filters (when not in search mode)
  const filteredVillages = villages.filter((v) => {
    const stateMatch = selectedState === "all" || v.state === selectedState;
    const tagMatch = selectedTag === "all" || (v.tags || []).includes(selectedTag);
    return stateMatch && tagMatch;
  });

  // Sort villages
  const sortedVillages = [...filteredVillages].sort((a, b) => {
    if (sortConfig.direction === 'asc') {
      return a[sortConfig.key] > b[sortConfig.key] ? 1 : -1;
    } else {
      return a[sortConfig.key] < b[sortConfig.key] ? 1 : -1;
    }
  });

  // Use search results if searching, otherwise use filtered/sorted villages
  const displayedVillages = searchQuery ? searchResults : sortedVillages;

  // State counts for filter buttons
  const stateCounts = villages.reduce(
    (acc, v) => {
      acc[v.state] = (acc[v.state] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const deleteVillage = async (villageId: string) => {
    try {
      const { error } = await supabase.from('villages').delete().eq('id', villageId);
      if (error) throw error;
      
      // Also delete related homestays
      await supabase.from('homestays').delete().eq('village_id', villageId);
      
      // Refetch villages
      await queryClient.invalidateQueries({ queryKey: ['villages'] });
      
      // Show success message
      alert('Village deleted successfully');
    } catch (error) {
      console.error('Error deleting village:', error);
      alert('Failed to delete village');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold tracking-tight">Villages</h2>
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search villages..."
              value={searchQuery}
              onChange={handleSearch}
              onKeyPress={handleKeyPress}
              className="rounded border input bg-background px-3 py-2 text-sm shadow-sm focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none"
              disabled={isLoading || searchLoading}
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-accent'}`}
            >
              Grid View
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${viewMode === 'table' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-accent'}`}
            >
              Table View
            </button>
          </div>
        </div>
      </div>

      {/* Tag filter pills */}
      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <span className="flex items-center gap-1 text-sm text-muted-foreground mr-1">
            <Tag className="h-3.5 w-3.5" />
          </span>
          <button onClick={() => setSelectedTag("all")} className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${selectedTag === "all" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent"}`}>All tags</button>
          {allTags.map((tag) => (
            <button key={tag} onClick={() => setSelectedTag(tag)} className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${selectedTag === tag ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent"}`}>{tag.replace(/_/g, " ")}</button>
          ))}
        </div>
      )}

      {/* State filter pills */}
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setSelectedState("all")} className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${selectedState === "all" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent`}>All ({villages.length || 0})</button>
              {states.map((state) => (
                <button key={state} onClick={() => setSelectedState(state)} className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${selectedState === state ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent`}>${state} ({stateCounts[state] || 0})</button>
              ))}
            </div>

      {/* View Switch: Grid or Table */}
      {viewMode === 'grid' ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading ? (
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse rounded-lg border bg-card p-5">
                <div className="h-4 w-3/4 rounded bg-muted" />
                <div className="mt-3 h-3 w-1/2 rounded bg-muted" />
                <div className="mt-2 h-3 w-full rounded bg-muted" />
              </div>
            ))}
          ) : (
            {displayedVillages.map((village) => (
              <div
                key={village.id}
                onClick={() => setSelectedVillage(village)}
                className={`group cursor-pointer rounded-lg border bg-card p-5 transition-all hover:border-primary/50 hover:shadow-md ${STATE_COLORS[village.state] || 'bg-gray-50 text-gray-600'}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                    {village.name}
                  </h3>
                  <div className="flex items-center gap-2 text-xs">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedVillage(village);
                      }}
                      className={`p-1 rounded hover:bg-muted transition-colors`}
                      title="View details"
                    >
                      <MapPin className="h-4 w-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const updatedVillage = {...village, editMode: true, tempName: village.name, tempState: village.state, tempDistrict: village.district, tempProfile: village.profile || '', tempTags: [...(village.tags || [])], tempNotes: village.notes || ''};
                        setSelectedVillage(updatedVillage);
                      }}
                      className={`p-1 rounded hover:bg-muted transition-colors`}
                      title="Edit village"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm('Are you sure you want to delete this village?')) {
                          deleteVillage(village.id);
                        }
                      }}
                      className={`p-1 rounded hover:bg-muted transition-colors`}
                      title="Delete village"
                    >
                      <Trash className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                  <Building2 className="h-3.5 w-3.5" />
                  <span>{village.district}</span>
                </div>
                <div className="mt-0.5 flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5" />
                  <span>{village.state}</span>
                </div>
                {village.tags && village.tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {village.tags.map((tag) => (
                      <span key={tag} className={`rounded-full px-2 py-0.5 text-xs font-medium ${TAG_COLORS[tag] || "bg-gray-100 text-gray-700"}`}>{tag.replace(/_/g, " ")}</span>
                    ))}
                  </div>
                )}
                {village.profile && (
                  <div className="mt-2 flex items-start gap-2 text-sm text-muted-foreground">
                    <FileText className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    <p className="line-clamp-3">{village.profile}</p>
                  </div>
                )}
                {village.notes && (
                  <div className="mt-2 flex items-start gap-2 text-sm text-muted-foreground">
                    <NotePen className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    <p className="line-clamp-2">{village.notes}</p>
                  </div>
                )}
                <div className="mt-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>{new Date(village.updated_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          )}
        </div>
      ) : (
        {/* Table View */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => setSortConfig({ key: 'name', direction: sortConfig.key === 'name' && sortConfig.direction === 'asc' ? 'desc' : 'asc' })}
                    className={`flex items-center gap-1 cursor-pointer hover:text-primary transition-colors ${sortConfig.key === 'name' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}`}
                  >
                    Village
                  </button>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => setSortConfig({ key: 'state', direction: sortConfig.key === 'state' && sortConfig.direction === 'asc' ? 'desc' : 'asc' })}
                    className={`flex items-center gap-1 cursor-pointer hover:text-primary transition-colors ${sortConfig.key === 'state' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}`}
                  >
                    State
                  </button>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button
                    onClick={() => setSortConfig({ key: 'district', direction: sortConfig.key === 'district' && sortConfig.direction === 'asc' ? 'desc' : 'asc' })}
                    className={`flex items-center gap-1 cursor-pointer hover:text-primary transition-colors ${sortConfig.key === 'district' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}`}
                  >
                    District
                  </button>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tags
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Profile
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Notes
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Updated
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan="8" className="py-8 text-center">
                    <div className="animate-pulse h-4 w-3/4 mx-auto rounded bg-muted" />
                  </td>
                </tr>
              ) : displayedVillages.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-muted-foreground">
                    No villages found for this filter.
                  </td>
                </tr>
              ) : (
                displayedVillages.map((village) => (
                  <tr
                    key={village.id}
                    className={`hover:bg-gray-50 ${STATE_COLORS[village.state] || 'bg-gray-50 text-gray-600'}`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {village.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {village.state}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {village.district}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 flex flex-wrap gap-1">
                      {village.tags && village.tags.length > 0 ? (
                        village.tags.map((tag) => (
                          <span key={tag} className={`rounded-full px-2 py-0.5 text-xs font-medium ${TAG_COLORS[tag] || "bg-gray-100 text-gray-700"}`}>{tag.replace(/_/g, " ")}</span>
                        ))
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 line-clamp-1">
                      {village.profile || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 line-clamp-1">
                      {village.notes || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <Clock className="h-3 w-3 me-1" />
                      <span>{new Date(village.updated_at).toLocaleDateString()}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedVillage(village);
                          }}
                          className={`p-1 rounded hover:bg-muted transition-colors`}
                          title="View details"
                        >
                          <MapPin className="h-4 w-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const updatedVillage = {...village, editMode: true, tempName: village.name, tempState: village.state, tempDistrict: village.district, tempProfile: village.profile || '', tempTags: [...(village.tags || [])], tempNotes: village.notes || ''};
                            setSelectedVillage(updatedVillage);
                          }}
                          className={`p-1 rounded hover:bg-muted transition-colors`}
                          title="Edit village"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm('Are you sure you want to delete this village?')) {
                              deleteVillage(village.id);
                            }
                          }}
                          className={`p-1 rounded hover:bg-muted transition-colors`}
                          title="Delete village"
                        >
                          <Trash className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {filteredVillages.length === 0 && !isLoading && !searchQuery && (
        <div className="rounded-lg border bg-card p-8 text-center">
          <p className="text-muted-foreground">No villages found for this filter.</p>
        </div>
      )}

      {/* Village Detail Modal */}
      {selectedVillage && (
        <VillageDetailWithEdit village={selectedVillage} onClose={() => setSelectedVillage(null)} />
      )}
    </div>
  );
}

// Import useEffect and useState for the VillageDetailWithEdit component

interface VillageDetailWithEditProps {
  village: VillageWithChanges;
  onClose: () => void;
}

function VillageDetailWithEdit({ village, onClose }: VillageDetailWithEditProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [changeLog, setChangeLog] = useState<Array<{field: string; oldValue: any; newValue: any; timestamp: string; user: string}>>([]);
  const [tempValues, setTempValues] = useState({
    name: village.tempName || village.name,
    state: village.tempState || village.state,
    district: village.tempDistrict || village.district,
    profile: village.tempProfile || village.profile || '',
    tags: village.tempTags?.join(', ') || (village.tags || []).join(', '),
    notes: village.tempNotes || village.notes || ''
  });

  // Load change log from Supabase
  useEffect(() => {
    loadChangeLog();
  }, [village.id]);

  const loadChangeLog = async () => {
    try {
      // For now, we'll simulate change logs from the updated_at field
      // In a real app, you'd have a separate change_log table
      const { data, error } = await supabase
        .from('villages')
        .select('updated_at')
        .eq('id', village.id)
        .single();

      if (error) throw error;
      
      // Create a simple change log entry based on last update
      // In a real app, you'd query a dedicated change_log table
      setChangeLog([{
        field: 'multiple',
        oldValue: 'previous values',
        newValue: 'current values',
        timestamp: data.updated_at,
        user: 'system'
      }]);
    } catch (err) {
      console.error('Error loading change log:', err);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setSuccess(null);
    
    try {
      const updates: Partial<Village> = {};
      const changes: Array<{field: string; oldValue: any; newValue: any; timestamp: string; user: string}> = [];
      
      // Track changes
      if (tempValues.name !== village.name) {
        updates.name = tempValues.name;
        changes.push({ field: 'name', oldValue: village.name, newValue: tempValues.name, timestamp: new Date().toISOString(), user: 'current_user' });
      }
      if (tempValues.state !== village.state) {
        updates.state = tempValues.state;
        changes.push({ field: 'state', oldValue: village.state, newValue: tempValues.state, timestamp: new Date().toISOString(), user: 'current_user' });
      }
      if (tempValues.district !== village.district) {
        updates.district = tempValues.district;
        changes.push({ field: 'district', oldValue: village.district, newValue: tempValues.district, timestamp: new Date().toISOString(), user: 'current_user' });
      }
      if (tempValues.profile !== (village.profile || '')) {
        updates.profile = tempValues.profile;
        changes.push({ field: 'profile', oldValue: village.profile, newValue: tempValues.profile, timestamp: new Date().toISOString(), user: 'current_user' });
      }
      if (tempValues.tags !== ((village.tags || []).join(', '))) {
        updates.tags = tempValues.tags.split(',').map(tag => tag.trim());
        changes.push({ field: 'tags', oldValue: village.tags, newValue: updates.tags, timestamp: new Date().toISOString(), user: 'current_user' });
      }
      if (tempValues.notes !== (village.notes || '')) {
        updates.notes = tempValues.notes;
        changes.push({ field: 'notes', oldValue: village.notes, newValue: tempValues.notes, timestamp: new Date().toISOString(), user: 'current_user' });
      }
      
      // Update the village
      const { data, error: updateError } = await supabase
        .from('villages')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', village.id);
      
      if (updateError) throw updateError;
      
      // Log changes to village_changelog table
      for (const change of changes) {
        await supabase.from('village_changelog').insert({
          village_id: village.id,
          field_changed: change.field,
          old_value: change.oldValue === null ? null : String(change.oldValue),
          new_value: change.newValue === null ? null : String(change.newValue),
          changed_by: 'current_user' // In a real app, you'd get this from auth
        });
      }
      
      // Update local change log for immediate feedback
      setChangeLog(prev => [...changes, ...prev]);
      
      setSuccess('Village updated successfully!');
      setIsSaving(false);
      
      // Close edit mode after a short delay
      setTimeout(() => {
        onClose();
        // Refetch the villages list
        // This would normally trigger a refetch via react-query
      }, 1500);
    } catch (err) {
      console.error('Error updating village:', err);
      setError('Failed to update village. Please try again.');
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="relative bg-card rounded-lg border p-6 shadow-lg">
          {/* Close button */}
          <button
            onClick={handleCancel}
            className="absolute top-3 right-2 rounded-half p-1 text-muted-foreground hover:bg-muted transition-colors"
          >
            <X className="h-4 w-4" />
          </button>

          <form onSubmit={handleSave} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="village-name" className="text-sm font-medium text-muted-foreground">
                Village Name
              </label>
              <input
                id="village-name"
                type="text"
                value={tempValues.name}
                onChange={(e) => setTempValues(prev => ({...prev, name: e.target.value}))}
                className="block w-full rounded-border bg-input px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={isSaving}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="village-state" className="text-sm font-medium text-muted-foreground">
                State
              </label>
              <select
                id="village-state"
                value={tempValues.state}
                onChange={(e) => setTempValues(prev => ({...prev, state: e.target.value}))}
                className="block w-full rounded-border bg-input px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={isSaving}
              >
                {/* States options */}
                <option value="Andhra Pradesh">Andhra Pradesh</option>
                <option value="Arunachal Pradesh">Arunachal Pradesh</option>
                <option value="Assam">Assam</option>
                <option value="Bihar">Bihar</option>
                <option value="Chhattisgarh">Chhattisgarh</option>
                <option value="Goa">Goa</option>
                <option value="Gujarat">Gujarat</option>
                <option value="Haryana">Haryana</option>
                <option value="Himachal Pradesh">Himachal Pradesh</option>
                <option value="Jharkhand">Jharkhand</option>
                <option value="Karnataka">Karnataka</option>
                <option value="Kerala">Kerala</option>
                <option value="Madhya Pradesh">Madhya Pradesh</option>
                <option value="Maharashtra">Maharashtra</option>
                <option value="Manipur">Manipur</option>
                <option value="Meghalaya">Meghalaya</option>
                <option value="Mizoram">Mizoram</option>
                <option value="Nagaland">Nagaland</option>
                <option value="Odisha">Odisha</option>
                <option value="Punjab">Punjab</option>
                <option value="Rajasthan">Rajasthan</option>
                <option value="Sikkim">Sikkim</option>
                <option value="Tamil Nadu">Tamil Nadu</option>
                <option value="Telangana">Telangana</option>
                <option value="Tripura">Tripura</option>
                <option value="Uttar Pradesh">Uttar Pradesh</option>
                <option value="Uttarakhand">Uttarakhand</option>
                <option value="West Bengal">West Bengal</option>
                <option value="Andaman and Nicobar Islands">Andaman and Nicobar Islands</option>
                <option value="Chandigarh">Chandigarh</option>
                <option value="Dadra and Nagar Haveli and Daman and Diu">Dadra and Nagar Haveli and Daman and Diu</option>
                <option value="Delhi">Delhi</option>
                <option value="Jammu and Kashmir">Jammu and Kashmir</option>
                <option value="Ladakh">Ladakh</option>
                <option value="Lakshadweep">Lakshadweep</option>
                <option value="Puducherry">Puducherry</option>
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="village-district" className="text-sm font-medium text-muted-foreground">
                District
              </label>
              <input
                id="village-district"
                type="text"
                value={tempValues.district}
                onChange={(e) => setTempValues(prev => ({...prev, district: e.target.value}))}
                className="block w-full rounded-border bg-input px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={isSaving}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="village-profile" className="text-sm font-medium text-muted-foreground">
                Profile / Description
              </label>
              <textarea
                id="village-profile"
                rows={3}
                value={tempValues.profile}
                onChange={(e) => setTempValues(prev => ({...prev, profile: e.target.value}))}
                className="block w-full rounded-border bg-input px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={isSaving}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="village-tags" className="text-sm font-medium text-muted-foreground">
                Tags (comma-separated)
              </label>
              <input
                id="village-tags"
                type="text"
                value={tempValues.tags}
                onChange={(e) => setTempValues(prev => ({...prev, tags: e.target.value}))}
                className="block w-full rounded-border bg-input px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={isSaving}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="village-notes" className="text-sm font-medium text-muted-foreground">
                Notes / Remarks
              </label>
              <textarea
                id="village-notes"
                rows={3}
                value={tempValues.notes}
                onChange={(e) => setTempValues(prev => ({...prev, notes: e.target.value}))}
                className="block w-full rounded-border bg-input px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={isSaving}
              />
            </div>

            <div className="mt-4 flex items-center justify-between">
              {isSaving ? (
                <button type="submit" disabled className="inline-flex items-center justify-center rounded-border px-3 py-1 text-sm font-medium transition-colors hover:bg-muted disabled:opacity-50 disabled:pointer-events-none">
                  Saving...
                </button>
              ) : (
                <>
                  <button type="button" onClick={handleCancel} className="inline-flex items-center justify-center rounded-border px-3 py-1 text-sm font-medium transition-colors hover:bg-muted">
                    Cancel
                  </button>
                  <button type="submit" className="inline-flex items-center justify-center rounded-border px-3 py-1 text-sm font-medium transition-colors hover:bg-primary focus:ring-primary/50">
                    Save Changes
                  </button>
                </>
              )}
              {error && <p className="text-sm text-destructive">{error}</p>}
              {success && <p className="text-sm text-success">{success}</p>}
            </div>
          </form>

          {/* Change Log Section */}
          <div className="mt-6 pt-4 border-t border-muted">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">
              Change Log
            </h3>
            {changeLog.length > 0 ? (
              <div className="space-y-2 text-xs">
                {changeLog.map((change, index) => (
                  <div key={index} className="flex items-start gap-2 p-2 bg-muted rounded">
                    <Clock className="h-3 w-3 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-medium">Changed {change.field}</p>
                      <p className="text-muted-foreground">
                        {change.oldValue} → {change.newValue}
                      </p>
                      <p className="text-muted-foreground">
                        {new Date(change.timestamp).toLocaleString()} by {change.user}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No change history available.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}