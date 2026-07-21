import * as React from 'react';
import {
  ShoppingCart,
  Utensils,
  Tv,
  Receipt,
  Car,
  Clapperboard,
  HeartPulse,
  ShoppingBag,
  Briefcase,
  Laptop,
  TrendingUp,
  Package,
  Target,
  Home,
  Plane,
  GraduationCap,
  Gem,
  Palmtree,
  CreditCard,
  AlertTriangle,
  Search,
  Coins,
  Sparkles,
  BarChart3,
  PartyPopper,
  Heart,
  Hand,
  LucideProps
} from 'lucide-react';

const iconMap: Record<string, React.ComponentType<LucideProps>> = {
  // Lucide Names
  target: Target,
  home: Home,
  plane: Plane,
  laptop: Laptop,
  car: Car,
  'graduation-cap': GraduationCap,
  gem: Gem,
  palmtree: Palmtree,
  'shopping-cart': ShoppingCart,
  utensils: Utensils,
  tv: Tv,
  receipt: Receipt,
  clapperboard: Clapperboard,
  'heart-pulse': HeartPulse,
  'shopping-bag': ShoppingBag,
  briefcase: Briefcase,
  'trending-up': TrendingUp,
  package: Package,
  'credit-card': CreditCard,
  'alert-triangle': AlertTriangle,
  search: Search,
  coins: Coins,
  sparkles: Sparkles,
  'bar-chart': BarChart3,
  'party-popper': PartyPopper,
  heart: Heart,
  hand: Hand,

  // Emojis for backwards compatibility
  '🎯': Target,
  '🏠': Home,
  '✈️': Plane,
  '✈': Plane,
  '💻': Laptop,
  '🚗': Car,
  '🎓': GraduationCap,
  '💍': Gem,
  '🌴': Palmtree,
  '🛒': ShoppingCart,
  '🍽️': Utensils,
  '🍽': Utensils,
  '📺': Tv,
  '🧾': Receipt,
  '🎬': Clapperboard,
  '🏥': HeartPulse,
  '🛍️': ShoppingBag,
  '🛍': ShoppingBag,
  '💼': Briefcase,
  '📈': TrendingUp,
  '📦': Package,
  '💳': CreditCard,
  '⚠️': AlertTriangle,
  '⚠': AlertTriangle,
  '🔍': Search,
  '💰': Coins,
  '✨': Sparkles,
  '📊': BarChart3,
  '🎉': PartyPopper,
  '♥': Heart,
  '👋': Hand
};

interface DynamicIconProps extends LucideProps {
  emoji: string;
}

export function DynamicIcon({ emoji, ...props }: DynamicIconProps) {
  const IconComponent = iconMap[emoji] || iconMap[emoji.trim()];
  if (!IconComponent) {
    // Fallback to text rendering of the emoji
    return <span className={props.className}>{emoji}</span>;
  }
  return <IconComponent {...props} />;
}
