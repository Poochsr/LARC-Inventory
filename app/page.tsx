"use client"

import { useState, useEffect, useMemo, useRef, useCallback, type ChangeEvent } from 'react'
import { InventoryItem, CATEGORIES, CONDITIONS, STATUSES } from '@/types'
import { getItems, saveItems, makeId } from '@/lib/storage'
import { exportToCsv, importFromCsv } from '@/lib/export'
import { StatsCards } from '@/components/stats-cards'
import { ItemDialog } from '@/components/item-dialog'
import { CheckoutDialog } from '@/components/checkout-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import {
  Plus, Search, Download, Upload, Edit, Trash, MoreVertical,
  LogOut, LogIn, Package, ChevronUp, ChevronDown, X,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// ── Badge helpers ──────────────────────────────────────────────
const STATUS_COLORS: Record<string, string> = {
  'Available':    'bg-green-100 text-green-800 border-green-200',
  'Checked Out':  'bg-blue-100  text-blue-800  border-blue-200',
  'In Repair':    'bg-orange-100 text-orange-800 border-orange-200',
  'Retired':      'bg-gray-100  text-gray-600  border-gray-200',
  'Lost':         'bg-red-100   text-red-800   border-red-200',
}
const COND_COLORS: Record<string, string> = {
  'Excellent':    'bg-emerald-100 text-emerald-800 border-emerald-200',
  'Good':         'bg-sky-100    text-sky-800    border-sky-200',
  'Fair':         'bg-yellow-100 text-yellow-800 border-yellow-200',
  'Poor':         'bg-orange-100 text-orange-800 border-orange-200',
  'Needs Repair': 'bg-red-100   text-red-800   border-red-200',
}
function StatusBadge({ v }: { v: string }) {
  return <Badge variant="outline" className={cn('text-xs font-medium', STATUS_COLORS[v] ?? '')}>{v}</Badge>
}
function CondBadge({ v }: { v: string }) {
  return <Badge variant="outline" className={cn('text-xs font-medium', COND_COLORS[v] ?? '')}>{v}</Badge>
}

// ── Sort helpers ───────────────────────────────────────────────
type SortField = keyof InventoryItem
type SortDir   = 'asc' | 'desc'

function SortIcon({ field, sortField, sortDir }: { field: SortField; sortField: SortField; sortDir: SortDir }) {
  if (field !== sortField) return null
  return sortDir === 'asc'
    ? <ChevronUp   className="h-3 w-3 ml-1 inline-block" />
    : <ChevronDown className="h-3 w-3 ml-1 inline-block" />
}

// ── Main page ──────────────────────────────────────────────────
export default function InventoryPage() {
  const [items,   setItems]   = useState<InventoryItem[]>([])
  const [loaded,  setLoaded]  = useState(false)

  // Filters
  const [search,        setSearch]        = useState('')
  const [catFilter,     setCatFilter]     = useState('all')
  const [statusFilter,  setStatusFilter]  = useState('all')
  const [condFilter,    setCondFilter]    = useState('all')

  // Sort
  const [sortField, setSortField] = useState<SortField>('assetTag')
  const [sortDir,   setSortDir]   = useState<SortDir>('asc')

  // Dialogs
  const [editItem,           setEditItem]           = useState<InventoryItem | null>(null)
  const [showItemDialog,     setShowItemDialog]     = useState(false)
  const [checkoutItem,       setCheckoutItem]       = useState<InventoryItem | null>(null)
  const [showCheckoutDialog, setShowCheckoutDialog] = useState(false)
  const [deleteItem,         setDeleteItem]         = useState<InventoryItem | null>(null)
  const [importMsg,          setImportMsg]          = useState('')

  const importRef = useRef<HTMLInputElement>(null)

  // Load from localStorage on mount
  useEffect(() => {
    setItems(getItems())
    setLoaded(true)
  }, [])

  // Persist whenever items change
  useEffect(() => {
    if (loaded) saveItems(items)
  }, [items, loaded])

  // ── Computed ──────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    let result = items.filter(it => {
      if (q && !`${it.name} ${it.make} ${it.model} ${it.assetTag} ${it.serialNumber} ${it.assignedTo} ${it.location}`
        .toLowerCase().includes(q)) return false
      if (catFilter    !== 'all' && it.category  !== catFilter)    return false
      if (statusFilter !== 'all' && it.status    !== statusFilter) return false
      if (condFilter   !== 'all' && it.condition !== condFilter)   return false
      return true
    })
    result.sort((a, b) => {
      const av = String(a[sortField] ?? '').toLowerCase()
      const bv = String(b[sortField] ?? '').toLowerCase()
      return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av)
    })
    return result
  }, [items, search, catFilter, statusFilter, condFilter, sortField, sortDir])

  const totalValue = useMemo(
    () => items.reduce((s, i) => s + (parseFloat(i.purchaseValue) || 0), 0),
    [items]
  )

  // ── Handlers ──────────────────────────────────────────────────
  function handleSort(field: SortField) {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortField(field); setSortDir('asc') }
  }

  const handleSaveItem = useCallback((item: InventoryItem) => {
    setItems(prev => {
      const idx = prev.findIndex(i => i.id === item.id)
      if (idx >= 0) { const n = [...prev]; n[idx] = item; return n }
      return [...prev, item]
    })
    setShowItemDialog(false)
    setEditItem(null)
  }, [])

  const handleCheckout = useCallback((updated: InventoryItem) => {
    setItems(prev => prev.map(i => i.id === updated.id ? updated : i))
    setShowCheckoutDialog(false)
    setCheckoutItem(null)
  }, [])

  const handleDeleteConfirm = useCallback(() => {
    if (!deleteItem) return
    setItems(prev => prev.filter(i => i.id !== deleteItem.id))
    setDeleteItem(null)
  }, [deleteItem])

  function handleImport(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      const text = ev.target?.result as string
      const imported = importFromCsv(text, makeId)
      if (imported.length > 0) {
        setItems(prev => [...prev, ...imported])
        setImportMsg(`✓ Imported ${imported.length} item(s)`)
        setTimeout(() => setImportMsg(''), 4000)
      } else {
        setImportMsg('No valid items found in CSV.')
        setTimeout(() => setImportMsg(''), 4000)
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  // ── Render ────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── Header ── */}
      <header className="bg-white border-b shadow-sm">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-900 text-white p-2.5 rounded-lg shrink-0">
              <Package className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold leading-tight">LARC Equipment Inventory</h1>
              <p className="text-xs text-muted-foreground">Longmont Amateur Radio Club · W0ENO</p>
            </div>
          </div>
          <Button onClick={() => { setEditItem(null); setShowItemDialog(true) }} className="gap-2 shrink-0">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add Equipment</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </div>
      </header>

      <main className="max-w-screen-xl mx-auto px-4 sm:px-6 py-6">

        {/* ── Stats ── */}
        <StatsCards items={items} />

        {/* ── Filters ── */}
        <div className="bg-white rounded-xl border p-4 mb-4 space-y-3">
          <div className="flex flex-wrap gap-3 items-center">
            {/* Search */}
            <div className="relative flex-1 min-w-[220px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search name, make, model, asset tag, callsign…"
                className="pl-9 pr-8"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Category */}
            <Select value={catFilter} onValueChange={setCatFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>

            {/* Status */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[155px]">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>

            {/* Condition */}
            <Select value={condFilter} onValueChange={setCondFilter}>
              <SelectTrigger className="w-[155px]">
                <SelectValue placeholder="All Conditions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Conditions</SelectItem>
                {CONDITIONS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>

            {/* Import / Export */}
            <div className="flex gap-2 ml-auto">
              <input
                ref={importRef}
                type="file"
                accept=".csv"
                onChange={handleImport}
                className="hidden"
              />
              <Button variant="outline" size="sm" onClick={() => importRef.current?.click()} className="gap-1.5">
                <Upload className="h-4 w-4" />
                Import CSV
              </Button>
              <Button variant="outline" size="sm" onClick={() => exportToCsv(filtered)} className="gap-1.5">
                <Download className="h-4 w-4" />
                Export CSV
              </Button>
            </div>
          </div>

          {importMsg && (
            <p className="text-sm text-green-700 font-medium">{importMsg}</p>
          )}
        </div>

        {/* ── Table ── */}
        <div className="bg-white rounded-xl border overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 hover:bg-slate-50">
                  {/* sortable columns */}
                  {(
                    [
                      { label: 'Asset Tag',  field: 'assetTag'  as SortField, cls: 'w-[105px]' },
                      { label: 'Name',       field: 'name'      as SortField, cls: '' },
                      { label: 'Make / Model', field: 'make'    as SortField, cls: '' },
                      { label: 'Category',   field: 'category'  as SortField, cls: '' },
                      { label: 'Condition',  field: 'condition' as SortField, cls: '' },
                      { label: 'Status',     field: 'status'    as SortField, cls: '' },
                      { label: 'Location',   field: 'location'  as SortField, cls: '' },
                    ] as { label: string; field: SortField; cls: string }[]
                  ).map(col => (
                    <TableHead
                      key={col.field}
                      className={cn(
                        'cursor-pointer select-none text-xs font-semibold uppercase tracking-wide text-muted-foreground',
                        col.cls,
                      )}
                      onClick={() => handleSort(col.field)}
                    >
                      {col.label}
                      <SortIcon field={col.field} sortField={sortField} sortDir={sortDir} />
                    </TableHead>
                  ))}
                  <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Assigned To
                  </TableHead>
                  <TableHead className="w-[56px]" />
                </TableRow>
              </TableHeader>

              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-16 text-muted-foreground">
                      <Package className="h-12 w-12 mx-auto mb-3 opacity-20" />
                      <p className="font-medium">
                        {items.length === 0
                          ? 'No equipment yet.'
                          : 'No items match your filters.'}
                      </p>
                      <p className="text-sm mt-1">
                        {items.length === 0
                          ? 'Click "Add Equipment" to get started.'
                          : 'Try adjusting your search or filter criteria.'}
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map(item => (
                    <TableRow key={item.id} className="hover:bg-slate-50">
                      <TableCell>
                        <span className="font-mono text-xs font-semibold text-slate-500">
                          {item.assetTag || '—'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <p className="font-medium text-sm">{item.name}</p>
                        {item.serialNumber && (
                          <p className="text-xs text-muted-foreground">S/N: {item.serialNumber}</p>
                        )}
                      </TableCell>
                      <TableCell>
                        <p className="text-sm">{item.make}</p>
                        <p className="text-xs text-muted-foreground">{item.model}</p>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-slate-600">{item.category}</span>
                      </TableCell>
                      <TableCell><CondBadge v={item.condition} /></TableCell>
                      <TableCell><StatusBadge v={item.status} /></TableCell>
                      <TableCell className="text-sm text-slate-600">{item.location || '—'}</TableCell>
                      <TableCell>
                        {item.assignedTo ? (
                          <div>
                            <p className="text-sm font-medium text-blue-700">{item.assignedTo}</p>
                            {item.expectedReturn && (
                              <p className="text-xs text-muted-foreground">Due: {item.expectedReturn}</p>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-xs">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => { setEditItem(item); setShowItemDialog(true) }}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => { setCheckoutItem(item); setShowCheckoutDialog(true) }}
                            >
                              {item.status === 'Checked Out'
                                ? <><LogIn  className="h-4 w-4 mr-2" />Check In</>
                                : <><LogOut className="h-4 w-4 mr-2" />Check Out</>
                              }
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600 focus:text-red-600 focus:bg-red-50"
                              onClick={() => setDeleteItem(item)}
                            >
                              <Trash className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground px-1">
          <span>
            Showing <strong className="text-foreground">{filtered.length}</strong> of{' '}
            <strong className="text-foreground">{items.length}</strong> items
          </span>
          <span>
            Total inventory value:{' '}
            <strong className="text-foreground">
              ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </strong>
          </span>
        </div>
      </main>

      {/* ── Dialogs ── */}
      <ItemDialog
        open={showItemDialog}
        item={editItem}
        onSave={handleSaveItem}
        onClose={() => { setShowItemDialog(false); setEditItem(null) }}
        makeId={makeId}
      />

      <CheckoutDialog
        open={showCheckoutDialog}
        item={checkoutItem}
        onConfirm={handleCheckout}
        onClose={() => { setShowCheckoutDialog(false); setCheckoutItem(null) }}
      />

      {/* Delete confirmation */}
      <Dialog open={!!deleteItem} onOpenChange={() => setDeleteItem(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Equipment</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground py-2">
            Are you sure you want to permanently delete{' '}
            <strong>{deleteItem?.name}</strong>
            {deleteItem?.assetTag ? ` (${deleteItem.assetTag})` : ''}?
            This cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteItem(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
