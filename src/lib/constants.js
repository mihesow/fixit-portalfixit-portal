import { 
  Droplets, Zap, BrickWall, Home, PaintRoller, 
  LayoutGrid, Bug, Lock, Wifi, Droplet, 
  Waves, Trees, Fence, Trash2, MoreHorizontal 
} from 'lucide-react'

export const CATS = [
  { id: 'plumbing',   label: 'Plumbing',               icon: <Droplets size={18} /> },
  { id: 'electrical', label: 'Electrical',             icon: <Zap size={18} /> },
  { id: 'structural', label: 'Structural / masonry',   icon: <BrickWall size={18} /> },
  { id: 'roofing',    label: 'Roofing / leakage',      icon: <Home size={18} /> },
  { id: 'painting',   label: 'Painting / wall repairs',icon: <PaintRoller size={18} /> },
  { id: 'flooring',   label: 'Flooring / tiles',       icon: <LayoutGrid size={18} /> },
  { id: 'pest',       label: 'Pest control',           icon: <Bug size={18} /> },
  { id: 'security',   label: 'Security / locks',       icon: <Lock size={18} /> },
  { id: 'internet',   label: 'Internet / TV cable',    icon: <Wifi size={18} /> },
  { id: 'water',      label: 'Water supply',           icon: <Droplet size={18} /> },
  { id: 'drainage',   label: 'Drainage / sewage',      icon: <Waves size={18} /> },
  { id: 'common',     label: 'Common area',            icon: <Trees size={18} /> },
  { id: 'gate',       label: 'Gate / perimeter wall',  icon: <Fence size={18} /> },
  { id: 'garbage',    label: 'Garbage / waste',        icon: <Trash2 size={18} /> },
  { id: 'other',      label: 'Other',                  icon: <MoreHorizontal size={18} /> }
]

export const TECHNICIANS = ['Plumber','Electrician','Painter','Mason', 'Carpenter', 'Management', 'Unassigned']

export const URGENCY_OPTIONS = [
  { value: 'urgent',   label: 'Urgent',     sub: 'Needs immediate attention' },
  { value: 'moderate', label: 'Moderate',   sub: 'Can wait a few days' },
  { value: 'low',      label: 'Not urgent', sub: 'When convenient' },
]

export const REQUEST_SUBTYPES = [
  { value: 'gate-key',       label: 'Copy of gate key' },
  { value: 'house-key',      label: 'Copy of house keys' },
  { value: 'house-transfer', label: 'House transfer' },
  { value: 'unit-change',    label: 'Unit upgrade / downgrade' },
  { value: 'lease-copy',     label: 'Copy of lease agreement' },
  { value: 'rent-statement', label: 'Rent statement / receipt' },
  { value: 'paint',          label: 'Painting / redecoration' },
  { value: 'other-req',      label: 'Other request' },
]

export const STATUS_LABELS   = { pending: 'Pending', 'in-progress': 'In progress', resolved: 'Resolved' }
export const TYPE_LABELS     = { repair: 'Repair', complaint: 'Complaint', request: 'Request', suggestion: 'Suggestion' }
export const URGENCY_LABELS  = { urgent: 'Urgent', moderate: 'Moderate', low: 'Not urgent' }
