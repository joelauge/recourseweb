import React from 'react';
import logoSrc from '../../assets/logo.svg';

// Common Icon Wrapper
const Icon = ({ d, size = 16, viewBox = "0 0 24 24", strokeWidth = 2, fill = "none", stroke = "currentColor", style }) => (
  <svg width={size} height={size} viewBox={viewBox} fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={style}>
    {d}
  </svg>
);


export const LogoSVG = ({ height = 28 }) => (
  <img src={logoSrc} alt="KnowDrive" height={height} style={{ display: 'block' }} />
);

export const DBIcon = ({size}) => <Icon d={<><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></>} size={size}/>;
export const UploadIcon = ({size}) => <Icon d={<><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></>} size={size}/>;
export const SearchIcon = ({size}) => <Icon d={<><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></>} size={size}/>;
export const ListIcon = ({size}) => <Icon d={<><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></>} size={size}/>;
export const DiffIcon = ({size}) => <Icon d={<><path d="M11 12H3"/><path d="M21 12h-8"/><path d="M12 3v8"/><path d="M12 13v8"/></>} size={size}/>;
export const ExtractIcon = ({size}) => <Icon d={<><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></>} size={size}/>;
export const MapIcon = ({size}) => <Icon d={<><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></>} size={size}/>;
export const InfoIcon = ({size}) => <Icon d={<><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></>} size={size}/>;
export const MoreVerticalIcon = ({size}) => <Icon d={<><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></>} size={size}/>;
export const ActionChatIcon = ({size}) => <Icon d={<><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></>} size={size}/>;
export const FileIcon = ({size}) => <Icon d={<><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/></>} size={size}/>;
export const PlusIcon = ({size}) => <Icon d={<><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>} size={size}/>;
export const MicIcon = ({size}) => <Icon d={<><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></>} size={size || 14}/>;
export const ImageIcon  = ({size}) => <Icon d={<><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></>} size={size || 14}/>;
export const VideoIcon  = ({size}) => <Icon d={<><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></>} size={size || 14}/>;
export const ChevronIcon = ({size, style}) => <Icon d={<polyline points="6 9 12 15 18 9"/>} size={size || 14} style={style}/>;
export const CheckIcon = ({size}) => <Icon d={<polyline points="20 6 9 17 4 12"/>} size={size || 14}/>;
export const SettingsIcon = ({size}) => <Icon d={<><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></>} size={size || 14}/>;
export const UserPlusIcon = ({size}) => <Icon d={<><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></>} size={size || 14}/>;
export const MoveIcon = ({size}) => <Icon d={<><polyline points="5 9 2 12 5 15"/><polyline points="9 5 12 2 15 5"/><polyline points="15 19 12 22 9 19"/><polyline points="19 9 22 12 19 15"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="12" y1="2" x2="12" y2="22"/></>} size={size || 14}/>;
export const SendIcon = ({size}) => <Icon d={<><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></>} size={size || 14}/>;
export const CameraIcon = ({size}) => <Icon d={<><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></>} size={size || 14}/>;
export const AudioRecordIcon = ({size}) => <Icon d={<><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3" fill="currentColor" stroke="none"/></>} size={size || 14}/>;
export const VideoRecordIcon = ({size}) => <Icon d={<><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/><circle cx="6" cy="12" r="1.5" fill="currentColor" stroke="none"/></>} size={size || 14}/>;
export const XCircleIcon = ({size}) => <Icon d={<><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></>} size={size || 14}/>;
export const PlayIcon = ({size}) => <Icon d={<polygon points="5 3 19 12 5 21 5 3" fill="currentColor" stroke="none"/>} size={size || 14}/>;
export const EyeIcon = ({size}) => <Icon d={<><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>} size={size || 14}/>;

export const SidebarToggleIcon = ({ active }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: active ? 1 : 0.5 }}>
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M9 3v18" />
    {active && <path d="M3 5c0-1.1.9-2 2-2h4v18H5c-1.1 0-2-.9-2-2V5z" fill="currentColor" opacity="0.2" />}
  </svg>
);

export const RightSidebarToggleIcon = ({ active }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: active ? 1 : 0.5 }}>
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M15 3v18" />
    {active && <path d="M15 3h4c1.1 0 2 .9 2 2v14c0 1.1-.9 2-2 2h-4V3z" fill="currentColor" opacity="0.2" />}
  </svg>
);

export const TopPanelToggleIcon = ({ active }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: active ? 1 : 0.5 }}>
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M3 10h18" />
    {active && <path d="M3 5c0-1.1.9-2 2-2h14c1.1 0 2 .9 2 2v5H3V5z" fill="currentColor" opacity="0.2" />}
  </svg>
);

export const BottomPanelToggleIcon = ({ active }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: active ? 1 : 0.5 }}>
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M3 14h18" />
    {active && <path d="M3 14h18v5c0 1.1-.9 2-2 2H5c-1.1 0-2-.9-2-2v-5z" fill="currentColor" opacity="0.2" />}
  </svg>
);

export const WarnIcon = ({size}) => <Icon d={<><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></>} size={size || 14}/>;
export const ChatIcon = ({size}) => <Icon d={<path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>} size={size || 14}/>;
export const ViewToggleIcon = ({size}) => <Icon d={<><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></>} size={size || 14}/>;
export const TreeViewIcon = ({size}) => <Icon d={<><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18"/><path d="M14 9h7"/><path d="M14 15h7"/><path d="M3 9h6"/><path d="M3 15h6"/></>} size={size || 14}/>;

export const FolderIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--amber)' }}>
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
  </svg>
);

export const TYPE_ICONS = {
  vec: () => <Icon d={<><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></>} size={20}/>,
  kb:  () => <Icon d={<><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></>} size={20}/>,
  raw: () => <Icon d={<><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></>} size={20}/>,
  img: () => <Icon d={<><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></>} size={20}/>,
  vid: () => <Icon d={<><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></>} size={20}/>,
};

export const TYPE_LABELS = { vec:"VEC", kb:"KB", raw:"RAW", img:"IMG", vid:"VID" };
export const TAG_MAP = { blue:"ftag ftag-blue", teal:"ftag ftag-teal", violet:"ftag ftag-violet", amber:"ftag ftag-amber", red:"ftag ftag-red", gray:"ftag ftag-gray", green:"ftag ftag-green" };
