"use client"

import { useState, useEffect } from 'react'
import { InventoryItem, Category, Condition, Status, CATEGORIES, CONDITIONS, STATUSES } from '@/types'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'

interface ItemDialogProps {
  open: boolean
  item: InventoryItem | null
  onSave: (item: InventoryItem) => void
  onClose: () => void
  makeId: () => string
}

type FormData = Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>

const EMPTY: FormData = {
  assetTag: '', name: '', make: '', model: '', serialNumber: '',
  category: 'HF Radio', condition: 'Good', status: 'Available',
  location: '', assignedTo: '', checkoutDate: '', expectedReturn: '',
  purchaseDate: '', purchaseValue: '', notes: '',
}

export function ItemDialog({ open, item, onSave, onClose, makeId }: ItemDialogProps) {
  const [form, setForm] = useState<FormData>({ ...EMPTY })
  const [nameError, setNameError] = useState(false)

  useEffect(() => {
    if (open) {
      if (item) {
        const { id, createdAt, updatedAt, ...rest } = item
        setForm(rest)
      } else {
        setForm({ ...EMPTY })
      }
      setNameError(false)
    }
  }, [item, open])

  function set<K extends keyof FormData>(field: K, value: FormData[K]) {
    setForm(prev => ({ ...prev, [field]: value }))
    if (field === 'name') setNameError(false)
  }

  function handleSubmit() {
    if (!form.name.trim()) { setNameError(true); return }
    const now = new Date().toISOString()
    onSave({
      id: item?.id ?? makeId(),
      ...form,
      createdAt: item?.createdAt ?? now,
      updatedAt: now,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="text-xl">
            {item ? 'Edit Equipment' : 'Add New Equipment'}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[65vh]">
          <div className="px-6 py-5 space-y-6">

            {/* Identification */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                Identification
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs mb-1 block">Asset Tag</Label>
                  <Input
                    value={form.assetTag}
                    onChange={e => set('assetTag', e.target.value)}
                    placeholder="LARC-001"
                  />
                </div>
                <div>
                  <Label className="text-xs mb-1 block">
                    Item Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    value={form.name}
                    onChange={e => set('name', e.target.value)}
                    placeholder="e.g. HF Transceiver"
                    className={nameError ? 'border-red-500' : ''}
                  />
                  {nameError && <p className="text-xs text-red-500 mt-1">Name is required</p>}
                </div>
                <div>
                  <Label className="text-xs mb-1 block">Manufacturer / Make</Label>
                  <Input
                    value={form.make}
                    onChange={e => set('make', e.target.value)}
                    placeholder="e.g. Icom"
                  />
                </div>
                <div>
                  <Label className="text-xs mb-1 block">Model</Label>
                  <Input
                    value={form.model}
                    onChange={e => set('model', e.target.value)}
                    placeholder="e.g. IC-7300"
                  />
                </div>
                <div>
                  <Label className="text-xs mb-1 block">Serial Number</Label>
                  <Input
                    value={form.serialNumber}
                    onChange={e => set('serialNumber', e.target.value)}
                    placeholder="Manufacturer serial #"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Classification */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                Classification
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs mb-1 block">Category</Label>
                  <Select value={form.category} onValueChange={v => set('category', v as Category)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map(c => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs mb-1 block">Condition</Label>
                  <Select value={form.condition} onValueChange={v => set('condition', v as Condition)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {CONDITIONS.map(c => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs mb-1 block">Status</Label>
                  <Select value={form.status} onValueChange={v => set('status', v as Status)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {STATUSES.map(s => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs mb-1 block">Storage Location</Label>
                  <Input
                    value={form.location}
                    onChange={e => set('location', e.target.value)}
                    placeholder="e.g. Club Shack"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Purchase Info */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                Purchase Information
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs mb-1 block">Purchase Date</Label>
                  <Input
                    type="date"
                    value={form.purchaseDate}
                    onChange={e => set('purchaseDate', e.target.value)}
                  />
                </div>
                <div>
                  <Label className="text-xs mb-1 block">Purchase Value ($)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.purchaseValue}
                    onChange={e => set('purchaseValue', e.target.value)}
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Notes */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                Notes
              </p>
              <Textarea
                value={form.notes}
                onChange={e => set('notes', e.target.value)}
                placeholder="Any additional notes about this equipment (accessories included, known issues, etc.)..."
                rows={3}
              />
            </div>

          </div>
        </ScrollArea>

        <div className="px-6 py-4 border-t flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit}>
            {item ? 'Save Changes' : 'Add Equipment'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
