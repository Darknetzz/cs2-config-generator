/**
 * CS2 radar / minimap cvars.
 */
const RadarSection = createSettingsModule({
  id: 'radar',
  label: 'Radar',
  fileName: 'radar',
  groups: [
    {
      id: 'minimap',
      label: 'Minimap',
      settings: [
        'cl_radar_scale',
        'cl_hud_radar_scale',
        'cl_radar_always_centered',
        'cl_radar_rotate',
        'cl_radar_icon_scale_min',
        'cl_radar_square_with_scoreboard',
      ],
    },
  ],
  settings: {
    cl_radar_scale: {
      label: 'Radar zoom',
      description: 'How zoomed the minimap is. Lower values show more of the map.',
      type: 'range',
      default: 0.7,
      min: 0.25,
      max: 1,
      step: 0.05,
    },
    cl_hud_radar_scale: {
      label: 'Radar HUD size',
      description: 'Physical size of the radar widget on your HUD (not map zoom).',
      type: 'range',
      default: 1,
      min: 0.8,
      max: 1.3,
      step: 0.05,
    },
    cl_radar_always_centered: {
      label: 'Always centered',
      description: 'Keep your player icon centered. Off lets the map pan to show more area ahead.',
      type: 'toggle',
      default: 1,
    },
    cl_radar_rotate: {
      label: 'Rotate with view',
      description: 'Rotate the radar with your facing direction. Off keeps the map fixed north-up.',
      type: 'toggle',
      default: 1,
    },
    cl_radar_icon_scale_min: {
      label: 'Icon scale',
      description: 'Minimum size of player, bomb, and objective icons on the radar.',
      type: 'range',
      default: 0.6,
      min: 0.4,
      max: 1.25,
      step: 0.05,
    },
    cl_radar_square_with_scoreboard: {
      label: 'Square with scoreboard',
      description: 'Switch the radar to a square shape when the scoreboard is open.',
      type: 'toggle',
      default: 1,
    },
  },
});
