/**
 * Pro player crosshair presets.
 * Migrated to Rush Hour cvars (Sep 2026). Length/gap/thickness units changed with
 * resolution-independent crosshairs — values are best-effort from pre-update codes.
 * Gap is clamped to the in-game Style Settings range (0–128); old negative gaps → 0.
 */
const CrosshairPresets = (() => {
  const CYAN = {
    cl_crosshaircolor_r: 0,
    cl_crosshaircolor_g: 255,
    cl_crosshaircolor_b: 255,
    cl_crosshaircolor_a: 255,
  };

  const BASE = {
    cl_crosshairstyle: 4,
    cl_crosshair_recoil: 0,
    cl_crosshair_t: 0,
    cl_crosshair_drawoutline: 0,
    cl_crosshairdot: 0,
    ...CYAN,
  };

  const PRESETS = [
    {
      id: 'donk',
      label: 'donk',
      team: 'Spirit',
      state: applyPresetState({
        ...BASE,
        cl_crosshairdot: 1,
        cl_crosshair_length: 2,
        cl_crosshair_thickness: 1,
        cl_crosshair_gap: 0,
        cl_crosshaircolor_r: 255,
        cl_crosshaircolor_g: 255,
        cl_crosshaircolor_b: 0,
      }),
    },
    {
      id: 'zywoo',
      label: 'ZywOo',
      team: 'Vitality',
      state: applyPresetState({
        ...BASE,
        cl_crosshair_length: 2,
        cl_crosshair_thickness: 1,
        cl_crosshair_gap: 0,
      }),
    },
    {
      id: 's1mple',
      label: 's1mple',
      team: 'BC.Game',
      state: applyPresetState({
        ...BASE,
        cl_crosshairstyle: 5,
        cl_crosshairdot: 1,
        cl_crosshair_length: 1,
        cl_crosshair_thickness: 1,
        cl_crosshair_gap: 0,
      }),
    },
    {
      id: 'niko',
      label: 'NiKo',
      team: 'Falcons',
      state: applyPresetState({
        ...BASE,
        cl_crosshair_length: 1,
        cl_crosshair_thickness: 1,
        cl_crosshair_gap: 0,
      }),
    },
    {
      id: 'm0nesy',
      label: 'm0NESY',
      team: 'Falcons',
      state: applyPresetState({
        ...BASE,
        cl_crosshair_length: 1,
        cl_crosshair_thickness: 1,
        cl_crosshair_gap: 0,
      }),
    },
    {
      id: 'ropz',
      label: 'ropz',
      team: 'Vitality',
      state: applyPresetState({
        ...BASE,
        cl_crosshair_length: 2,
        cl_crosshair_thickness: 1,
        cl_crosshair_gap: 0,
        cl_crosshaircolor_r: 0,
        cl_crosshaircolor_g: 255,
        cl_crosshaircolor_b: 0,
      }),
    },
    {
      id: 'dev1ce',
      label: 'dev1ce',
      team: 'Astralis',
      state: applyPresetState({
        ...BASE,
        cl_crosshair_length: 1,
        cl_crosshair_thickness: 1,
        cl_crosshair_gap: 0,
      }),
    },
    {
      id: 'elige',
      label: 'EliGE',
      team: 'Liquid',
      state: applyPresetState({
        ...BASE,
        cl_crosshairdot: 1,
        cl_crosshair_length: 0,
        cl_crosshair_thickness: 1,
        cl_crosshair_gap: 0,
        cl_crosshair_drawoutline: 1,
        cl_crosshaircolor_r: 255,
        cl_crosshaircolor_g: 100,
        cl_crosshaircolor_b: 255,
      }),
    },
    {
      id: 'xantares',
      label: 'XANTARES',
      team: 'Aurora',
      state: applyPresetState({
        ...BASE,
        cl_crosshair_length: 3,
        cl_crosshair_thickness: 1,
        cl_crosshair_gap: 0,
        cl_crosshaircolor_r: 50,
        cl_crosshaircolor_g: 250,
        cl_crosshaircolor_b: 50,
        cl_crosshaircolor_a: 200,
      }),
    },
    {
      id: 'kyousuke',
      label: 'kyousuke',
      team: 'Falcons',
      state: applyPresetState({
        ...BASE,
        cl_crosshair_length: 1,
        cl_crosshair_thickness: 1,
        cl_crosshair_gap: 0,
        cl_crosshaircolor_r: 0,
        cl_crosshaircolor_g: 255,
        cl_crosshaircolor_b: 135,
      }),
    },
  ];

  function getById(id) {
    return PRESETS.find((preset) => preset.id === id) ?? null;
  }

  return { PRESETS, getById };
})();
