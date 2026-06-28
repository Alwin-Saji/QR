/**
 * Processes a canvas context to apply adjustments, filters, and borders cleanly.
 * @param {CanvasRenderingContext2D} ctx - The canvas rendering context
 * @param {number} width - Canvas width
 * @param {number} height - Canvas height
 * @param {Object} options - Custom adjustments configuration
 */
export const processCanvasImage = (ctx, width, height, options) => {
  const { filterType, brightness, contrast, saturation, frame } = options;

  // 1. Reset canvas and calculate normalized percentages from 0-centered states
  ctx.clearRect(0, 0, width, height);

  // Map 0-centered sliders (-100 to 100) to standard percentages (0% to 200%)
  const normalizedBrightness = brightness + 100;
  const normalizedContrast = contrast + 100;
  const normalizedSaturation = saturation + 100;

  // 2. Build the high-performance native filter string
  let filterString = `brightness(${normalizedBrightness}%) contrast(${normalizedContrast}%) saturate(${normalizedSaturation}%)`;

  if (filterType === 'bw') {
    filterString += ' grayscale(100%)';
  } else if (filterType === 'vintage') {
    filterString += ' sepia(50%) hue-rotate(-10deg)';
  } else if (filterType === 'warm') {
    filterString += ' sepia(20%) saturate(140%)';
  } else if (filterType === 'cool') {
    filterString += ' hue-rotate(15deg) saturate(120%)';
  }

  // 3. Render the photo directly through the hardware-accelerated pipeline
  ctx.filter = filterString;
  const sourceImg = ctx.canvas.__sourceImage || document.querySelector('img[alt="source"]');
  if (sourceImg) {
    ctx.drawImage(sourceImg, 0, 0, width, height);
  } else {
    return;
  }

  // 4. Layer decorative vectors cleanly on top without sluggish pixel data copying
  if (frame && frame !== 'none') {
    ctx.filter = 'none'; // Clear the filter state so borders aren't discolored
    const minDimension = Math.min(width, height);

    if (frame === 'polaroid') {
      const borderSize = minDimension * 0.05;
      const bottomExtend = minDimension * 0.12;

      ctx.lineWidth = borderSize;
      ctx.strokeStyle = '#FDFDFD';
      ctx.strokeRect(borderSize / 2, borderSize / 2, width - borderSize, height - borderSize);
      
      ctx.fillStyle = '#FDFDFD';
      ctx.fillRect(0, height - bottomExtend, width, bottomExtend);
    }

    if (frame === 'film') {
      const borderSize = minDimension * 0.04;
      ctx.lineWidth = borderSize;
      ctx.strokeStyle = '#1A1A1A';
      ctx.strokeRect(borderSize / 2, borderSize / 2, width - borderSize, height - borderSize);

      ctx.fillStyle = '#FAF9F6';
      const holeWidth = minDimension * 0.015;
      const holeHeight = minDimension * 0.02;
      const spacing = holeHeight * 2;

      for (let y = borderSize; y < height - borderSize; y += spacing) {
        ctx.fillRect(borderSize * 0.2, y, holeWidth, holeHeight);
        ctx.fillRect(width - (borderSize * 0.2) - holeWidth, y, holeWidth, holeHeight);
      }
    }
  }
};