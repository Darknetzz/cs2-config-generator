/**
 * CS2 stock / engine ConVar defaults for cvars exposed in this app.
 * Sourced from data/cs2-commands.json (not the app’s Reset baseline).
 *
 * Corrections applied where the catalog default is outside accepted / in-app ranges:
 * - viewmodel_presetpos: 0 → 1 (Desktop; accepted is 1 / 2)
 * - cl_teamid_overhead_mode: 3 → 2 (Full; accepted is 0 / 1 / 2)
 */
const StockDefaults = (() => {
  const FILE_NAME = 'cs2-stock-defaults.cfg';

  /** @type {Record<string, Record<string, number>>} */
  const OVERRIDES = {
    crosshair: {
      cl_crosshairstyle: 4,
      cl_crosshairsize: 3.9,
      cl_crosshairgap: -2.2,
      cl_crosshairthickness: 0.6,
      cl_crosshairdot: 0,
      cl_crosshair_t: 0,
      cl_crosshaircolor: 5,
      cl_crosshaircolor_r: 0,
      cl_crosshaircolor_g: 255,
      cl_crosshaircolor_b: 0,
      cl_crosshairusealpha: 1,
      cl_crosshairalpha: 200,
      cl_crosshair_drawoutline: 0,
      cl_crosshair_outlinethickness: 0,
      cl_crosshair_recoil: 1,
      cl_crosshairgap_useweaponvalue: 0,
      cl_fixedcrosshairgap: 0,
      cl_crosshair_dynamic_splitdist: 5,
      cl_crosshair_dynamic_splitalpha_innermod: 1,
      cl_crosshair_dynamic_splitalpha_outermod: 0.3,
      cl_crosshair_dynamic_maxdist_splitratio: 0,
      cl_crosshair_sniper_width: 1,
      cl_sniper_show_inaccuracy: 0,
      cl_crosshair_friendly_warning: 0,
      cl_grenadecrosshair_keepusercrosshair: 1,
      cl_grenadecrosshair_smoke: 1,
      cl_grenadecrosshairdelay_smoke: 2,
      cl_grenadecrosshair_flash: 1,
      cl_grenadecrosshairdelay_flash: 2,
      cl_grenadecrosshair_explosive: 1,
      cl_grenadecrosshairdelay_explosive: 2,
      cl_grenadecrosshair_fire: 1,
      cl_grenadecrosshairdelay_fire: 2,
      cl_grenadecrosshair_decoy: 1,
      cl_grenadecrosshairdelay_decoy: 2,
    },
    viewmodel: {
      viewmodel_fov: 68,
      viewmodel_offset_x: 2,
      viewmodel_offset_y: 2,
      viewmodel_offset_z: -1,
      viewmodel_presetpos: 1,
    },
    hud: {
      hud_scaling: 1,
      cl_hud_color: 6,
      safezonex: 1,
      safezoney: 0.99,
      hud_showtargetid: 1,
      cl_showloadout: 1,
      cl_teamid_overhead_mode: 2,
      cl_teamcounter_playercount_instead_of_avatars: 0,
    },
    radar: {
      cl_radar_always_centered: 1,
      cl_radar_rotate: 1,
      cl_radar_square_with_scoreboard: 0,
      cl_radar_square_always: 0,
      cl_radar_scale_dynamic: 0,
      cl_hud_radar_map_additive: 1,
      cl_hud_radar_blur_background: 0,
      cl_hud_radar_background_alpha: 0.627,
      cl_hud_radar_scale: 1,
      cl_radar_icon_scale_min: 0.6,
      cl_radar_scale: 0.3,
      cl_radar_scale_alternate: 1,
    },
    fps: {
      fps_max: 0,
      fps_max_ui: 64,
      cl_showfps: 0,
      cl_hud_telemetry_frametime_show: 2,
      cl_hud_telemetry_ping_show: 2,
      cl_hud_telemetry_net_misdelivery_show: 2,
      r_show_build_info: 0,
    },
  };

  /**
   * Full multi-section state matching CS2 stock defaults.
   * @param {object} [options]
   * @param {boolean} [options.precise=false] - keep catalog floats even when outside UI step/min
   */
  function createStockSectionsState(options = {}) {
    const precise = Boolean(options.precise);
    const state = {};

    for (const section of ConfigSections.ALL) {
      if (section.kind === 'binds') {
        state[section.id] = section.createDefaultState();
        continue;
      }

      const overrides = OVERRIDES[section.id] || {};
      if (!precise) {
        state[section.id] = section.applyOverrides(overrides);
        continue;
      }

      const next = section.createDefaultState();
      for (const [key, value] of Object.entries(overrides)) {
        if (!(key in section.SETTINGS)) continue;
        const meta = section.SETTINGS[key];
        if (meta.type === 'toggle') {
          next[key] = Number(value) ? 1 : 0;
        } else if (meta.type === 'select') {
          const allowed = meta.options.map((option) => option.value);
          const num = Number(value);
          next[key] = allowed.includes(num) ? num : meta.default;
        } else {
          next[key] = Number(value);
        }
      }
      state[section.id] = next;
    }

    return state;
  }

  function toCfgText() {
    const body = ConfigCommands.toCombinedCfg(createStockSectionsState({ precise: true }), {
      mode: 'inline',
      banner: [
        '// CS2 stock defaults (engine ConVar defaults)',
        '// Values match a fresh install with no custom config for cvars in this app.',
        '// Not the same as Config Generator “Reset” defaults.',
        '',
      ],
    });
    return body;
  }

  function downloadCfg() {
    ConfigCommands.downloadTextFile(FILE_NAME, toCfgText());
  }

  return {
    FILE_NAME,
    OVERRIDES,
    createStockSectionsState,
    toCfgText,
    downloadCfg,
  };
})();
