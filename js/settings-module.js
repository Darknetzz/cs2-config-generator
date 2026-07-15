/**
 * Shared factory for declarative CS2 settings sections (cvars, defaults, clamp/enable helpers).
 */
function createSettingsModule({ id, label, fileName, groups, settings }) {
  if (!id || !label || !Array.isArray(groups) || !settings || typeof settings !== 'object') {
    throw new Error('createSettingsModule requires id, label, groups, and settings');
  }

  const SETTINGS = settings;
  const GROUPS = groups;
  const CVAR_ORDER = groups.flatMap((group) => group.settings);

  for (const key of CVAR_ORDER) {
    if (!SETTINGS[key]) {
      throw new Error(`Missing setting metadata for "${key}" in section "${id}"`);
    }
  }

  function createDefaultState() {
    const state = {};
    for (const key of CVAR_ORDER) {
      state[key] = SETTINGS[key].default;
    }
    return state;
  }

  function clamp(key, raw) {
    const meta = SETTINGS[key];
    if (!meta) return Number(raw);

    let val = Number(raw);
    if (Number.isNaN(val)) return meta.default;

    if (meta.type === 'toggle') {
      return val ? 1 : 0;
    }

    if (meta.type === 'select') {
      const allowed = meta.options.map((option) => option.value);
      return allowed.includes(val) ? val : meta.default;
    }

    val = Math.max(meta.min, Math.min(meta.max, val));
    if (meta.step) {
      const steps = Math.round(val / meta.step);
      val = steps * meta.step;
      val = Math.round(val * 1000) / 1000;
    }
    return val;
  }

  function isEnabled(key, state) {
    const meta = SETTINGS[key];
    if (!meta?.enabledWhen) return true;
    return Number(state[meta.enabledWhen.key]) === meta.enabledWhen.value;
  }

  function isAtDefault(key, state) {
    const defaultVal = clamp(key, SETTINGS[key].default);
    const currentVal = clamp(key, state[key]);
    return currentVal === defaultVal;
  }

  function applyOverrides(overrides) {
    const state = createDefaultState();
    for (const [key, value] of Object.entries(overrides || {})) {
      if (key in SETTINGS) {
        state[key] = clamp(key, value);
      }
    }
    return state;
  }

  function statesMatch(a, b) {
    for (const key of CVAR_ORDER) {
      if (clamp(key, a?.[key]) !== clamp(key, b?.[key])) return false;
    }
    return true;
  }

  function countChanged(state) {
    return CVAR_ORDER.filter((key) => !isAtDefault(key, state)).length;
  }

  function mergeState(target, source) {
    if (!source || typeof source !== 'object') return target;
    for (const key of CVAR_ORDER) {
      if (key in source) {
        target[key] = clamp(key, source[key]);
      }
    }
    return target;
  }

  return {
    id,
    label,
    fileName: fileName || id,
    SETTINGS,
    GROUPS,
    CVAR_ORDER,
    createDefaultState,
    clamp,
    isEnabled,
    isAtDefault,
    applyOverrides,
    statesMatch,
    countChanged,
    mergeState,
  };
}
