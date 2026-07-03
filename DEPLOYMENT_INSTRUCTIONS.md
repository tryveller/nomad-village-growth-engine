# Deployment Instructions for Nomad Village Growth Engine - Village View Features

## Prerequisites
- Supabase CLI installed and configured
- Vercel CLI installed (or using git-based deployments)
- Access to the Nomad Village Growth Engine repositories
- Environment variables configured for both staging and production

## Step 1: Apply Database Migrations

### For Production:
```bash
# Link to production project
supabase link --project-ref fiwzknputkildsmdbsbf

# Apply migrations
supabase db push
```

### For Staging:
```bash
# Link to staging project
supabase link --project-ref qhmnymaskqzohdonjxdv

# Apply migrations
supabase db push
```

## Step 2: Deploy Application Code

### Option A: Git-based Deployment (Recommended)
Since the project is connected to Vercel via GitHub:

```bash
# Stage all changes
git add .

# Commit changes
git commit -m "feat: implement village view enhancements - tabular view, search, edit, notes, changelog"

# Push to trigger Vercel deployment
git push origin main  # or your production branch
```

Vercel will automatically detect the push and deploy to the connected environment.

### Option B: Manual Vercel CLI Deployment
```bash
# For production
vercel --prod --confirm

# For staging  
vercel
```

## Step 3: Verify Environment Variables

Ensure these variables are set in both your staging and production Vercel projects:

```
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
RESEND_API_KEY=your-resend-api-key
WHATSAPP_PHONE_NUMBER_ID=your-whatsapp-phone-id
WHATSAPP_ACCESS_TOKEN=your-whatsapp-access-token
```

## Step 4: Post-Deployment Verification

After deployment, verify these features work correctly:

### Grid View:
- [ ] Toggle between Grid and Table views
- [ ] Search bar filters villages by name
- [ ] State-based color coding visible on village cards
- [ ] Edit button opens modal with pre-filled data
- [ ] Delete button shows confirmation dialog
- [ ] Notes field visible in village cards when populated

### Table View:
- [ ] Sortable columns (click headers to sort)
- [ ] All data displayed correctly in table format
- [ ] Search still functional
- [ ] Edit/Delete actions work per row
- [ ] State-based row coloring applied

### Village Detail Modal:
- [ ] Notes section displays when notes exist
- [ ] Change log section shows tracking of modifications
- [ ] Loading states appear during data fetch
- [ ] Save button persists changes to database
- [ ] Cancel button discards changes
- [ ] Success/error messages display appropriately

### Database Verification:
You can verify the changes in Supabase Studio:
1. `villages` table should have a `notes` column
2. `village_changelog` table should exist with proper schema
3. Test data modifications should appear in the changelog

## Troubleshooting

### Common Issues:

1. **Migration Errors**: 
   - Ensure you're linked to the correct project (`supabase status`)
   - Check migration files exist in `supabase/migrations/`

2. **Build Failures**:
   - Check Vercel deployment logs for specific errors
   - Ensure all dependencies are installed (`bun install` or `npm install`)
   - Verify TypeScript compiles without errors (`npm run typecheck`)

3. **Runtime Errors**:
   - Check browser console for JavaScript errors
   - Verify Supabase connection in network tab
   - Ensure RLS policies allow the operations

4. **Feature Not Working**:
   - Hard refresh the page (Ctrl+Shift+R)
   - Check if feature flags or branch deployments are interfering
   - Verify the correct version is deployed (check Vercel deployment logs)

## Rollback Procedure

If issues arise after deployment:

### Using Vercel:
1. Go to your project in Vercel Dashboard
2. Navigate to Deployments tab
3. Find the previous working deployment
4. Click "..." → "Promote to Production" (or equivalent)

### Using Git:
```bash
# Revert the last commit
git revert HEAD
git push origin main  # This will trigger a redeploy
```

## Performance Considerations

1. **Search Performance**: Search uses indexed `name` column for efficient filtering
2. **Change Log**: Indexes on `village_id` and `changed_at` for fast queries
3. **Pagination**: Consider adding pagination to table view for very large datasets (>1000 records)
4. **Caching**: React Query automatically caches and refetches data appropriately

## Future Enhancements

1. **Advanced Search**: Add filtering by state, tags, etc.
2. **Bulk Operations**: Select multiple villages for batch actions
3. **Export Functionality**: Export village data to CSV/Excel
4. **Enhanced Validation**: Add form validation with error messages
5. **Undo/Redo**: Implement undo functionality for recent changes
6. **Analytics**: Add view/edit statistics for villages

---

**Deployment Complete!** The village view now includes all requested features: tabular form with search, prioritization/editing capabilities, state-based color coding, notes functionality, and comprehensive change tracking.