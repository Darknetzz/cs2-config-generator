/**
 * CS2 HUD / interface cvars.
 */
const HudSection = createSettingsModule({
  id: 'hud',
  label: 'HUD',
  fileName: 'hud',
  groups: [
    {
      id: 'scale',
      label: 'Scale & Color',
      settings: [
        'hud_scaling',
        'cl_hud_color',
        'safezonex',
        'safezoney',
      ],
    },
    {
      id: 'elements',
      label: 'Elements',
      settings: [
        'hud_showtargetid',
        'cl_showloadout',
        'cl_teamid_overhead_mode',
        'cl_teamcounter_playercount_instead_of_avatars',
      ],
    },
  ],
  settings: {
    hud_scaling: {
      label: 'HUD scaling',
      description: 'Overall size of HUD elements. Lower values free up more screen space.',
      type: 'range',
      default: 1,
      min: 0.5,
      max: 1,
      step: 0.05,
    },
    cl_hud_color: {
      label: 'HUD color',
      description: 'Accent color for HUD elements.',
      type: 'select',
      default: 0,
      options: [
        { value: 0, label: '0 — Team color' },
        { value: 1, label: '1 — White' },
        { value: 2, label: '2 — Bright white' },
        { value: 3, label: '3 — Light blue' },
        { value: 4, label: '4 — Blue' },
        { value: 5, label: '5 — Purple' },
        { value: 6, label: '6 — Red' },
        { value: 7, label: '7 — Orange' },
        { value: 8, label: '8 — Yellow' },
        { value: 9, label: '9 — Green' },
        { value: 10, label: '10 — Aqua' },
        { value: 11, label: '11 — Pink' },
      ],
    },
    safezonex: {
      label: 'Safe zone X',
      description: 'Horizontal HUD inset. Lower values pull HUD elements toward the screen center.',
      type: 'range',
      default: 1,
      min: 0.85,
      max: 1,
      step: 0.01,
    },
    safezoney: {
      label: 'Safe zone Y',
      description: 'Vertical HUD inset. Lower values pull HUD elements toward the screen center.',
      type: 'range',
      default: 1,
      min: 0.85,
      max: 1,
      step: 0.01,
    },
    hud_showtargetid: {
      label: 'Show target ID',
      description: 'Show player names when aiming at them.',
      type: 'toggle',
      default: 1,
    },
    cl_showloadout: {
      label: 'Always show loadout',
      description: 'Keep your weapon loadout visible on the HUD.',
      type: 'toggle',
      default: 1,
    },
    cl_teamid_overhead_mode: {
      label: 'Team ID overhead',
      description: 'How teammate indicators appear above players.',
      type: 'select',
      default: 2,
      options: [
        { value: 0, label: '0 — Off' },
        { value: 1, label: '1 — Simple' },
        { value: 2, label: '2 — Full' },
      ],
    },
    cl_teamcounter_playercount_instead_of_avatars: {
      label: 'Player count instead of avatars',
      description: 'Show numeric team player counts instead of avatar icons in the team counter.',
      type: 'toggle',
      default: 0,
    },
  },
});
