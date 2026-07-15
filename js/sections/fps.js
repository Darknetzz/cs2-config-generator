/**
 * CS2 FPS / telemetry / performance cvars.
 */
const FpsSection = createSettingsModule({
  id: 'fps',
  label: 'FPS',
  fileName: 'fps',
  groups: [
    {
      id: 'limits',
      label: 'Frame Limits',
      settings: [
        'fps_max',
        'fps_max_ui',
      ],
    },
    {
      id: 'telemetry',
      label: 'Telemetry & Overlays',
      settings: [
        'cl_showfps',
        'cl_hud_telemetry_frametime_show',
        'cl_hud_telemetry_ping_show',
        'cl_hud_telemetry_net_misdelivery_show',
        'r_show_build_info',
      ],
    },
  ],
  settings: {
    fps_max: {
      label: 'Max FPS (game)',
      description: 'Cap in-game FPS. 0 = uncapped. Common competitive values: 0, 300, 400.',
      type: 'range',
      default: 400,
      min: 0,
      max: 1000,
      step: 1,
    },
    fps_max_ui: {
      label: 'Max FPS (UI / menus)',
      description: 'Cap FPS in menus and the UI. 0 = uncapped.',
      type: 'range',
      default: 200,
      min: 0,
      max: 1000,
      step: 1,
    },
    cl_showfps: {
      label: 'Show FPS',
      description: 'Basic on-screen FPS counter.',
      type: 'select',
      default: 0,
      options: [
        { value: 0, label: '0 — Off' },
        { value: 1, label: '1 — Simple' },
        { value: 2, label: '2 — Detailed' },
      ],
    },
    cl_hud_telemetry_frametime_show: {
      label: 'Show frametime',
      description: 'Show frametime telemetry on the HUD.',
      type: 'toggle',
      default: 0,
    },
    cl_hud_telemetry_ping_show: {
      label: 'Show ping',
      description: 'Show ping telemetry on the HUD.',
      type: 'toggle',
      default: 0,
    },
    cl_hud_telemetry_net_misdelivery_show: {
      label: 'Show packet loss',
      description: 'Show network misdelivery / packet loss telemetry on the HUD.',
      type: 'toggle',
      default: 0,
    },
    r_show_build_info: {
      label: 'Show build info',
      description: 'Show engine build information overlay.',
      type: 'toggle',
      default: 1,
    },
  },
});
