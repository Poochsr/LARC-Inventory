import { InventoryItem } from '@/types'

const CSV_HEADERS = [
  'Asset Tag', 'Name', 'Make', 'Model', 'Serial Number', 'Category', 'Condition',
  'Status', 'Location', 'Assigned To', 'Checkout Date', 'Expected Return',
  'Purchase Date', 'Purchase Value', 'Notes',
]

function esc(v: string): string {
  const s = String(v ?? '')
  return s.includes(',') || s.includes('"') || s.includes('\n')
    ? `"${s.replace(/"/g, '""')}"`
    : s
}

export function exportToCsv(items: InventoryItem[]): void {
  const lines = [
    CSV_HEADERS.join(','),
    ...items.map(i =>
      [
        i.assetTag, i.name, i.make, i.model, i.serialNumber,
        i.category, i.condition, i.status, i.location,
        i.assignedTo, i.checkoutDate, i.expectedReturn,
        i.purchaseDate, i.purchaseValue, i.notes,
      ]
        .map(esc)
        .join(',')
    ),
  ]
  const blob = new Blob([lines.join('\r\n')], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `LARC_Inventory_${new Date().toISOString().slice(0, 10)}.csv`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function parseCsvRow(line: string): string[] {
  const result: string[] = []
  let cur = ''
  let inQ = false
  for (let i = 0; i < line.length; i++) {
    const c = line[i]
    if (inQ) {
      if (c === '"' && line[i + 1] === '"') { cur += '"'; i++ }
      else if (c === '"') inQ = false
      else cur += c
    } else {
      if (c === '"') inQ = true
      else if (c === ',') { result.push(cur); cur = '' }
      else cur += c
    }
  }
  result.push(cur)
  return result
}

export function importFromCsv(text: string, makeId: () => string): InventoryItem[] {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l)
  if (lines.length < 2) return []
  const now = new Date().toISOString()
  return lines
    .slice(1)
    .map(line => {
      const cols = parseCsvRow(line)
      const [
        assetTag, name, make, model, serialNumber, category, condition,
        status, location, assignedTo, checkoutDate, expectedReturn,
        purchaseDate, purchaseValue, notes,
      ] = cols
      return {
        id: makeId(),
        assetTag: assetTag ?? '',
        name: name ?? '',
        make: make ?? '',
        model: model ?? '',
        serialNumber: serialNumber ?? '',
        category: (category as any) || 'Other',
        condition: (condition as any) || 'Good',
        status: (status as any) || 'Available',
        location: location ?? '',
        assignedTo: assignedTo ?? '',
        checkoutDate: checkoutDate ?? '',
        expectedReturn: expectedReturn ?? '',
        purchaseDate: purchaseDate ?? '',
        purchaseValue: purchaseValue ?? '',
        notes: notes ?? '',
        createdAt: now,
        updatedAt: now,
      } as InventoryItem
    })
    .filter(i => i.name.trim())
}
