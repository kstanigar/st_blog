import { loadStripe } from '@stripe/stripe-js';

export const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

// Map product IDs to Stripe Price IDs.
// Replace placeholder values after creating products in the Stripe dashboard.
export const PRODUCT_PRICES: Record<string, string> = {
  skin_neon_ghost:    'price_1TkJeXPh0Sm4tu9Pm0v5p5jT',
  skin_toxic:         'price_1TkJfKPh0Sm4tu9PJyJvFtgd',
  skin_solar_flare:   'price_1TkJgfPh0Sm4tu9PWLX2Mc9X',
  skin_ivory_static:  'price_1TkJhCPh0Sm4tu9PW3S78RTf',
  skin_blood_code:    'price_1TkJhmPh0Sm4tu9PeVUCucOf',
  skin_ember:         'price_1TkJiDPh0Sm4tu9PTPh8Iayd',
  color_wheel:        'price_1TkJiePh0Sm4tu9P2fhy7LZj',
  rainbow_cycle:      'price_1TkJjKPh0Sm4tu9PDaTfc5KY',
};
