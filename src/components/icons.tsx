/**
 * Sport Visa icon system.
 *
 * Custom SVG icons cover sport-domain concepts absent from Lucide.
 * All other icons are re-exported from lucide-react under semantic names
 * so import paths stay stable if the underlying library ever changes.
 *
 * Usage:
 *   import { FootballIcon, SearchIcon, VerifiedBadgeIcon } from '@/components/icons';
 */

// ─── Re-exports from lucide-react ────────────────────────────────────────────

export {
  // Navigation & layout
  Menu as MenuIcon,
  ChevronDown as ChevronDownIcon,
  ChevronUp as ChevronUpIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  ArrowLeft as ArrowLeftIcon,
  ArrowRight as ArrowRightIcon,
  ArrowDown as ArrowDownIcon,
  LayoutGrid as GridViewIcon,
  List as ListViewIcon,
  SlidersHorizontal as FiltersIcon,
  // User & auth
  User as UserIcon,
  Users as UsersIcon,
  LogIn as LogInIcon,
  LogOut as LogOutIcon,
  UserPlus as UserPlusIcon,
  // Actions
  Plus as PlusIcon,
  X as CloseIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Trash2 as DeleteIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  ExternalLink as ExternalLinkIcon,
  Copy as CopyIcon,
  RefreshCw as RefreshIcon,
  // Content & engagement
  Heart as HeartIcon,
  Eye as EyeIcon,
  Star as StarIcon,
  // Communication
  MessageCircle as MessageCircleIcon,
  Bell as BellIcon,
  Send as SendIcon,
  Paperclip as PaperclipIcon,
  // Status
  CheckCircle as CheckCircleIcon,
  XCircle as XCircleIcon,
  Clock as ClockIcon,
  AlertCircle as AlertCircleIcon,
  AlertTriangle as AlertTriangleIcon,
  Info as InfoIcon,
  // Media
  Image as ImageIcon,
  Video as VideoIcon,
  FileText as FileTextIcon,
  Camera as CameraIcon,
  // Services
  UtensilsCrossed as MealPlanIcon,
  Dumbbell as PersonalTrainerIcon,
  Stethoscope as TeamDoctorIcon,
  MoreHorizontal as OtherServicesIcon,
  // Data & stats
  BarChart3 as BarChartIcon,
  TrendingUp as TrendingUpIcon,
  // Location & time
  MapPin as MapPinIcon,
  Calendar as CalendarIcon,
  // Settings
  Settings as SettingsIcon,
  Shield as ShieldIcon,
  Lock as LockIcon,
  // Misc
  Globe as GlobeIcon,
  Link as LinkIcon,
  Share2 as ShareIcon,
  Flag as FlagIcon,
  Loader2 as SpinnerIcon,
} from 'lucide-react';

// ─── Custom SVG icons ─────────────────────────────────────────────────────────

import type { SVGProps } from 'react';
import { cn } from '@/lib/utils';

type IconProps = SVGProps<SVGSVGElement> & {
  size?: number;
  className?: string;
};

/**
 * Soccer ball — primary domain icon for sport context labels.
 */
export function FootballIcon({ size = 24, className, ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className={cn('shrink-0', className)}
      {...props}
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
      {/* Pentagon centre */}
      <polygon
        points="12,6.5 14.6,8.4 13.6,11.4 10.4,11.4 9.4,8.4"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinejoin="round"
        fill="currentColor"
        fillOpacity="0.15"
      />
      {/* Connecting patches */}
      <line
        x1="12"
        y1="6.5"
        x2="12"
        y2="2"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
      <line
        x1="14.6"
        y1="8.4"
        x2="18.5"
        y2="6.5"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
      <line
        x1="13.6"
        y1="11.4"
        x2="16.5"
        y2="14.5"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
      <line
        x1="10.4"
        y1="11.4"
        x2="7.5"
        y2="14.5"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
      <line
        x1="9.4"
        y1="8.4"
        x2="5.5"
        y2="6.5"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * Football jersey / shirt — used in profile cards and position pickers.
 */
export function JerseyIcon({ size = 24, className, ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className={cn('shrink-0', className)}
      {...props}
    >
      {/* Sleeves */}
      <path
        d="M2 8L7 6V11H2V8Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
        fill="currentColor"
        fillOpacity="0.1"
      />
      <path
        d="M22 8L17 6V11H22V8Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
        fill="currentColor"
        fillOpacity="0.1"
      />
      {/* Body */}
      <path
        d="M7 6C7 6 8.5 3 12 3C15.5 3 17 6 17 6V21H7V6Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
        fill="currentColor"
        fillOpacity="0.1"
      />
    </svg>
  );
}

/**
 * Football pitch / tactical board — used in position picker and analytics.
 */
export function PitchIcon({ size = 24, className, ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className={cn('shrink-0', className)}
      {...props}
    >
      {/* Pitch outline */}
      <rect x="2" y="2" width="20" height="20" rx="1" stroke="currentColor" strokeWidth="1.5" />
      {/* Centre line */}
      <line x1="2" y1="12" x2="22" y2="12" stroke="currentColor" strokeWidth="1.25" />
      {/* Centre circle */}
      <circle cx="12" cy="12" r="3.5" stroke="currentColor" strokeWidth="1.25" />
      {/* Centre spot */}
      <circle cx="12" cy="12" r="0.75" fill="currentColor" />
      {/* Top penalty area */}
      <rect x="7" y="2" width="10" height="5" stroke="currentColor" strokeWidth="1.25" />
      {/* Bottom penalty area */}
      <rect x="7" y="17" width="10" height="5" stroke="currentColor" strokeWidth="1.25" />
    </svg>
  );
}

/**
 * Verified badge — filled shield with a check. Used on verified profiles.
 * Colour should be set via className (e.g. `text-success`).
 */
export function VerifiedBadgeIcon({ size = 24, className, ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className={cn('shrink-0', className)}
      {...props}
    >
      {/* Shield fill */}
      <path
        d="M12 2L3 6V13C3 17.97 7.02 22.14 12 23C16.98 22.14 21 17.97 21 13V6L12 2Z"
        fill="currentColor"
        fillOpacity="0.15"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      {/* Check */}
      <path
        d="M8.5 12.5L10.5 14.5L15.5 9.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Pending badge — shield outline with a clock dot. Used on pending verifications.
 */
export function PendingBadgeIcon({ size = 24, className, ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className={cn('shrink-0', className)}
      {...props}
    >
      <path
        d="M12 2L3 6V13C3 17.97 7.02 22.14 12 23C16.98 22.14 21 17.97 21 13V6L12 2Z"
        fill="currentColor"
        fillOpacity="0.1"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      {/* Clock hands */}
      <circle cx="12" cy="13" r="3.5" stroke="currentColor" strokeWidth="1.25" />
      <path
        d="M12 11V13L13.5 14"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Position tag — compact pill-shaped icon for displaying a football position abbreviation.
 * Pass the position text as `children` or use standalone as a decorative shape.
 */
export function PositionTagIcon({ size = 24, className, ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className={cn('shrink-0', className)}
      {...props}
    >
      <rect
        x="2"
        y="7"
        width="20"
        height="10"
        rx="5"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="currentColor"
        fillOpacity="0.1"
      />
    </svg>
  );
}

/**
 * Transfer arrow — bidirectional arrow suggesting a transfer/move between clubs.
 */
export function TransferIcon({ size = 24, className, ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className={cn('shrink-0', className)}
      {...props}
    >
      <path
        d="M5 8H19M19 8L15 4M19 8L15 12"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M19 16H5M5 16L9 12M5 16L9 20"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
