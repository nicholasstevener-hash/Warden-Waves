# Warden Waves — The Treatment / Security Update

A browser prison escape survival roguelite. You wake up in Solitary without a name. Someone scratched **CHECK THE MATTRESS** into the wall. Someone else remembers you.

## Play

Published project: https://github.com/nicholasstevener-hash/Warden-Waves

Play online: https://nicholasstevener-hash.github.io/Warden-Waves/

- WASD / arrows: move. Space: dodge. E: investigate a nearby clue; hold at your cell door to return safely. Esc: pause.
- Phone: drag on the arena to move. Use the DODGE and context-sensitive investigation buttons.
- Weapons attack automatically. Move away from marked circles, charge lanes, and gunner sights.
- **Collect the drops:** diamonds grant XP, banknotes grant Contraband, bandages restore HP. Supplies stay on the floor between waves. They are never automatically awarded after a clear.
- Returning safely banks every piece of collected Contraband. Capture banks half (rounded down); the other half is confiscated. Reloading an active attempt loses its unbanked loot and temporary powers; mission discoveries are saved immediately.

For local play, serve this directory with `python3 -m http.server 8765`, then open http://localhost:8765. `PLAY-WARDEN-WAVES.html` is a standalone copy. Prefer a stable HTTP/HTTPS address for reliable save storage.

## First chapter

1. **Check the mattress.** Cross the cell and investigate the bunk. Find instructions in your own handwriting.
2. **The man behind the vent.** Follow the tapping to the northeast wall. Meeting the contact unlocks the Library.
3. **A little insurance.** Reach wave 3, then search the laundry cache. Unlock the Perk Vault, store Quick Hands, and recover 15 Contraband.
4. **Find another way out.** Discover an environmental weakness during the Baton Guard fight. He holds the center above half health, then pursues you with a damaging heavy strike below half. Environmental damage provides the clue. The mission display does not identify the solution.

New runs begin with a short story scene. The action pauses during dialogue. The journal records evidence and the current lead. The Warden has a line for your first capture. Missions and earned unlocks survive later captures.

## Combat and presentation changes

- Illustrated directional sprites for the prisoner and guards, with canvas weapon/impact overlays and a vector fallback while loading. The built-in image-generation tool created the source atlas; see `ART.md`. The original fallback figures include: separate legs and boots, walking cycles, uniforms, faces, collars, hair/stubble, badges, visible weapons and throwing motion. The locally hosted `actors.png` contains 32 animation cells; no external asset service is required.
- Chargers telegraph a rush; ranged guards lock their aim before firing. Their silhouettes and warning patterns differ in shape as well as color.
- Watchlights mark a delayed strike at the prisoner’s last position. Standing still is dangerous from wave 1; movement and dodging avoid the warning circles.
- XP pickups drive level-up choices. Free wave-clear upgrades and automatic collection have been removed. Waves follow one another after a short reinforcement delay.
- Recognizable XP, Contraband and healing supplies, plus hit flashes and floating pickup/damage text.
- Physical room landmarks, a compact tap-to-expand mission tracker, and an objective direction marker for narrow screens.

## Campaign and saves

The existing ten-block campaign remains available beyond Solitary, with boss patterns, permanent cell stats, weapon unlocks, choosing to keep or abandon a build between blocks, the twenty-clear Intake starting point, and harder prisons after the Warden.

Saves continue to use `wardenWavesSave3`. Existing currency, upgrades, stored perks and boss clears are retained. Previously discovered journal gates stay open. Existing Library and Perk Vault investments remain available. New players unlock those facilities through missions; collecting damage/health/healing upgrades no longer opens the first gate by itself.

Copy/restore saves through Save & settings before changing devices or browser storage. The hosted site and standalone file can have separate storage. Old `wardenSolitarySave` and `wardenSave2` saves are imported when no current save exists.

## Validation

```sh
node --check core.js
node --check game.js
node --check chapter.js
node --test tests/rules.test.cjs tests/game.test.cjs
```

Twenty-three automated checks cover the story chain, proximity/wave requirements, physical door breach, mission rewards, existing-save migration, purchases, perks, no free drop collection, capture banking without duplicate rewards, all ten boss transitions, escape, pause and drawing code. A seeded real-combat simulation captures a fresh idle player in wave 1; a moving/dodging simulation survives the first 45 seconds into wave 3. These are regression checks, not a substitute for human difficulty testing.

`tests/browser.cjs` is an optional Playwright desktop/mobile smoke check. Install Playwright and Chromium, start the local server, then run `node tests/browser.cjs`. Set `WARDEN_BASE_URL` to test a different host. `CODEX_PRIMARY_RUNTIME_NODE_MODULES`, if used, points to a directory containing Playwright. Full mobile performance, touch ergonomics, later-floor balance and the historical 7–9 minute first-clear target still need player testing.

## Leave or be captured

- Reach the **CELL 017** door on the west wall and hold E / RETURN for **3 seconds**. Enemies remain active. Damage or releasing the control interrupts the return.
- A safe return banks **100%** of collected Contraband and clears any pending patrol increase.
- Capture banks **50%**, loses the temporary build, and flags the next attempt for **15% more guards per wave** (rounded up to whole guards). The increase is applied once; repeated captures do not multiply or stack it. Another capture can flag the following attempt at the same 15% level.
- Knowledge, purchased cell stats, boss clears and stored perks persist. Banked savings are never confiscated.
- Pause cannot instantly cash out a run. Returning after a cleared boss is also safe.
- The Patrol notice appears on the cell menu and the active wave display. Current saves receive a default of normal security.

## Baton and boss

The Baton Guard drops the baton free, including for saves that already defeated him. Training still costs Contraband. The baton deals more base damage, attacks faster, staggers enemies, interrupts chargers and bowls nearby guards into each other. Ranged attacks and watchlights still threaten a melee build.

The Baton Guard's controlled phase does not chase the prisoner or break the gate above 50% HP. Below 50%, he starts pursuing and committing to a windup/lunge/recovery attack. Only his enraged heavy strike can break the environmental gate. Gate highlighting and explicit "bait him" instructions are removed until the passage has actually opened.

Regression coverage includes full vs half banking, non-stacking patrol quotas, interrupted extraction, baton interrupts/collisions, boss phase behavior, hidden hints, sprite fallback and previous campaign/migration checks. Full real-device and human difficulty testing is still needed.

This remains a browser prototype. A native Godot/iOS App Store release is future work.
