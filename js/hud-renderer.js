/**
 * CS2 HUD preview — approximate in-game chrome over shared backgrounds.
 * Layout mirrors Source 2 competitive HUD (not a pixel-perfect plate).
 * CT/T team toggle is preview-only (for cl_hud_color 0).
 */
const HudRenderer = (() => {
  const PREVIEW_SIZE = 640;
  const ASPECT = 16 / 9;
  const REF_W = 1920;

  const TEAM_CT = 'ct';
  const TEAM_T = 't';

  /** Approximate CS2 cl_hud_color palette. */
  const COLOR_MAP = {
    1: '#e8e8e8',
    2: '#ffffff',
    3: '#a8d4ff',
    4: '#4b69ff',
    5: '#8847ff',
    6: '#eb4b4b',
    7: '#ff8c32',
    8: '#f0d124',
    9: '#7eea3a',
    10: '#44e3c0',
    11: '#f47dc6',
  };

  const TEAM_COLORS = {
    [TEAM_CT]: '#5d79ae',
    [TEAM_T]: '#c19511',
  };

  const FONT = '"Arial Narrow", "Helvetica Neue Condensed", "Segoe UI", system-ui, sans-serif';
  const FONT_UI = '"Segoe UI", Tahoma, system-ui, sans-serif';

  let previewTeam = TEAM_CT;

  function setTeam(value) {
    previewTeam = value === TEAM_T ? TEAM_T : TEAM_CT;
  }

  function getTeam() {
    return previewTeam;
  }

  function clamp(n, min, max) {
    return Math.max(min, Math.min(max, n));
  }

  function num(state, key, fallback) {
    const raw = Number(state[key]);
    return Number.isFinite(raw) ? raw : fallback;
  }

  function resolveAccent(state) {
    const id = Math.round(num(state, 'cl_hud_color', 0));
    if (id === 0) return TEAM_COLORS[previewTeam] || TEAM_COLORS[TEAM_CT];
    return COLOR_MAP[id] || COLOR_MAP[1];
  }

  function withShadow(ctx, draw) {
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.85)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 1;
    draw();
    ctx.restore();
  }

  function fillText(ctx, text, x, y, {
    size,
    color,
    align = 'left',
    baseline = 'alphabetic',
    weight = '700',
    font = FONT,
    shadow = true,
  }) {
    const paint = () => {
      ctx.font = `${weight} ${size}px ${font}`;
      ctx.textAlign = align;
      ctx.textBaseline = baseline;
      ctx.fillStyle = color;
      ctx.fillText(text, x, y);
    };
    if (shadow) withShadow(ctx, paint);
    else paint();
  }

  function drawHeart(ctx, x, y, size, color) {
    const s = size;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s / 16, s / 16);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(8, 14);
    ctx.bezierCurveTo(8, 14, 2, 10, 2, 6);
    ctx.bezierCurveTo(2, 3.5, 4, 2, 6, 2);
    ctx.bezierCurveTo(7.2, 2, 8, 2.8, 8, 2.8);
    ctx.bezierCurveTo(8, 2.8, 8.8, 2, 10, 2);
    ctx.bezierCurveTo(12, 2, 14, 3.5, 14, 6);
    ctx.bezierCurveTo(14, 10, 8, 14, 8, 14);
    ctx.fill();
    ctx.restore();
  }

  function drawHelmet(ctx, x, y, size, color) {
    const s = size;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s / 16, s / 16);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(8, 7, 6, 5.5, 0, Math.PI, 0);
    ctx.lineTo(14, 10);
    ctx.lineTo(2, 10);
    ctx.closePath();
    ctx.fill();
    ctx.fillRect(3, 10, 10, 2.5);
    ctx.restore();
  }

  /** Placeholder agent portrait (CS2 places this left of HP). */
  function drawPortrait(ctx, x, y, size, accent) {
    ctx.save();
    ctx.fillStyle = 'rgba(12, 16, 22, 0.72)';
    ctx.fillRect(x, y, size, size);
    ctx.strokeStyle = accent;
    ctx.lineWidth = Math.max(1.5, size * 0.04);
    ctx.strokeRect(x + 0.5, y + 0.5, size - 1, size - 1);

    // Silhouette head + shoulders
    ctx.fillStyle = 'rgba(180, 190, 200, 0.55)';
    ctx.beginPath();
    ctx.arc(x + size * 0.5, y + size * 0.38, size * 0.22, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(x + size * 0.5, y + size * 0.82, size * 0.36, size * 0.28, 0, Math.PI, 0, true);
    ctx.fill();
    ctx.restore();
  }

  function drawHpBar(ctx, x, y, w, h, frac, color) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w * clamp(frac, 0, 1), h);
  }

  function drawHealthArmor(ctx, layout, accent) {
    const { scale: s, left, bottom } = layout;
    const portrait = 72 * s;
    const gap = 8 * s;
    const x0 = left;
    const y0 = bottom - portrait;

    drawPortrait(ctx, x0, y0, portrait, accent);

    const hx = x0 + portrait + gap;
    const icon = 16 * s;
    const barW = 140 * s;
    const barH = 4 * s;

    // HP row — heart + large number + thin bar (CS2 style)
    drawHeart(ctx, hx, y0 + 4 * s, icon, accent);
    fillText(ctx, '100', hx + icon + 5 * s, y0 + 18 * s, {
      size: 34 * s,
      color: accent,
      baseline: 'middle',
    });
    drawHpBar(ctx, hx, y0 + 34 * s, barW, barH, 1, accent);

    // Armor row
    drawHelmet(ctx, hx, y0 + 42 * s, icon * 0.95, 'rgba(210, 220, 230, 0.92)');
    fillText(ctx, '100', hx + icon + 5 * s, y0 + 52 * s, {
      size: 20 * s,
      color: 'rgba(230, 236, 242, 0.95)',
      baseline: 'middle',
      weight: '700',
    });
    drawHpBar(ctx, hx, y0 + 64 * s, barW * 0.85, barH * 0.9, 1, 'rgba(200, 210, 220, 0.85)');
  }

  function drawMoney(ctx, layout, accent) {
    const { scale: s, left, bottom } = layout;
    const y = bottom - 72 * s - 26 * s;
    fillText(ctx, '$3,250', left, y, {
      size: 26 * s,
      color: accent,
      baseline: 'middle',
      weight: '700',
    });
  }

  /** Flat AK-47 silhouette (loadout / ammo panel). */
  function drawAkSilhouette(ctx, x, y, w, h, color) {
    ctx.save();
    ctx.translate(x, y);
    const sx = w / 120;
    const sy = h / 36;
    ctx.scale(sx, sy);
    ctx.fillStyle = color;
    ctx.beginPath();
    // receiver + barrel
    ctx.moveTo(8, 18);
    ctx.lineTo(18, 12);
    ctx.lineTo(55, 12);
    ctx.lineTo(70, 10);
    ctx.lineTo(108, 10);
    ctx.lineTo(112, 14);
    ctx.lineTo(108, 16);
    ctx.lineTo(72, 16);
    ctx.lineTo(58, 22);
    ctx.lineTo(40, 24);
    ctx.lineTo(28, 28);
    ctx.lineTo(18, 28);
    ctx.lineTo(12, 24);
    ctx.closePath();
    ctx.fill();
    // stock
    ctx.fillRect(0, 14, 12, 8);
    // mag
    ctx.beginPath();
    ctx.moveTo(38, 22);
    ctx.lineTo(46, 22);
    ctx.lineTo(44, 34);
    ctx.lineTo(36, 34);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function drawGrenadeIcon(ctx, x, y, size, kind, color, active) {
    const s = size;
    ctx.save();
    ctx.globalAlpha = active ? 1 : 0.45;
    ctx.translate(x + s / 2, y + s / 2);
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    ctx.lineWidth = Math.max(1, s * 0.08);

    if (kind === 'flash') {
      ctx.beginPath();
      ctx.arc(0, 2, s * 0.28, 0, Math.PI * 2);
      ctx.fill();
      for (let i = 0; i < 6; i += 1) {
        const a = (i / 6) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(Math.cos(a) * s * 0.2, Math.sin(a) * s * 0.2 - 2);
        ctx.lineTo(Math.cos(a) * s * 0.42, Math.sin(a) * s * 0.42 - 2);
        ctx.stroke();
      }
    } else if (kind === 'smoke') {
      ctx.beginPath();
      ctx.arc(0, 2, s * 0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(-s * 0.08, -s * 0.38, s * 0.16, s * 0.2);
    } else if (kind === 'he') {
      ctx.beginPath();
      ctx.moveTo(0, -s * 0.35);
      ctx.lineTo(s * 0.32, s * 0.28);
      ctx.lineTo(-s * 0.32, s * 0.28);
      ctx.closePath();
      ctx.fill();
    } else {
      // molotov bottle
      ctx.fillRect(-s * 0.12, -s * 0.1, s * 0.24, s * 0.42);
      ctx.beginPath();
      ctx.arc(0, -s * 0.22, s * 0.14, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  function drawAmmoAndWeapon(ctx, layout, accent, showLoadout) {
    const { scale: s, right, bottom } = layout;
    const ammoX = right - 8 * s;
    const ammoY = bottom - 18 * s;

    // Magazine / reserve (CS2: large clip, smaller reserve)
    fillText(ctx, '30', ammoX - 52 * s, ammoY, {
      size: 40 * s,
      color: accent,
      align: 'right',
      baseline: 'bottom',
    });
    fillText(ctx, '/', ammoX - 42 * s, ammoY - 4 * s, {
      size: 22 * s,
      color: 'rgba(220, 228, 236, 0.75)',
      align: 'right',
      baseline: 'bottom',
      weight: '600',
    });
    fillText(ctx, '90', ammoX, ammoY - 2 * s, {
      size: 22 * s,
      color: 'rgba(220, 228, 236, 0.85)',
      align: 'right',
      baseline: 'bottom',
      weight: '600',
    });

    // Weapon silhouette above ammo
    const gunW = 150 * s;
    const gunH = 42 * s;
    const gunX = right - gunW - 4 * s;
    const gunY = bottom - 78 * s;
    drawAkSilhouette(ctx, gunX, gunY, gunW, gunH, accent);

    if (!showLoadout) return;

    // Vertical utility column (CS2 loadout strip)
    const slot = 28 * s;
    const gx = right - slot;
    let gy = gunY - slot * 4 - 12 * s;
    const kinds = ['molotov', 'he', 'smoke', 'flash'];
    kinds.forEach((kind, i) => {
      const active = i === 3;
      ctx.save();
      ctx.fillStyle = active ? 'rgba(0, 0, 0, 0.35)' : 'rgba(0, 0, 0, 0.18)';
      ctx.fillRect(gx - 4 * s, gy, slot + 8 * s, slot);
      if (active) {
        ctx.fillStyle = accent;
        ctx.fillRect(gx - 4 * s, gy, Math.max(2, 2.5 * s), slot);
      }
      ctx.restore();
      drawGrenadeIcon(ctx, gx, gy + 2 * s, slot - 4 * s, kind, active ? accent : 'rgba(210, 218, 226, 0.8)', true);
      gy += slot;
    });

    // Secondary / knife hints above gun (always-show loadout)
    ctx.save();
    ctx.globalAlpha = 0.55;
    drawAkSilhouette(ctx, gunX + 30 * s, gunY - 36 * s, gunW * 0.55, gunH * 0.55, 'rgba(220, 228, 236, 0.9)');
    ctx.restore();
    fillText(ctx, 'Glock', gunX + gunW * 0.55, gunY - 18 * s, {
      size: 12 * s,
      color: 'rgba(200, 210, 220, 0.7)',
      align: 'right',
      weight: '600',
      font: FONT_UI,
      shadow: false,
    });
  }

  function drawPlayerSlot(ctx, x, y, w, h, teamColor, alive, index) {
    ctx.save();
    ctx.fillStyle = alive ? 'rgba(18, 22, 28, 0.75)' : 'rgba(18, 22, 28, 0.35)';
    ctx.fillRect(x, y, w, h);

    // Mini portrait wash
    ctx.fillStyle = alive ? 'rgba(160, 170, 180, 0.35)' : 'rgba(80, 85, 90, 0.25)';
    ctx.beginPath();
    ctx.arc(x + w / 2, y + h * 0.38, w * 0.22, 0, Math.PI * 2);
    ctx.fill();

    // Team color footer strip (CS2 avatar row)
    ctx.fillStyle = alive ? teamColor : 'rgba(90, 95, 100, 0.55)';
    ctx.fillRect(x, y + h - Math.max(3, h * 0.14), w, Math.max(3, h * 0.14));

    if (!alive) {
      ctx.strokeStyle = 'rgba(200, 80, 80, 0.85)';
      ctx.lineWidth = Math.max(1, w * 0.06);
      ctx.beginPath();
      ctx.moveTo(x + w * 0.25, y + h * 0.25);
      ctx.lineTo(x + w * 0.75, y + h * 0.65);
      ctx.moveTo(x + w * 0.75, y + h * 0.25);
      ctx.lineTo(x + w * 0.25, y + h * 0.65);
      ctx.stroke();
    } else {
      fillText(ctx, String(index), x + w / 2, y + h * 0.55, {
        size: Math.max(9, w * 0.32),
        color: '#f2f5f8',
        align: 'center',
        baseline: 'middle',
        weight: '700',
        font: FONT_UI,
        shadow: false,
      });
    }
    ctx.restore();
  }

  function drawTeamCounters(ctx, layout, useCounts) {
    const { scale: s, top, midX } = layout;
    const slotW = 34 * s;
    const slotH = 40 * s;
    const gap = 3 * s;
    const timerW = 72 * s;
    const scoreGap = 14 * s;
    const rowW = 5 * slotW + 4 * gap;
    const countBox = 44 * s;

    const ctColor = TEAM_COLORS[TEAM_CT];
    const tColor = TEAM_COLORS[TEAM_T];

    // Round timer + match score
    const timerX = midX - timerW / 2;
    const timerY = top;
    fillText(ctx, '12', timerX - 10 * s, timerY + 18 * s, {
      size: 26 * s,
      color: ctColor,
      align: 'right',
      baseline: 'middle',
    });
    fillText(ctx, '1:35', midX, timerY + 18 * s, {
      size: 22 * s,
      color: '#f5f7fa',
      align: 'center',
      baseline: 'middle',
      weight: '700',
    });
    fillText(ctx, '9', timerX + timerW + 10 * s, timerY + 18 * s, {
      size: 26 * s,
      color: tColor,
      align: 'left',
      baseline: 'middle',
    });

    const rowY = timerY + 36 * s;

    if (useCounts) {
      // Large alive-count style
      fillText(ctx, '5', midX - scoreGap - countBox / 2, rowY + slotH / 2, {
        size: 36 * s,
        color: ctColor,
        align: 'center',
        baseline: 'middle',
      });
      fillText(ctx, '4', midX + scoreGap + countBox / 2, rowY + slotH / 2, {
        size: 36 * s,
        color: tColor,
        align: 'center',
        baseline: 'middle',
      });
      return;
    }

    // CT avatars (left of timer)
    let x = midX - timerW / 2 - scoreGap - rowW;
    for (let i = 0; i < 5; i += 1) {
      const alive = i < 5;
      drawPlayerSlot(ctx, x + i * (slotW + gap), rowY, slotW, slotH, ctColor, alive, i + 1);
    }

    // T avatars (right of timer) — one dead for realism
    x = midX + timerW / 2 + scoreGap;
    for (let i = 0; i < 5; i += 1) {
      const alive = i < 4;
      drawPlayerSlot(ctx, x + i * (slotW + gap), rowY, slotW, slotH, tColor, alive, i + 1);
    }
  }

  function drawTargetId(ctx, layout) {
    const { scale: s, midX, midY } = layout;
    const y = midY + 56 * s;
    const name = 's1mple';
    fillText(ctx, name, midX, y, {
      size: 16 * s,
      color: '#f2f5f8',
      align: 'center',
      baseline: 'bottom',
      weight: '600',
      font: FONT_UI,
    });
    const barW = 72 * s;
    const barH = 4 * s;
    drawHpBar(ctx, midX - barW / 2, y + 4 * s, barW, barH, 0.62, '#eb4b4b');
  }

  function drawTeamOverhead(ctx, layout, mode) {
    if (mode <= 0) return;
    const { scale: s, midX, midY } = layout;
    // Fake teammate in mid-field (world-space stand-in)
    const x = midX + 140 * s;
    const y = midY - 40 * s;
    const color = TEAM_COLORS[previewTeam];

    // Simple player body hint
    ctx.save();
    ctx.globalAlpha = 0.35;
    ctx.fillStyle = '#9aa3ad';
    ctx.beginPath();
    ctx.arc(x, y + 36 * s, 10 * s, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(x - 8 * s, y + 46 * s, 16 * s, 28 * s);
    ctx.restore();

    const badge = 16 * s;
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, badge / 2, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.lineWidth = Math.max(1, s);
    ctx.stroke();
    ctx.restore();

    fillText(ctx, '3', x, y, {
      size: 11 * s,
      color: '#0d1117',
      align: 'center',
      baseline: 'middle',
      weight: '800',
      font: FONT_UI,
      shadow: false,
    });

    if (mode >= 2) {
      fillText(ctx, 'Teammate', x, y - badge / 2 - 6 * s, {
        size: 12 * s,
        color,
        align: 'center',
        baseline: 'bottom',
        weight: '600',
        font: FONT_UI,
      });
      drawHpBar(ctx, x - 28 * s, y + badge / 2 + 4 * s, 56 * s, 3 * s, 0.78, color);
    }
  }

  /** Tiny radar placeholder (top-left) so the frame reads as a full HUD — not interactive. */
  function drawRadarPlaceholder(ctx, layout) {
    const { scale: s, left, top } = layout;
    const r = 52 * s;
    const cx = left + r;
    const cy = top + r + 8 * s;
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(8, 12, 16, 0.55)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(150, 180, 200, 0.55)';
    ctx.lineWidth = Math.max(1, 1.5 * s);
    ctx.stroke();
    ctx.fillStyle = 'rgba(90, 140, 180, 0.35)';
    ctx.beginPath();
    ctx.arc(cx - r * 0.15, cy + r * 0.1, r * 0.55, 0, Math.PI * 2);
    ctx.fill();
    // player pip
    ctx.fillStyle = '#5dade2';
    ctx.beginPath();
    ctx.arc(cx, cy, 3.5 * s, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function buildLayout(width, height, state) {
    const hudScale = clamp(num(state, 'hud_scaling', 1), 0.5, 1);
    const safeX = clamp(num(state, 'safezonex', 1), 0.85, 1);
    const safeY = clamp(num(state, 'safezoney', 1), 0.85, 1);
    const canvasScale = width / REF_W;
    const scale = canvasScale * hudScale;

    // CS2 safezone pulls HUD toward center from edges
    const edgePadX = 28 * scale;
    const edgePadY = 22 * scale;
    const insetX = ((1 - safeX) / 2) * width + edgePadX;
    const insetY = ((1 - safeY) / 2) * height + edgePadY;

    return {
      scale,
      left: insetX,
      right: width - insetX,
      top: insetY,
      bottom: height - insetY,
      midX: width / 2,
      midY: height / 2,
      width,
      height,
    };
  }

  function render(canvas, state, background = 'dark') {
    if (!canvas || !state) return;

    const width = canvas.width || PREVIEW_SIZE;
    const height = canvas.height || Math.round(PREVIEW_SIZE / ASPECT);
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    CrosshairRenderer.paintBackground(ctx, width, height, background);

    const layout = buildLayout(width, height, state);
    const accent = resolveAccent(state);
    const showTarget = num(state, 'hud_showtargetid', 1) === 1;
    const showLoadout = num(state, 'cl_showloadout', 1) === 1;
    const overheadMode = Math.round(num(state, 'cl_teamid_overhead_mode', 2));
    const useCounts = num(state, 'cl_teamcounter_playercount_instead_of_avatars', 0) === 1;

    drawRadarPlaceholder(ctx, layout);
    drawTeamCounters(ctx, layout, useCounts);
    drawMoney(ctx, layout, accent);
    drawHealthArmor(ctx, layout, accent);
    drawAmmoAndWeapon(ctx, layout, accent, showLoadout);
    if (showTarget) drawTargetId(ctx, layout);
    drawTeamOverhead(ctx, layout, overheadMode);
  }

  return {
    render,
    setTeam,
    getTeam,
    PREVIEW_SIZE,
    ASPECT,
    TEAM_CT,
    TEAM_T,
  };
})();
