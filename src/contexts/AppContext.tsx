import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
  type ReactNode,
} from 'react'
import {
  Lead,
  User,
  View,
  MapPosition,
  LeadStatus,
  TEAM_MEMBERS as DEFAULT_TEAM_MEMBERS,
} from '../types'
import {
  getLeads,
  saveLeads,
  getUser,
  saveUser,
  getMapPosition,
  saveMapPosition,
  isInitialized,
  setInitialized,
  clearAllData,
  getTeamMembers,
  saveTeamMembers,
} from '../utils/storage'
import { DEMO_LEADS } from '../data/demoData'

interface FlyToTarget {
  lat: number
  lng: number
  zoom?: number
  leadId?: string
}

interface AppContextValue {
  // Auth
  user: User | null
  login: (email: string, password: string) => boolean
  logout: () => void

  // Leads
  leads: Lead[]
  addLead: (lead: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>) => Lead
  updateLead: (lead: Lead) => void
  deleteLead: (id: string) => void

  // Navigation
  currentView: View
  setCurrentView: (v: View) => void

  // Map
  mapPosition: MapPosition
  setMapPosition: (p: MapPosition) => void
  flyToTarget: FlyToTarget | null
  flyTo: (target: FlyToTarget) => void
  clearFlyTo: () => void

  // Filters
  activeFilters: LeadStatus[]
  toggleFilter: (s: LeadStatus) => void
  clearFilters: () => void

  // Selected lead (list → map)
  selectedLeadId: string | null
  selectLead: (id: string | null) => void

  // Team members
  teamMembers: string[]
  setTeamMembers: (members: string[]) => void

  // Settings
  updateUser: (updates: Partial<User>) => void
  clearData: () => void
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => getUser())
  const [leads, setLeads] = useState<Lead[]>(() => {
    if (!isInitialized()) {
      saveLeads(DEMO_LEADS)
      setInitialized()
      return DEMO_LEADS
    }
    return getLeads()
  })
  const [currentView, setCurrentView] = useState<View>('map')
  const [mapPosition, setMapPositionState] = useState<MapPosition>(() => getMapPosition())
  const [flyToTarget, setFlyToTarget] = useState<FlyToTarget | null>(null)
  const [activeFilters, setActiveFilters] = useState<LeadStatus[]>([])
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null)
  const [teamMembers, setTeamMembersState] = useState<string[]>(() => {
    const stored = getTeamMembers()
    return stored.length > 0 ? stored : DEFAULT_TEAM_MEMBERS
  })

  useEffect(() => {
    saveLeads(leads)
  }, [leads])

  const login = useCallback((email: string, password: string): boolean => {
    if (email === 'admin@canvass.app' && password === 'admin123') {
      const u: User = { email, name: 'Admin User', role: 'Team Lead' }
      setUser(u)
      saveUser(u)
      return true
    }
    return false
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    saveUser(null)
  }, [])

  const updateUser = useCallback((updates: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return prev
      const updated = { ...prev, ...updates }
      saveUser(updated)
      return updated
    })
  }, [])

  const setTeamMembers = useCallback((members: string[]) => {
    setTeamMembersState(members)
    saveTeamMembers(members)
  }, [])

  const addLead = useCallback(
    (data: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>): Lead => {
      const now = new Date().toISOString()
      const lead: Lead = {
        ...data,
        id: `lead-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        createdAt: now,
        updatedAt: now,
      }
      setLeads((prev) => [...prev, lead])
      return lead
    },
    []
  )

  const updateLead = useCallback((updated: Lead) => {
    setLeads((prev) =>
      prev.map((l) =>
        l.id === updated.id ? { ...updated, updatedAt: new Date().toISOString() } : l
      )
    )
  }, [])

  const deleteLead = useCallback((id: string) => {
    setLeads((prev) => prev.filter((l) => l.id !== id))
  }, [])

  const setMapPosition = useCallback((p: MapPosition) => {
    setMapPositionState(p)
    saveMapPosition(p)
  }, [])

  const flyTo = useCallback((target: FlyToTarget) => {
    setFlyToTarget(target)
  }, [])

  const clearFlyTo = useCallback(() => {
    setFlyToTarget(null)
  }, [])

  const toggleFilter = useCallback((s: LeadStatus) => {
    setActiveFilters((prev) =>
      prev.includes(s) ? prev.filter((f) => f !== s) : [...prev, s]
    )
  }, [])

  const clearFilters = useCallback(() => setActiveFilters([]), [])

  const selectLead = useCallback((id: string | null) => {
    setSelectedLeadId(id)
  }, [])

  const clearData = useCallback(() => {
    clearAllData()
    saveLeads(DEMO_LEADS)
    setInitialized()
    setLeads(DEMO_LEADS)
    setTeamMembersState(DEFAULT_TEAM_MEMBERS)
    setActiveFilters([])
    setSelectedLeadId(null)
  }, [])

  const value = useMemo<AppContextValue>(
    () => ({
      user,
      login,
      logout,
      updateUser,
      leads,
      addLead,
      updateLead,
      deleteLead,
      currentView,
      setCurrentView,
      mapPosition,
      setMapPosition,
      flyToTarget,
      flyTo,
      clearFlyTo,
      activeFilters,
      toggleFilter,
      clearFilters,
      selectedLeadId,
      selectLead,
      teamMembers,
      setTeamMembers,
      clearData,
    }),
    [
      user,
      login,
      logout,
      updateUser,
      leads,
      addLead,
      updateLead,
      deleteLead,
      currentView,
      mapPosition,
      setMapPosition,
      flyToTarget,
      flyTo,
      clearFlyTo,
      activeFilters,
      toggleFilter,
      clearFilters,
      selectedLeadId,
      selectLead,
      teamMembers,
      setTeamMembers,
      clearData,
    ]
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside AppProvider')
  return ctx
}
