"use client"

import { useState, useEffect } from 'react'
import { InventoryItem } from '@/types'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { LogOut, LogIn, User, Calendar } from 'lucide-react'

interface CheckoutDialogProps {
  open: boolean
  item: InventoryItem | null
  onConfirm: (updated: InventoryItem) => void
  onClose: () => void
}

export function CheckoutDialog({ open, item, onConfirm, onClose }: CheckoutDialogProps) {
  const [assignedTo, setAssignedTo] = useState('')
  const [expectedReturn, setExpectedReturn] = useState('')
  const isCheckingIn = item?.status === 'Checked Out'

  useEffect(() => {
    if (open && item) {
      setAssignedTo(isCheckingIn ? item.assignedTo : '')
      setExpectedReturn(isCheckingIn ? item.expectedReturn : '')
    }
  }, [open, item, isCheckingIn])

  if (!item) return null

  function handleConfirm() {
    const now = new Date().toISOString()
    if (isCheckingIn) {
      onConfirm({
        ...item!,
        status: 'Available',
        assignedTo: '',
        checkoutDate: '',
        expectedReturn: '',
        updatedAt: now,
      })
    } else {
      if (!assignedTo.trim()) return
      onConfirm({
        ...item!,
        status: 'Checked Out',
        assignedTo: assignedTo.trim(),
        checkoutDate: new Date().toISOString().slice(0, 10),
        expectedReturn,
        updatedAt: now,
      })
    }
  }

  const today = new Date().toISOString().slice(0, 10)

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isCheckingIn
              ? <LogIn className="h-5 w-5 text-green-600" />
              : <LogOut className="h-5 w-5 text-blue-600" />
            }
            {isCheckingIn ? 'Check In Equipment' : 'Check Out Equipment'}
          </DialogTitle>
        </DialogHeader>

        <div className="py-1">
          {/* Item summary */}
          <div className="bg-muted rounded-lg px-4 py-3 mb-5">
            <p className="font-semibold">{item.name}</p>
            <p className="text-sm text-muted-foreground">
              {[item.make, item.model].filter(Boolean).join(' ')}
              {item.assetTag ? ` · ${item.assetTag}` : ''}
            </p>
          </div>

          {isCheckingIn ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-muted-foreground shrink-0" />
                <span>Checked out to: <strong>{item.assignedTo}</strong></span>
              </div>
              {item.checkoutDate && (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span>Checked out: <strong>{item.checkoutDate}</strong></span>
                </div>
              )}
              {item.expectedReturn && (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span>Expected return: <strong>{item.expectedReturn}</strong></span>
                </div>
              )}
              <p className="text-sm text-muted-foreground pt-2 border-t mt-3">
                Confirming check-in will mark this item as <strong>Available</strong>.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <Label className="text-sm mb-1.5 block">
                  Checking Out To (Name & Callsign) <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={assignedTo}
                  onChange={e => setAssignedTo(e.target.value)}
                  placeholder="e.g. Jane W0XYZ"
                  autoFocus
                />
              </div>
              <div>
                <Label className="text-sm mb-1.5 block">Expected Return Date</Label>
                <Input
                  type="date"
                  value={expectedReturn}
                  onChange={e => setExpectedReturn(e.target.value)}
                  min={today}
                />
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            onClick={handleConfirm}
            disabled={!isCheckingIn && !assignedTo.trim()}
            className={isCheckingIn ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}
          >
            {isCheckingIn ? 'Confirm Check In' : 'Check Out'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
