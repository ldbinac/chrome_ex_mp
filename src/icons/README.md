# Icon Generation Instructions

This extension requires PNG icons in three sizes: 16x16, 48x48, and 128x128 pixels.

## Method 1: Using Online Tools

1. Visit https://www.favicon-generator.org/ or similar online tool
2. Upload the `icon.svg` file from this directory
3. Select the sizes: 16x16, 48x48, 128x128
4. Download the generated PNG files
5. Rename them to:
   - icon16.png
   - icon48.png
   - icon128.png
6. Place them in this directory

## Method 2: Using ImageMagick (Command Line)

If you have ImageMagick installed:

```bash
# Convert SVG to PNG in different sizes
magick convert -background none -size 16x16 icon.svg icon16.png
magick convert -background none -size 48x48 icon.svg icon48.png
magick convert -background none -size 128x128 icon.svg icon128.png
```

## Method 3: Using GIMP

1. Open GIMP
2. File > Open > Select icon.svg
3. Image > Scale Image
4. Set width/height to desired size (16, 48, or 128)
5. File > Export As
6. Choose PNG format
7. Repeat for each size

## Method 4: Using Node.js with sharp

Install sharp:
```bash
npm install sharp
```

Create a script `generate-icons.js`:
```javascript
const sharp = require('sharp');

const sizes = [16, 48, 128];

sizes.forEach(size => {
  sharp('icon.svg')
    .resize(size, size)
    .png()
    .toFile(`icon${size}.png`)
    .then(() => console.log(`Generated icon${size}.png`))
    .catch(err => console.error(err));
});
```

Run:
```bash
node generate-icons.js
```

## Important Notes

- Icons should have a transparent background
- Use the same color scheme as the SVG (#4285f4 blue background, white lock icon)
- Ensure good visibility at small sizes
- Test icons in different browser themes (light/dark)

## Required Files

After generation, ensure these files exist in this directory:
- icon16.png
- icon48.png
- icon128.png