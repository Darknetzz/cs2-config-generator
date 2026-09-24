/**
 * Canvas renderer for CS2 crosshair preview (Rush Hour styles 0–8).
 * Resolution-independent length / gap / thickness units, scaled to the preview.
 */
const CrosshairRenderer = (() => {
  const INTERNAL_SIZE = 128;
  const PREVIEW_SIZE = 640;
  const ANIMATION_CYCLE_MS = 1800;
  const CHECKER_TILE = 16;
  const OUTLINE_PAD = 1;
  const MAX_DYNAMIC_SPREAD = 40;

  let animFrameId = null;
  let animCanvas = null;
  let animCanvasSecondary = null;
  let getStateFn = null;
  let getBackgroundFn = null;
  let getOptionsFn = null;
  let reduceMotion = false;

  const GRENADE_RETICLE = {
    REF_HEIGHT: 1080,
    TICK_INTERVAL: 10,
    TICK_SCALING: 1.1,
    CENTER_GAP: 14,
    SMALL_TICK: 5,
    LARGE_TICK: 10,
    MAJOR_EVERY: 5,
  };

  const imageCache = new Map();
  const loadingImages = new Set();
  let checkerPattern = null;

  const bgCache = {
    canvas: null,
    width: 0,
    height: 0,
    mode: null,
  };

  function initMotionPreference() {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    reduceMotion = mq.matches;
    mq.addEventListener('change', (event) => {
      reduceMotion = event.matches;
    });
  }

  if (typeof window !== 'undefined') {
    initMotionPreference();
  }

  function isDynamicStyle(style) {
    return CrosshairSection.DYNAMIC_STYLES.includes(Number(style));
  }

  function isCircleStyle(style) {
    return CrosshairSection.CIRCLE_STYLES.includes(Number(style));
  }

  function isSquareStyle(style) {
    return CrosshairSection.SQUARE_STYLES.includes(Number(style));
  }

  function isAnimating() {
    return animFrameId !== null;
  }

  function getDynamicFactor(timestamp, style) {
    if (reduceMotion) return 0;

    const phase = (timestamp % ANIMATION_CYCLE_MS) / ANIMATION_CYCLE_MS;
    const wave = (1 - Math.cos(phase * Math.PI * 2)) / 2;

    // Style 5 — shot-feedback pulse (sharper attack).
    if (style === 5) {
      return Math.pow(wave, 0.45);
    }

    // Styles 0 / 1 / 7 — inaccuracy tracking (slightly softer).
    if (style === 0 || style === 1 || style === 7) {
      return wave * 0.85;
    }

    return wave;
  }

  function resolveColor(state) {
    return {
      r: state.cl_crosshaircolor_r,
      g: state.cl_crosshaircolor_g,
      b: state.cl_crosshaircolor_b,
      a: (state.cl_crosshaircolor_a ?? 255) / 255,
    };
  }

  function getSpreadExtra(state, dynamicFactor) {
    const limit = Number(state.cl_crosshair_dynamic_spread_limit ?? 255);
    return dynamicFactor * (limit / 255) * MAX_DYNAMIC_SPREAD;
  }

  function withAlpha(color, mod) {
    return { r: color.r, g: color.g, b: color.b, a: color.a * mod };
  }

  function computeDotBounds(thickness, centerX, centerY) {
    const t = Math.max(1, thickness);
    const rb = Math.floor(t / 2);
    const lt = t - rb;
    return {
      x0: centerX - lt,
      y0: centerY - lt,
      x1: centerX + rb,
      y1: centerY + rb,
    };
  }

  function computeArms(dot, gap, length) {
    const topBase = dot.y0 - gap;
    const bottomBase = dot.y1 + gap;
    const leftBase = dot.x0 - gap;
    const rightBase = dot.x1 + gap;
    const armLen = Math.max(0, length);

    return [
      { x0: dot.x0, y0: topBase - armLen, x1: dot.x1, y1: topBase, side: 'top' },
      { x0: dot.x0, y0: bottomBase, x1: dot.x1, y1: bottomBase + armLen, side: 'bottom' },
      { x0: leftBase - armLen, y0: dot.y0, x1: leftBase, y1: dot.y1, side: 'left' },
      { x0: rightBase, y0: dot.y0, x1: rightBase + armLen, y1: dot.y1, side: 'right' },
    ];
  }

  function splitArm(arm, splitRatio, splitOffset) {
    const innerRatio = Math.max(0, Math.min(1, splitRatio));
    const armLen = arm.side === 'left' || arm.side === 'right'
      ? arm.x1 - arm.x0
      : arm.y1 - arm.y0;
    const innerLen = armLen * innerRatio;

    switch (arm.side) {
      case 'right':
        return {
          inner: { x0: arm.x0, y0: arm.y0, x1: arm.x0 + innerLen, y1: arm.y1 },
          outer: {
            x0: arm.x0 + innerLen + splitOffset,
            y0: arm.y0,
            x1: arm.x0 + armLen + splitOffset,
            y1: arm.y1,
          },
        };
      case 'left':
        return {
          inner: { x0: arm.x1 - innerLen, y0: arm.y0, x1: arm.x1, y1: arm.y1 },
          outer: {
            x0: arm.x0 - splitOffset,
            y0: arm.y0,
            x1: arm.x1 - innerLen - splitOffset,
            y1: arm.y1,
          },
        };
      case 'top':
        return {
          inner: { x0: arm.x0, y0: arm.y1 - innerLen, x1: arm.x1, y1: arm.y1 },
          outer: {
            x0: arm.x0,
            y0: arm.y0 - splitOffset,
            x1: arm.x1,
            y1: arm.y1 - innerLen - splitOffset,
          },
        };
      case 'bottom':
        return {
          inner: { x0: arm.x0, y0: arm.y0, x1: arm.x1, y1: arm.y0 + innerLen },
          outer: {
            x0: arm.x0,
            y0: arm.y0 + innerLen + splitOffset,
            x1: arm.x1,
            y1: arm.y1 + splitOffset,
          },
        };
      default:
        return { inner: arm, outer: null };
    }
  }

  function drawRect(ctx, rect, color, scale) {
    const w = (rect.x1 - rect.x0) * scale;
    const h = (rect.y1 - rect.y0) * scale;
    if (w <= 0 || h <= 0) return;

    ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`;
    ctx.fillRect(rect.x0 * scale, rect.y0 * scale, w, h);
  }

  function drawOutline(ctx, rect, pad, scale, mode = 1) {
    if (mode === 2) {
      // Half outline: top + left edges only (top-left portions).
      drawRect(ctx, {
        x0: rect.x0 - pad,
        y0: rect.y0 - pad,
        x1: rect.x1,
        y1: rect.y0,
      }, { r: 0, g: 0, b: 0, a: 1 }, scale);
      drawRect(ctx, {
        x0: rect.x0 - pad,
        y0: rect.y0,
        x1: rect.x0,
        y1: rect.y1,
      }, { r: 0, g: 0, b: 0, a: 1 }, scale);
      return;
    }

    drawRect(ctx, {
      x0: rect.x0 - pad,
      y0: rect.y0 - pad,
      x1: rect.x1 + pad,
      y1: rect.y1 + pad,
    }, { r: 0, g: 0, b: 0, a: 1 }, scale);
  }

  function drawPart(ctx, rect, color, outlineMode, outlinePad, scale) {
    if (outlineMode > 0) drawOutline(ctx, rect, outlinePad, scale, outlineMode);
    drawRect(ctx, rect, color, scale);
  }

  function drawArm(ctx, arm, color, outlineMode, outlinePad, scale, dynamic) {
    const {
      style,
      factor,
      splitDist,
      splitRatio,
      innerAlphaMod,
      outerAlphaMod,
    } = dynamic;

    if (style !== 2 || factor <= 0) {
      drawPart(ctx, arm, color, outlineMode, outlinePad, scale);
      return;
    }

    const splitOffset = splitDist * factor;
    const { inner, outer } = splitArm(arm, 1 - splitRatio, splitOffset);

    drawPart(
      ctx,
      inner,
      withAlpha(color, innerAlphaMod),
      outlineMode,
      outlinePad,
      scale,
    );

    if (outer && splitRatio > 0) {
      drawPart(
        ctx,
        outer,
        withAlpha(color, outerAlphaMod),
        outlineMode,
        outlinePad,
        scale,
      );
    }
  }

  function strokeOutlinePath(ctx, lineWidth, scale, drawPath) {
    const lw = Math.max(1, lineWidth * scale);
    ctx.strokeStyle = 'rgba(0, 0, 0, 1)';
    ctx.lineWidth = lw + OUTLINE_PAD * 2 * scale;
    ctx.lineCap = 'butt';
    ctx.lineJoin = 'miter';
    drawPath();
    ctx.stroke();
    return lw;
  }

  function strokeCircle(ctx, cx, cy, radius, lineWidth, color, outlineMode, scale) {
    if (radius <= 0 || lineWidth <= 0) return;

    const x = cx * scale;
    const y = cy * scale;
    const r = radius * scale;

    let lw = Math.max(1, lineWidth * scale);
    if (outlineMode === 1) {
      lw = strokeOutlinePath(ctx, lineWidth, scale, () => {
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
      });
    } else if (outlineMode === 2) {
      // Top-left arc: north → west (counterclockwise).
      lw = strokeOutlinePath(ctx, lineWidth, scale, () => {
        ctx.beginPath();
        ctx.arc(x, y, r, 3 * Math.PI / 2, Math.PI, true);
      });
    }

    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`;
    ctx.lineWidth = lw;
    ctx.stroke();
  }

  function strokeSquare(ctx, cx, cy, halfSize, lineWidth, color, outlineMode, scale) {
    if (halfSize <= 0 || lineWidth <= 0) return;

    const x = (cx - halfSize) * scale;
    const y = (cy - halfSize) * scale;
    const size = halfSize * 2 * scale;

    let lw = Math.max(1, lineWidth * scale);
    if (outlineMode === 1) {
      lw = strokeOutlinePath(ctx, lineWidth, scale, () => {
        ctx.beginPath();
        ctx.rect(x, y, size, size);
      });
    } else if (outlineMode === 2) {
      lw = strokeOutlinePath(ctx, lineWidth, scale, () => {
        ctx.beginPath();
        ctx.moveTo(x, y + size);
        ctx.lineTo(x, y);
        ctx.lineTo(x + size, y);
      });
    }

    ctx.strokeStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`;
    ctx.lineWidth = lw;
    ctx.strokeRect(x, y, size, size);
  }

  function drawQuadCorners(ctx, cx, cy, distance, arm, thickness, color, outlineMode, scale) {
    const t = Math.max(1, thickness);
    const len = Math.max(1, arm);
    const corners = [
      { x: cx - distance, y: cy - distance, dx: 1, dy: 1 },
      { x: cx + distance, y: cy - distance, dx: -1, dy: 1 },
      { x: cx - distance, y: cy + distance, dx: 1, dy: -1 },
      { x: cx + distance, y: cy + distance, dx: -1, dy: -1 },
    ];

    for (const corner of corners) {
      const h = {
        x0: corner.dx > 0 ? corner.x : corner.x - len,
        y0: corner.y - t / 2,
        x1: corner.dx > 0 ? corner.x + len : corner.x,
        y1: corner.y + t / 2,
      };
      const v = {
        x0: corner.x - t / 2,
        y0: corner.dy > 0 ? corner.y : corner.y - len,
        x1: corner.x + t / 2,
        y1: corner.dy > 0 ? corner.y + len : corner.y,
      };
      drawPart(ctx, h, color, outlineMode, OUTLINE_PAD, scale);
      drawPart(ctx, v, color, outlineMode, OUTLINE_PAD, scale);
    }
  }

  function drawSolidBackground(ctx, width, height, color) {
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, width, height);
  }

  function getCheckerPattern() {
    if (checkerPattern) return checkerPattern;

    const size = CHECKER_TILE * 2;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#3a3a3a';
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(CHECKER_TILE, 0, CHECKER_TILE, CHECKER_TILE);
    ctx.fillRect(0, CHECKER_TILE, CHECKER_TILE, CHECKER_TILE);

    checkerPattern = ctx.createPattern(canvas, 'repeat');
    return checkerPattern;
  }

  function drawImageCover(ctx, width, height, img) {
    if (!img?.complete || !img.naturalWidth) return false;

    const sw = img.naturalWidth;
    const sh = img.naturalHeight;
    const scale = Math.max(width / sw, height / sh);
    const dw = sw * scale;
    const dh = sh * scale;
    const dx = (width - dw) / 2;
    const dy = (height - dh) / 2;
    ctx.drawImage(img, dx, dy, dw, dh);
    return true;
  }

  function drawProceduralBackground(ctx, width, height, mode) {
    if (mode === 'light') {
      drawSolidBackground(ctx, width, height, '#c4b89a');
      return;
    }

    if (mode === 'black') {
      drawSolidBackground(ctx, width, height, '#000000');
      return;
    }

    if (mode === 'white') {
      drawSolidBackground(ctx, width, height, '#ffffff');
      return;
    }

    if (mode === 'checker') {
      ctx.fillStyle = getCheckerPattern();
      ctx.fillRect(0, 0, width, height);
      return;
    }

    const grad = ctx.createRadialGradient(
      width / 2, height / 2, 0,
      width / 2, height / 2, width * 0.6,
    );
    grad.addColorStop(0, '#4a4540');
    grad.addColorStop(1, '#2a2825');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
  }

  function ensureImageLoaded(bgId, onReady) {
    const bg = Backgrounds.getById(bgId);
    if (!bg || bg.type !== 'image') {
      onReady?.();
      return;
    }

    if (imageCache.has(bgId)) {
      const img = imageCache.get(bgId);
      if (img.complete) {
        onReady?.();
        return;
      }
      img.addEventListener('load', () => onReady?.(), { once: true });
      img.addEventListener('error', () => onReady?.(), { once: true });
      return;
    }

    if (loadingImages.has(bgId)) {
      const check = () => {
        const img = imageCache.get(bgId);
        if (img?.complete) onReady?.();
        else setTimeout(check, 50);
      };
      check();
      return;
    }

    loadingImages.add(bgId);
    const img = new Image();
    img.decoding = 'async';
    const done = () => {
      loadingImages.delete(bgId);
      onReady?.();
    };
    img.onload = done;
    img.onerror = done;
    img.src = bg.src;
    imageCache.set(bgId, img);
  }

  function drawBackground(ctx, width, height, mode) {
    const bg = Backgrounds.getById(mode);

    if (bg.type === 'image') {
      const img = imageCache.get(bg.id);
      if (!drawImageCover(ctx, width, height, img)) {
        drawProceduralBackground(ctx, width, height, Backgrounds.DEFAULT_ID);
      }
      return;
    }

    drawProceduralBackground(ctx, width, height, mode);
  }

  function invalidateBgCache() {
    bgCache.mode = null;
  }

  function drawBackgroundCached(ctx, width, height, mode) {
    if (
      !bgCache.canvas
      || bgCache.width !== width
      || bgCache.height !== height
      || bgCache.mode !== mode
    ) {
      if (!bgCache.canvas) bgCache.canvas = document.createElement('canvas');
      bgCache.canvas.width = width;
      bgCache.canvas.height = height;
      const bgCtx = bgCache.canvas.getContext('2d');
      drawBackground(bgCtx, width, height, mode);
      bgCache.width = width;
      bgCache.height = height;
      bgCache.mode = mode;
    }

    ctx.drawImage(bgCache.canvas, 0, 0);
  }

  function preloadImages(onReady) {
    onReady?.();
  }

  function getBaseGap(state) {
    return state.cl_crosshair_gap;
  }

  function getEffectiveGap(state, dynamicFactor) {
    const style = state.cl_crosshairstyle;
    const baseGap = getBaseGap(state);

    // Style 2 uses split offset on arms instead of expanding the base gap.
    if (!isDynamicStyle(style) || style === 2 || style === 7) {
      return baseGap;
    }

    return baseGap + getSpreadExtra(state, dynamicFactor);
  }

  function getCrosshairScale(height) {
    return height / PREVIEW_SIZE;
  }

  function getCrosshairLayout(width, height) {
    const scale = getCrosshairScale(height);
    const drawSize = INTERNAL_SIZE * scale;
    const offsetX = Math.floor((width - drawSize) / 2);
    const offsetY = Math.floor((height - drawSize) / 2);
    const internalCenter = INTERNAL_SIZE / 2;
    return {
      scale,
      offsetX,
      offsetY,
      cx: offsetX + internalCenter * scale,
      cy: offsetY + internalCenter * scale,
    };
  }

  function drawUserCrosshair(ctx, width, height, state, dynamicFactor = 0) {
    const { scale, offsetX, offsetY } = getCrosshairLayout(width, height);
    const centerX = INTERNAL_SIZE / 2;
    const centerY = INTERNAL_SIZE / 2;

    ctx.save();
    ctx.translate(offsetX, offsetY);

    const color = resolveColor(state);
    const thickness = Math.max(1, state.cl_crosshair_thickness);
    const gap = getEffectiveGap(state, dynamicFactor);
    const length = state.cl_crosshair_length;
    const showDot = state.cl_crosshairdot === 1 || state.cl_crosshairstyle === 6;
    const tShape = state.cl_crosshair_t === 1;
    const outlineMode = Number(state.cl_crosshair_drawoutline) || 0;
    const style = state.cl_crosshairstyle;

    const dynamic = {
      style,
      factor: dynamicFactor,
      splitDist: state.cl_crosshair_dynamic_splitdist,
      splitRatio: state.cl_crosshair_dynamic_maxdist_splitratio,
      innerAlphaMod: state.cl_crosshair_dynamic_splitalpha_innermod,
      outerAlphaMod: state.cl_crosshair_dynamic_splitalpha_outermod,
    };

    const dot = computeDotBounds(thickness, centerX, centerY);

    // Style 6 — Dot Only.
    if (style === 6) {
      drawPart(ctx, dot, color, outlineMode, OUTLINE_PAD, scale);
      ctx.restore();
      return;
    }

    // Styles 1 / 3 — Circle (1 dynamic, 3 static).
    // In-game Style Settings: dynamic circle has no Length/Gap; static circle has Gap only.
    if (isCircleStyle(style)) {
      const lengthPart = 0;
      const gapPart = style === 1
        ? getSpreadExtra(state, dynamicFactor)
        : gap;
      const radius = Math.max(thickness, Math.abs(gapPart) + lengthPart);
      strokeCircle(
        ctx,
        centerX,
        centerY,
        radius,
        thickness,
        color,
        outlineMode,
        scale,
      );
      if (showDot) {
        drawPart(ctx, dot, color, outlineMode, OUTLINE_PAD, scale);
      }
      ctx.restore();
      return;
    }

    // Style 8 — Static Square (Gap + Thickness + optional center dot; no Length / T).
    if (isSquareStyle(style)) {
      const halfSize = Math.max(thickness, Math.abs(gap));
      strokeSquare(
        ctx,
        centerX,
        centerY,
        halfSize,
        thickness,
        color,
        outlineMode,
        scale,
      );
      if (showDot) {
        drawPart(ctx, dot, color, outlineMode, OUTLINE_PAD, scale);
      }
      ctx.restore();
      return;
    }

    const arms = computeArms(dot, gap, length);

    if (showDot) {
      drawPart(ctx, dot, color, outlineMode, OUTLINE_PAD, scale);
    }

    if (length !== 0) {
      for (const arm of arms) {
        if (tShape && arm.side === 'top') continue;
        drawArm(ctx, arm, color, outlineMode, OUTLINE_PAD, scale, dynamic);
      }
    }

    // Style 7 — Dynamic Quad: static cross + expanding corner brackets.
    if (style === 7) {
      const quadDist = Math.max(gap + length + 2, 6) + getSpreadExtra(state, dynamicFactor);
      const quadArm = Math.max(2, Math.round(thickness + 1));
      drawQuadCorners(
        ctx,
        centerX,
        centerY,
        quadDist,
        quadArm,
        thickness,
        withAlpha(color, 0.85),
        outlineMode,
        scale,
      );
    }

    ctx.restore();
  }

  function getGrenadeReticleScale(height) {
    return (height / GRENADE_RETICLE.REF_HEIGHT) * GRENADE_RETICLE.TICK_SCALING;
  }

  function colorToRgba(color) {
    return `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`;
  }

  function drawRulerSegment(ctx, x0, y0, x1, y1, horizontal, tickSpacing, tickScale, color) {
    const { SMALL_TICK, LARGE_TICK, MAJOR_EVERY } = GRENADE_RETICLE;
    const cx = (x0 + x1) / 2;
    const cy = (y0 + y1) / 2;
    const length = horizontal ? Math.abs(x1 - x0) : Math.abs(y1 - y0);
    const lineW = Math.max(1, tickScale * 0.9);

    ctx.strokeStyle = colorToRgba(color);
    ctx.lineWidth = lineW;
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.stroke();

    const smallTick = SMALL_TICK * tickScale;
    const largeTick = LARGE_TICK * tickScale;

    for (let dist = tickSpacing; dist <= length / 2; dist += tickSpacing) {
      const tickIndex = Math.round(dist / tickSpacing);
      const isMajor = tickIndex % MAJOR_EVERY === 0;
      const tickLen = isMajor ? largeTick : smallTick;

      if (horizontal) {
        for (const sign of [-1, 1]) {
          const x = cx + sign * dist;
          ctx.beginPath();
          ctx.moveTo(x, cy - tickLen / 2);
          ctx.lineTo(x, cy + tickLen / 2);
          ctx.stroke();
        }
      } else {
        for (const sign of [-1, 1]) {
          const y = cy + sign * dist;
          ctx.beginPath();
          ctx.moveTo(cx - tickLen / 2, y);
          ctx.lineTo(cx + tickLen / 2, y);
          ctx.stroke();
        }
      }
    }
  }

  function drawGrenadeLineupReticle(ctx, width, height, color) {
    const tickScale = getGrenadeReticleScale(height);
    const gap = (GRENADE_RETICLE.CENTER_GAP / 2) * tickScale;
    const tickSpacing = GRENADE_RETICLE.TICK_INTERVAL * tickScale;
    const { cx, cy } = getCrosshairLayout(width, height);
    const pad = Math.max(1, tickScale);

    drawRulerSegment(ctx, pad, cy, cx - gap, cy, true, tickSpacing, tickScale, color);
    drawRulerSegment(ctx, cx + gap, cy, width - pad, cy, true, tickSpacing, tickScale, color);
    drawRulerSegment(ctx, cx, pad, cx, cy - gap, false, tickSpacing, tickScale, color);
    drawRulerSegment(ctx, cx, cy + gap, cx, height - pad, false, tickSpacing, tickScale, color);
  }

  function drawLineupDisabledOverlay(ctx, width, height) {
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `600 ${Math.max(14, Math.round(width * 0.028))}px system-ui, sans-serif`;
    ctx.fillText('Lineup reticle disabled for all grenades', width / 2, height / 2);
    ctx.restore();
  }

  function drawSniperScope(ctx, width, height, state) {
    const cx = width / 2;
    const cy = height / 2;
    const radius = Math.min(width, height) * 0.42;
    const scale = height / 1080;
    const lineWidth = Math.max(1, Math.round(state.cl_crosshair_sniper_width * scale));
    const centerGap = Math.max(3, radius * 0.035);
    const dotRadius = Math.max(2, lineWidth * 2.2);

    ctx.save();

    ctx.fillStyle = 'rgba(0, 0, 0, 0.78)';
    ctx.beginPath();
    ctx.rect(0, 0, width, height);
    ctx.arc(cx, cy, radius, 0, Math.PI * 2, true);
    ctx.fill('evenodd');

    ctx.strokeStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.lineWidth = Math.max(1, scale * 2);
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.clip();

    ctx.strokeStyle = 'rgba(0, 0, 0, 0.92)';
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'butt';
    ctx.beginPath();
    ctx.moveTo(cx - radius, cy);
    ctx.lineTo(cx - centerGap, cy);
    ctx.moveTo(cx + centerGap, cy);
    ctx.lineTo(cx + radius, cy);
    ctx.moveTo(cx, cy - radius);
    ctx.lineTo(cx, cy - centerGap);
    ctx.moveTo(cx, cy + centerGap);
    ctx.lineTo(cx, cy + radius);
    ctx.stroke();

    ctx.shadowColor = 'rgba(235, 228, 210, 0.85)';
    ctx.shadowBlur = Math.max(2, scale * 5);
    ctx.fillStyle = 'rgba(240, 235, 220, 0.95)';
    ctx.beginPath();
    ctx.arc(cx, cy, dotRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    if (state.cl_sniper_show_inaccuracy === 1) {
      const pulse = reduceMotion ? 0.35 : (Math.sin(performance.now() / 400) + 1) / 2;
      const inaccuracyRadius = centerGap * (2.5 + pulse * 1.5);
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.35)';
      ctx.lineWidth = Math.max(1, lineWidth * 0.8);
      ctx.beginPath();
      ctx.arc(cx, cy, inaccuracyRadius, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.restore();
  }

  function normalizeRenderOptions(options = {}) {
    const mode = PreviewMode.isValidMode(options.mode)
      ? options.mode
      : PreviewMode.DEFAULT_MODE;

    return { mode };
  }

  function drawPreview(ctx, width, height, state, background, dynamicFactor = 0, options = {}) {
    const { mode } = normalizeRenderOptions(options);

    ctx.clearRect(0, 0, width, height);
    drawBackgroundCached(ctx, width, height, background);

    if (mode === PreviewMode.MODES.SNIPER) {
      drawSniperScope(ctx, width, height, state);
      return;
    }

    if (mode === PreviewMode.MODES.LINEUP) {
      const enabled = PreviewMode.isLineupEnabled(state);

      if (enabled) {
        const color = resolveColor(state);
        if (state.cl_grenadecrosshair_keepusercrosshair === 1) {
          drawUserCrosshair(ctx, width, height, state, dynamicFactor);
        }
        drawGrenadeLineupReticle(ctx, width, height, color);
        return;
      }

      drawUserCrosshair(ctx, width, height, state, dynamicFactor);
      drawLineupDisabledOverlay(ctx, width, height);
      return;
    }

    drawUserCrosshair(ctx, width, height, state, dynamicFactor);
  }

  /**
   * Render crosshair onto canvas.
   * @param {HTMLCanvasElement} canvas
   * @param {object} state - crosshair cvar state
   * @param {string} background - background id from Backgrounds config
   * @param {number} [dynamicFactor=0] - 0 = resting, 1 = full movement spread
   * @param {object} [options] - preview options ({ mode })
   */
  function render(canvas, state, background = 'dark', dynamicFactor = 0, options = {}) {
    const ctx = canvas.getContext('2d');
    drawPreview(ctx, canvas.width, canvas.height, state, background, dynamicFactor, options);
  }

  /**
   * Render a small crosshair preview for preset cards.
   * Crops tight on the crosshair and scales it up to fill the frame.
   * @param {HTMLCanvasElement} canvas
   * @param {object} state
   * @param {number} [size=64]
   */
  function renderMini(canvas, state, size = 64) {
    const scratch = document.createElement('canvas');
    scratch.width = PREVIEW_SIZE;
    scratch.height = PREVIEW_SIZE;
    const scratchCtx = scratch.getContext('2d');
    drawSolidBackground(scratchCtx, PREVIEW_SIZE, PREVIEW_SIZE, '#2a2825');
    drawUserCrosshair(scratchCtx, PREVIEW_SIZE, PREVIEW_SIZE, state, 0);

    const cropSize = INTERNAL_SIZE + 8;
    const sx = (PREVIEW_SIZE - cropSize) / 2;
    const sy = (PREVIEW_SIZE - cropSize) / 2;

    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    drawSolidBackground(ctx, size, size, '#2a2825');
    ctx.drawImage(scratch, sx, sy, cropSize, cropSize, 0, 0, size, size);
  }

  function animationLoop(timestamp) {
    if (!animCanvas || !getStateFn || !getBackgroundFn) return;

    const state = getStateFn();
    if (!isDynamicStyle(state.cl_crosshairstyle)) {
      stopAnimation();
      return;
    }

    const options = getOptionsFn?.() ?? {};
    if (options.mode !== PreviewMode.MODES.NORMAL) {
      stopAnimation();
      return;
    }

    const factor = getDynamicFactor(timestamp, state.cl_crosshairstyle);
    const background = getBackgroundFn();
    render(animCanvas, state, background, factor, options);
    if (animCanvasSecondary) {
      render(animCanvasSecondary, state, background, factor, options);
    }
    animFrameId = requestAnimationFrame(animationLoop);
  }

  function startAnimation(canvas, getState, getBackground, getOptions, secondaryCanvas = null) {
    animCanvas = canvas;
    animCanvasSecondary = secondaryCanvas || null;
    getStateFn = getState;
    getBackgroundFn = getBackground;
    getOptionsFn = getOptions ?? null;
    if (isAnimating()) return;
    animFrameId = requestAnimationFrame(animationLoop);
  }

  function stopAnimation() {
    if (animFrameId !== null) {
      cancelAnimationFrame(animFrameId);
      animFrameId = null;
    }
    animCanvas = null;
    animCanvasSecondary = null;
    getStateFn = null;
    getBackgroundFn = null;
    getOptionsFn = null;
  }

  return {
    render,
    renderMini,
    resolveColor,
    preloadImages,
    ensureImageLoaded,
    invalidateBgCache,
    paintBackground: drawBackground,
    isDynamicStyle,
    isAnimating,
    startAnimation,
    stopAnimation,
    getCrosshairScale,
    INTERNAL_SIZE,
    PREVIEW_SIZE,
  };
})();
