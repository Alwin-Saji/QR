/**
 * Processes a canvas context to apply adjustments, filters, and borders.
 */
export const processCanvasImage = (ctx, width, height, options) => {
  const { filterType, brightness, contrast, saturation, frame } = options;

  // 1. Clear out the workspace completely
  ctx.clearRect(0, 0, width, height);

  // 2. Build and apply the native filter chain string
  let filterString = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;

  if (filterType === 'bw') {
    filterString += ' grayscale(100%)';
  } else if (filterType === 'vintage') {
    filterString += ' sepia(50%) hue-rotate(-10deg)';
  } else if (filterType === 'warm') {
    filterString += ' sepia(20%) saturate(140%)';
  } else if (filterType === 'cool') {
    filterString += ' hue-rotate(15deg) saturate(120%)';
  }

  // Assign filter matrix properties to context state
  ctx.filter = filterString;

  // 3. Draw the underlying image through the active filter pipeline
  const sourceImg = ctx.canvas.__sourceImage || document.querySelector('img[alt="source"]');
  if (sourceImg) {
    ctx.drawImage(sourceImg, 0, 0, width, height);
  } else {
    return; // Safety guard: if there is no source image yet, exit early
  }

  // 4. Draw a custom frame overlay if one is selected
  if (frame && frame !== 'none') {
    // Clear filters safely—the pixels are already drawn
    // (Changing ctx.filter only applies to subsequent draw operations)
    ctx.filter = 'none'; 

    const minDimension = Math.min(width, height);

    // Dynamic Polaroid Frame Layout
    if (frame === 'polaroid') {
      const borderSize = minDimension * 0.05;
      const bottomExtend = minDimension * 0.12;

      ctx.lineWidth = borderSize;
      ctx.strokeStyle = '#FDFDFD'; // Off-white border
      ctx.strokeRect(borderSize / 2, borderSize / 2, width - borderSize, height - borderSize);
      
      // Bottom thick block for captions
      ctx.fillStyle = '#FDFDFD';
      ctx.fillRect(0, height - bottomExtend, width, bottomExtend);
    }

    // Dynamic Retro Film Frame Layout
    if (frame === 'film') {
      const borderSize = minDimension * 0.04;
      ctx.lineWidth = borderSize;
      ctx.strokeStyle = '#1A1A1A'; // Film strip matte dark
      ctx.strokeRect(borderSize / 2, borderSize / 2, width - borderSize, height - borderSize);

      // Draw standard cinematic sprocket perforation alignments
      ctx.fillStyle = '#FAF9F6';
      const holeWidth = minDimension * 0.015;
      const holeHeight = minDimension * 0.02;
      const spacing = holeHeight * 2;

      for (let y = borderSize; y < height - borderSize; y += spacing) {
        ctx.fillRect(borderSize * 0.2, y, holeWidth, holeHeight); // Left rail holes
        ctx.fillRect(width - (borderSize * 0.2) - holeWidth, y, holeWidth, holeHeight); // Right rail holes
      }
    }
  }
};