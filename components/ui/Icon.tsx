import React from "react";

/**
 * Single stroke-icon set for the whole product.
 *
 * Every icon is drawn on a 24×24 grid with a 1.6 stroke and round caps, so
 * they stay optically consistent at any size. `currentColor` throughout —
 * colour comes from the parent, never from the icon.
 */

export type IconName =
  | "sparkle"
  | "search"
  | "globe"
  | "brain"
  | "code"
  | "document"
  | "layers"
  | "shield"
  | "route"
  | "arrowRight"
  | "arrowUp"
  | "arrowUpRight"
  | "plus"
  | "paperclip"
  | "target"
  | "copy"
  | "refresh"
  | "share"
  | "settings"
  | "sliders"
  | "chevronDown"
  | "check"
  | "upload"
  | "image"
  | "lock"
  | "eye"
  | "users"
  | "book"
  | "message"
  | "sun"
  | "moon"
  | "menu"
  | "close"
  | "star"
  | "zap"
  | "dots";

const paths: Record<IconName, React.ReactNode> = {
  sparkle: (
    <>
      <path d="M12 3l1.6 4.9L18.5 9.5l-4.9 1.6L12 16l-1.6-4.9L5.5 9.5l4.9-1.6z" />
      <path d="M18.5 15.5l.7 2.1 2.1.7-2.1.7-.7 2.1-.7-2.1-2.1-.7 2.1-.7z" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.9-3.9" />
    </>
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3a15 15 0 0 1 0 18a15 15 0 0 1 0-18z" />
    </>
  ),
  brain: (
    <>
      <path d="M9 4a2.5 2.5 0 0 0-2.5 2.5A2.5 2.5 0 0 0 5 9v1.5A2.5 2.5 0 0 0 6 15v.5A2.5 2.5 0 0 0 9 20a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" />
      <path d="M15 4a2.5 2.5 0 0 1 2.5 2.5A2.5 2.5 0 0 1 19 9v1.5a2.5 2.5 0 0 1-1 4.5v.5a2.5 2.5 0 0 1-3 4.5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />
    </>
  ),
  code: (
    <>
      <path d="M9 17l-5-5 5-5" />
      <path d="M15 7l5 5-5 5" />
    </>
  ),
  document: (
    <>
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
      <path d="M14 3v5h5" />
      <path d="M9 13h6M9 17h4" />
    </>
  ),
  layers: (
    <>
      <path d="M12 3l9 5-9 5-9-5 9-5z" />
      <path d="M3 13l9 5 9-5" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3l7 3v5.5c0 4.4-3 8-7 9.5-4-1.5-7-5.1-7-9.5V6z" />
      <path d="M9.2 12.2l2 2 3.6-3.8" />
    </>
  ),
  route: (
    <>
      <circle cx="6" cy="6" r="2.5" />
      <circle cx="18" cy="18" r="2.5" />
      <path d="M8.5 6H14a3.5 3.5 0 0 1 0 7h-4a3.5 3.5 0 0 0 0 7h5.5" />
    </>
  ),
  arrowRight: (
    <>
      <path d="M4 12h15" />
      <path d="M13 6l6 6-6 6" />
    </>
  ),
  arrowUp: (
    <>
      <path d="M12 20V5" />
      <path d="M6 11l6-6 6 6" />
    </>
  ),
  arrowUpRight: (
    <>
      <path d="M7 17L17 7" />
      <path d="M8 7h9v9" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  paperclip: (
    <path d="M20 11.5l-8 8a5 5 0 0 1-7-7l8.5-8.5a3.4 3.4 0 0 1 4.8 4.8L10 17a1.8 1.8 0 0 1-2.5-2.5l7.5-7.5" />
  ),
  target: (
    <>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="3.5" />
    </>
  ),
  copy: (
    <>
      <rect x="9" y="9" width="11" height="11" rx="2.5" />
      <path d="M5 15H4.5A1.5 1.5 0 0 1 3 13.5v-9A1.5 1.5 0 0 1 4.5 3h9A1.5 1.5 0 0 1 15 4.5V5" />
    </>
  ),
  refresh: (
    <>
      <path d="M20 12a8 8 0 1 1-2.4-5.7" />
      <path d="M20 4v4h-4" />
    </>
  ),
  share: (
    <>
      <path d="M12 15V4" />
      <path d="M8 8l4-4 4 4" />
      <path d="M4 14v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4" />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3.1" />
      <path d="M12 2.4l1.7 2.3 2.8-.6.5 2.8 2.6 1.2-1.4 2.5 1.4 2.5-2.6 1.2-.5 2.8-2.8-.6L12 21.6l-1.7-2.3-2.8.6-.5-2.8-2.6-1.2 1.4-2.5-1.4-2.5 2.6-1.2.5-2.8 2.8.6z" />
    </>
  ),
  sliders: (
    <>
      <path d="M4 8h8M16.5 8H20" />
      <circle cx="14.2" cy="8" r="2.3" />
      <path d="M4 16h3.5M12 16h8" />
      <circle cx="9.8" cy="16" r="2.3" />
    </>
  ),
  chevronDown: <path d="M6 9.5l6 6 6-6" />,
  check: <path d="M5 12.5l4.5 4.5L19 7" />,
  upload: (
    <>
      <path d="M4 15v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" />
      <path d="M8 8l4-4 4 4" />
      <path d="M12 4v12" />
    </>
  ),
  image: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2.5" />
      <circle cx="8.5" cy="9.5" r="1.5" />
      <path d="M4 17l4.5-4.5a2 2 0 0 1 2.8 0L16 17" />
      <path d="M14.5 15l1.7-1.7a2 2 0 0 1 2.8 0L21 15.3" />
    </>
  ),
  lock: (
    <>
      <rect x="4" y="10" width="16" height="10" rx="2.5" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </>
  ),
  eye: (
    <>
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2.5 20a6.5 6.5 0 0 1 13 0" />
      <path d="M16 5.2a3.5 3.5 0 0 1 0 6.6" />
      <path d="M18 14.6a6.5 6.5 0 0 1 3.5 5.4" />
    </>
  ),
  book: (
    <>
      <path d="M3 5.5A2.5 2.5 0 0 1 5.5 3H11v16H5.5A2.5 2.5 0 0 0 3 21.5z" />
      <path d="M21 5.5A2.5 2.5 0 0 0 18.5 3H13v16h5.5a2.5 2.5 0 0 1 2.5 2.5z" />
    </>
  ),
  message: (
    <path d="M20 14.5a2.5 2.5 0 0 1-2.5 2.5H8l-4 4V5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5z" />
  ),
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M22 12h-2M4 12H2M19 5l-1.5 1.5M6.5 17.5L5 19M19 19l-1.5-1.5M6.5 6.5L5 5" />
    </>
  ),
  moon: <path d="M20 13.4A8.2 8.2 0 0 1 10.6 4a8.4 8.4 0 1 0 9.4 9.4z" />,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  close: <path d="M6 6l12 12M18 6L6 18" />,
  star: (
    <path d="M12 3.5l2.6 5.3 5.9.9-4.2 4.1 1 5.8-5.3-2.8-5.3 2.8 1-5.8L3.5 9.7l5.9-.9z" />
  ),
  zap: <path d="M13 2L4.5 13.5H11l-1 8.5L19.5 10.5H13z" />,
  dots: (
    <>
      <circle cx="5" cy="12" r="1.2" />
      <circle cx="12" cy="12" r="1.2" />
      <circle cx="19" cy="12" r="1.2" />
    </>
  ),
};

/* These read better as solid shapes than as outlines. */
const filled = new Set<IconName>(["sparkle", "star", "zap", "dots"]);

interface IconProps extends React.SVGProps<SVGSVGElement> {
  name: IconName;
  size?: number;
  strokeWidth?: number;
}

export default function Icon({
  name,
  size = 20,
  strokeWidth = 1.6,
  ...rest
}: IconProps) {
  const isFilled = filled.has(name);
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={isFilled ? "currentColor" : "none"}
      stroke={isFilled ? "none" : "currentColor"}
      strokeWidth={isFilled ? undefined : strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      {paths[name]}
    </svg>
  );
}
