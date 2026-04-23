import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { supabase } from '../src/lib/supabase'

const ScentSwapContext = createContext(null)

function slugify(value) {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function parseList(value, fallback = []) {
  if (Array.isArray(value)) {
    const cleaned = value.map((item) => String(item).trim().toLowerCase()).filter(Boolean)
    return cleaned.length ? [...new Set(cleaned)] : fallback
  }

  const cleaned = String(value ?? '')
    .split(',')
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean)

  return cleaned.length ? [...new Set(cleaned)] : fallback
}

function formatDateTime(value) {
  if (!value) {
    return ''
  }

  try {
    return new Date(value).toLocaleString()
  } catch {
    return value
  }
}

function mapProfileRow(row, email = null) {
  if (!row) {
    return null
  }

  return {
    id: row.id,
    name: row.display_name || email?.split('@')[0] || 'Collector',
    email,
    city: row.city || 'Unknown',
    distance: Number(row.distance_miles ?? 0),
    verified: Boolean(row.verified),
    rating: Number(row.rating ?? 0),
    responseTime: row.response_time || '~1 day',
    bio: row.bio || '',
    meetupSpot: row.meetup_spot || 'TBD',
    createdAt: row.created_at,
  }
}

function mapFragranceRow(row) {
  return {
    id: row.id,
    slug: row.slug,
    brand: row.brand,
    name: row.name,
    concentration: row.concentration,
    family: row.family,
    vibe: row.vibe,
    description: row.description,
    topNotes: row.top_notes ?? [],
    middleNotes: row.middle_notes ?? [],
    baseNotes: row.base_notes ?? [],
    accords: row.accords ?? [],
    seasons: row.seasons ?? [],
    longevity: row.longevity,
    sillage: row.sillage,
    idealFor: row.ideal_for ?? [],
    communityScore: row.community_score,
    blindBuyRisk: row.blind_buy_risk,
    popularity: row.popularity,
    featuredReason: row.featured_reason ?? '',
    ownerCount: 0,
    createdBy: row.created_by,
    createdAt: row.created_at,
  }
}

function mapCollectionRow(row) {
  return {
    id: row.id,
    userId: row.user_id,
    fragranceId: row.fragrance_id,
    bottleMl: row.bottle_ml,
    condition: row.condition,
    sampleFormat: row.sample_format,
    shareEnabled: row.share_enabled,
    createdAt: row.created_at,
  }
}

function mapRequestRow(row) {
  return {
    id: row.id,
    fragranceId: row.fragrance_id,
    ownerId: row.owner_user_id,
    requesterId: row.requester_user_id,
    status: row.status,
    createdAt: formatDateTime(row.created_at),
    message: row.message,
  }
}

function uniqueSlug(base, taken) {
  let candidate = base
  let index = 2

  while (taken.has(candidate)) {
    candidate = `${base}-${index}`
    index += 1
  }

  return candidate
}

export function ScentSwapProvider({ children }) {
  const [session, setSession] = useState(null)
  const [currentUser, setCurrentUser] = useState(null)
  const [profiles, setProfiles] = useState([])
  const [fragrances, setFragrances] = useState([])
  const [publicCollectionItems, setPublicCollectionItems] = useState([])
  const [ownCollectionItems, setOwnCollectionItems] = useState([])
  const [favoriteRows, setFavoriteRows] = useState([])
  const [requests, setRequests] = useState([])
  const [supportTickets, setSupportTickets] = useState([])
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [toasts, setToasts] = useState([])
  const [loading, setLoading] = useState(true)
  const refreshRunRef = useRef(0)
  const lastErrorSignatureRef = useRef('')

  const pushToast = useCallback((title, body) => {
    const id = crypto.randomUUID()
    setToasts((current) => [...current, { id, title, body }])
  }, [])

  const dismissToast = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const ensureProfile = useCallback(async (authUser) => {
    if (!authUser) {
      return null
    }

    const payload = {
      id: authUser.id,
      display_name: authUser.user_metadata?.display_name || authUser.email?.split('@')[0] || 'Collector',
      city: authUser.user_metadata?.city || null,
      distance_miles: Number(authUser.user_metadata?.distance_miles ?? 0),
      bio: authUser.user_metadata?.bio || '',
      meetup_spot: authUser.user_metadata?.meetup_spot || 'TBD',
      response_time: '~1 day',
    }

    const { error } = await supabase
      .from('profiles')
      .upsert(payload, { onConflict: 'id' })

    if (error) {
      console.error(error)
    }
  }, [])

  const refreshAll = useCallback(async (nextSession = null) => {
    const runId = ++refreshRunRef.current
    setLoading(true)

    const {
      data: { session: liveSession },
    } = await supabase.auth.getSession()

    const activeSession = nextSession ?? liveSession ?? null
    const authUser = activeSession?.user ?? null
    const userId = authUser?.id ?? null

    if (authUser) {
      await ensureProfile(authUser)
    }

    const [
      profilesRes,
      fragrancesRes,
      publicCollectionRes,
      ownCollectionRes,
      favoritesRes,
      requestsRes,
      ticketsRes,
    ] = await Promise.all([
      supabase.from('profiles').select('*').order('display_name'),
      supabase.from('fragrances').select('*').order('popularity', { ascending: false }),
      supabase.from('collection_items').select('*').eq('share_enabled', true),
      userId
        ? supabase.from('collection_items').select('*').eq('user_id', userId)
        : Promise.resolve({ data: [], error: null }),
      userId
        ? supabase.from('favorites').select('*').eq('user_id', userId)
        : Promise.resolve({ data: [], error: null }),
      userId
        ? supabase
            .from('sample_requests')
            .select('*')
            .or(`owner_user_id.eq.${userId},requester_user_id.eq.${userId}`)
            .order('created_at', { ascending: false })
        : Promise.resolve({ data: [], error: null }),
      userId
        ? supabase
            .from('support_tickets')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
        : Promise.resolve({ data: [], error: null }),
    ])

    const queryErrors = [
      ['profiles', profilesRes.error],
      ['fragrances', fragrancesRes.error],
      ['publicCollection', publicCollectionRes.error],
      ['ownCollection', ownCollectionRes.error],
      ['favorites', favoritesRes.error],
      ['requests', requestsRes.error],
      ['tickets', ticketsRes.error],
    ].filter(([, error]) => error)

    if (queryErrors.length > 0) {
      console.group('Supabase refreshAll errors')
      queryErrors.forEach(([label, error]) => {
        console.error(label, error)
      })
      console.groupEnd()

      const errorSignature = queryErrors.map(([label]) => label).join(',')

      if (lastErrorSignatureRef.current !== errorSignature) {
        lastErrorSignatureRef.current = errorSignature
        pushToast(
          'Sync problem',
          `Failed: ${errorSignature}`,
        )
      }
    } else {
      lastErrorSignatureRef.current = ''
    }

    if (runId !== refreshRunRef.current) {
      return
    }

    const nextProfiles = (profilesRes.data ?? []).map((row) => mapProfileRow(row))
    const profileMap = Object.fromEntries(nextProfiles.map((profile) => [profile.id, profile]))

    const nextPublicCollection = (publicCollectionRes.data ?? []).map(mapCollectionRow)
    const nextOwnCollection = (ownCollectionRes.data ?? []).map(mapCollectionRow)
    const nextFavoriteRows = favoritesRes.data ?? []
    const nextRequests = (requestsRes.data ?? []).map(mapRequestRow)
    const nextTickets = (ticketsRes.data ?? []).map((ticket) => ({
      ...ticket,
      createdAt: formatDateTime(ticket.created_at),
    }))

    const ownerCounts = nextPublicCollection.reduce((acc, item) => {
      acc[item.fragranceId] = (acc[item.fragranceId] ?? 0) + 1
      return acc
    }, {})

    const nextFragrances = (fragrancesRes.data ?? []).map((row) => ({
      ...mapFragranceRow(row),
      ownerCount: ownerCounts[row.id] ?? 0,
    }))

    const ownProfileRow = profilesRes.data?.find((profile) => profile.id === authUser?.id)

    const fallbackOwnProfile = authUser
      ? {
          id: authUser.id,
          name: authUser.user_metadata?.display_name || authUser.email?.split('@')[0] || 'Collector',
          email: authUser.email ?? null,
          city: authUser.user_metadata?.city || 'Unknown',
          distance: Number(authUser.user_metadata?.distance_miles ?? 0),
          verified: false,
          rating: 0,
          responseTime: '~1 day',
          bio: authUser.user_metadata?.bio || '',
          meetupSpot: authUser.user_metadata?.meetup_spot || 'TBD',
          createdAt: null,
        }
      : null

    const ownProfile = ownProfileRow
      ? mapProfileRow(ownProfileRow, authUser?.email ?? null)
      : fallbackOwnProfile

    setProfiles(nextProfiles)
    setFragrances(nextFragrances)
    setPublicCollectionItems(nextPublicCollection)
    setOwnCollectionItems(nextOwnCollection)
    setFavoriteRows(nextFavoriteRows)
    setRequests(nextRequests)
    setSupportTickets(nextTickets)
    setCurrentUser(ownProfile)
    setLoading(false)

    return {
      profileMap,
      ownProfile,
      nextFragrances,
    }
  }, [ensureProfile, pushToast])

  useEffect(() => {
    let mounted = true

    async function bootstrap() {
      const {
        data: { session: initialSession },
      } = await supabase.auth.getSession()

      if (!mounted) {
        return
      }

      setSession(initialSession)
      await refreshAll(initialSession)
    }

    bootstrap()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      refreshAll(nextSession)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [refreshAll])

  const fragranceMap = useMemo(
    () => Object.fromEntries(fragrances.map((fragrance) => [fragrance.id, fragrance])),
    [fragrances],
  )

  const profilesById = useMemo(
    () => Object.fromEntries(profiles.map((profile) => [profile.id, profile])),
    [profiles],
  )

  const favoriteIds = useMemo(
    () => favoriteRows.map((row) => row.fragrance_id),
    [favoriteRows],
  )

  const collectionIds = useMemo(
    () => ownCollectionItems.map((item) => item.fragranceId),
    [ownCollectionItems],
  )

  const collection = useMemo(
    () => ownCollectionItems
      .map((item) => ({
        ...item,
        fragrance: fragranceMap[item.fragranceId],
      }))
      .filter((item) => item.fragrance),
    [ownCollectionItems, fragranceMap],
  )

  const incomingRequests = useMemo(
    () => currentUser
      ? requests.filter((request) => request.ownerId === currentUser.id)
      : [],
    [requests, currentUser],
  )

  const outgoingRequests = useMemo(
    () => currentUser
      ? requests.filter((request) => request.requesterId === currentUser.id)
      : [],
    [requests, currentUser],
  )

  const stats = useMemo(() => {
    const visibleOwnerIds = new Set(publicCollectionItems.map((item) => item.user_id ?? item.userId).filter(Boolean))
    const localOwners = profiles.filter(
      (profile) => visibleOwnerIds.has(profile.id) && Number(profile.distance ?? 0) <= 10,
    ).length

    return {
      totalFragrances: fragrances.length,
      communityMembers: profiles.length,
      activeSamples: requests.filter((request) => request.status === 'Pending').length,
      localOwners,
    }
  }, [fragrances.length, profiles, publicCollectionItems, requests])

  const ensureSignedIn = () => {
    if (!currentUser) {
      setAuthModalOpen(true)
      pushToast('Sign in required', 'Create an account or sign in to continue.')
      return false
    }

    return true
  }

  const signIn = async ({ email, password }) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      pushToast('Sign-in failed', error.message)
      return
    }

    setAuthModalOpen(false)
    pushToast('Signed in', 'Welcome back.')
  }

  const signInDemo = async () => {
    const email = import.meta.env.VITE_DEMO_EMAIL
    const password = import.meta.env.VITE_DEMO_PASSWORD

    if (!email || !password) {
      pushToast('Demo unavailable', 'Set VITE_DEMO_EMAIL and VITE_DEMO_PASSWORD to enable demo login.')
      return
    }

    await signIn({ email, password })
  }

  const createAccount = async ({ name, email, password, city }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: name,
          city,
          bio: 'New collector building a smarter sampling routine.',
          meetup_spot: 'TBD',
          distance_miles: 0,
        },
      },
    })

    if (error) {
      pushToast('Sign-up failed', error.message)
      return
    }

    setAuthModalOpen(false)

    if (data.session) {
      pushToast('Account created', 'Your account is ready.')
    } else {
      pushToast('Check your email', 'Confirm your email, then sign in from any device.')
    }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()

    if (error) {
      pushToast('Sign-out failed', error.message)
      return
    }

    pushToast('Signed out', 'You can still browse as a guest.')
  }

  const updateProfile = async (updates) => {
    if (!ensureSignedIn()) {
      return
    }

    const payload = {
      display_name: updates.name ?? currentUser.name,
      city: updates.city ?? currentUser.city,
      bio: updates.bio ?? currentUser.bio,
      meetup_spot: updates.meetupSpot ?? currentUser.meetupSpot,
      response_time: updates.responseTime ?? currentUser.responseTime,
      distance_miles: Number(updates.distance ?? currentUser.distance ?? 0),
    }

    const { error } = await supabase
      .from('profiles')
      .update(payload)
      .eq('id', currentUser.id)

    if (error) {
      pushToast('Profile update failed', error.message)
      return
    }

    await refreshAll()
    pushToast('Profile saved', 'Your preferences and profile details were updated.')
  }

  const toggleFavorite = async (fragranceId) => {
    if (!ensureSignedIn()) {
      return
    }

    const alreadySaved = favoriteIds.includes(fragranceId)

    if (alreadySaved) {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', currentUser.id)
        .eq('fragrance_id', fragranceId)

      if (error) {
        pushToast('Could not remove favorite', error.message)
        return
      }

      await refreshAll()
      pushToast('Removed from saved scents', 'The fragrance was removed from your shortlist.')
      return
    }

    const { error } = await supabase
      .from('favorites')
      .insert({
        user_id: currentUser.id,
        fragrance_id: fragranceId,
      })

    if (error) {
      pushToast('Could not save fragrance', error.message)
      return
    }

    await refreshAll()
    pushToast('Saved for later', 'You can find it anytime in your saved scents.')
  }

  const addToCollection = async (fragranceId) => {
    if (!ensureSignedIn()) {
      return
    }

    const { error } = await supabase
      .from('collection_items')
      .upsert({
        user_id: currentUser.id,
        fragrance_id: fragranceId,
        bottle_ml: 50,
        condition: '95% full',
        sample_format: '2 ml atomizer',
        share_enabled: true,
      }, {
        onConflict: 'user_id,fragrance_id',
      })

    if (error) {
      pushToast('Could not add to collection', error.message)
      return
    }

    await refreshAll()
    pushToast('Collection updated', 'The fragrance was added to your collection.')
  }

  const removeFromCollection = async (fragranceId) => {
    if (!ensureSignedIn()) {
      return
    }

    const { error } = await supabase
      .from('collection_items')
      .delete()
      .eq('user_id', currentUser.id)
      .eq('fragrance_id', fragranceId)

    if (error) {
      pushToast('Could not remove from collection', error.message)
      return
    }

    await refreshAll()
    pushToast('Removed from collection', 'The fragrance has been removed from your shelf.')
  }

  const toggleCollectionSharing = async (fragranceId) => {
    if (!ensureSignedIn()) {
      return
    }

    const currentItem = ownCollectionItems.find((item) => item.fragranceId === fragranceId)

    if (!currentItem) {
      return
    }

    const { error } = await supabase
      .from('collection_items')
      .update({
        share_enabled: !currentItem.shareEnabled,
      })
      .eq('user_id', currentUser.id)
      .eq('fragrance_id', fragranceId)

    if (error) {
      pushToast('Could not update sharing', error.message)
      return
    }

    await refreshAll()
    pushToast('Sampling settings updated', 'Your collection visibility has been updated.')
  }

  const createFragrance = async (payload) => {
    if (!ensureSignedIn()) {
      return { status: 'blocked' }
    }

    const brand = String(payload.brand ?? '').trim()
    const name = String(payload.name ?? '').trim()

    if (!brand || !name) {
      pushToast('Missing fields', 'Brand and fragrance name are required.')
      return { status: 'invalid' }
    }

    const duplicate = fragrances.find((fragrance) => (
      fragrance.brand.trim().toLowerCase() === brand.toLowerCase()
      && fragrance.name.trim().toLowerCase() === name.toLowerCase()
    ))

    if (duplicate) {
      if (payload.addToCollection) {
        await addToCollection(duplicate.id)
      }

      pushToast('Already in catalog', 'We found an existing match for that fragrance.')
      return { status: 'duplicate', fragrance: duplicate }
    }

    const takenSlugs = new Set(fragrances.map((fragrance) => fragrance.slug))
    const slug = uniqueSlug(slugify(`${brand}-${name}`), takenSlugs)

    const insertPayload = {
      slug,
      brand,
      name,
      concentration: String(payload.concentration || 'Eau de Parfum').trim(),
      family: String(payload.family || 'Woody Aromatic').trim(),
      vibe: String(payload.vibe || '').trim(),
      description: String(payload.description || '').trim(),
      top_notes: parseList(payload.topNotes, ['bergamot']),
      middle_notes: parseList(payload.middleNotes, ['jasmine']),
      base_notes: parseList(payload.baseNotes, ['musk']),
      accords: parseList(payload.accords, ['woody', 'musky']),
      seasons: parseList(payload.seasons, ['spring', 'fall']),
      longevity: String(payload.longevity || '6–8 hours').trim(),
      sillage: String(payload.sillage || 'moderate').trim().toLowerCase(),
      ideal_for: parseList(payload.idealFor, ['sampling', 'everyday']),
      community_score: Number(payload.communityScore ?? 76),
      blind_buy_risk: Number(payload.blindBuyRisk ?? 32),
      popularity: Number(payload.popularity ?? 12),
      featured_reason: 'Community-added fragrance created because it was missing from the catalog.',
      created_by: currentUser.id,
    }

    const { data, error } = await supabase
      .from('fragrances')
      .insert(insertPayload)
      .select('*')
      .single()

    if (error) {
      pushToast('Could not create fragrance', error.message)
      return { status: 'error' }
    }

    await refreshAll()

    const fragrance = mapFragranceRow(data)

    if (payload.addToCollection) {
      await addToCollection(fragrance.id)
    }

    pushToast('Fragrance created', 'Added to the catalog.')
    return { status: 'created', fragrance }
  }

  const sendSampleRequest = async ({ fragranceId, ownerId, message }) => {
    if (!ensureSignedIn()) {
      return
    }

    if (ownerId === currentUser.id) {
      pushToast('Cannot request from yourself', 'Choose another community member who owns this scent.')
      return
    }

    const duplicate = requests.some((request) => (
      request.fragranceId === fragranceId
      && request.ownerId === ownerId
      && request.requesterId === currentUser.id
      && request.status === 'Pending'
    ))

    if (duplicate) {
      pushToast('Request already pending', 'You already have an open request for this fragrance.')
      return
    }

    const { error } = await supabase
      .from('sample_requests')
      .insert({
        fragrance_id: fragranceId,
        owner_user_id: ownerId,
        requester_user_id: currentUser.id,
        message,
      })

    if (error) {
      pushToast('Could not send request', error.message)
      return
    }

    await refreshAll()
    pushToast('Request sent', 'Your sample request is now waiting for a response.')
  }

  const updateRequestStatus = async (requestId, status) => {
    const { error } = await supabase
      .from('sample_requests')
      .update({ status })
      .eq('id', requestId)

    if (error) {
      pushToast('Could not update request', error.message)
      return
    }

    await refreshAll()

    const copy = {
      Approved: 'You approved a request and the requester can now coordinate pickup.',
      Declined: 'The request was declined and removed from your active queue.',
      Completed: 'Marked as completed. Great sampling etiquette keeps the community healthy.',
    }

    pushToast(`Request ${status.toLowerCase()}`, copy[status] ?? 'The request was updated.')
  }

  const submitSupportTicket = async ({ type, subject, message }) => {
    if (!ensureSignedIn()) {
      return
    }

    const { error } = await supabase
      .from('support_tickets')
      .insert({
        user_id: currentUser.id,
        type,
        subject,
        message,
      })

    if (error) {
      pushToast('Could not submit support ticket', error.message)
      return
    }

    await refreshAll()
    pushToast('Support request sent', 'Your support ticket was saved.')
  }

  const resetDemo = () => {
    pushToast('No reset in production mode', 'This app now uses the database instead of local demo state.')
  }

  const getOwnersForFragrance = useCallback((fragranceId) => {
    return publicCollectionItems
      .filter((item) => item.fragranceId === fragranceId && item.shareEnabled)
      .map((item) => {
        const owner = profilesById[item.user_id] || profilesById[item.userId]

        if (!owner) {
          return null
        }

        return {
          ...owner,
          ownedItem: item,
        }
      })
      .filter(Boolean)
      .sort((a, b) => a.distance - b.distance)
  }, [publicCollectionItems, profilesById])

  const getUserById = useCallback(
    (userId) => profilesById[userId] ?? null,
    [profilesById],
  )

  const getFragranceById = useCallback(
    (fragranceId) => fragranceMap[fragranceId] ?? null,
    [fragranceMap],
  )

  const value = {
    session,
    loading,
    fragrances,
    currentUser,
    collection,
    collectionIds,
    favoriteIds,
    requests,
    incomingRequests,
    outgoingRequests,
    supportTickets,
    stats,
    authModalOpen,
    setAuthModalOpen,
    signIn,
    signInDemo,
    createAccount,
    signOut,
    updateProfile,
    toggleFavorite,
    addToCollection,
    removeFromCollection,
    toggleCollectionSharing,
    createFragrance,
    sendSampleRequest,
    updateRequestStatus,
    submitSupportTicket,
    resetDemo,
    getOwnersForFragrance,
    getUserById,
    getFragranceById,
    toasts,
    dismissToast,
  }

  return (
    <ScentSwapContext.Provider value={value}>
      {children}
    </ScentSwapContext.Provider>
  )
}

export function useScentSwap() {
  const context = useContext(ScentSwapContext)

  if (!context) {
    throw new Error('useScentSwap must be used within a ScentSwapProvider')
  }

  return context
}