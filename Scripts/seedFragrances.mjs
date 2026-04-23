import { createClient } from '@supabase/supabase-js'
import { FRAGRANCES } from '../data/mockData.js'

const supabaseUrl = process.env.VITE_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
})

const rows = FRAGRANCES.map((fragrance) => ({
  slug: fragrance.slug,
  brand: fragrance.brand,
  name: fragrance.name,
  concentration: fragrance.concentration,
  family: fragrance.family,
  vibe: fragrance.vibe,
  description: fragrance.description,
  top_notes: fragrance.topNotes,
  middle_notes: fragrance.middleNotes,
  base_notes: fragrance.baseNotes,
  accords: fragrance.accords,
  seasons: fragrance.seasons,
  longevity: fragrance.longevity,
  sillage: fragrance.sillage,
  ideal_for: fragrance.idealFor,
  community_score: fragrance.communityScore,
  blind_buy_risk: fragrance.blindBuyRisk,
  popularity: fragrance.popularity,
  featured_reason: fragrance.featuredReason,
}))

const { error, data } = await supabase
  .from('fragrances')
  .upsert(rows, { onConflict: 'slug' })
  .select('id, slug')

if (error) {
  console.error(error)
  process.exit(1)
}

console.log(`Seeded ${data.length} fragrances`)