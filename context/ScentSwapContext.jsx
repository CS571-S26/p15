import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import {
  COMMUNITY_MEMBERS,
  DEMO_USER,
  FRAGRANCES,
  INITIAL_REQUESTS,
} from '../data/mockData'

const STORAGE_KEY = 'scentswap-demo-state-v3'

const ScentSwapContext = createContext(null)

function buildInitialState() {
  return {
    currentUser: DEMO_USER,
    requests: INITIAL_REQUESTS,
    supportTickets: [],
    customFragrances: [],
  }
}

function loadState() {
  if (typeof window === 'undefined') {
    return buildInitialState()
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return buildInitialState()
    }

    const parsed = JSON.parse(raw)

    return {
      ...buildInitialState(),
      ...parsed,
      customFragrances: parsed.customFragrances ?? [],
    }
  } catch {
    return buildInitialState()
  }
}

function randomId(prefix) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`
}

function slugify(value) {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function uniqueValue(base, taken) {
  let candidate = base
  let index = 2

  while (taken.has(candidate)) {
    candidate = `${base}-${index}`
    index += 1
  }

  return candidate
}

function parseList(value, fallback = []) {
  if (Array.isArray(value)) {
    const cleaned = value
      .map((item) => String(item).trim().toLowerCase())
      .filter(Boolean)

    return cleaned.length ? [...new Set(cleaned)] : fallback
  }

  const cleaned = String(value ?? '')
    .split(',')
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean)

  return cleaned.length ? [...new Set(cleaned)] : fallback
}

function buildCollectionEntry(fragranceId) {
  return {
    fragranceId,
    bottleMl: 50,
    condition: '95% full',
    sampleFormat: '2 ml atomizer',
    shareEnabled: true,
  }
}

function addCollectionEntryIfMissing(user, fragranceId) {
  if (user.collection.some((item) => item.fragranceId === fragranceId)) {
    return {
      user,
      added: false,
    }
  }

  return {
    user: {
      ...user,
      collection: [...user.collection, buildCollectionEntry(fragranceId)],
    },
    added: true,
  }
}

export function ScentSwapProvider({ children }) {
  const [state, setState] = useState(loadState)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [toasts, setToasts] = useState([])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    }
  }, [state])

  const pushToast = (title, body) => {
    const id = randomId('toast')
    setToasts((current) => [...current, { id, title, body }])
  }

  const dismissToast = (id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }

  const currentUser = state.currentUser
  const requests = state.requests
  const supportTickets = state.supportTickets
  const customFragrances = state.customFragrances ?? []

  const allUsers = useMemo(() => {
    if (!currentUser) {
      return COMMUNITY_MEMBERS
    }

    return [
      currentUser,
      ...COMMUNITY_MEMBERS.filter((member) => member.id !== currentUser.id),
    ]
  }, [currentUser])

  const ownerCounts = useMemo(() => {
    const counts = {}

    for (const user of allUsers) {
      for (const item of user.collection ?? []) {
        if (!item.shareEnabled) {
          continue
        }

        counts[item.fragranceId] = (counts[item.fragranceId] ?? 0) + 1
      }
    }

    return counts
  }, [allUsers])

  const fragrances = useMemo(() => {
    const merged = [...customFragrances, ...FRAGRANCES]
    const seen = new Set()

    return merged
      .filter((fragrance) => {
        if (seen.has(fragrance.id)) {
          return false
        }

        seen.add(fragrance.id)
        return true
      })
      .map((fragrance) => ({
        ...fragrance,
        ownerCount: ownerCounts[fragrance.id] ?? 0,
      }))
  }, [customFragrances, ownerCounts])

  const fragranceMap = useMemo(() => {
    return Object.fromEntries(fragrances.map((fragrance) => [fragrance.id, fragrance]))
  }, [fragrances])

  const collectionIds = currentUser?.collection.map((item) => item.fragranceId) ?? []
  const favoriteIds = currentUser?.favorites ?? []

  const enrichCollectionItem = (item) => ({
    ...item,
    fragrance: fragranceMap[item.fragranceId],
  })

  const ensureSignedIn = () => {
    if (!currentUser) {
      setAuthModalOpen(true)
      pushToast('Sign in required', 'Create an account or use the demo profile to continue.')
      return false
    }

    return true
  }

  const updateCurrentUser = (updater) => {
    setState((current) => {
      if (!current.currentUser) {
        return current
      }

      const nextUser = typeof updater === 'function'
        ? updater(current.currentUser)
        : updater

      return {
        ...current,
        currentUser: nextUser,
      }
    })
  }

  const signInDemo = () => {
    setState((current) => ({
      ...current,
      currentUser: DEMO_USER,
    }))
    setAuthModalOpen(false)
    pushToast('Welcome back', 'Signed in with the demo collector account.')
  }

  const signIn = ({ name, email, city }) => {
    setState((current) => ({
      ...current,
      currentUser: {
        ...DEMO_USER,
        name: name || DEMO_USER.name,
        email: email || DEMO_USER.email,
        city: city || DEMO_USER.city,
      },
    }))
    setAuthModalOpen(false)
    pushToast('Signed in', 'Your local session is ready and your collection is restored.')
  }

  const createAccount = ({ name, email, city }) => {
    const newUser = {
      ...DEMO_USER,
      id: 'you',
      name,
      email,
      city,
      bio: 'New collector building a smarter sampling routine.',
      collection: [],
      favorites: [],
    }

    setState((current) => ({
      ...current,
      currentUser: newUser,
      requests: current.requests.filter(
        (request) => request.ownerId !== 'you' && request.requesterId !== 'you',
      ),
    }))
    setAuthModalOpen(false)
    pushToast('Account created', 'Start building your collection and send your first sample request.')
  }

  const signOut = () => {
    setState((current) => ({
      ...current,
      currentUser: null,
    }))
    pushToast('Signed out', 'You can still browse fragrances and community profiles.')
  }

  const toggleFavorite = (fragranceId) => {
    if (!ensureSignedIn()) {
      return
    }

    updateCurrentUser((user) => {
      const alreadySaved = user.favorites.includes(fragranceId)
      const nextFavorites = alreadySaved
        ? user.favorites.filter((id) => id !== fragranceId)
        : [...user.favorites, fragranceId]

      pushToast(
        alreadySaved ? 'Removed from saved scents' : 'Saved for later',
        alreadySaved
          ? 'The fragrance was removed from your shortlist.'
          : 'You can find it anytime in your saved scents.',
      )

      return {
        ...user,
        favorites: nextFavorites,
      }
    })
  }

  const addToCollection = (fragranceId) => {
    if (!ensureSignedIn()) {
      return
    }

    updateCurrentUser((user) => {
      const result = addCollectionEntryIfMissing(user, fragranceId)

      if (!result.added) {
        pushToast('Already in collection', 'That fragrance is already listed in your collection.')
        return user
      }

      pushToast('Collection updated', 'The fragrance was added to your collection.')
      return result.user
    })
  }

  const removeFromCollection = (fragranceId) => {
    if (!ensureSignedIn()) {
      return
    }

    updateCurrentUser((user) => ({
      ...user,
      collection: user.collection.filter((item) => item.fragranceId !== fragranceId),
    }))
    pushToast('Removed from collection', 'The fragrance has been removed from your shelf.')
  }

  const toggleCollectionSharing = (fragranceId) => {
    if (!ensureSignedIn()) {
      return
    }

    updateCurrentUser((user) => ({
      ...user,
      collection: user.collection.map((item) => (
        item.fragranceId === fragranceId
          ? { ...item, shareEnabled: !item.shareEnabled }
          : item
      )),
    }))
    pushToast('Sampling settings updated', 'Your collection visibility has been updated.')
  }

  const createFragrance = (payload) => {
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
      let addedToCollection = false

      if (payload.addToCollection) {
        updateCurrentUser((user) => {
          const result = addCollectionEntryIfMissing(user, duplicate.id)
          addedToCollection = result.added
          return result.user
        })
      }

      pushToast(
        'Already in catalog',
        addedToCollection
          ? 'We found an existing match and added it to your collection.'
          : 'We found an existing match for that fragrance.',
      )

      return {
        status: 'duplicate',
        fragrance: duplicate,
      }
    }

    const takenIds = new Set(fragrances.map((fragrance) => fragrance.id))
    const takenSlugs = new Set(fragrances.map((fragrance) => fragrance.slug))

    const idBase = `custom-${slugify(`${brand}-${name}`)}`
    const slugBase = slugify(`${brand}-${name}`)

    const id = uniqueValue(idBase, takenIds)
    const slug = uniqueValue(slugBase, takenSlugs)

    const topNotes = parseList(payload.topNotes, ['bergamot'])
    const middleNotes = parseList(payload.middleNotes, ['jasmine'])
    const baseNotes = parseList(payload.baseNotes, ['musk'])

    const accords = parseList(payload.accords, [
      familyFallback(payload.family),
      topNotes[0],
      baseNotes[0],
    ].filter(Boolean).slice(0, 4))

    const seasons = parseList(payload.seasons, ['spring', 'fall'])
    const idealFor = parseList(payload.idealFor, ['sampling', 'everyday'])

    const fragrance = {
      id,
      slug,
      brand,
      name,
      concentration: String(payload.concentration || 'Eau de Parfum').trim(),
      family: String(payload.family || 'Woody Aromatic').trim(),
      vibe: String(payload.vibe || `${topNotes[0]}, ${middleNotes[0]}, ${baseNotes[0]}`).trim(),
      description: String(
        payload.description
        || `${name} by ${brand} blends ${topNotes[0]}, ${middleNotes[0]}, and ${baseNotes[0]} into a balanced profile built for testing before a full bottle purchase.`,
      ).trim(),
      topNotes,
      middleNotes,
      baseNotes,
      accords,
      seasons,
      longevity: String(payload.longevity || '6–8 hours').trim(),
      sillage: String(payload.sillage || 'moderate').trim().toLowerCase(),
      idealFor,
      communityScore: Number(payload.communityScore ?? 76),
      blindBuyRisk: Number(payload.blindBuyRisk ?? 32),
      ownerCount: 0,
      popularity: Number(payload.popularity ?? 12),
      featuredReason: 'Community-added fragrance created because it was missing from the catalog.',
      createdBy: currentUser.id,
      createdAt: new Date().toISOString(),
    }

    setState((current) => ({
      ...current,
      customFragrances: [fragrance, ...(current.customFragrances ?? [])],
    }))

    let addedToCollection = false

    if (payload.addToCollection) {
      updateCurrentUser((user) => {
        const result = addCollectionEntryIfMissing(user, fragrance.id)
        addedToCollection = result.added
        return result.user
      })
    }

    pushToast(
      'Fragrance created',
      addedToCollection
        ? 'Added to the catalog and your collection.'
        : 'Added to the catalog.',
    )

    return {
      status: 'created',
      fragrance,
    }
  }

  const sendSampleRequest = ({ fragranceId, ownerId, message }) => {
    if (!ensureSignedIn()) {
      return
    }

    if (ownerId === currentUser.id) {
      pushToast('Cannot request from yourself', 'Choose another community member who owns this scent.')
      return
    }

    const duplicate = requests.some(
      (request) => (
        request.fragranceId === fragranceId
        && request.ownerId === ownerId
        && request.requesterId === currentUser.id
        && request.status === 'Pending'
      ),
    )

    if (duplicate) {
      pushToast('Request already pending', 'You already have an open request for this fragrance.')
      return
    }

    const nextRequest = {
      id: randomId('req'),
      fragranceId,
      ownerId,
      requesterId: currentUser.id,
      status: 'Pending',
      createdAt: 'Just now',
      message,
    }

    setState((current) => ({
      ...current,
      requests: [nextRequest, ...current.requests],
    }))
    pushToast('Request sent', 'Your sample request is now waiting for a response.')
  }

  const updateRequestStatus = (requestId, status) => {
    setState((current) => ({
      ...current,
      requests: current.requests.map((request) => (
        request.id === requestId
          ? { ...request, status }
          : request
      )),
    }))

    const copy = {
      Approved: 'You approved a request and the requester can now coordinate pickup.',
      Declined: 'The request was declined and removed from your active queue.',
      Completed: 'Marked as completed. Great sampling etiquette keeps the community healthy.',
    }

    pushToast(`Request ${status.toLowerCase()}`, copy[status] ?? 'The request was updated.')
  }

  const submitSupportTicket = ({ type, subject, message }) => {
    const ticket = {
      id: randomId('ticket'),
      type,
      subject,
      message,
      createdAt: new Date().toLocaleString(),
    }

    setState((current) => ({
      ...current,
      supportTickets: [ticket, ...current.supportTickets],
    }))
    pushToast('Support request sent', 'We saved your ticket locally so you can track it in this demo.')
  }

  const resetDemo = () => {
    const fresh = buildInitialState()
    setState(fresh)
    pushToast('Demo reset', 'The workspace has been restored to the starter showcase state.')
  }

  const getOwnersForFragrance = (fragranceId) => {
    return allUsers
      .filter((user) => user.collection.some(
        (item) => item.fragranceId === fragranceId && item.shareEnabled,
      ))
      .map((user) => {
        const ownedItem = user.collection.find((item) => item.fragranceId === fragranceId)
        return {
          ...user,
          ownedItem,
        }
      })
      .sort((a, b) => a.distance - b.distance)
  }

  const getUserById = (userId) => allUsers.find((user) => user.id === userId)
  const getFragranceById = (fragranceId) => fragranceMap[fragranceId]

  const incomingRequests = currentUser
    ? requests.filter((request) => request.ownerId === currentUser.id)
    : []

  const outgoingRequests = currentUser
    ? requests.filter((request) => request.requesterId === currentUser.id)
    : []

  const collection = currentUser?.collection
    .map(enrichCollectionItem)
    .filter((item) => item.fragrance) ?? []

  const stats = {
    totalFragrances: fragrances.length,
    communityMembers: COMMUNITY_MEMBERS.length + (currentUser ? 1 : 0),
    activeSamples: requests.filter((request) => request.status === 'Pending').length,
    localOwners: allUsers.filter((user) => user.distance <= 10).length,
  }

  const value = {
    fragrances,
    customFragrances,
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

function familyFallback(family) {
  if (!family) {
    return 'woody'
  }

  return String(family).trim().split(' ')[0].toLowerCase()
}

export function useScentSwap() {
  const context = useContext(ScentSwapContext)

  if (!context) {
    throw new Error('useScentSwap must be used within a ScentSwapProvider')
  }

  return context
}