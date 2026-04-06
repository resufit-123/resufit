import Stripe from "stripe";
import type { Currency, Plan } from "@/types";

// Singleton Stripe client — server-only
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-01-27.acacia",
  typescript: true,
});

// ── Price ID lookup ───────────────────────────────────────────
// Maps plan + currency to the correct Stripe Price ID.
// All nine IDs are set as env vars (3 plans × 3 currencies).

type PriceKey = `${Plan}_${Currency}`;

const PRICE_MAP: Record<PriceKey, string | undefined> = {
  one_time_usd: process.env.STRIPE_PRICE_ONETIME_USD,
  one_time_gbp: process.env.STRIPE_PRICE_ONETIME_GBP,
  one_time_eur: process.env.STRIPE_PRICE_ONETIME_EUR,
  pro_usd:      process.env.STRIPE_PRICE_PRO_USD,
  pro_gbp:      process.env.STRIPE_PRICE_PRO_GBP,
  pro_eur:      process.env.STRIPE_PRICE_PRO_EUR,
  annual_usd:   process.env.STRIPE_PRICE_ANNUAL_USD,
  annual_gbp:   process.env.STRIPE_PRICE_ANNUAL_GBP,
  annual_eur:   process.env.STRIPE_PRICE_ANNUAL_EUR,
};

export function getPriceId(plan: Plan, currency: Currency): string {
  const key: PriceKey = `${plan}_${currency}`;
  const priceId = PRICE_MAP[key];
  if (!priceId) throw new Error(`No Stripe price configured for ${key}`);
  return priceId;
}

// ── Currency detection ────────────────────────────────────────
// Infer the user's preferred currency from the Accept-Language /
// country header that Vercel injects (CF-IPCountry / x-vercel-ip-country).

const GBP_COUNTRIES = new Set(["GB", "IM", "JE", "GG"]);
const EUR_COUNTRIES = new Set([
  "AT","BE","CY","EE","FI","FR","DE","GR","IE","IT",
  "LV","LT","LU","MT","NL","PT","SK","SI","ES",
]);

export function detectCurrency(countryCode: string | null): Currency {
  if (!countryCode) return "usd";
  const code = countryCode.toUpperCase();
  if (GBP_COUNTRIES.has(code)) return "gbp";
  if (EUR_COUNTRIES.has(code)) return "eur";
  return "usd";
}

// ── Optimizations limit per plan ─────────────────────────────
export const PLAN_LIMITS: Record<Plan, number> = {
  one_time: 1,
  pro: 30,
  annual: 50,
};
