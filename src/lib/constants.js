export const CATS = [
  { id: 'plumbing',   label: 'Plumbing',               icon: '💧' },
  { id: 'electrical', label: 'Electrical',              icon: '⚡' },
  { id: 'structural', label: 'Structural / masonry',    icon: '🏗️' },
  { id: 'roofing',    label: 'Roofing / leakage',       icon: '🏠' },
  { id: 'painting',   label: 'Painting / wall repairs', icon: '🎨' },
  { id: 'flooring',   label: 'Flooring / tiles',        icon: '🪟' },
  { id: 'pest',       label: 'Pest control',            icon: '🐛' },
  { id: 'security',   label: 'Security / locks',        icon: '🔒' },
  { id: 'internet',   label: 'Internet / TV cable',     icon: '📶' },
  { id: 'water',      label: 'Water supply',            icon: '🚰' },
  { id: 'drainage',   label: 'Drainage / sewage',       icon: '🕳️' },
  { id: 'common',     label: 'Common area',             icon: '🌳' },
  { id: 'gate',       label: 'Gate / perimeter wall',   icon: '🚪' },
  { id: 'garbage',    label: 'Garbage / waste',         icon: '🗑️' },
  { id: 'other',      label: 'Other',                   icon: '•••' },
]

export const TECHNICIANS = ['Plumber','Electrician','Painter','Mason', 'Carpenter', 'Management', 'Unassigned']

export const URGENCY_OPTIONS = [
  { value: 'urgent',   label: 'Urgent',     sub: 'Needs immediate attention' },
  { value: 'moderate', label: 'Moderate',   sub: 'Can wait a few days' },
  { value: 'low',      label: 'Not urgent', sub: 'When convenient' },
]

export const REQUEST_SUBTYPES = [
  { value: 'gate-key',       label: 'Copy of gate key' },
  { value: 'house-key',      label: 'Copy of house key' },
  { value: 'house-transfer', label: 'House transfer' },
  { value: 'unit-change',    label: 'Unit upgrade / downgrade' },
  { value: 'lease-copy',     label: 'Copy of lease agreement' },
  { value: 'rent-statement', label: 'Rent statement / receipt' },
  { value: 'parking',        label: 'Parking allocation' },
  { value: 'paint',          label: 'Painting / redecoration' },
  { value: 'other-req',      label: 'Other request' },
]

export const STATUS_LABELS   = { pending: 'Pending', 'in-progress': 'In progress', resolved: 'Resolved' }
export const TYPE_LABELS     = { repair: 'Repair', complaint: 'Complaint', request: 'Request', suggestion: 'Suggestion' }
export const URGENCY_LABELS  = { urgent: 'Urgent', moderate: 'Moderate', low: 'Not urgent' }
