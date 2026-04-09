import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import {
  COMMUNITY_MEMBERS,
  DEMO_USER,
  FRAGRANCES,
  INITIAL_REQUESTS,
} from '../data/mockData'

const STORAGE_KEY = 'scentswap-demo-state-v2'

const ScentSwapContext = createContext(null)

function buildInitialState() {
  return {
    currentUser: DEMO_USER,
    requests: INITIAL_REQUESTS,
    supportTickets: [],
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
    }
  } catch {
    return buildInitialState()
  }
}

function randomId(prefix) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`
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

  const allUsers = useMemo(() => {
    if (!currentUser) {
      return COMMUNITY_MEMBERS
    }

    return [currentUser, ...COMMUNITY_MEMBERS]
  }, [currentUser])

  const fragranceMap = useMemo(() => {
    return Object.fromEntries(FRAGRANCES.map((fragrance) => [fragrance.id, fragrance]))
  }, [])

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
      if (user.collection.some((item) => item.fragranceId === fragranceId)) {
        pushToast('Already in collection', 'That fragrance is already listed in your collection.')
        return user
      }

      pushToast('Collection updated', 'The fragrance was added to your collection.')
      return {
        ...user,
        collection: [
          ...user.collection,
          {
            fragranceId,
            bottleMl: 50,
            condition: '95% full',
            sampleFormat: '2 ml atomizer',
            shareEnabled: true,
          },
        ],
      }
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
    return COMMUNITY_MEMBERS
      .filter((member) => member.collection.some(
        (item) => item.fragranceId === fragranceId && item.shareEnabled,
      ))
      .map((member) => {
        const ownedItem = member.collection.find((item) => item.fragranceId === fragranceId)
        return {
          ...member,
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

  const collection = currentUser?.collection.map(enrichCollectionItem) ?? []

  const stats = {
    totalFragrances: FRAGRANCES.length,
    communityMembers: COMMUNITY_MEMBERS.length + (currentUser ? 1 : 0),
    activeSamples: requests.filter((request) => request.status === 'Pending').length,
    localOwners: COMMUNITY_MEMBERS.filter((member) => member.distance <= 10).length,
  }

  const value = {
    fragrances: FRAGRANCES,
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
