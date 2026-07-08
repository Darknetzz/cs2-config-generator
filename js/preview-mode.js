/**
 * Preview mode (normal crosshair vs grenade lineup reticle).
 * Display only — does not affect exported commands.
 */
const PreviewMode = (() => {
  const MODES = {
    NORMAL: 'normal',
    LINEUP: 'lineup',
  };

  const DEFAULT_MODE = MODES.NORMAL;

  const GRENADE_TYPES = [
    { id: 'smoke', label: 'Smoke', enableKey: 'cl_grenadecrosshair_smoke' },
    { id: 'flash', label: 'Flash', enableKey: 'cl_grenadecrosshair_flash' },
    { id: 'explosive', label: 'HE', enableKey: 'cl_grenadecrosshair_explosive' },
    { id: 'fire', label: 'Fire', enableKey: 'cl_grenadecrosshair_fire' },
    { id: 'decoy', label: 'Decoy', enableKey: 'cl_grenadecrosshair_decoy' },
  ];

  const DEFAULT_GRENADE_TYPE = 'smoke';

  function isValidMode(mode) {
    return mode === MODES.NORMAL || mode === MODES.LINEUP;
  }

  function isValidGrenadeType(id) {
    return GRENADE_TYPES.some((type) => type.id === id);
  }

  function isGrenadeTypeEnabled(state, typeId) {
    const type = GRENADE_TYPES.find((item) => item.id === typeId);
    return Boolean(type && state[type.enableKey] === 1);
  }

  function getGrenadeTypeLabel(typeId) {
    return GRENADE_TYPES.find((type) => type.id === typeId)?.label ?? typeId;
  }

  return {
    MODES,
    DEFAULT_MODE,
    GRENADE_TYPES,
    DEFAULT_GRENADE_TYPE,
    isValidMode,
    isValidGrenadeType,
    isGrenadeTypeEnabled,
    getGrenadeTypeLabel,
  };
})();
