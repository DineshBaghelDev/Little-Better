export const colors = {
  background: "#FAF8F2",
  surface: "#FFFFFF",
  text: "#2F3A33",
  muted: "#6B6B6B",
  primary: "#6D8B6A",
  primaryDark: "#4F7455",
  sageSurface: "#E8F0E4",
  lavender: "#CDB7F6",
  lavenderSurface: "#F0EAFB",
  coral: "#FF8F7A",
  coralSurface: "#FFF0EA",
  mustard: "#F4C85B",
  mustardSurface: "#FFF5D9",
  border: "#E8E2D7",
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const radii = {
  control: 14,
  card: 18,
  pill: 999,
};

export const typography = {
  display: { fontSize: 30, fontWeight: "700" as const, lineHeight: 36 },
  screenTitle: { fontSize: 24, fontWeight: "700" as const, lineHeight: 30 },
  cardTitle: { fontSize: 16, fontWeight: "700" as const, lineHeight: 21 },
  body: { fontSize: 15, lineHeight: 22 },
  secondary: { fontSize: 12, lineHeight: 17 },
  micro: { fontSize: 11, lineHeight: 14 },
};

export const colorSchemes = {
  sage: { label: "Sage", primary: colors.primary, primaryDark: colors.primaryDark, surface: colors.sageSurface },
  teal: { label: "Teal", primary: "#7CC5C4", primaryDark: "#3F8583", surface: "#E5F6F5" },
  lavender: { label: "Lavender", primary: colors.lavender, primaryDark: "#765AB5", surface: colors.lavenderSurface },
  coral: { label: "Coral", primary: colors.coral, primaryDark: "#B95D4D", surface: colors.coralSurface },
  mustard: { label: "Mustard", primary: colors.mustard, primaryDark: "#9E741B", surface: colors.mustardSurface },
} as const;

export const backgroundPatterns = {
  none: "None",
  sprouts: "Sprouts",
  dots: "Dots",
  stars: "Stars",
} as const;

export const navStyles = {
  floating: "Floating",
  classic: "Classic",
  compact: "Compact",
} as const;

export type ColorScheme = keyof typeof colorSchemes;
export type BackgroundPattern = keyof typeof backgroundPatterns;
export type NavStyle = keyof typeof navStyles;

export function resolveAppearance(settings?: {
  backgroundPattern?: string;
  colorScheme?: string;
  navStyle?: string;
} | null) {
  const colorScheme = (settings?.colorScheme && settings.colorScheme in colorSchemes ? settings.colorScheme : "sage") as ColorScheme;
  const backgroundPattern = (settings?.backgroundPattern && settings.backgroundPattern in backgroundPatterns ? settings.backgroundPattern : "sprouts") as BackgroundPattern;
  const navStyle = (settings?.navStyle && settings.navStyle in navStyles ? settings.navStyle : "floating") as NavStyle;
  return { ...colorSchemes[colorScheme], backgroundPattern, colorScheme, navStyle };
}
