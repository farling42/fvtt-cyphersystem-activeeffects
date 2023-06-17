# CHANGELOG

## 1.3.4

- Use a reliable method of getting the name of the item which provided an Actor's effect (non-deprecated on V11).
- Ensure tooltip of the edit button accurately reflects whether the effect can be edited or only viewed.

## 1.3.3

- Disable the toggle and delete buttons when viewing Effects on Embedded Items.
- Hook directly on `game.cyphersystem.CypherItemSheet` rather than `Items.registeredSheets.0` (it was only possible from Cypher System version 2.6.0)

## 1.3.2

- Prevent deprecation warning on Foundry 11
- Rename module to "Cypher System Active Effects"

## 1.3.1

- Mark as compatible with Foundry 11 (299)

## 1.3.0

- Fix problem with tooltips not being translated.
- Update active state of all effects in a single update (rather than one update per effect).
- Simplify position and size of the "Add Active Effect" button.
- Much better support for updating VALUE of a pool when the MAX is changed by an effect.

## 1.2.0

- When an Item is archived/dearchived, or a recursion or tag is enabled/disabled, ensure that the owned effects on the actor are enabled/disabled accordingly.
- Rework effects panel to follow the styling of the rest of the Actor/Item sheet more precisely.

## 1.1.0

- Provide a module option which will automatically change a pool's current value whenever the pool's maximum value is changed (the change in value of the pool's maximum will be added/subtracted from the pool's current value). It does not prevent the value going negative.

## 1.0.0

- First public release.
- Items now have the FX tab available.

## 0.1.3

- Change HTML/CSS for the effects tab to use more of the core CYPHERSYSTEM css styles.

## 0.1.2

- Refactor to use less hooks into core functions.

## 0.1.1

- Fix problems with the github workflow.

## 0.1.0

- Initial working version.