# Warden Waves — Break the Cycle

A dependency-free browser prison survival roguelite extending the existing Warden Waves prototype. Desktop keyboard and touch movement, automatically aimed weapons, ten blocks of ten waves, bosses, journal lessons, permanent Contraband upgrades, a Perk Vault, and an escape/New Game+ loop.

## Play

Open `PLAY-WARDEN-WAVES.html` for the standalone build, or serve this folder:

```sh
python3 -m http.server 8000
```

Then open http://localhost:8000. A stable HTTP/HTTPS origin is recommended for reliable browser saves. No accounts, dependencies, external fonts, analytics or network requests are required by the game.

- WASD / arrows: move. Space: dodge. Esc: pause.
- Phone: drag anywhere on the arena to move; tap DODGE to evade.
- Attacks automatically target the nearest guard.
- Return to your cell to bank Contraband. Closing or reloading an active attempt loses that attempt's unbanked loot and temporary powers.
- Knowledge, purchases, banked currency and boss clears save on this device. Save & settings lets you copy or restore a backup.

## Publishing to the existing GitHub Pages site

Replace the existing root `index.html`, `game.js`, and `style.css`; add `core.js`. Keep all four together in the same directory on the branch served by GitHub Pages. The standalone HTML is optional; normal hosting uses `index.html`.

Project home: https://github.com/nicholasstevener-hash/Warden-Waves. The browser build is served through GitHub Pages after deployment.

## Recovered design implemented

- Death/capture returns the prisoner to the cell and resets temporary run powers.
- Contraband purchases Bed, Workout Corner, Shiv Training, Baton Training, Library and Perk Vault upgrades.
- First Solitary clear ends in capture. Three journal lessons plus a clear reveal a service gate; a later clear can advance through it.
- Reaching waves 7, 8 and 9 guarantees an unlearned damage, health or healing lesson among the choices, respectively. Lessons persist on capture.
- Damage + health lessons unlock twin shiv throws. Recovery improves later healing.
- Every wave has a finite quota, with timed reinforcement spawning. Strong builds clear waves faster; there is no mandatory wave-duration wait.
- Each floor ends in a boss. Telegraphs mark slams, hazards and charges; shielding bosses punish attacking outside their openings.
- Choose to keep a build or abandon temporary powers and heal fully at floor transitions.
- Store perks actually found in the Perk Vault at attempt end; one slot initially, two at vault level 4, three at level 8. Stored perks apply once per attempt.
- Twenty Solitary clears unlock starting at Intake without carried powers. Permanent cell stats still apply.
- Defeating the Warden unlocks a harder prison. Upgrades and knowledge persist.

## Reconciled history and implementation choices

The older plans referred to The Yard as Floor 1 and also proposed a ten-block campaign starting at Intake. The latest repository instead starts in Solitary with three waves and the Baton Guard. This update retains that existing starting area and boss, expands it to ten waves, restores the journal gate, and orders the campaign as:

1. Solitary — Baton Guard / telegraphed area strike
2. Intake — The Registrar / charge
3. General Population — Block Captain / reinforcements
4. The Yard — Watchtower Chief / projectile fans
5. Workshops — The Foreman / armored slam
6. Medical Wing — The Orderly / floor hazards
7. Maximum Security — Riot Commander / armored openings
8. Death Row — The Executioner / consecutive charges
9. Administration — The Overseer / projectile fans
10. Warden’s Tower — The Warden / changing patterns

The specific later boss names, encounter numbers, costs and balance are implementation choices filling gaps in the recovered plan, rather than claims that every detail was previously approved. The historical 7–9 minute first-clear target still needs real-player balance testing. This is the browser prototype; a Godot/native iOS App Store release remains future work.

## Saves

`wardenWavesSave3` is the current save key. On first launch it imports earned currency/upgrades from the repository's `wardenSolitarySave`, or falls back to the earlier `wardenSave2`. The old keys remain untouched until an explicit reset. A prior Solitary clear is preserved; new journal lessons must still be learned. The standalone file and hosted site may have separate save storage: use the backup feature to transfer progress.

## Validation

```sh
node --check core.js
node --check game.js
node --test tests/rules.test.cjs tests/game.test.cjs
```

Ten automated tests passed. They cover save normalization and migration, purchases, guaranteed lesson offers, permanent gate conditions, perks, vault capacity, campaign progression, all boss logic paths, capture/reward settlement, abandoning a build, escape/New Game+, pause, movement, attacks, pickups and reload persistence. The campaign test accelerates encounters to test transitions; it is not a full balance playthrough.

`tests/browser.cjs` contains a separate Playwright desktop/mobile check. It was **not completed** in the build environment because no browser was installed and the browser download failed. Visual layout, real-device touch input, mobile performance and overall difficulty remain unverified.

To run the browser check with Node and Playwright installed:

```sh
python3 -m http.server 8765
# In a separate terminal, point CODEX_PRIMARY_RUNTIME_NODE_MODULES at the
# directory containing your installed playwright module, then:
node tests/browser.cjs
```
