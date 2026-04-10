export const STATUS_LABEL = {
  pending:  'Pending',
  progress: 'In progress',
  done:     'Done',
}

export const STATUS_CLASS = {
  pending:  'badge-pending',
  progress: 'badge-progress',
  done:     'badge-done',
}

export const CAR_STATUS_LABEL = {
  active:    'Active',
  'in-repair': 'In repair',
  inactive:  'Inactive',
}

export const CAR_STATUS_STYLE = {
  active:    { background: '#EAF3DE', color: '#3B6D11' },
  'in-repair': { background: '#E6F1FB', color: '#185FA5' },
  inactive:  { background: '#F1EFE8', color: '#5F5E5A' },
}

export const AVATAR_COLOR = {
  blue:   { bg: '#E6F1FB', color: '#185FA5' },
  teal:   { bg: '#E1F5EE', color: '#0F6E56' },
  coral:  { bg: '#FAECE7', color: '#993C1D' },
  purple: { bg: '#EEEDFE', color: '#534AB7' },
  amber:  { bg: '#FAEEDA', color: '#854F0B' },
}

export const formatDate = (date = new Date()) =>
  date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
