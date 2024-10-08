# CHANGELOG

## 2.5.2

- Do not add our own statuses field to the Active Effects window in Foundry 12 (since F12 now does it itself).
- Mark verified on Foundry 12 & Cypher 3.1.0

## 2.5.1

- Get statuses working on Foundry 11

## 2.5.0

- Allow drag of Items and Active Effects onto Tokens on the canvas, which will add them to the associated actor. (Core Foundry won't let you drag an AE that is inherited from an Item on the actor.)

## 2.4.3

- Ensure a newly created ActiveEffect has the correct enabled/disabled state based on the owning item's state (active/archived).
- Simplify code for applying effects in Tags & Recursions (since `CONFIG.ActiveEffect.legacyTransferral = false`)
- Disable the enable/disable button on an effect if it was transferred onto the Actor from an item (e.g. tag). It's enabled state should always match the archived/enabled state of the owning Item.

## 2.4.2

- Add the missing translation for the new option "Set Macro to Document's Image"

## 2.4.1

- Add module option to set the image for macros to the image of the document being dragged to the Hotbar.

## 2.4.0

- Add some console debug messages to indicate our processing of active effects from items.
- Use the rollEngine hook provided by Cypher System version 2.9.0 to detect triggering of an item (for DAE to set effect on user).
- Add an option to sort Status Effects in the Token HUD into alphabetical order (since the default order isn't easy to scan quickly).

## 2.3.0

- Support DAE effects which use the setting "Apply to self when item is rolled".

## 2.2.1

- Change the two SVG files to have separate width/height attributes so that they work in Firefox browser.

## 2.2.0

- Use sparkles icon for the Active Effects tab, and use the Foundry core translation for the button's tooltip ("Active Effects").
- Reduce text of the Add active Effect button to just "Add".
- Move the Active Effects to the left of the Settings tab in the Actor sheets (so that SETTINGS is always the right-most tab).

## 2.1.5

- Allow the status field in the Active Effects editor to be set to blank.

## 2.1.3

- Prevent error being reported in my_renderChatMessage when chat card doesn't contain a dice roll.

## 2.1.2

- Fix bug where transfer-effects button would appear in chat card even though no effects are present on the triggering Item.

## 2.1.1

- Provide an empty status in the Active Effects Dialog.
- DAE (Dynamic Active Effects) version 10.0.37 is working with any system again - so use DAE.doEffects from the button in the chat card if the DAE module is enabled (rather than our internal, more-limited version).

## 2.1.0

- Update the Active Effects Dialog to allow setting of ONE token status for the effect. (Note that the icon for the effect is displayed on the Token, whilst the icon associated with the selected token status is displayed when opening the token's status select menu.)

## 2.0.2

- Ensure effects on Items are applied to an Actor at world start.
- Apply getData() hooks directly to ActorSheet and ItemSheet (rather than the CypherSystem-specific versions).

## 2.0.1

- Fix an issue with archived items/tags/recursions still having their effects applied (rather than disabled).

## 2.0.0

- Switch to being only compatible with Foundry 11.304+ and Cypher System 2.7.0+
- Remove support for DAE, since DAE won't work with any system except dnd5e any more.
- Add support for showing status set by an effect (not currently editable).
- Allow effects to be applied to a target (mark the effects on the combat/ability as NOT transferred to Actor) via the chat card button.
- Use NEW active effect system available in Foundry 11 (legacyTransferral=false), this might leave previously transferred effects on your actors.

## 1.8.0

- Allow effects to be disabled and deleted on embedded Items in Foundry V11 (not allowed by core in V10).

## 1.7.0

- Allow drag and drop of Active Effects on Item Sheets (since Core Foundry doesn't support it).

## 1.6.0

- LIMITED ownership prevents seeing the FX tab.
- OBSERVER ownership makes the activate and delete buttons on effects non-interactive.

## 1.5.2

- Get the damage track status working on Foundry V11.

## 1.5.0

- Provide Impaired and Debilitated token states, which will match the state of the damage track for a PC Actor.

## 1.4.0

- Mark effects as draggable.
- Add support for Dynamic Active Effects (DAE) module. Adding a button to the chat card if an ability is used has an effect which can be transferred to the player's current target(s).

## 1.3.4

- Use a reliable method of getting the name of the item which provided an Actor's effect (non-deprecated on V11).
- Ensure tooltip of the edit button accurately reflects whether the effect can be edited or only viewed.
- Fixes the bug where pressing the RETURN key in a text field would activate the "Add Active Effect" button.

## 1.3.3

- Don't allow effects to be toggled on/off or deleted if the effect is inherited from an Item on the Actor.
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