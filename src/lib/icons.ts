import {
  Baby,
  Bone,
  Brain,
  Eye,
  Flower2,
  HeartHandshake,
  HeartPulse,
  Smile,
  Sparkles,
  Stethoscope,
  type LucideIcon,
} from "lucide-react";

export const SPECIALTY_ICONS: Record<string, LucideIcon> = {
  heart: HeartPulse,
  brain: Brain,
  sparkles: Sparkles,
  bone: Bone,
  baby: Baby,
  handshake: HeartHandshake,
  smile: Smile,
  stethoscope: Stethoscope,
  eye: Eye,
  flower: Flower2,
};

export function specialtyIcon(key: string): LucideIcon {
  return SPECIALTY_ICONS[key] ?? Stethoscope;
}
