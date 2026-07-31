/**
 * Useful CS2 binds catalog — aliases + key binds (not numeric cvars).
 */
const BindSection = (() => {
  const GROUPS = [
    { id: 'buy', label: 'Buy' },
    { id: 'utility', label: 'Utility' },
    { id: 'fun', label: 'Fun' },
    { id: 'practice', label: 'Practice' },
  ];

  /** Shared alias recipes referenced by catalog entries. */
  const ALIAS_DEFS = {
    bomb: [
      'alias "+bomb" "slot3; slot5;"',
      'alias "-bomb" "drop; slot2; slot1;"',
    ],
    fakeflash: [
      'alias "+fakeflash" "use weapon_knife; slot2;"',
      'alias "-fakeflash" "drop; slot1;"',
    ],
    muteTeam: [
      'alias "mute-team" "clutchon"',
      'alias "clutchon" "voice_enable 0; alias mute-team clutchoff"',
      'alias "clutchoff" "voice_enable 1; alias mute-team clutchon"',
    ],
    spinbot: [
      'alias "+spinbot" "+right; m_yaw 99999"',
      'alias "-spinbot" "-right; m_yaw 0.022"',
    ],
    rethrow: [
      'alias "rethrow" "sv_rethrow_last_grenade"',
    ],
  };

  const SLOT_KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
  const SLOT_COMMANDS = [
    'slot1; switchhands',
    'slot2; switchhands',
    'slot3; switchhands',
    'slot4; switchhands',
    'slot5; switchhands',
    'slot6; switchhands',
    'slot7; switchhands',
    'slot8; switchhands',
    'slot9; switchhands',
    'slot10; switchhands',
  ];

  /** Buy-menu item ids accepted by CS2 `buy <id>`. */
  const BUY_WEAPON_GROUPS = [
    {
      id: 'rifles',
      label: 'Rifles',
      items: [
        { id: 'ak47', label: 'AK-47' },
        { id: 'm4a1', label: 'M4A4' },
        { id: 'm4a1_silencer', label: 'M4A1-S' },
        { id: 'galilar', label: 'Galil' },
        { id: 'famas', label: 'FAMAS' },
        { id: 'aug', label: 'AUG' },
        { id: 'sg556', label: 'SG 553' },
      ],
    },
    {
      id: 'snipers',
      label: 'Snipers',
      items: [
        { id: 'awp', label: 'AWP' },
        { id: 'ssg08', label: 'SSG 08' },
        { id: 'g3sg1', label: 'G3SG1' },
        { id: 'scar20', label: 'SCAR-20' },
      ],
    },
    {
      id: 'smgs',
      label: 'SMGs',
      items: [
        { id: 'mac10', label: 'MAC-10' },
        { id: 'mp9', label: 'MP9' },
        { id: 'mp7', label: 'MP7' },
        { id: 'mp5sd', label: 'MP5-SD' },
        { id: 'ump45', label: 'UMP-45' },
        { id: 'p90', label: 'P90' },
        { id: 'bizon', label: 'PP-Bizon' },
      ],
    },
    {
      id: 'heavy',
      label: 'Heavy',
      items: [
        { id: 'nova', label: 'Nova' },
        { id: 'xm1014', label: 'XM1014' },
        { id: 'mag7', label: 'MAG-7' },
        { id: 'sawedoff', label: 'Sawed-Off' },
        { id: 'm249', label: 'M249' },
        { id: 'negev', label: 'Negev' },
      ],
    },
    {
      id: 'pistols',
      label: 'Pistols',
      items: [
        { id: 'deagle', label: 'Desert Eagle' },
        { id: 'revolver', label: 'R8 Revolver' },
        { id: 'tec9', label: 'Tec-9' },
        { id: 'fiveseven', label: 'Five-SeveN' },
        { id: 'cz75a', label: 'CZ75-Auto' },
        { id: 'p250', label: 'P250' },
        { id: 'elite', label: 'Dual Berettas' },
        { id: 'usp_silencer', label: 'USP-S' },
        { id: 'hkp2000', label: 'P2000' },
        { id: 'glock', label: 'Glock-18' },
      ],
    },
    {
      id: 'gear',
      label: 'Gear',
      items: [
        { id: 'vesthelm', label: 'Kevlar + Helmet' },
        { id: 'vest', label: 'Kevlar' },
        { id: 'taser', label: 'Zeus' },
        { id: 'defuser', label: 'Defuse Kit' },
      ],
    },
  ];

  const BUY_GRENADE_ITEMS = [
    { id: 'flashbang', label: 'Flashbang' },
    { id: 'smokegrenade', label: 'Smoke' },
    { id: 'hegrenade', label: 'HE Grenade' },
    { id: 'molotov', label: 'Molotov (T)' },
    { id: 'incgrenade', label: 'Incendiary (CT)' },
    { id: 'decoy', label: 'Decoy' },
  ];

  function flattenItemGroups(groups) {
    return groups.flatMap((group) => group.items);
  }

  const BUY_WEAPON_ITEMS = flattenItemGroups(BUY_WEAPON_GROUPS);

  const ENTRIES = [
    {
      id: 'buyDefault',
      group: 'buy',
      label: 'Buy default',
      description: 'Run autobuy (cl_autobuy order). Default key is F3 in stock CS2.',
      defaultKey: 'f3',
      bindCommand: 'autobuy',
    },
    {
      id: 'buyWeapons',
      group: 'buy',
      label: 'Buy weapons / gear',
      description: 'Buy the selected weapons and gear on one key. Items must be in your loadout; unaffordable buys are skipped.',
      defaultKey: 'f4',
      kind: 'items',
      itemMode: 'buy',
      itemGroups: BUY_WEAPON_GROUPS,
      items: BUY_WEAPON_ITEMS,
      defaultItems: ['ak47', 'm4a1_silencer', 'vesthelm'],
    },
    {
      id: 'buyGrenades',
      group: 'buy',
      label: 'Buy grenades',
      description: 'Buy the selected grenades on one key. Include both molotov and incendiary for T/CT.',
      defaultKey: 'f5',
      kind: 'items',
      itemMode: 'buy',
      items: BUY_GRENADE_ITEMS,
      defaultItems: ['flashbang', 'smokegrenade', 'hegrenade', 'molotov', 'incgrenade'],
    },
    {
      id: 'switchFlash',
      group: 'utility',
      label: 'Switch to flashbang',
      description: 'Equip flashbang (use weapon_flashbang).',
      defaultKey: 'c',
      bindCommand: 'use weapon_flashbang',
    },
    {
      id: 'switchSmoke',
      group: 'utility',
      label: 'Switch to smoke',
      description: 'Equip smoke grenade.',
      defaultKey: 'x',
      bindCommand: 'use weapon_smokegrenade',
    },
    {
      id: 'switchHE',
      group: 'utility',
      label: 'Switch to HE',
      description: 'Equip HE grenade.',
      defaultKey: 'z',
      bindCommand: 'use weapon_hegrenade',
    },
    {
      id: 'switchMolly',
      group: 'utility',
      label: 'Switch to molotov',
      description: 'Equip molotov or incendiary (works on both sides).',
      defaultKey: 't',
      bindCommand: 'use weapon_molotov; use weapon_incgrenade',
    },
    {
      id: 'switchDecoy',
      group: 'utility',
      label: 'Switch to decoy',
      description: 'Equip decoy grenade.',
      defaultKey: '6',
      bindCommand: 'use weapon_decoy',
    },
    {
      id: 'dropBomb',
      group: 'utility',
      label: 'Drop bomb',
      description: 'Hold to pull bomb, release to drop it and switch back.',
      defaultKey: 'v',
      bindCommand: '+bomb',
      aliases: ['bomb'],
    },
    {
      id: 'fakeFlash',
      group: 'utility',
      label: 'Fake flash',
      description: 'Hold to pull flash, release to drop it (fake flash trick).',
      defaultKey: 'mouse5',
      bindCommand: '+fakeflash',
      aliases: ['fakeflash'],
    },
    {
      id: 'voiceToggle',
      group: 'utility',
      label: 'Voice toggle',
      description: 'Toggle voice chat on/off (voice_modenable_toggle).',
      defaultKey: 'o',
      bindCommand: 'voice_modenable_toggle',
    },
    {
      id: 'muteTeam',
      group: 'utility',
      label: 'Mute team (clutch)',
      description: 'Toggle teammate voice (voice_enable) for clutch moments.',
      defaultKey: 'p',
      bindCommand: 'mute-team',
      aliases: ['muteTeam'],
    },
    {
      id: 'scrollJump',
      group: 'utility',
      label: 'Scroll jump',
      description: 'Jump on mouse wheel down (scroll-jump / bhop assist).',
      defaultKey: 'mwheeldown',
      bindCommand: '+jump',
    },
    {
      id: 'switchHands',
      group: 'utility',
      label: 'Switch hands on slots',
      description: 'Rebind 1–0 so each weapon slot also runs switchhands.',
      defaultKey: '',
      kind: 'package',
      packageBinds: SLOT_KEYS.map((key, index) => ({
        key,
        command: SLOT_COMMANDS[index],
      })),
    },
    {
      id: 'spinbot',
      group: 'fun',
      label: 'Spinbot',
      description: 'Hold to spin wildly (m_yaw trick). Release to restore.',
      defaultKey: 'n',
      bindCommand: '+spinbot',
      aliases: ['spinbot'],
    },
    {
      id: 'shrug',
      group: 'fun',
      label: 'Shrug',
      description: 'Say ¯\\_(ツ)_/¯ in chat.',
      defaultKey: '.',
      bindCommand: 'say ¯\\_(ツ)_/¯',
    },
    {
      id: 'noclip',
      group: 'practice',
      label: 'Noclip',
      description: 'Toggle noclip. Requires sv_cheats on a local/practice server.',
      defaultKey: 'capslock',
      bindCommand: 'noclip',
      requiresCheats: true,
    },
    {
      id: 'rethrow',
      group: 'practice',
      label: 'Rethrow grenade',
      description: 'Rethrow the last grenade. Practice servers / sv_cheats.',
      defaultKey: 'c',
      bindCommand: 'rethrow',
      aliases: ['rethrow'],
      requiresCheats: true,
    },
    {
      id: 'clearProjectiles',
      group: 'practice',
      label: 'Clear projectiles',
      description: 'Kill smoke/molotov/flash/HE/decoy projectiles and stop sound. Needs cheats.',
      defaultKey: ',',
      bindCommand: 'ent_fire smokegrenade_projectile kill;ent_fire molotov_projectile kill;ent_fire flashbang_projectile kill;ent_fire hegrenade_projectile kill;ent_fire decoy_projectile kill;stopsound',
      requiresCheats: true,
    },
  ];

  const BY_ID = Object.fromEntries(ENTRIES.map((entry) => [entry.id, entry]));
  const CVAR_ORDER = ENTRIES.map((entry) => entry.id);

  /**
   * Common CS2 bind key names for the picker UI (values are console key names).
   * @type {{ id: string, label: string, keys: { value: string, label?: string }[] }[]}
   */
  const KEY_PICKER_GROUPS = [
    {
      id: 'mouse',
      label: 'Mouse',
      keys: [
        { value: 'mouse1', label: 'Left' },
        { value: 'mouse2', label: 'Right' },
        { value: 'mouse3', label: 'Middle' },
        { value: 'mouse4', label: 'Mouse 4' },
        { value: 'mouse5', label: 'Mouse 5' },
        { value: 'mwheelup', label: 'Wheel up' },
        { value: 'mwheeldown', label: 'Wheel down' },
      ],
    },
    {
      id: 'modifiers',
      label: 'Modifiers',
      keys: [
        { value: 'shift' },
        { value: 'ctrl' },
        { value: 'alt' },
        { value: 'capslock', label: 'Caps' },
        { value: 'tab' },
        { value: 'space' },
        { value: 'enter' },
        { value: 'backspace', label: 'Backspace' },
        { value: 'escape', label: 'Esc' },
      ],
    },
    {
      id: 'letters',
      label: 'Letters',
      keys: 'abcdefghijklmnopqrstuvwxyz'.split('').map((value) => ({ value })),
    },
    {
      id: 'digits',
      label: 'Digits',
      keys: '0123456789'.split('').map((value) => ({ value })),
    },
    {
      id: 'function',
      label: 'Function',
      keys: Array.from({ length: 12 }, (_, i) => {
        const value = `f${i + 1}`;
        return { value, label: value.toUpperCase() };
      }),
    },
    {
      id: 'navigation',
      label: 'Navigation',
      keys: [
        { value: 'uparrow', label: '↑' },
        { value: 'downarrow', label: '↓' },
        { value: 'leftarrow', label: '←' },
        { value: 'rightarrow', label: '→' },
        { value: 'ins', label: 'Ins' },
        { value: 'del', label: 'Del' },
        { value: 'home', label: 'Home' },
        { value: 'end', label: 'End' },
        { value: 'pgup', label: 'PgUp' },
        { value: 'pgdn', label: 'PgDn' },
      ],
    },
    {
      id: 'other',
      label: 'Other',
      keys: [
        { value: '.', label: '.' },
        { value: ',', label: ',' },
        { value: '/', label: '/' },
        { value: ';', label: ';' },
        { value: "'", label: "'" },
        { value: '[', label: '[' },
        { value: ']', label: ']' },
        { value: '-', label: '-' },
        { value: '=', label: '=' },
        { value: '\\', label: '\\' },
      ],
    },
  ];

  /** Map KeyboardEvent.code → CS2 bind key name. */
  const CODE_TO_CS2 = {
    Space: 'space',
    ShiftLeft: 'shift',
    ShiftRight: 'shift',
    ControlLeft: 'ctrl',
    ControlRight: 'ctrl',
    AltLeft: 'alt',
    AltRight: 'alt',
    CapsLock: 'capslock',
    Tab: 'tab',
    Enter: 'enter',
    NumpadEnter: 'enter',
    Backspace: 'backspace',
    Escape: 'escape',
    Insert: 'ins',
    Delete: 'del',
    Home: 'home',
    End: 'end',
    PageUp: 'pgup',
    PageDown: 'pgdn',
    ArrowUp: 'uparrow',
    ArrowDown: 'downarrow',
    ArrowLeft: 'leftarrow',
    ArrowRight: 'rightarrow',
    Period: '.',
    Comma: ',',
    Slash: '/',
    Semicolon: ';',
    Quote: "'",
    BracketLeft: '[',
    BracketRight: ']',
    Minus: '-',
    Equal: '=',
    Backslash: '\\',
  };

  for (let i = 0; i < 26; i += 1) {
    CODE_TO_CS2[`Key${String.fromCharCode(65 + i)}`] = String.fromCharCode(97 + i);
  }
  for (let i = 0; i < 10; i += 1) {
    CODE_TO_CS2[`Digit${i}`] = String(i);
    CODE_TO_CS2[`Numpad${i}`] = String(i);
  }
  for (let i = 1; i <= 12; i += 1) {
    CODE_TO_CS2[`F${i}`] = `f${i}`;
  }

  /** Map MouseEvent.button → CS2 mouse key. */
  const MOUSE_BUTTON_TO_CS2 = {
    0: 'mouse1',
    1: 'mouse3',
    2: 'mouse2',
    3: 'mouse4',
    4: 'mouse5',
  };

  /** Label map so section summary / helpers can look up by id like SETTINGS. */
  const SETTINGS = Object.fromEntries(
    ENTRIES.map((entry) => [entry.id, {
      label: entry.label,
      description: entry.description,
    }]),
  );

  function normalizeKey(raw) {
    return String(raw ?? '').trim().toLowerCase();
  }

  function isValidKey(key) {
    if (!key) return false;
    if (/\s/.test(key)) return false;
    return /^[\w.+,-]+$/i.test(key) || key === '.' || key === ',' || key === '/'
      || key === ';' || key === "'" || key === '[' || key === ']'
      || key === '-' || key === '=' || key === '\\';
  }

  /**
   * Resolve a KeyboardEvent to a CS2 key name, or null if unsupported.
   * @param {KeyboardEvent} event
   */
  function keyFromKeyboardEvent(event) {
    if (!event || event.repeat) return null;
    const fromCode = CODE_TO_CS2[event.code];
    if (fromCode) return fromCode;
    const key = normalizeKey(event.key);
    if (key.length === 1 && isValidKey(key)) return key;
    return null;
  }

  /**
   * Resolve a MouseEvent button to a CS2 mouse key, or null.
   * @param {MouseEvent} event
   */
  function keyFromMouseEvent(event) {
    if (!event || event.button == null) return null;
    return MOUSE_BUTTON_TO_CS2[event.button] || null;
  }

  /**
   * Resolve a wheel delta to mwheelup / mwheeldown.
   * @param {WheelEvent} event
   */
  function keyFromWheelEvent(event) {
    if (!event || !event.deltaY) return null;
    return event.deltaY < 0 ? 'mwheelup' : 'mwheeldown';
  }

  function entryItemIds(entry) {
    return (entry.items || []).map((item) => item.id);
  }

  function clampItems(entry, rawItems) {
    const allowed = new Set(entryItemIds(entry));
    const source = Array.isArray(rawItems) ? rawItems : (entry.defaultItems || []);
    const selected = new Set(
      source.map((id) => String(id)).filter((id) => allowed.has(id)),
    );
    return entryItemIds(entry).filter((id) => selected.has(id));
  }

  function itemsEqual(a, b) {
    if (a.length !== b.length) return false;
    return a.every((id, index) => id === b[index]);
  }

  /** Build the console command string for an entry given clamped state. */
  function resolveBindCommand(entry, entryState) {
    if (entry.kind === 'items' && entry.itemMode === 'buy') {
      const items = clampItems(entry, entryState?.items);
      if (!items.length) return '';
      return items.map((id) => `buy ${id}`).join('; ');
    }
    return entry.bindCommand || '';
  }

  function createEntryDefault(entry) {
    const base = {
      enabled: false,
      key: entry.defaultKey || '',
    };
    if (entry.kind === 'items') {
      base.items = clampItems(entry, entry.defaultItems);
    }
    return base;
  }

  function createDefaultState() {
    const state = {};
    for (const entry of ENTRIES) {
      state[entry.id] = createEntryDefault(entry);
    }
    return state;
  }

  function clampEntry(entry, raw) {
    const defaults = createEntryDefault(entry);
    if (!raw || typeof raw !== 'object') return defaults;

    const enabled = Boolean(raw.enabled);
    let key = normalizeKey(raw.key);
    if (entry.kind === 'package') {
      key = '';
    } else if (raw.key === undefined || raw.key === null) {
      key = defaults.key;
    }

    const result = { enabled, key };
    if (entry.kind === 'items') {
      result.items = raw.items === undefined
        ? defaults.items
        : clampItems(entry, raw.items);
    }
    return result;
  }

  function clamp(id, raw) {
    const entry = BY_ID[id];
    if (!entry) return { enabled: false, key: '' };
    return clampEntry(entry, raw);
  }

  function isAtDefault(id, state) {
    const entry = BY_ID[id];
    if (!entry) return true;
    const current = clampEntry(entry, state?.[id]);
    const defaults = createEntryDefault(entry);
    if (current.enabled !== defaults.enabled) return false;
    if (normalizeKey(current.key) !== normalizeKey(defaults.key)) return false;
    if (entry.kind === 'items' && !itemsEqual(current.items || [], defaults.items || [])) {
      return false;
    }
    return true;
  }

  function isEnabled() {
    return true;
  }

  function countChanged(state) {
    return CVAR_ORDER.filter((id) => !isAtDefault(id, state)).length;
  }

  function mergeState(target, source) {
    if (!source || typeof source !== 'object') return target;
    for (const entry of ENTRIES) {
      if (entry.id in source) {
        target[entry.id] = clampEntry(entry, source[entry.id]);
      }
    }
    return target;
  }

  function formatBind(key, command) {
    return `bind "${key}" "${command}"`;
  }

  function entryBindLines(entry, entryState) {
    if (entry.kind === 'package' && Array.isArray(entry.packageBinds)) {
      return entry.packageBinds.map((item) => formatBind(item.key, item.command));
    }
    const key = normalizeKey(entryState?.key) || entry.defaultKey;
    const command = resolveBindCommand(entry, entryState);
    if (!key || !command) return [];
    return [formatBind(key, command)];
  }

  function entryAliasLines(entry) {
    return (entry.aliases || []).flatMap((aliasId) => ALIAS_DEFS[aliasId] || []);
  }

  /** Preview / export body for one bind (aliases + bind lines). */
  function entryBodyLines(entry, entryState) {
    return [...entryAliasLines(entry), ...entryBindLines(entry, entryState)];
  }

  function entryPreviewLines(entry, entryState) {
    const body = entryBodyLines(entry, entryState);
    if (!body.length) return [];
    return [`// ${entry.label}`, ...body];
  }

  /**
   * Serialize enabled binds to cfg / console lines.
   * @param {object} state
   * @param {{ minimal?: boolean, annotate?: boolean }} [options]
   *   annotate (default true) — `// Label` before each bind and a blank line between blocks
   */
  function toCommandLines(state, options = {}) {
    const minimal = Boolean(options.minimal);
    const annotate = options.annotate !== false;
    const lines = [];
    const emittedAliases = new Set();

    for (const entry of ENTRIES) {
      const entryState = clampEntry(entry, state?.[entry.id]);
      if (!entryState.enabled) continue;
      if (minimal && isAtDefault(entry.id, state)) continue;

      if (entry.kind !== 'package') {
        const key = normalizeKey(entryState.key);
        if (!isValidKey(key)) continue;
      }

      const block = [];
      for (const aliasId of entry.aliases || []) {
        if (emittedAliases.has(aliasId)) continue;
        emittedAliases.add(aliasId);
        block.push(...(ALIAS_DEFS[aliasId] || []));
      }
      block.push(...entryBindLines(entry, entryState));
      if (!block.length) continue;

      if (annotate) {
        if (lines.length) lines.push('');
        lines.push(`// ${entry.label}`);
      }
      lines.push(...block);
    }

    return lines;
  }

  function collectDelta(state) {
    const delta = {};
    for (const entry of ENTRIES) {
      if (!isAtDefault(entry.id, state)) {
        delta[entry.id] = clampEntry(entry, state[entry.id]);
      }
    }
    return delta;
  }

  /**
   * Parse semicolon-separated `buy <id>` commands into item ids, or null if mixed.
   * @param {string} command
   * @returns {string[] | null}
   */
  function parseBuyItemIds(command) {
    const parts = String(command).split(';').map((part) => part.trim()).filter(Boolean);
    if (!parts.length) return null;
    const ids = [];
    for (const part of parts) {
      const match = part.match(/^buy\s+(\S+)$/i);
      if (!match) return null;
      ids.push(match[1].toLowerCase());
    }
    return ids;
  }

  /**
   * Best-effort match of a bind command string to a catalog entry.
   */
  function findEntryForBindCommand(command) {
    const normalized = String(command).trim().replace(/^"|"$/g, '');
    for (const entry of ENTRIES) {
      if (entry.kind === 'package' || entry.kind === 'items') continue;
      if (entry.bindCommand === normalized) return entry;
    }

    const buyIds = parseBuyItemIds(normalized);
    if (!buyIds) return null;

    let best = null;
    let bestExtra = Infinity;
    for (const entry of ENTRIES) {
      if (entry.kind !== 'items' || entry.itemMode !== 'buy') continue;
      const allowed = new Set(entryItemIds(entry));
      if (!buyIds.every((id) => allowed.has(id))) continue;
      const extra = allowed.size - new Set(buyIds).size;
      if (extra < bestExtra) {
        best = entry;
        bestExtra = extra;
      }
    }
    return best;
  }

  /** Item ids from a buy-command string that belong to an items entry. */
  function itemsFromBuyCommand(entry, command) {
    if (!entry || entry.kind !== 'items') return [];
    return clampItems(entry, parseBuyItemIds(command) || []);
  }

  function findEntryForAliasName(name) {
    const cleaned = String(name).replace(/^["']|["']$/g, '');
    for (const entry of ENTRIES) {
      for (const aliasId of entry.aliases || []) {
        const defs = ALIAS_DEFS[aliasId] || [];
        for (const line of defs) {
          const match = line.match(/^alias\s+"([^"]+)"/);
          if (match && match[1] === cleaned) return entry;
        }
      }
    }
    return null;
  }

  return {
    id: 'binds',
    label: 'Binds',
    icon: 'binds',
    fileName: 'binds',
    kind: 'binds',
    GROUPS,
    ENTRIES,
    BY_ID,
    ALIAS_DEFS,
    KEY_PICKER_GROUPS,
    SETTINGS,
    CVAR_ORDER,
    createDefaultState,
    clamp,
    isEnabled,
    isAtDefault,
    countChanged,
    mergeState,
    toCommandLines,
    collectDelta,
    normalizeKey,
    isValidKey,
    keyFromKeyboardEvent,
    keyFromMouseEvent,
    keyFromWheelEvent,
    entryPreviewLines,
    resolveBindCommand,
    findEntryForBindCommand,
    findEntryForAliasName,
    itemsFromBuyCommand,
    clampItems,
  };
})();
