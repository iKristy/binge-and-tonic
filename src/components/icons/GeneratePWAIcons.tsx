
import React, { useEffect, useState } from 'react';
import { AppIcon } from './AppIcon';

const GeneratePWAIcons = () => {
  const [status, setStatus] = useState<string>('Generating icons...');
  
  useEffect(() => {
    const generateIcons = async () => {
      try {
        const sizes = [192, 512];
        
        for (const size of sizes) {
          const canvas = document.createElement('canvas');
          canvas.width = size;
          canvas.height = size;
          const ctx = canvas.getContext('2d');
          
          if (ctx) {
            // Create a temporary SVG element
            const container = document.createElement('div');
            container.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 24 24" fill="none"><path d="M21 9a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V9Zm2 11a3 3 0 0 1-3 3H4a3 3 0 0 1-3-3V9a3 3 0 0 1 3-3h16a3 3 0 0 1 3 3v11Z" fill="#0765E9"/><path d="M16.37 1.22a1 1 0 0 1 1.4 1.41l-.06.08-5 5a1 1 0 0 1-1.42 0l-5-5-.07-.08a1 1 0 0 1 1.41-1.4l.08.06L12 5.6l4.3-4.3.07-.07ZM18.6 10.73a2.75 2.75 0 0 1 3.92 0l.1.11.07.08a1 1 0 0 1-1.5 1.31l-.07-.07-.06-.06a.75.75 0 0 0-1 0l-.06.06a2.75 2.75 0 0 1-4.03.11l-.1-.11a.75.75 0 0 0-1.07-.06l-.06.06a2.75 2.75 0 0 1-4.02.11l-.1-.11a.75.75 0 0 0-1.07-.06l-.06.06a2.75 2.75 0 0 1-4.03.11l-.1-.11a.75.75 0 0 0-1.07-.06l-.06.06-.09.1c-.34.4-.78.68-1.27.84l-.21.06-.26.06a1 1 0 0 1-.47-1.94l.26-.06.13-.04a.87.87 0 0 0 .32-.24l.09-.1.1-.11a2.75 2.75 0 0 1 4.03.11l.06.06c.3.28.79.26 1.06-.06l.11-.11a2.75 2.75 0 0 1 4.03.11l.05.06c.3.28.8.26 1.07-.06l.1-.11a2.75 2.75 0 0 1 4.03.11l.06.06c.3.28.79.26 1.07-.06l.1-.11Z" fill="#0765E9"/></svg>';
            const svg = container.querySelector('svg');
            
            if (svg) {
              // Convert SVG to data URL
              const svgData = new XMLSerializer().serializeToString(svg);
              const img = new Image();
              img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
              
              await new Promise((resolve) => {
                img.onload = () => {
                  ctx.drawImage(img, 0, 0, size, size);
                  
                  // Convert to blob
                  canvas.toBlob((blob) => {
                    if (blob) {
                      setStatus(`Generated ${size}x${size} icon`);
                      
                      // Instead of downloading, we display the image for easy copying
                      const img = document.createElement('img');
                      img.src = URL.createObjectURL(blob);
                      img.width = size;
                      img.height = size;
                      img.style.margin = '10px';
                      img.style.border = '1px solid #ccc';
                      img.alt = `PWA icon ${size}x${size}`;
                      img.title = `Right-click and save as public/pwa-${size}x${size}.png`;
                      
                      const container = document.getElementById('icon-container');
                      if (container) {
                        container.appendChild(img);
                      }
                      
                      resolve(true);
                    }
                  }, 'image/png');
                };
              });
            }
          }
        }
        setStatus('Icons generated! Right-click each icon and save as "public/pwa-{size}x{size}.png"');
      } catch (error) {
        console.error('Error generating icons:', error);
        setStatus('Error generating icons. See console for details.');
      }
    };

    generateIcons();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">PWA Icon Generator</h1>
      <div className="mb-4 p-3 bg-yellow-100 border border-yellow-400 rounded">
        <p>{status}</p>
        <p className="mt-2 text-sm">After saving the icons to the public folder, rebuild and deploy your app.</p>
      </div>
      <div id="icon-container" className="flex flex-wrap items-center"></div>
    </div>
  );
};

export default GeneratePWAIcons;
