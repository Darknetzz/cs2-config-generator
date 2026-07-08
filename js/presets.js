/**
 * Pro player crosshair presets.
 * Values sourced from publicly shared crosshair codes (Jaxon.GG, April 2026).
 */
const CrosshairPresets = (() => {
  const CYAN = {
    cl_crosshaircolor: 4,
    cl_crosshaircolor_r: 0,
    cl_crosshaircolor_g: 255,
    cl_crosshaircolor_b: 255,
    cl_crosshairusealpha: 1,
    cl_crosshairalpha: 255,
  };

  const BASE = {
    cl_crosshairstyle: 4,
    cl_crosshair_recoil: 0,
    cl_crosshairgap_useweaponvalue: 0,
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
        cl_crosshairsize: 1.5,
        cl_crosshairthickness: 0,
        cl_crosshairgap: -3,
        cl_crosshaircolor: 2,
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
        cl_crosshairsize: 1.5,
        cl_crosshairthickness: 0,
        cl_crosshairgap: -3,
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
        cl_crosshairsize: 1,
        cl_crosshairthickness: 0,
        cl_crosshairgap: -2,
      }),
    },
    {
      id: 'niko',
      label: 'NiKo',
      team: 'Falcons',
      state: applyPresetState({
        ...BASE,
        cl_crosshairsize: 1,
        cl_crosshairthickness: 1,
        cl_crosshairgap: -4,
      }),
    },
    {
      id: 'm0nesy',
      label: 'm0NESY',
      team: 'Falcons',
      state: applyPresetState({
        ...BASE,
        cl_crosshairsize: 1,
        cl_crosshairthickness: 1,
        cl_crosshairgap: -4,
      }),
    },
    {
      id: 'ropz',
      label: 'ropz',
      team: 'Vitality',
      state: applyPresetState({
        ...BASE,
        cl_crosshairsize: 2,
        cl_crosshairthickness: 0.5,
        cl_crosshairgap: -3,
        cl_crosshaircolor: 1,
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
        cl_crosshairsize: 1,
        cl_crosshairthickness: 1,
        cl_crosshairgap: -4,
      }),
    },
    {
      id: 'elige',
      label: 'EliGE',
      team: 'Liquid',
      state: applyPresetState({
        ...BASE,
        cl_crosshairdot: 1,
        cl_crosshairsize: 0,
        cl_crosshairthickness: 1,
        cl_crosshairgap: -5,
        cl_crosshair_drawoutline: 1,
        cl_crosshair_outlinethickness: 1,
        cl_crosshaircolor: 5,
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
        cl_crosshairsize: 3,
        cl_crosshairthickness: 0.5,
        cl_crosshairgap: 0,
        cl_crosshaircolor: 5,
        cl_crosshaircolor_r: 50,
        cl_crosshaircolor_g: 250,
        cl_crosshaircolor_b: 50,
        cl_crosshairalpha: 200,
      }),
    },
    {
      id: 'kyousuke',
      label: 'kyousuke',
      team: 'Falcons',
      state: applyPresetState({
        ...BASE,
        cl_crosshairsize: 1,
        cl_crosshairthickness: 1,
        cl_crosshairgap: -4,
        cl_crosshaircolor: 5,
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
