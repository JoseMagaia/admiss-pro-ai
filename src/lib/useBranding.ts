import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getSettings } from "@/lib/dashboard.functions";
import logoLightAsset from "@/assets/fliq-logo-light.png.asset.json";
import logoDarkAsset from "@/assets/fliq-logo-dark.png.asset.json";

// Default white-label brand (FLIQ). Each Space can override these from
// Settings → Company. Light logo is used on light surfaces, dark logo on dark
// surfaces (e.g. the sidebar).
export const DEFAULT_BRAND = {
  name: "fliq",
  tagline: "Linkmoore Education · AI Admissions Platform",
  logoLight: logoLightAsset.url,
  logoDark: logoDarkAsset.url,
};

export type Branding = {
  name: string;
  tagline: string;
  logoLight: string;
  logoDark: string;
  /** Logo display size as a percentage of the default (100 = default). */
  scale: number;
};

// Default logo display size (percentage). 100 = the built-in size.
export const DEFAULT_LOGO_SCALE = 100;

// Reads the active Space's branding from company settings, falling back to the
// FLIQ defaults. Safe to call anywhere inside the authenticated dashboard.
export function useBranding(): Branding {
  const getFn = useServerFn(getSettings);
  const { data } = useQuery({ queryKey: ["settings"], queryFn: () => getFn() });
  const s = (data?.settings ?? null) as Record<string, string | number | null> | null;

  const rawScale = Number(s?.logo_scale);
  const scale = Number.isFinite(rawScale) && rawScale > 0 ? rawScale : DEFAULT_LOGO_SCALE;

  return {
    name: (s?.brand_name || s?.company_name || DEFAULT_BRAND.name) as string,
    tagline: (s?.brand_tagline ?? DEFAULT_BRAND.tagline) || DEFAULT_BRAND.tagline,
    logoLight: (s?.logo_light_url || DEFAULT_BRAND.logoLight) as string,
    logoDark: (s?.logo_dark_url || DEFAULT_BRAND.logoDark) as string,
    scale,
  };
}
