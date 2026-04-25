import React from 'react'

const base = (size = 20) => ({
  width: size, height: size, viewBox: '0 0 24 24',
  fill: 'none', stroke: 'currentColor',
  strokeWidth: 1.7, strokeLinecap: 'round', strokeLinejoin: 'round',
  'aria-hidden': true,
})

export const IconCompass = ({ size }) => (
  <svg {...base(size)}>
    <circle cx="12" cy="12" r="9" />
    <polygon points="15.5,8.5 13.5,13.5 8.5,15.5 10.5,10.5" fill="currentColor" stroke="none" />
  </svg>
)

export const IconHome = ({ size }) => (
  <svg {...base(size)}>
    <path d="M3 11.5L12 4l9 7.5" />
    <path d="M5 10v10h14V10" />
  </svg>
)

export const IconGrid = ({ size }) => (
  <svg {...base(size)}>
    <rect x="3" y="3" width="7" height="7" rx="1.2" />
    <rect x="14" y="3" width="7" height="7" rx="1.2" />
    <rect x="3" y="14" width="7" height="7" rx="1.2" />
    <rect x="14" y="14" width="7" height="7" rx="1.2" />
  </svg>
)

export const IconMusic = ({ size }) => (
  <svg {...base(size)}>
    <path d="M9 18V6l11-2v12" />
    <circle cx="6.5" cy="18" r="2.5" />
    <circle cx="17.5" cy="16" r="2.5" />
  </svg>
)

export const IconPlus = ({ size }) => (
  <svg {...base(size)}>
    <path d="M12 5v14M5 12h14" />
  </svg>
)

export const IconChart = ({ size }) => (
  <svg {...base(size)}>
    <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
  </svg>
)

export const IconDocument = ({ size }) => (
  <svg {...base(size)}>
    <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
    <path d="M14 3v5h5" />
    <path d="M9 13h6M9 17h4" />
  </svg>
)

export const IconWallet = ({ size }) => (
  <svg {...base(size)}>
    <path d="M3 7a2 2 0 0 1 2-2h14v4" />
    <rect x="3" y="7" width="18" height="13" rx="2" />
    <circle cx="17" cy="13.5" r="1.2" fill="currentColor" stroke="none" />
  </svg>
)

export const IconTag = ({ size }) => (
  <svg {...base(size)}>
    <path d="M20.6 13.4l-7.2 7.2a2 2 0 0 1-2.8 0l-7.2-7.2a2 2 0 0 1-.6-1.4V5a2 2 0 0 1 2-2h7a2 2 0 0 1 1.4.6l7.4 7.4a2 2 0 0 1 0 2.4z" />
    <circle cx="8.5" cy="8.5" r="1.4" fill="currentColor" stroke="none" />
  </svg>
)

export const IconStar = ({ size }) => (
  <svg {...base(size)}>
    <polygon points="12,3 14.6,9.2 21,9.8 16,14.1 17.6,20.4 12,17 6.4,20.4 8,14.1 3,9.8 9.4,9.2" />
  </svg>
)

export const IconBag = ({ size }) => (
  <svg {...base(size)}>
    <path d="M5 8h14l-1.2 11a2 2 0 0 1-2 1.8H8.2a2 2 0 0 1-2-1.8z" />
    <path d="M8.5 8V6a3.5 3.5 0 0 1 7 0v2" />
  </svg>
)

export const IconShield = ({ size }) => (
  <svg {...base(size)}>
    <path d="M12 3l8 3v6c0 4.5-3.4 8.4-8 9-4.6-.6-8-4.5-8-9V6z" />
  </svg>
)

export const IconEdit = ({ size }) => (
  <svg {...base(size)}>
    <path d="M4 20h4l11-11-4-4L4 16z" />
    <path d="M14 6l4 4" />
  </svg>
)

export const IconFolder = ({ size }) => (
  <svg {...base(size)}>
    <path d="M3 6a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
  </svg>
)

export const IconBuilding = ({ size }) => (
  <svg {...base(size)}>
    <rect x="4" y="3" width="16" height="18" rx="1.2" />
    <path d="M8 7h2M14 7h2M8 11h2M14 11h2M8 15h2M14 15h2M10 21v-3h4v3" />
  </svg>
)

export const IconLayers = ({ size }) => (
  <svg {...base(size)}>
    <polygon points="12,3 22,8 12,13 2,8" />
    <polyline points="2,12 12,17 22,12" />
    <polyline points="2,16 12,21 22,16" />
  </svg>
)

export const IconUser = ({ size }) => (
  <svg {...base(size)}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21c1.5-4 5-6 8-6s6.5 2 8 6" />
  </svg>
)

export const IconLogout = ({ size }) => (
  <svg {...base(size)}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <path d="M16 17l5-5-5-5" />
    <path d="M21 12H9" />
  </svg>
)

export const IconBell = ({ size }) => (
  <svg {...base(size)}>
    <path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9z" />
    <path d="M10 21a2 2 0 0 0 4 0" />
  </svg>
)

export const IconCheck = ({ size }) => (
  <svg {...base(size)}>
    <path d="M5 12.5l4.5 4.5L19 7" />
  </svg>
)

export const IconXCircle = ({ size }) => (
  <svg {...base(size)}>
    <circle cx="12" cy="12" r="9" />
    <path d="M9 9l6 6M15 9l-6 6" />
  </svg>
)

export const IconCheckCircle = ({ size }) => (
  <svg {...base(size)}>
    <circle cx="12" cy="12" r="9" />
    <path d="M8 12.5l3 3 5-6" />
  </svg>
)

export const IconKey = ({ size }) => (
  <svg {...base(size)}>
    <circle cx="8" cy="15" r="4" />
    <path d="M11 12l9-9M16 7l3 3M19 4l3 3" />
  </svg>
)

export const IconDownload = ({ size }) => (
  <svg {...base(size)}>
    <path d="M12 4v12M7 11l5 5 5-5" />
    <path d="M5 20h14" />
  </svg>
)

export const IconLock = ({ size }) => (
  <svg {...base(size)}>
    <rect x="5" y="11" width="14" height="10" rx="1.6" />
    <path d="M8 11V8a4 4 0 0 1 8 0v3" />
  </svg>
)

export const IconChat = ({ size }) => (
  <svg {...base(size)}>
    <path d="M4 5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H9l-5 4z" />
  </svg>
)

export const IconSettings = ({ size }) => (
  <svg {...base(size)}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
  </svg>
)

export const IconChevronUp = ({ size = 12 }) => (
  <svg {...base(size)}>
    <polyline points="6,15 12,9 18,15" />
  </svg>
)

export const IconChevronDown = ({ size = 12 }) => (
  <svg {...base(size)}>
    <polyline points="6,9 12,15 18,9" />
  </svg>
)

export const IconMore = ({ size }) => (
  <svg {...base(size)}>
    <circle cx="5" cy="12" r="1.6" fill="currentColor" stroke="none" />
    <circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none" />
    <circle cx="19" cy="12" r="1.6" fill="currentColor" stroke="none" />
  </svg>
)

export const IconCrown = ({ size }) => (
  <svg {...base(size)}>
    <path d="M3 7l4 4 5-7 5 7 4-4-2 12H5z" />
  </svg>
)
