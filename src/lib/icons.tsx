/**
 * Lucide-compatible shim around @phosphor-icons/react.
 * Lets existing components keep using <Icon size={} strokeWidth={} className={} />
 * while rendering Phosphor icons (https://phosphoricons.com).
 */
import {
  Baby as PhBaby,
  Pill as PhPill,
  Drop as PhShowerHead,
  Stethoscope as PhStethoscope,
  Smiley as PhSmiley,
  Leaf as PhLeaf,
  Flame as PhFlame,
  Hospital as PhHospital,
  Star as PhStar,
  Truck as PhTruck,
  ShieldCheck as PhShieldCheck,
  Quotes as PhQuotes,
  EnvelopeSimple as PhEnvelope,
  Package as PhPackage,
  Users as PhUsers,
  MagnifyingGlass as PhSearch,
  ShoppingCart as PhCart,
  List as PhMenu,
  X as PhX,
  Plus as PhPlus,
  Minus as PhMinus,
  Eye as PhEye,
  SlidersHorizontal as PhSliders,
  GridFour as PhGrid,
  ListBullets as PhListBullets,
  CaretRight as PhCaretRight,
  ArrowsDownUp as PhArrowsDownUp,
  ArrowCounterClockwise as PhRotate,
  Globe as PhGlobe,
  Phone as PhPhone,
  MapPin as PhMapPin,
  FacebookLogo as PhFacebook,
  InstagramLogo as PhInstagram,
  PencilSimple as PhPencil,
  Trash as PhTrash,
  UploadSimple as PhUpload,
  SignOut as PhSignOut,
  CaretDown as PhCaretDown,
  type Icon as PhIcon,
  type IconWeight,
} from "@phosphor-icons/react";
import type { ComponentProps, ComponentType } from "react";

type LucideLikeProps = Omit<ComponentProps<PhIcon>, "weight"> & {
  /** Lucide compat — mapped to Phosphor weight (>=2 = bold, else regular). */
  strokeWidth?: number;
  /** Allow direct override. */
  weight?: IconWeight;
};

const wrap = (PhComp: PhIcon, defaultWeight: IconWeight = "regular"): ComponentType<LucideLikeProps> => {
  const Wrapped = ({ strokeWidth, weight, ...rest }: LucideLikeProps) => {
    const w: IconWeight = weight ?? (strokeWidth !== undefined && strokeWidth >= 2 ? "bold" : defaultWeight);
    return <PhComp weight={w} {...rest} />;
  };
  Wrapped.displayName = `PhShim(${PhComp.displayName ?? "Icon"})`;
  return Wrapped;
};

// Re-export with Lucide names used across the codebase.
export const Baby = wrap(PhBaby);
export const Pill = wrap(PhPill);
export const ShowerHead = wrap(PhShowerHead);
export const Stethoscope = wrap(PhStethoscope);
export const SmilePlus = wrap(PhSmiley);
export const Leaf = wrap(PhLeaf);
export const Flame = wrap(PhFlame);
export const Hospital = wrap(PhHospital);
export const Star = wrap(PhStar);
export const Truck = wrap(PhTruck);
export const ShieldCheck = wrap(PhShieldCheck);
export const Quote = wrap(PhQuotes);
export const Mail = wrap(PhEnvelope);
export const Package = wrap(PhPackage);
export const Users = wrap(PhUsers);
export const Search = wrap(PhSearch);
export const ShoppingCart = wrap(PhCart);
export const Menu = wrap(PhMenu);
export const X = wrap(PhX);
export const Plus = wrap(PhPlus);
export const Minus = wrap(PhMinus);
export const Eye = wrap(PhEye);
export const SlidersHorizontal = wrap(PhSliders);
export const Grid3X3 = wrap(PhGrid);
export const List = wrap(PhListBullets);
export const ChevronRight = wrap(PhCaretRight);
export const ArrowUpDown = wrap(PhArrowsDownUp);
export const RotateCcw = wrap(PhRotate);
export const Globe = wrap(PhGlobe);
export const Phone = wrap(PhPhone);
export const MapPin = wrap(PhMapPin);
export const Facebook = wrap(PhFacebook);
export const Instagram = wrap(PhInstagram);
export const Pencil = wrap(PhPencil);
export const Trash2 = wrap(PhTrash);
export const UploadCloud = wrap(PhUpload);
export const LogOut = wrap(PhSignOut);
export const ChevronDown = wrap(PhCaretDown);
