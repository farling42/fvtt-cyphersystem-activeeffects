[![ko-fi](https://img.shields.io/badge/Ko--Fi-farling-success)](https://ko-fi.com/farling)
[![patreon](https://img.shields.io/badge/Patreon-amusingtime-success)](https://patreon.com/amusingtime)
[![paypal](https://img.shields.io/badge/Paypal-farling-success)](https://paypal.me/farling)
![GitHub License](https://img.shields.io/github/license/farling42/fvtt-cyphersystem-activeeffects)
![](https://img.shields.io/badge/Foundry-v11-informational)
![Latest Release Download Count](https://img.shields.io/github/downloads/farling42/fvtt-cyphersystem-activeeffects/latest/module.zip)

## Cypher System Active Effects

This module provides support for Active Effects on all Actors and Items for the [Cypher System](https://foundryvtt.com/packages/cyphersystem) game system (version 2.6.0 and later).

## Installation

The module is available from the module's tab of the Foundry setup screen.

It can also be installed manually by using the following manifest link:

https://github.com/farling42/fvtt-cyphersystem-activeeffects/releases/latest/download/module.json

## Usage

Simply enable the module within your Cypher System world and a new "FX" tab will appear in the Actor and Item sheets.

The core Foundry functionality is then available for active effects, such as the effects on Items being inherited by the owning Actor.

Effects placed on Items which are archived, or tags/recursions which are not active, will have their effects automatically disabled/enabled when their state changes.

### Option: Show status on Actors which are Impaired or Debilititated

The module adds two new statuses to Tokens - Impaired (broken arm) and Debilitated (broken heart). The display of the statuses on the token will match the damage track state - and applying or removing the status on the token will update the linked Actor's damage track state.

### Option: Modify pool's current value whenever maximum is changed (EXPERIMENTAL)

There is a module option which apply any change in a pool's maximum value also to the pool's current value. (So when an effect or the user changes the maximum value, the pool will maintain the same number of USED points by adjusting the current value accordingly.)
(NOTE: This interferes with the "Stat Modifiers" in recursions and exclusive tags, so should probably be disabled if playing The Strange.)

## Other Modules

### [libWrapper](https://foundryvtt.com/packages/lib-wrapper) _(mandatory)_

This is a hard-dependency that must be enabled. It allows this module to hook into and change some core functionality.

### [Active Token Effects](https://foundryvtt.com/packages/ATL) _(optional)_

When **Active Token Effects** is installed, then the "ATL." prefix can be put on a token attribute in order for the effect to modify the token on the owning actor.

### [Dynamic Active Effects](https://foundryvtt.com/packages/dae) _(optional)_

_**NOTE:**_ Version 10.0.35 onwards of DAE do not work with any system other than DND5E due to the author putting DND5E-specific code into the "generic" game system management part of the module.

The **Dynamic Active Effects** module provides some additional support which can be helpful for creating active effects, such as being able to use something like `@pools.might.max' or more complicated functions as the Effect Value.

When DAE is used, any effects which are marked as being transferred to the target will cause an additional button to be placed into the chat card. Pressing this button will transfer the effect to the player's current targets. (This caters for discussion between player and GM before deciding if effects should be transferred.)

_**NOTE:**_ You must go into the DAE module settings and check the box next to "Load DAE for untested game systems".


### [Times Up](https://foundryvtt.com/packages/times-up) _(optional)_

Allows effects to automatically expire when their duration has been reached - provides an option to disable the effect, rather than delete it.
