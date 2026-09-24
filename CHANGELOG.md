# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- **Changed only** export mode (on by default): preview, copy, and `.cfg` download omit settings that still match the Reset baseline; preference is saved in `localStorage`
- Rush Hour crosshair styles: Dynamic Cross, Dynamic Circle, Dynamic Cross Classic, Static Circle, Static Cross, Legacy/Shot Feedback, Dot Only, Dynamic Quad (new default), and Static Square
- `cl_crosshair_dynamic_spread_limit` for dynamic style expansion
- Sniper options: delay unscope and auto-rezoom
- Quick RGB color chips (replaces the old preset color cvar)
- Live HUD canvas preview (scale, color, safe zone, target ID, loadout, team counter, overhead IDs; CT/T toggle is preview-only)
- Load / download CS2 stock defaults (engine ConVar values for a fresh install) from the export panel
- Buy binds: autobuy (F3), rebuy (F2), configurable weapon/gear buys, grenade buys, and quick-switch to flash / smoke / HE / molotov / decoy
- `mp_shoot_dropped_grenades` in the Commands catalog (curated override; shoot dropped grenades to activate them, needs `sv_cheats 1`)
- Icons on site nav links and config section tabs
- Larger preview column and click-to-expand live preview modal (crosshair, viewmodel, radar)
- GitHub repository link in the site header nav
- Lightweight syntax highlighting in the config export editor (numbers and quoted strings)
- Bind key picker (keyboard icon) with categorized CS2 keys, mouse buttons, and press-to-capture
- Commands reference page (`commands.html`) with searchable/sortable CS2 console command and cvar catalog
- Prefix-based category filters on the Commands page
- ConVar flag legend and tooltips explaining engine metadata under each command name
- `sv_cheats` badge on Commands that require cheats enabled
- Client / server badges on Commands derived from `cl` / `sv` flags
- Script to refresh the command catalog (`scripts/refresh-cs2-commands.py`)

### Changed

- Crosshair Gap range is now 0–128 (matches in-game Style Settings; was -50–50)
- Pro presets: negative legacy gaps clamped to 0
- Crosshair Style Settings visibility matches in-game options per style (Length / Gap / Center Dot / T / Dynamic Spread Limit / Classic split controls)
- Export panel: **Changed only** / **All settings** toggle replaces the separate **Copy changed only** button; preview and downloads follow the same mode
- Crosshair cvars updated for Rush Hour: `cl_crosshair_length` / `_gap` / `_thickness`, `cl_crosshaircolor_a`, styles 0–8, resolution-independent preview
- Import / localStorage / custom presets migrate legacy crosshair names (`cl_crosshairsize`, `cl_crosshairalpha`, color presets, etc.)
- Stock crosshair defaults match Dynamic Quad (style 7)
- Pro presets migrated to the new cvar names (pre-update length/gap units are best-effort)
- Command catalog refresh keeps public dumps when `--input` is used, and accepts Rush Hour console dumps
- HUD preview redrawn to closer CS2 layout (agent portrait, HP/armor strip, weapon silhouette + ammo, grenade column, top scoreboard) instead of generic panels
- Site nav links styled as prominent pill buttons (clearer current-page state)
- FPS telemetry overlays use Never / Always / When elevated (0 / 1 / 2) to match CS2
- Radar preview uses in-game Ancient minimap plates (round/square chrome, zone label, CS2-style icons) instead of a schematic placeholder
- Commands catalog merges ArminC (broad/hidden) + Nihilnia (fresher public) dumps by default
- Bind export and editor previews label each bind with a `//` comment and separate blocks with a blank line
- Wider config export column; long cvar lines scroll horizontally instead of wrapping
- Wider inline preview column for crosshair / viewmodel / radar canvases

### Fixed

- Viewmodel (and radar) preview no longer grows scrollbars / resizes in a loop; canvases fill the wrap at device-pixel resolution so the preview stays sharp
- Crosshair Gap slider updates the preview for classic static style 4 (and other styles that use gap)
- Strip markdown backslashes and HTML entities from command descriptions in the catalog

### Removed

- Legacy crosshair cvars from the generator UI: `cl_crosshairsize` / `gap` / `thickness`, `cl_crosshairalpha` / `usealpha`, `cl_crosshaircolor` presets, outline thickness, fixed gap, and weapon gap value
