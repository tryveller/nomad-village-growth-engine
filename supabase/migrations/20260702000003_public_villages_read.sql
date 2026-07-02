-- Allow public read access to villages table
create policy "public_read_villages" on villages
  for select using (true);