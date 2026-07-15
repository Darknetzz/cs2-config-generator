/**
 * CS2 viewmodel / weapon position cvars.
 */
const ViewmodelSection = createSettingsModule({
  id: 'viewmodel',
  label: 'Viewmodel',
  fileName: 'viewmodel',
  groups: [
    {
      id: 'position',
      label: 'Weapon Position',
      settings: [
        'viewmodel_fov',
        'viewmodel_offset_x',
        'viewmodel_offset_y',
        'viewmodel_offset_z',
        'viewmodel_presetpos',
      ],
    },
  ],
  settings: {
    viewmodel_fov: {
      label: 'Viewmodel FOV',
      description: 'Field of view for the weapon model only (not camera FOV). Higher values pull the gun away from the center.',
      type: 'range',
      default: 60,
      min: 54,
      max: 68,
      step: 1,
    },
    viewmodel_offset_x: {
      label: 'Offset X',
      description: 'Moves the weapon left (negative) or right (positive).',
      type: 'range',
      default: 1,
      min: -2.5,
      max: 2.5,
      step: 0.1,
    },
    viewmodel_offset_y: {
      label: 'Offset Y',
      description: 'Moves the weapon closer (negative) or farther (positive).',
      type: 'range',
      default: 1,
      min: -2,
      max: 2,
      step: 0.1,
    },
    viewmodel_offset_z: {
      label: 'Offset Z',
      description: 'Moves the weapon down (negative) or up (positive).',
      type: 'range',
      default: -1,
      min: -2,
      max: 2,
      step: 0.1,
    },
    viewmodel_presetpos: {
      label: 'Preset position',
      description: 'Built-in viewmodel presets. Custom offsets still apply after selecting a preset.',
      type: 'select',
      default: 1,
      options: [
        { value: 1, label: '1 — Desktop' },
        { value: 2, label: '2 — Couch' },
        { value: 3, label: '3 — Classic' },
      ],
    },
  },
});
