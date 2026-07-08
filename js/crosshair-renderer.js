/**
 * Canvas renderer for CS2 crosshair preview.
 * Based on the rectangle-based algorithm used by community crosshair tools.
 */
const CrosshairRenderer = (() => {
  const INTERNAL_SIZE = 64;

  const PRESET_COLORS = {
    0: [255, 0, 0],
    1: [0, 255, 0],
    2: [255, 255, 0],
    3: [0, 0, 255],
    4: [0, 255, 255],
  };

  function resolveColor(state) {
    const useAlpha = state.cl_crosshairusealpha === 1;
    const alpha = useAlpha ? state.cl_crosshairalpha / 255 : 1;
    let rgb;

    if (state.cl_crosshaircolor === 5) {
      rgb = [
        state.cl_crosshaircolor_r,
        state.cl_crosshaircolor_g,
        state.cl_crosshaircolor_b,
      ];
    } else {
      rgb = PRESET_COLORS[state.cl_crosshaircolor] || PRESET_COLORS[1];
    }

    return { r: rgb[0], g: rgb[1], b: rgb[2], a: alpha };
  }

  function computeDotBounds(thickness, centerX, centerY) {
    const t = Math.max(0.5, thickness * 2);
    const rb = Math.floor(t / 2);
    const lt = t - rb;
    return {
      x0: centerX - lt,
      y0: centerY - lt,
      x1: centerX + rb,
      y1: centerY + rb,
    };
  }

  function computeArms(dot, gap, size) {
    const topBase = dot.y0 - 4 - gap;
    const bottomBase = dot.y1 + 4 + gap;
    const leftBase = dot.x0 - 4 - gap;
    const rightBase = dot.x1 + 4 + gap;
    const armLen = size * 2;

    return [
      { x0: dot.x0, y0: topBase - armLen, x1: dot.x1, y1: topBase, side: 'top' },
      { x0: dot.x0, y0: bottomBase, x1: dot.x1, y1: bottomBase + armLen, side: 'bottom' },
      { x0: leftBase - armLen, y0: dot.y0, x1: leftBase, y1: dot.y1, side: 'left' },
      { x0: rightBase, y0: dot.y0, x1: rightBase + armLen, y1: dot.y1, side: 'right' },
    ];
  }

  function drawRect(ctx, rect, color, scale) {
    const w = (rect.x1 - rect.x0) * scale;
    const h = (rect.y1 - rect.y0) * scale;
    if (w <= 0 || h <= 0) return;

    ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`;
    ctx.fillRect(rect.x0 * scale, rect.y0 * scale, w, h);
  }

  function drawOutline(ctx, rect, pad, scale) {
    drawRect(ctx, {
      x0: rect.x0 - pad,
      y0: rect.y0 - pad,
      x1: rect.x1 + pad,
      y1: rect.y1 + pad,
    }, { r: 0, g: 0, b: 0, a: 1 }, scale);
  }

  function drawBackground(ctx, width, height, mode) {
    if (mode === 'light') {
      ctx.fillStyle = '#c4b89a';
      ctx.fillRect(0, 0, width, height);
      return;
    }

    if (mode === 'checker') {
      const tile = 16;
      for (let y = 0; y < height; y += tile) {
        for (let x = 0; x < width; x += tile) {
          const even = ((x / tile) + (y / tile)) % 2 === 0;
          ctx.fillStyle = even ? '#3a3a3a' : '#2a2a2a';
          ctx.fillRect(x, y, tile, tile);
        }
      }
      return;
    }

    // dark (default — resembles in-game wall)
    const grad = ctx.createRadialGradient(
      width / 2, height / 2, 0,
      width / 2, height / 2, width * 0.6,
    );
    grad.addColorStop(0, '#4a4540');
    grad.addColorStop(1, '#2a2825');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
  }

  /**
   * Render crosshair onto canvas.
   * @param {HTMLCanvasElement} canvas
   * @param {object} state - crosshair cvar state
   * @param {string} background - 'dark' | 'light' | 'checker'
   */
  function render(canvas, state, background = 'dark') {
    const ctx = canvas.getContext('2d');
    const displaySize = canvas.width;
    const scale = displaySize / INTERNAL_SIZE;
    const centerX = Math.floor(INTERNAL_SIZE / 2);
    const centerY = Math.floor(INTERNAL_SIZE / 2);

    ctx.clearRect(0, 0, displaySize, displaySize);
    drawBackground(ctx, displaySize, displaySize, background);

    const color = resolveColor(state);
    const thickness = state.cl_crosshairthickness;
    const gap = state.cl_crosshairgap;
    const size = state.cl_crosshairsize;
    const showDot = state.cl_crosshairdot === 1;
    const tShape = state.cl_crosshair_t === 1;
    const drawOutlineEnabled = state.cl_crosshair_drawoutline === 1;
    const outlinePad = state.cl_crosshair_outlinethickness;

    const dot = computeDotBounds(thickness, centerX, centerY);
    const arms = computeArms(dot, gap, size);

    // Draw dot
    if (showDot) {
      if (drawOutlineEnabled) drawOutline(ctx, dot, outlinePad, scale);
      drawRect(ctx, dot, color, scale);
    }

    // Draw arms (skip if size is 0 and no visible length)
    if (size !== 0) {
      for (const arm of arms) {
        if (tShape && arm.side === 'top') continue;
        if (drawOutlineEnabled) drawOutline(ctx, arm, outlinePad, scale);
        drawRect(ctx, arm, color, scale);
      }
    }
  }

  return { render, resolveColor, INTERNAL_SIZE };
})();
