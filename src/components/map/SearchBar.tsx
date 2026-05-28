import { useState, useEffect, useRef, useCallback } from 'react'
import { Search, X, Loader2 } from 'lucide-react'
import { searchPlaces, type NominatimResult } from '../../utils/geocoding'

interface Props {
  onSelect: (lat: number, lng: number, label: string) => void
}

export default function SearchBar({ onSelect }: Props) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<NominatimResult[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const runSearch = useCallback(async (q: string) => {
    if (!q.trim()) { setResults([]); setOpen(false); return }
    setLoading(true)
    const res = await searchPlaces(q)
    setResults(res)
    setOpen(res.length > 0)
    setLoading(false)
  }, [])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => runSearch(query), 320)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [query, runSearch])

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleSelect = (r: NominatimResult) => {
    onSelect(parseFloat(r.lat), parseFloat(r.lon), r.display_name)
    setQuery(r.display_name.split(',').slice(0, 2).join(','))
    setOpen(false)
    setResults([])
  }

  const clear = () => { setQuery(''); setResults([]); setOpen(false) }

  return (
    <div ref={containerRef} className="relative w-full">
      <div
        className="flex items-center gap-2 px-3 h-11 rounded-xl"
        style={{
          background: 'rgba(10,14,28,0.88)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
        }}
      >
        {loading
          ? <Loader2 size={16} className="text-white/40 shrink-0 animate-spin" />
          : <Search size={16} className="text-white/40 shrink-0" />
        }
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search neighborhood, street, or city…"
          className="flex-1 bg-transparent text-sm text-white placeholder:text-white/30 outline-none"
        />
        {query && (
          <button onClick={clear} className="text-white/30 hover:text-white/60 transition-colors">
            <X size={15} />
          </button>
        )}
      </div>

      {open && results.length > 0 && (
        <div
          className="absolute top-full mt-1.5 left-0 right-0 rounded-xl overflow-hidden z-50 animate-slide-up"
          style={{
            background: 'rgba(10,14,28,0.96)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          }}
        >
          {results.map((r) => (
            <button
              key={r.place_id}
              onClick={() => handleSelect(r)}
              className="w-full text-left px-4 py-3 text-sm hover:bg-white/06 transition-colors border-b last:border-b-0"
              style={{ borderColor: 'rgba(255,255,255,0.06)', color: 'rgba(240,244,255,0.85)' }}
            >
              <p className="font-medium truncate">{r.display_name.split(',')[0]}</p>
              <p className="text-xs mt-0.5 truncate" style={{ color: 'rgba(240,244,255,0.4)' }}>
                {r.display_name.split(',').slice(1, 4).join(',')}
              </p>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
