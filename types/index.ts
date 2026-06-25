export type Category =
  | 'HF Radio'
  | 'VHF/UHF Radio'
  | 'Handheld Radio'
  | 'DMR Radio'
  | 'D-STAR Radio'
  | 'Antenna'
  | 'Coax & Cables'
  | 'Power Supply'
  | 'Antenna Tuner'
  | 'Test Equipment'
  | 'Digital Interface'
  | 'Headset & Mic'
  | 'Computer'
  | 'Emergency Comms'
  | 'Accessories'
  | 'Other'

export type Condition = 'Excellent' | 'Good' | 'Fair' | 'Poor' | 'Needs Repair'

export type Status = 'Available' | 'Checked Out' | 'In Repair' | 'Retired' | 'Lost'

export interface InventoryItem {
  id: string
  assetTag: string
  name: string
  make: string
  model: string
  serialNumber: string
  category: Category
  condition: Condition
  status: Status
  location: string
  assignedTo: string
  checkoutDate: string
  expectedReturn: string
  purchaseDate: string
  purchaseValue: string
  notes: string
  createdAt: string
  updatedAt: string
}

export const CATEGORIES: Category[] = [
  'HF Radio', 'VHF/UHF Radio', 'Handheld Radio', 'DMR Radio', 'D-STAR Radio',
  'Antenna', 'Coax & Cables', 'Power Supply', 'Antenna Tuner', 'Test Equipment',
  'Digital Interface', 'Headset & Mic', 'Computer', 'Emergency Comms', 'Accessories', 'Other',
]

export const CONDITIONS: Condition[] = ['Excellent', 'Good', 'Fair', 'Poor', 'Needs Repair']

export const STATUSES: Status[] = ['Available', 'Checked Out', 'In Repair', 'Retired', 'Lost']
