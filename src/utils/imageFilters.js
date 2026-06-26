// src/utils/imageFilters.js

export const applyFilterToImage = (imageSrc, filterType) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageSrc;

    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      if (filterType === 'none') {
        canvas.toBlob((b) => resolve(b), "image/jpeg", 0.85);
        return;
      }

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        if (filterType === 'grayscale') {
          const gray = 0.299 * r + 0.587 * g + 0.114 * b;
          data[i] = gray;     
          data[i + 1] = gray; 
          data[i + 2] = gray; 
        } 
        else if (filterType === 'vintage') {
          data[i] = Math.min(255, (r * 0.393) + (g * 0.769) + (b * 0.189));
          data[i + 1] = Math.min(255, (r * 0.349) + (g * 0.686) + (b * 0.168));
          data[i + 2] = Math.min(255, (r * 0.272) + (g * 0.534) + (b * 0.131));
        }
        else if (filterType === 'warm') {
          data[i] = Math.min(255, r * 1.15); 
          data[i + 2] = b * 0.9;             
        }
        else if (filterType === 'cool') {
          data[i] = r * 0.9;                 
          data[i + 2] = Math.min(255, b * 1.15); 
        }
      }

      ctx.putImageData(imageData, 0, 0);
      canvas.toBlob((blob) => resolve(blob), "image/jpeg", 0.85);
    };

    img.onerror = (err) => reject(err);
  });
};