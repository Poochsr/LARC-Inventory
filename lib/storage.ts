import { InventoryItem } from '@/types'

const STORAGE_KEY = 'larc_w0eno_inventory_v1'

export function makeId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7)
}

const D = '2026-01-01T00:00:00.000Z'

const SAMPLE_DATA: InventoryItem[] = [
  {
    id: 's1', assetTag: 'LARC-001', name: 'HF Transceiver', make: 'Icom', model: 'IC-7300',
    serialNumber: 'IC7300-12345', category: 'HF Radio', condition: 'Excellent', status: 'Available',
    location: 'Club Shack', assignedTo: '', checkoutDate: '', expectedReturn: '',
    purchaseDate: '2021-04-10', purchaseValue: '1249.95',
    notes: 'Primary club HF rig. SDR-based receiver. Includes original power cable and microphone.',
    createdAt: D, updatedAt: D,
  },
  {
    id: 's2', assetTag: 'LARC-002', name: 'VHF/UHF Transceiver', make: 'Kenwood', model: 'TM-D710G',
    serialNumber: 'KW710-67890', category: 'VHF/UHF Radio', condition: 'Good', status: 'Available',
    location: 'Club Shack', assignedTo: '', checkoutDate: '', expectedReturn: '',
    purchaseDate: '2019-06-20', purchaseValue: '549.99',
    notes: 'APRS capable. Dual band 2m/70cm. Includes MH-71A4B mic.',
    createdAt: D, updatedAt: D,
  },
  {
    id: 's3', assetTag: 'LARC-003', name: 'Antenna Analyzer', make: 'MFJ', model: 'MFJ-269C',
    serialNumber: 'MFJ269-00113', category: 'Test Equipment', condition: 'Good', status: 'Checked Out',
    location: 'Club Shack', assignedTo: 'John K0ABC', checkoutDate: '2026-06-15', expectedReturn: '2026-06-30',
    purchaseDate: '2018-09-05', purchaseValue: '279.95',
    notes: 'Covers 1.8–170 MHz and 415–470 MHz. 9V battery or 12V DC power.',
    createdAt: D, updatedAt: D,
  },
  {
    id: 's4', assetTag: 'LARC-004', name: 'Linear Power Supply', make: 'Astron', model: 'RS-35A',
    serialNumber: 'ASTR35-4451', category: 'Power Supply', condition: 'Excellent', status: 'Available',
    location: 'Storage Cabinet', assignedTo: '', checkoutDate: '', expectedReturn: '',
    purchaseDate: '2020-02-14', purchaseValue: '159.95',
    notes: '35A continuous, 45A peak. Powers all club HF rigs.',
    createdAt: D, updatedAt: D,
  },
  {
    id: 's5', assetTag: 'LARC-005', name: 'Dual-Band Vertical Antenna', make: 'Diamond', model: 'X50A',
    serialNumber: '', category: 'Antenna', condition: 'Good', status: 'Available',
    location: 'Antenna Storage', assignedTo: '', checkoutDate: '', expectedReturn: '',
    purchaseDate: '2020-08-22', purchaseValue: '89.95',
    notes: '2m/70cm vertical. PL-259 connector. No radials needed.',
    createdAt: D, updatedAt: D,
  },
  {
    id: 's6', assetTag: 'LARC-006', name: 'Auto Antenna Tuner', make: 'LDG', model: 'AT-600ProII',
    serialNumber: 'LDG600-7891', category: 'Antenna Tuner', condition: 'Excellent', status: 'Available',
    location: 'Club Shack', assignedTo: '', checkoutDate: '', expectedReturn: '',
    purchaseDate: '2022-01-30', purchaseValue: '289.95',
    notes: '600W auto tuner. Compatible with IC-7300 via data port.',
    createdAt: D, updatedAt: D,
  },
  {
    id: 's7', assetTag: 'LARC-007', name: 'Digital Sound Card Interface', make: 'Tigertronics', model: 'SignaLink USB',
    serialNumber: 'SLNK-56782', category: 'Digital Interface', condition: 'Good', status: 'Available',
    location: 'Club Shack', assignedTo: '', checkoutDate: '', expectedReturn: '',
    purchaseDate: '2019-11-10', purchaseValue: '119.95',
    notes: 'USB audio interface for FT8, JS8Call, PSK31, WSPR.',
    createdAt: D, updatedAt: D,
  },
  {
    id: 's8', assetTag: 'LARC-008', name: 'C4FM Handheld Transceiver', make: 'Yaesu', model: 'FT-70DR',
    serialNumber: 'FT70-90123', category: 'Handheld Radio', condition: 'Fair', status: 'In Repair',
    location: 'Under Repair', assignedTo: '', checkoutDate: '', expectedReturn: '',
    purchaseDate: '2020-05-18', purchaseValue: '149.95',
    notes: 'C4FM/FM dual band HT. Battery not holding charge — needs new battery pack.',
    createdAt: D, updatedAt: D,
  },
  {
    id: 's9', assetTag: 'LARC-009', name: 'OCF Wire Dipole', make: 'Buckmaster', model: '7-Band OCF Dipole',
    serialNumber: '', category: 'Antenna', condition: 'Good', status: 'Available',
    location: 'Antenna Storage', assignedTo: '', checkoutDate: '', expectedReturn: '',
    purchaseDate: '2021-07-04', purchaseValue: '149.95',
    notes: '135 ft off-center fed dipole. Covers 80–6m with tuner. Used for Field Day.',
    createdAt: D, updatedAt: D,
  },
  {
    id: 's10', assetTag: 'LARC-010', name: 'Inverter Generator', make: 'Honda', model: 'EU2200i',
    serialNumber: 'HD2200-33441', category: 'Emergency Comms', condition: 'Good', status: 'Available',
    location: 'Storage Shed', assignedTo: '', checkoutDate: '', expectedReturn: '',
    purchaseDate: '2019-03-15', purchaseValue: '1099.00',
    notes: '2200W inverter generator. Used for Field Day and ARES deployments.',
    createdAt: D, updatedAt: D,
  },
]

export function getItems(): InventoryItem[] {
  if (typeof window === 'undefined') return SAMPLE_DATA
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SAMPLE_DATA))
      return SAMPLE_DATA
    }
    return JSON.parse(raw) as InventoryItem[]
  } catch {
    return SAMPLE_DATA
  }
}

export function saveItems(items: InventoryItem[]): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch {
    // Storage full or unavailable
  }
}
