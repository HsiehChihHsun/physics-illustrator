import React from 'react';

export const IconWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        {children}
    </svg>
);

// --- PHY Icons ---

export const IconBlock = () => (
    <IconWrapper>
        <rect x="4" y="4" width="16" height="16" rx="2" />
    </IconWrapper>
);

export const IconWall = () => (
    <IconWrapper>
        <line x1="2" y1="14" x2="22" y2="14" strokeWidth="2.5" />
        <path d="M4 14L9 8" />
        <path d="M9 14L14 8" />
        <path d="M14 14L19 8" />
        <path d="M19 14L23 9" />
    </IconWrapper>
);

export const IconPulley = () => (
    <IconWrapper>
        {/* Ceiling */}
        <line x1="7" y1="4" x2="17" y2="4" strokeWidth="2" />
        {/* Hanger */}
        <line x1="12" y1="4" x2="12" y2="10" />
        {/* Wheel */}
        <circle cx="12" cy="10" r="4.5" />
        {/* Axle */}
        <circle cx="12" cy="10" r="1.5" fill="currentColor" />
        {/* Rope */}
        <path d="M7.5 21V10C7.5 10 7.5 5.5 12 5.5C16.5 5.5 16.5 10 16.5 10V21" strokeLinecap="round" />
    </IconWrapper>
);

export const IconSpring = () => (
    <IconWrapper>
        {/* Spiral Spring Style */}
        <path d="M17 5.5C17 4 14.5 4 13 5C11.5 6 11 8 12.5 9C14 10 16.5 9.5 17 8.5" />
        <path d="M17 9.5C17 8 14.5 8 13 9C11.5 10 11 12 12.5 13C14 14 16.5 13.5 17 12.5" />
        <path d="M17 13.5C17 12 14.5 12 13 13C11.5 14 11 16 12.5 17C14 18 16.5 17.5 17 16.5" />
        <path d="M17 17.5C17 16 14.5 16 13 17C11.5 18 11 20 12.5 21" />
    </IconWrapper>
);

// Rope / Catenary
export const IconRope = () => (
    <IconWrapper>
        <path d="M4 6C4 6 8 18 12 18C16 18 20 6 20 6" />
    </IconWrapper>
);


// --- Shape Icons ---

export const IconLine = () => (
    <IconWrapper>
        <line x1="5" y1="19" x2="19" y2="5" />
    </IconWrapper>
);

export const IconVector = () => (
    <IconWrapper>
        <line x1="5" y1="12" x2="19" y2="12" />
        <polyline points="12 5 19 12 12 19" />
    </IconWrapper>
);

export const IconTriangle = () => (
    <IconWrapper>
        <path d="M12 4L4 20H20L12 4Z" />
    </IconWrapper>
);

export const IconCircle = () => (
    <IconWrapper>
        <circle cx="12" cy="12" r="8" />
    </IconWrapper>
);

export const IconText = () => (
    <IconWrapper>
        <path d="M4 6H20" />
        <path d="M12 6V18" />
        <path d="M10 18H14" />
    </IconWrapper>
);


// --- Circuit Icons ---

export const IconWire = () => (
    <IconWrapper>
        <line x1="4" y1="12" x2="20" y2="12" />
    </IconWrapper>
);

export const IconDC = () => (
    <IconWrapper>
        <line x1="4" y1="12" x2="10" y2="12" />
        <line x1="14" y1="12" x2="20" y2="12" />
        <line x1="10" y1="7" x2="10" y2="17" />
        <line x1="14" y1="10" x2="14" y2="14" />
    </IconWrapper>
);

export const IconAC = () => (
    <IconWrapper>
        <circle cx="12" cy="12" r="8" />
        <path d="M8 12C8 12 9 10 10 10C11 10 12 12 12 12C12 12 13 14 14 14C15 14 16 12 16 12" />
    </IconWrapper>
);

export const IconResistor = () => (
    <IconWrapper>
        <path d="M4 12H6L8 8L11 16L14 8L16 16L18 12H20" />
    </IconWrapper>
);

export const IconInductor = () => (
    <IconWrapper>
        <path d="M4 12H6C6 12 7 8 9 8C11 8 11 12 11 12C11 12 12 8 14 8C16 8 16 12 16 12C16 12 17 8 19 8C20 8 20 12 20 12H21" />
    </IconWrapper>
);

export const IconCapacitor = () => (
    <IconWrapper>
        <line x1="4" y1="12" x2="10" y2="12" />
        <line x1="14" y1="12" x2="20" y2="12" />
        <line x1="10" y1="6" x2="10" y2="18" />
        <line x1="14" y1="6" x2="14" y2="18" />
    </IconWrapper>
);

export const IconDiode = () => (
    <IconWrapper>
        <path d="M4 12H8" />
        <path d="M16 12H20" />
        <path d="M8 7L16 12L8 17V7Z" />
        <line x1="16" y1="7" x2="16" y2="17" />
    </IconWrapper>
);

export const IconSwitch = () => (
    <IconWrapper>
        <circle cx="5" cy="12" r="1.5" fill="currentColor" />
        <circle cx="19" cy="12" r="1.5" fill="currentColor" />
        <line x1="5" y1="12" x2="17" y2="6" />
    </IconWrapper>
);


// --- UI / Toolbar Icons ---

export const IconSave = () => (
    <IconWrapper>
        <path d="M19 21H5C4.44772 21 4 20.5523 4 20V4C4 3.44772 4.44772 3 5 3H16L20 7V20C20 20.5523 19.5523 21 19 21Z" />
        <polyline points="17 21 17 13 7 13 7 21" />
        <polyline points="7 3 7 8 15 8" />
    </IconWrapper>
);

export const IconLoad = () => (
    <IconWrapper>
        <path d="M22 19C22 20.1 21.1 21 20 21H4C2.9 21 2 20.1 2 19V5C2 3.9 2.9 3 4 3H9L11 6H20C21.1 6 22 6.9 22 8V19Z" />
    </IconWrapper>
);

export const IconDelete = () => (
    <IconWrapper>
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6V20C19 20.5523 18.5523 21 18 21H6C5.44772 21 5 20.5523 5 20V6" />
        <line x1="10" y1="11" x2="10" y2="17" />
        <line x1="14" y1="11" x2="14" y2="17" />
        <path d="M9 6H15" />
    </IconWrapper>
);

export const IconVisible = () => (
    <IconWrapper>
        <path d="M1 12S5 4 12 4S23 12 23 12S19 20 12 20S1 12 1 12Z" />
        <circle cx="12" cy="12" r="3" />
    </IconWrapper>
);

export const IconInvisible = () => (
    <IconWrapper>
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20C5 20 1 12 1 12S3.59 6.82 7 5.05" />
        <path d="M1 1L23 23" />
        <path d="M16.97 5.03A10.5 10.5 0 0 1 23 12S20.72 17.5 16 19.16" />
        <path d="M12 4C13.59 4 15.06 4.46 16.32 5.24" />
        <path d="M12 9A3 3 0 0 0 9.88 14.12" />
        <path d="M14.12 10A3 3 0 0 1 10.9 9.1" />
    </IconWrapper>
);

export const IconDeselect = () => (
    <IconWrapper>
        <path d="M18 6L6 18" />
        <path d="M6 6L18 18" />
    </IconWrapper>
);

