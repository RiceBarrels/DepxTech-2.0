const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const PUBLIC_DIR = path.join(__dirname, '../public');
const LOGO_PATH = path.join(PUBLIC_DIR, 'lightLogo.svg');

// Icon sizes to generate
const ICON_SIZES = [
  { size: 192, name: 'icon-192.png' },
  { size: 512, name: 'icon-512.png' },
  { size: 512, name: 'icon-maskable-512.png', maskable: true },
  { size: 180, name: 'apple-touch-icon.png' },
];

async function generateIcons() {
  console.log('Generating PWA icons...');

  // Check if logo exists
  if (!fs.existsSync(LOGO_PATH)) {
    console.error('Logo not found at:', LOGO_PATH);
    process.exit(1);
  }

  for (const icon of ICON_SIZES) {
    const outputPath = path.join(PUBLIC_DIR, icon.name);

    try {
      // For maskable icons, add padding (safe zone is 80% of the icon)
      const padding = icon.maskable ? Math.floor(icon.size * 0.1) : 0;
      const innerSize = icon.size - (padding * 2);

      if (icon.maskable) {
        // Create a white background with the logo centered (for maskable)
        await sharp({
          create: {
            width: icon.size,
            height: icon.size,
            channels: 4,
            background: { r: 15, g: 23, b: 42, alpha: 1 } // Dark slate background
          }
        })
          .composite([{
            input: await sharp(LOGO_PATH)
              .resize(innerSize, innerSize, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
              .toBuffer(),
            gravity: 'center'
          }])
          .png()
          .toFile(outputPath);
      } else {
        // Standard icon with transparent background
        await sharp(LOGO_PATH)
          .resize(icon.size, icon.size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
          .png()
          .toFile(outputPath);
      }

      console.log(`Generated: ${icon.name} (${icon.size}x${icon.size})`);
    } catch (error) {
      console.error(`Failed to generate ${icon.name}:`, error.message);
    }
  }

  console.log('Done! PWA icons generated in public/');
}

generateIcons().catch(console.error);
