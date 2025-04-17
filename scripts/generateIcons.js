
const fs = require('fs');
const { createCanvas, loadImage } = require('canvas');
const path = require('path');

async function generateIcons() {
  try {
    const sizes = [192, 512];
    const publicDir = path.join(__dirname, '../public');
    
    // Ensure the public directory exists
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }
    
    // SVG content of our app icon
    const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 24 24" fill="none"><path d="M21 9a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V9Zm2 11a3 3 0 0 1-3 3H4a3 3 0 0 1-3-3V9a3 3 0 0 1 3-3h16a3 3 0 0 1 3 3v11Z" fill="#0765E9"/><path d="M16.37 1.22a1 1 0 0 1 1.4 1.41l-.06.08-5 5a1 1 0 0 1-1.42 0l-5-5-.07-.08a1 1 0 0 1 1.41-1.4l.08.06L12 5.6l4.3-4.3.07-.07ZM18.6 10.73a2.75 2.75 0 0 1 3.92 0l.1.11.07.08a1 1 0 0 1-1.5 1.31l-.07-.07-.06-.06a.75.75 0 0 0-1 0l-.06.06a2.75 2.75 0 0 1-4.03.11l-.1-.11a.75.75 0 0 0-1.07-.06l-.06.06a2.75 2.75 0 0 1-4.02.11l-.1-.11a.75.75 0 0 0-1.07-.06l-.06.06a2.75 2.75 0 0 1-4.03.11l-.1-.11a.75.75 0 0 0-1.07-.06l-.06.06-.09.1c-.34.4-.78.68-1.27.84l-.21.06-.26.06a1 1 0 0 1-.47-1.94l.26-.06.13-.04a.87.87 0 0 0 .32-.24l.09-.1.1-.11a2.75 2.75 0 0 1 4.03.11l.06.06c.3.28.79.26 1.06-.06l.11-.11a2.75 2.75 0 0 1 4.03.11l.05.06c.3.28.8.26 1.07-.06l.1-.11a2.75 2.75 0 0 1 4.03.11l.06.06c.3.28.79.26 1.07-.06l.1-.11Z" fill="#0765E9"/></svg>`;
    
    // Write the SVG file for favicon
    fs.writeFileSync(path.join(publicDir, 'favicon.svg'), svgContent);
    
    // Create a temporary SVG file
    const tempSvgPath = path.join(__dirname, 'temp-icon.svg');
    fs.writeFileSync(tempSvgPath, svgContent);
    
    for (const size of sizes) {
      const canvas = createCanvas(size, size);
      const ctx = canvas.getContext('2d');
      
      // Load and draw SVG to canvas
      const img = await loadImage(tempSvgPath);
      ctx.drawImage(img, 0, 0, size, size);
      
      // Save as PNG
      const out = fs.createWriteStream(path.join(publicDir, `pwa-${size}x${size}.png`));
      const stream = canvas.createPNGStream();
      stream.pipe(out);
      
      await new Promise((resolve) => {
        out.on('finish', () => {
          console.log(`Generated ${size}x${size} icon`);
          resolve();
        });
      });
    }
    
    // Clean up the temporary SVG file
    fs.unlinkSync(tempSvgPath);
    
    console.log('All PWA icons generated successfully in the public directory!');
  } catch (error) {
    console.error('Error generating icons:', error);
  }
}

generateIcons();
