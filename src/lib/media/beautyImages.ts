/**

 * Curated Unsplash URLs for beauty / skincare (IDs verified HTTP 200).

 * Product cards should prefer `GET /api/products` image fields when the API is up.

 */

const BASE = 'https://images.unsplash.com';



export function unsplash(photoId: string, width = 1200): string {

  return `${BASE}/photo-${photoId}?auto=format&fit=crop&w=${width}&q=80`;

}



/** Hero, banners, large backgrounds */

export const beautyHero = {

  flatLay: unsplash('1702312685548-3832748d09d6', 1920),

  moodyProducts: unsplash('1612817288484-6f916006741a', 1600),

  spaRitual: unsplash('1540555700478-4be289fbecef', 1600),

  /** Light product flat-lay — used when an image fails (avoid dark placeholders) */

  imageFallback: unsplash('1618384874910-9f823a21babb', 1200),

} as const;



/** Home category bento grid */

export const beautyCategories = {

  moisturizers: unsplash('1685526724067-d57ebf14903d', 1400),

  serums: unsplash('1681487785847-c76e0dfd90e0', 1200),

  cleansers: unsplash('1695561115616-b4b719f1a242', 1200),

  sunscreen: unsplash('1681810814668-b498f00d4530', 1200),

  eyeCare: unsplash('1714980716170-64cae2744604', 1200),

  masks: unsplash('1636467769776-6c8db2bf3b3c', 1600),

} as const;



/** Best Sellers static fallback (matches showcase SKUs) */

export const beautyProducts = {

  serumVitaminC: unsplash('1618384874910-9f823a21babb', 1000),

  creamJar: unsplash('1685526724067-d57ebf14903d', 1000),

  snailEssence: unsplash('1681487785847-c76e0dfd90e0', 1000),

  foamCleanser: unsplash('1695561115616-b4b719f1a242', 1000),

  sunscreenTube: unsplash('1624746478154-4b6aafbe77b5', 1000),

  tonerBottle: unsplash('1616526629549-353331fea648', 1000),

  riceEssence: unsplash('1595300398913-3772655443e1', 1000),

  gelMoisturizer: unsplash('1556228720-195a672e8a03', 1000),

  niacinamide: unsplash('1666025068567-31e8618c0be2', 1000),

  clayMask: unsplash('1710693547884-41a6113d67d2', 1000),

  sleepingMask: unsplash('1570172619644-dfd03ed5d881', 1000),

  ingredients: unsplash('1628751784881-c8b7b6d4dd82', 1000),

} as const;



/** Lifestyle gallery strip on home */

export const beautyGallery = [

  { src: unsplash('1702312685548-3832748d09d6', 900), alt: 'Skincare products flat lay on cream marble' },

  { src: unsplash('1570172619644-dfd03ed5d881', 900), alt: 'Sheet mask packets arranged in pastel flat lay' },

  { src: unsplash('1616526629549-353331fea648', 900), alt: 'Toner bottle on white marble' },

  { src: unsplash('1617897903246-719242758050', 900), alt: 'Serum dropper bottle with soft studio lighting' },

  { src: unsplash('1670201202833-b0932731628f', 900), alt: 'Brightening essence bottle warm cream backdrop' },

  { src: unsplash('1714980716170-64cae2744604', 900), alt: 'Luxury eye cream jar close-up' },

  { src: unsplash('1540555700478-4be289fbecef', 900), alt: 'Spa facial treatment skincare ritual' },

  { src: unsplash('1628751784881-c8b7b6d4dd82', 900), alt: 'Skincare ingredients label detail' },

] as const;



/** Review avatars — natural portraits */

export const beautyPortraits = {

  mia: unsplash('1494790108377-be9c29b29330', 400),

  sophia: unsplash('1534528741775-53994a69daeb', 400),

  aisha: unsplash('1438761681033-6461ffad8d80', 400),

} as const;


