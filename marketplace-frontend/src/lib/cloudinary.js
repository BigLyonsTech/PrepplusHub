// Cloudinary integration, kept intentionally minimal: we build delivery URLs
// by hand (no SDK needed for read-only display) so this works today against
// Cloudinary's public "demo" cloud, and becomes real the moment a real
// CLOUD_NAME is set — no other code changes required.
//
// To go live: set VITE_CLOUDINARY_CLOUD_NAME in a .env file to your own
// Cloudinary cloud name, and start passing real public IDs (e.g. from the
// vendor product-upload flow once Cloudinary uploads are wired server-side).

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'demo'

/**
 * Build a Cloudinary delivery URL for a given public ID.
 * @param {string} publicId - e.g. "products/raffia-tote"
 * @param {{ width?: number, height?: number, crop?: string }} opts
 */
export function cloudinaryUrl(publicId, opts = {}) {
  const { width = 600, height, crop = 'fill' } = opts
  const transforms = [`f_auto`, `q_auto`, `c_${crop}`, `w_${width}`]
  if (height) transforms.push(`h_${height}`)
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${transforms.join(',')}/${publicId}`
}
