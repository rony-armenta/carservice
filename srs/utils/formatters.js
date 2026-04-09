// Status label and CSS class helpers
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

// Avatar color map
export const AVATAR_COLOR = {
  blue:   { bg: '#E6F1FB', color: '#185FA5' },
  teal:   { bg: '#E1F5EE', color: '#0F6E56' },
  coral:  { bg: '#FAECE7', color: '#993C1D' },
  purple: { bg: '#EEEDFE', color: '#534AB7' },
  amber:  { bg: '#FAEEDA', color: '#854F0B' },
}

// Format a date to readable string
export const formatDate = (date = new Date()) =>
  date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
