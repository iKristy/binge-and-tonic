
import React, { useEffect } from 'react';
import { AppIcon } from './AppIcon';

const GeneratePWAIcons = () => {
  useEffect(() => {
    const generateIcons = async () => {
      const sizes = [192, 512];
      
      for (const size of sizes) {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        
        if (ctx) {
          // Create a temporary SVG element
          const container = document.createElement('div');
          const ReactDOMClient = await import('react-dom/client');
          const root = ReactDOMClient.createRoot(container);
          root.render(<AppIcon />);
          
          // Convert SVG to data URL
          const svgData = new XMLSerializer().serializeToString(container.querySelector('svg')!);
          const img = new Image();
          img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
          
          img.onload = () => {
            ctx.drawImage(img, 0, 0, size, size);
            
            // Convert to blob and download
            canvas.toBlob((blob) => {
              if (blob) {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `pwa-${size}x${size}.png`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
              }
            }, 'image/png');
          };
        }
      }
    };

    generateIcons();
  }, []);

  return null;
};

export default GeneratePWAIcons;
