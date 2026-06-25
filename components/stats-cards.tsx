"use client"

import { InventoryItem } from '@/types'
import { Card, CardContent } from '@/components/ui/card'
import { Package, CheckCircle, LogOut, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatsCardsProps {
  items: InventoryItem[]
}

export function StatsCards({ items }: StatsCardsProps) {
  const total = items.length
  const available = items.filter(i => i.status === 'Available').length
  const checkedOut = items.filter(i => i.status === 'Checked Out').length
  const attention = items.filter(
    i => i.status === 'In Repair' || i.status === 'Lost' || i.condition === 'Needs Repair'
  ).length

  const cards = [
    {
      label: 'Total Items',
      value: total,
      icon: Package,
      iconCls: 'text-slate-600',
      bgCls: 'bg-slate-100',
      borderCls: 'border-slate-200',
    },
    {
      label: 'Available',
      value: available,
      icon: CheckCircle,
      iconCls: 'text-green-600',
      bgCls: 'bg-green-50',
      borderCls: 'border-green-200',
    },
    {
      label: 'Checked Out',
      value: checkedOut,
      icon: LogOut,
      iconCls: 'text-blue-600',
      bgCls: 'bg-blue-50',
      borderCls: 'border-blue-200',
    },
    {
      label: 'Needs Attention',
      value: attention,
      icon: AlertCircle,
      iconCls: attention > 0 ? 'text-red-600' : 'text-gray-400',
      bgCls: attention > 0 ? 'bg-red-50' : 'bg-gray-50',
      borderCls: attention > 0 ? 'border-red-200' : 'border-gray-200',
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map(card => (
        <Card key={card.label} className={cn('border', card.borderCls)}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold">{card.value}</p>
                <p className="text-sm text-muted-foreground mt-0.5">{card.label}</p>
              </div>
              <div className={cn('p-3 rounded-full', card.bgCls)}>
                <card.icon className={cn('h-5 w-5', card.iconCls)} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
