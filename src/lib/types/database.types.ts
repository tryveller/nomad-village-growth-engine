// Supabase generated types — run `bun run db:types` after `supabase start`
// or link to cloud project with `supabase link --project-ref <ref>`
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: Record<string, unknown>;
    Views: Record<string, unknown>;
    Functions: Record<string, unknown>;
    Enums: Record<string, unknown>;
  };
}