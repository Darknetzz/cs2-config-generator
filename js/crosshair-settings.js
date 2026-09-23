/**
 * CS2 crosshair cvar definitions — single source of truth for defaults, ranges, and UI metadata.
 * Updated for the Rush Hour (Sep 2026) crosshair overhaul.
 */
const CROSSHAIR_PRESET_COLORS = {
  0: [255, 0, 0],
  1: [0, 255, 0],
  2: [255, 255, 0],
  3: [0, 0, 255],
  4: [0, 255, 255],
};

/** Quick RGB picks shown in the Color group (not exported cvars). */
const CROSSHAIR_QUICK_COLORS = [
  { id: 'red', label: 'Red', rgb: CROSSHAIR_PRESET_COLORS[0] },
  { id: 'green', label: 'Green', rgb: CROSSHAIR_PRESET_COLORS[1] },
  { id: 'yellow', label: 'Yellow', rgb: CROSSHAIR_PRESET_COLORS[2] },
  { id: 'blue', label: 'Blue', rgb: CROSSHAIR_PRESET_COLORS[3] },
  { id: 'cyan', label: 'Cyan', rgb: CROSSHAIR_PRESET_COLORS[4] },
  { id: 'white', label: 'White', rgb: [255, 255, 255] },
];

const CHANNEL_SWATCH_COLORS = {
  cl_crosshaircolor_r: '#ff4444',
  cl_crosshaircolor_g: '#44dd44',
  cl_crosshaircolor_b: '#4488ff',
  cl_crosshaircolor_a: '#cccccc',
};

/** Pre-Rush Hour cvar names → current names. */
const CROSSHAIR_LEGACY_KEY_MAP = {
  cl_crosshairsize: 'cl_crosshair_length',
  cl_crosshairgap: 'cl_crosshair_gap',
  cl_crosshairthickness: 'cl_crosshair_thickness',
  cl_crosshairalpha: 'cl_crosshaircolor_a',
};

/** Styles that animate with weapon inaccuracy / movement (preview). */
const CROSSHAIR_DYNAMIC_STYLES = [0, 1, 2, 5, 7];

/** Style 2 (Dynamic Cross Classic) uses the split-distance alpha controls. */
const CROSSHAIR_SPLIT_STYLES = [2];

/** Styles that draw cross bars (not circle / dot-only). */
const CROSSHAIR_CROSS_STYLES = [0, 2, 4, 5, 7];

/** Styles that draw a circle. */
const CROSSHAIR_CIRCLE_STYLES = [1, 3];

function presetColorToCss(value) {
  const rgb = CROSSHAIR_PRESET_COLORS[value];
  return rgb ? `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})` : null;
}

function getCrosshairSwatchColor(state) {
  return `rgb(${state.cl_crosshaircolor_r}, ${state.cl_crosshaircolor_g}, ${state.cl_crosshaircolor_b})`;
}

/**
 * Rewrite a raw crosshair state / import bag from legacy Rush Hour–era names.
 * @param {Record<string, unknown>} source
 * @returns {Record<string, unknown>}
 */
function migrateLegacyCrosshairSource(source) {
  if (!source || typeof source !== 'object') return source;

  const out = { ...source };

  for (const [oldKey, newKey] of Object.entries(CROSSHAIR_LEGACY_KEY_MAP)) {
    if (oldKey in out && !(newKey in out)) {
      out[newKey] = out[oldKey];
    }
    delete out[oldKey];
  }

  if ('cl_crosshaircolor' in out) {
    const preset = Number(out.cl_crosshaircolor);
    if (preset !== 5 && CROSSHAIR_PRESET_COLORS[preset]) {
      const [r, g, b] = CROSSHAIR_PRESET_COLORS[preset];
      out.cl_crosshaircolor_r = r;
      out.cl_crosshaircolor_g = g;
      out.cl_crosshaircolor_b = b;
    }
    delete out.cl_crosshaircolor;
  }

  if ('cl_crosshairusealpha' in out) {
    if (Number(out.cl_crosshairusealpha) === 0) {
      out.cl_crosshaircolor_a = 255;
    }
    delete out.cl_crosshairusealpha;
  }

  delete out.cl_crosshair_outlinethickness;
  delete out.cl_crosshairgap_useweaponvalue;
  delete out.cl_fixedcrosshairgap;

  return out;
}

const CROSSHAIR_GROUPS = [
  {
    id: 'shape',
    label: 'Shape & Style',
    settings: [
      'cl_crosshairstyle',
      'cl_crosshair_length',
      'cl_crosshair_gap',
      'cl_crosshair_thickness',
      'cl_crosshairdot',
      'cl_crosshair_t',
    ],
  },
  {
    id: 'color',
    label: 'Color & Opacity',
    settings: [
      'cl_crosshaircolor_r',
      'cl_crosshaircolor_g',
      'cl_crosshaircolor_b',
      'cl_crosshaircolor_a',
    ],
  },
  {
    id: 'outline',
    label: 'Outline',
    headerToggle: 'cl_crosshair_drawoutline',
    settings: [
      'cl_crosshair_drawoutline',
    ],
  },
  {
    id: 'dynamic',
    label: 'Dynamic / Gameplay',
    settings: [
      'cl_crosshair_recoil',
      'cl_crosshair_dynamic_spread_limit',
      'cl_crosshair_dynamic_splitdist',
      'cl_crosshair_dynamic_splitalpha_innermod',
      'cl_crosshair_dynamic_splitalpha_outermod',
      'cl_crosshair_dynamic_maxdist_splitratio',
    ],
  },
  {
    id: 'sniper',
    label: 'Sniper & Misc',
    settings: [
      'cl_crosshair_sniper_width',
      'cl_sniper_show_inaccuracy',
      'cl_sniper_delay_unscope',
      'cl_sniper_auto_rezoom',
      'cl_crosshair_friendly_warning',
    ],
  },
  {
    id: 'grenade',
    label: 'Grenade Lineup',
    settings: [
      'cl_grenadecrosshair_keepusercrosshair',
      'cl_grenadecrosshair_smoke',
      'cl_grenadecrosshairdelay_smoke',
      'cl_grenadecrosshair_flash',
      'cl_grenadecrosshairdelay_flash',
      'cl_grenadecrosshair_explosive',
      'cl_grenadecrosshairdelay_explosive',
      'cl_grenadecrosshair_fire',
      'cl_grenadecrosshairdelay_fire',
      'cl_grenadecrosshair_decoy',
      'cl_grenadecrosshairdelay_decoy',
    ],
  },
];

const CROSSHAIR_SETTINGS = {
  cl_crosshairstyle: {
    label: 'Style',
    description: 'Crosshair shape and behavior. Styles 0, 1, and 7 track weapon inaccuracy. Default is Dynamic Quad (7).',
    type: 'select',
    default: 7,
    options: [
      { value: 0, label: '0 — Dynamic Cross' },
      { value: 1, label: '1 — Dynamic Circle' },
      { value: 2, label: '2 — Dynamic Cross (Classic)' },
      { value: 3, label: '3 — Static Circle' },
      { value: 4, label: '4 — Static Cross' },
      { value: 5, label: '5 — Dynamic Cross (Legacy / Shot Feedback)' },
      { value: 6, label: '6 — Dot Only' },
      { value: 7, label: '7 — Dynamic Quad' },
    ],
  },
  cl_crosshair_length: {
    label: 'Length',
    description: 'Length of each crosshair bar (or circle radius contribution). Scaled with screen resolution.',
    type: 'range',
    default: 8,
    min: 0,
    max: 100,
    step: 1,
    enabledWhen: { key: 'cl_crosshairstyle', values: [0, 1, 2, 3, 4, 5, 7] },
    hideWhenDisabled: true,
  },
  cl_crosshair_gap: {
    label: 'Gap',
    description: 'Offset added to the gap between the crosshair center and the bars.',
    type: 'range',
    default: 4,
    min: -50,
    max: 50,
    step: 1,
    enabledWhen: { key: 'cl_crosshairstyle', values: [0, 1, 2, 3, 4, 5, 7] },
    hideWhenDisabled: true,
  },
  cl_crosshair_thickness: {
    label: 'Thickness',
    description: 'Thickness of crosshair bars and circle stroke, scaled with screen resolution (minimum 1 pixel).',
    type: 'range',
    default: 2,
    min: 1,
    max: 20,
    step: 1,
  },
  cl_crosshairdot: {
    label: 'Center dot',
    description: 'Draw a dot at the center of the crosshair.',
    type: 'toggle',
    default: 0,
    enabledWhen: { key: 'cl_crosshairstyle', values: [0, 1, 2, 3, 4, 5, 7] },
    hideWhenDisabled: true,
  },
  cl_crosshair_t: {
    label: 'T-shape',
    description: 'Hide the top bar for a T-shaped crosshair.',
    type: 'toggle',
    default: 0,
    enabledWhen: { key: 'cl_crosshairstyle', values: CROSSHAIR_CROSS_STYLES },
    hideWhenDisabled: true,
  },
  cl_crosshaircolor_r: {
    label: 'Red',
    description: 'Crosshair color, red component (0–255).',
    type: 'range',
    default: 0,
    min: 0,
    max: 255,
    step: 1,
  },
  cl_crosshaircolor_g: {
    label: 'Green',
    description: 'Crosshair color, green component (0–255).',
    type: 'range',
    default: 255,
    min: 0,
    max: 255,
    step: 1,
  },
  cl_crosshaircolor_b: {
    label: 'Blue',
    description: 'Crosshair color, blue component (0–255).',
    type: 'range',
    default: 0,
    min: 0,
    max: 255,
    step: 1,
  },
  cl_crosshaircolor_a: {
    label: 'Opacity',
    description: 'Crosshair opacity. 0 = fully transparent, 255 = fully opaque.',
    type: 'range',
    default: 255,
    min: 0,
    max: 255,
    step: 1,
  },
  cl_crosshair_drawoutline: {
    label: 'Outline',
    description: 'Draw a black outline around the crosshair for better visibility.',
    type: 'toggle',
    default: 1,
  },
  cl_crosshair_recoil: {
    label: 'Follow recoil',
    description: 'Crosshair follows the weapon\'s predicted recoil (aim punch).',
    type: 'toggle',
    default: 1,
    previewOnly: true,
  },
  cl_crosshair_dynamic_spread_limit: {
    label: 'Dynamic spread limit',
    description: 'Extra distance dynamic elements may spread from the 128-pixel baseline (0–255).',
    type: 'range',
    default: 255,
    min: 0,
    max: 255,
    step: 1,
    enabledWhen: { key: 'cl_crosshairstyle', values: CROSSHAIR_DYNAMIC_STYLES },
    hideWhenDisabled: true,
  },
  cl_crosshair_dynamic_splitdist: {
    label: 'Dynamic split distance',
    description: 'Style 2 only: distance at which the crosshair bars split in two.',
    type: 'range',
    default: 3,
    min: 0,
    max: 20,
    step: 1,
    enabledWhen: { key: 'cl_crosshairstyle', values: CROSSHAIR_SPLIT_STYLES },
    hideWhenDisabled: true,
  },
  cl_crosshair_dynamic_splitalpha_innermod: {
    label: 'Split alpha (inner)',
    description: 'Style 2 only: alpha multiplier for the INNER bars once split.',
    type: 'range',
    default: 0,
    min: 0,
    max: 1,
    step: 0.05,
    enabledWhen: { key: 'cl_crosshairstyle', values: CROSSHAIR_SPLIT_STYLES },
    hideWhenDisabled: true,
  },
  cl_crosshair_dynamic_splitalpha_outermod: {
    label: 'Split alpha (outer)',
    description: 'Style 2 only: alpha multiplier for the OUTER bars once split.',
    type: 'range',
    default: 1,
    min: 0,
    max: 1,
    step: 0.05,
    enabledWhen: { key: 'cl_crosshairstyle', values: CROSSHAIR_SPLIT_STYLES },
    hideWhenDisabled: true,
  },
  cl_crosshair_dynamic_maxdist_splitratio: {
    label: 'Max split ratio',
    description: 'Style 2 only: how bar length is divided between inner and outer bars once split.',
    type: 'range',
    default: 1,
    min: 0,
    max: 1,
    step: 0.05,
    enabledWhen: { key: 'cl_crosshairstyle', values: CROSSHAIR_SPLIT_STYLES },
    hideWhenDisabled: true,
  },
  cl_crosshair_sniper_width: {
    label: 'Sniper width',
    description: 'Width of sniper scope crosshair lines (scoped view uses fixed black lines and a center dot, not your crosshair color).',
    type: 'range',
    default: 1,
    min: 1,
    max: 5,
    step: 1,
  },
  cl_sniper_show_inaccuracy: {
    label: 'Scoped inaccuracy',
    description: 'Show the dynamic inaccuracy indicator inside the sniper scope.',
    type: 'toggle',
    default: 0,
    previewOnly: true,
  },
  cl_sniper_delay_unscope: {
    label: 'Delay unscope',
    description: 'Briefly keep the scope view after unscoping (cannot fire until fully unscoped).',
    type: 'toggle',
    default: 0,
    previewOnly: true,
  },
  cl_sniper_auto_rezoom: {
    label: 'Auto-rezoom',
    description: 'Automatically rezoom snipers after a shot.',
    type: 'toggle',
    default: 1,
    previewOnly: true,
  },
  cl_crosshair_friendly_warning: {
    label: 'Friendly warning',
    description: 'Crosshair warning when aiming at a teammate.',
    type: 'select',
    default: 1,
    previewOnly: true,
    options: [
      { value: 0, label: 'Off' },
      { value: 1, label: 'On' },
    ],
  },
  cl_grenadecrosshair_keepusercrosshair: {
    label: 'Keep regular crosshair',
    description: 'Keep drawing your normal crosshair while the grenade throw crosshair is shown.',
    type: 'toggle',
    default: 1,
    consoleFormat: 'bool',
  },
  cl_grenadecrosshair_smoke: {
    label: 'Smoke lineup reticle',
    description: 'Enable the lineup reticle when holding a smoke grenade.',
    type: 'toggle',
    default: 1,
    consoleFormat: 'bool',
  },
  cl_grenadecrosshairdelay_smoke: {
    label: 'Smoke pin delay',
    description: 'Seconds after pulling the pin before the smoke lineup reticle appears.',
    type: 'range',
    default: 2,
    min: 0,
    max: 5,
    step: 0.1,
    enabledWhen: { key: 'cl_grenadecrosshair_smoke', value: 1 },
    previewOnly: true,
  },
  cl_grenadecrosshair_flash: {
    label: 'Flash lineup reticle',
    description: 'Enable the lineup reticle when holding a flashbang.',
    type: 'toggle',
    default: 1,
    consoleFormat: 'bool',
  },
  cl_grenadecrosshairdelay_flash: {
    label: 'Flash pin delay',
    description: 'Seconds after pulling the pin before the flash lineup reticle appears.',
    type: 'range',
    default: 2,
    min: 0,
    max: 5,
    step: 0.1,
    enabledWhen: { key: 'cl_grenadecrosshair_flash', value: 1 },
    previewOnly: true,
  },
  cl_grenadecrosshair_explosive: {
    label: 'HE lineup reticle',
    description: 'Enable the lineup reticle when holding an HE grenade.',
    type: 'toggle',
    default: 1,
    consoleFormat: 'bool',
  },
  cl_grenadecrosshairdelay_explosive: {
    label: 'HE pin delay',
    description: 'Seconds after pulling the pin before the HE lineup reticle appears.',
    type: 'range',
    default: 2,
    min: 0,
    max: 5,
    step: 0.1,
    enabledWhen: { key: 'cl_grenadecrosshair_explosive', value: 1 },
    previewOnly: true,
  },
  cl_grenadecrosshair_fire: {
    label: 'Fire lineup reticle',
    description: 'Enable the lineup reticle when holding a molotov or incendiary.',
    type: 'toggle',
    default: 1,
    consoleFormat: 'bool',
  },
  cl_grenadecrosshairdelay_fire: {
    label: 'Fire pin delay',
    description: 'Seconds after pulling the pin before the fire lineup reticle appears.',
    type: 'range',
    default: 2,
    min: 0,
    max: 5,
    step: 0.1,
    enabledWhen: { key: 'cl_grenadecrosshair_fire', value: 1 },
    previewOnly: true,
  },
  cl_grenadecrosshair_decoy: {
    label: 'Decoy lineup reticle',
    description: 'Enable the lineup reticle when holding a decoy grenade.',
    type: 'toggle',
    default: 1,
    consoleFormat: 'bool',
  },
  cl_grenadecrosshairdelay_decoy: {
    label: 'Decoy pin delay',
    description: 'Seconds after pulling the pin before the decoy lineup reticle appears.',
    type: 'range',
    default: 2,
    min: 0,
    max: 5,
    step: 0.1,
    enabledWhen: { key: 'cl_grenadecrosshair_decoy', value: 1 },
    previewOnly: true,
  },
};

const CrosshairSection = createSettingsModule({
  id: 'crosshair',
  label: 'Crosshair',
  fileName: 'crosshair',
  groups: CROSSHAIR_GROUPS,
  settings: CROSSHAIR_SETTINGS,
});

CrosshairSection.QUICK_COLORS = CROSSHAIR_QUICK_COLORS;
CrosshairSection.LEGACY_KEY_MAP = CROSSHAIR_LEGACY_KEY_MAP;
CrosshairSection.DYNAMIC_STYLES = CROSSHAIR_DYNAMIC_STYLES;
CrosshairSection.CIRCLE_STYLES = CROSSHAIR_CIRCLE_STYLES;
CrosshairSection.CROSS_STYLES = CROSSHAIR_CROSS_STYLES;
CrosshairSection.IMPORT_ALIASES = new Set([
  ...Object.keys(CROSSHAIR_LEGACY_KEY_MAP),
  'cl_crosshaircolor',
  'cl_crosshairusealpha',
  'cl_crosshair_outlinethickness',
  'cl_crosshairgap_useweaponvalue',
  'cl_fixedcrosshairgap',
]);

(() => {
  const originalMerge = CrosshairSection.mergeState;
  const originalApply = CrosshairSection.applyOverrides;

  CrosshairSection.mergeState = function mergeCrosshairState(target, source) {
    return originalMerge(target, migrateLegacyCrosshairSource(source));
  };

  CrosshairSection.applyOverrides = function applyCrosshairOverrides(overrides) {
    return originalApply(migrateLegacyCrosshairSource(overrides));
  };

  /**
   * Handle legacy / non-schema cvars during cfg import.
   * @returns {boolean} true if the cvar was consumed
   */
  CrosshairSection.consumeImportCvar = function consumeImportCvar(state, key, rawValue) {
    const mapped = CROSSHAIR_LEGACY_KEY_MAP[key];
    if (mapped) {
      state[mapped] = CrosshairSection.clamp(mapped, rawValue);
      return true;
    }

    if (key === 'cl_crosshaircolor') {
      const preset = Number(String(rawValue).trim());
      if (preset !== 5 && CROSSHAIR_PRESET_COLORS[preset]) {
        const [r, g, b] = CROSSHAIR_PRESET_COLORS[preset];
        state.cl_crosshaircolor_r = r;
        state.cl_crosshaircolor_g = g;
        state.cl_crosshaircolor_b = b;
      }
      return true;
    }

    if (key === 'cl_crosshairusealpha') {
      const on = ['1', 'true', 'yes', 'on'].includes(String(rawValue).trim().toLowerCase())
        || Number(rawValue) === 1;
      if (!on) state.cl_crosshaircolor_a = 255;
      return true;
    }

    if (
      key === 'cl_crosshair_outlinethickness'
      || key === 'cl_crosshairgap_useweaponvalue'
      || key === 'cl_fixedcrosshairgap'
    ) {
      return true;
    }

    return false;
  };
})();

/** Ordered list of all cvar keys for command generation. */
const CROSSHAIR_CVAR_ORDER = CrosshairSection.CVAR_ORDER;

/** Build a fresh state object from defaults. */
function createDefaultCrosshairState() {
  return CrosshairSection.createDefaultState();
}

/** Clamp and round a numeric value to the setting's step. */
function clampSettingValue(key, raw) {
  return CrosshairSection.clamp(key, raw);
}

/** Build state from default values plus preset overrides. */
function applyPresetState(overrides) {
  return CrosshairSection.applyOverrides(overrides);
}

/** Whether a setting row should be enabled given current state. */
function isSettingEnabled(key, state) {
  return CrosshairSection.isEnabled(key, state);
}

/** Whether a setting matches its default value. */
function isSettingAtDefault(key, state) {
  return CrosshairSection.isAtDefault(key, state);
}

/** Whether two crosshair states are equivalent. */
function crosshairStatesMatch(a, b) {
  return CrosshairSection.statesMatch(a, b);
}
