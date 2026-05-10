Trip banner images (hero + cards)
=================================

Add one image per emoji slug. The app uses PNG by default (`TRIP_BANNER_EXT` in
`src/lib/trip-emoji-banners.ts`). For JPG or WebP, change that constant.

Put files here:

  public/trip-banners/plane.png      → ✈️
  public/trip-banners/car.png        → 🚗
  public/trip-banners/beach.png      → 🏖️
  public/trip-banners/mountain.png   → 🏔️
  public/trip-banners/party.png      → 🎉
  public/trip-banners/pizza.png      → 🍕
  public/trip-banners/camping.png    → 🏕️
  public/trip-banners/train.png      → 🚂
  public/trip-banners/ship.png       → 🚢
  public/trip-banners/ferris.png     → 🎡
  public/trip-banners/default.png    → fallback / unknown emoji / missing slug

If a slug file is missing, the UI tries `default.png` next, then a gradient.
