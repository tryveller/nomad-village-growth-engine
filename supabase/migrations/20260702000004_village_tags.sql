-- Add tags column to villages table for categorization (homestay_cluster, eco_tourism, heritage, etc.)
alter table villages add column if not exists tags text[] default '{}';

-- Add index for tag-based filtering
create index if not exists idx_villages_tags on villages using gin(tags);