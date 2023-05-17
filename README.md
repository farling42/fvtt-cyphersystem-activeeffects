[![ko-fi](https://img.shields.io/badge/Ko--Fi-farling-success)](https://ko-fi.com/farling)
[![patreon](https://img.shields.io/badge/Patreon-amusingtime-success)](https://patreon.com/amusingtime)
[![paypal](https://img.shields.io/badge/Paypal-farling-success)](https://paypal.me/farling)
![GitHub License](https://img.shields.io/github/license/farling42/fvtt-cyphersystem-activeeffects)
![](https://img.shields.io/badge/Foundry-v10-informational)
![Latest Release Download Count](https://img.shields.io/github/downloads/farling42/fvtt-cyphersystem-activeeffects/latest/module.zip)

## Active Effects for the Cypher System

This module provides support for Active Effects on all Actors and Items for the [Cypher System](https://foundryvtt.com/packages/cyphersystem) game system.

## Installation

The module is available from the module's tab of the Foundry setup screen.

It can also be installed manually by using the following manifest link:

https://github.com/farling42/fvtt-cyphersystem-activeeffects/releases/latest/download/module.json

## Usage

Simply enable the module within your Cypher System world and a new "FX" tab will appear in the Actor and Item sheets.

The core Foundry functionality is then available for active effects, such as the effects on Items being inherited by the owning Actor.

Effects placed on Items which are archived, or tags/recursions which are not active, will have their effects automatically disabled/enabled when their state changes.

### Option: Modify pool's current value whenever maximum is changed (EXPERIMENTAL)

There is a module option which apply any change in a pool's maximum value also to the pool's current value. (So when an effect or the user changes the maximum value, the pool will maintain the same number of USED points by adjusting the current value accordingly.)
(NOTE: This interferes with the "Stat Modifiers" in recursions and exclusive tags, so should probably be disabled if playing The Strange.)

## Other Modules

### [libWrapper](https://foundryvtt.com/packages/lib-wrapper)

This is a hard-dependency that must be enabled. It allows this module to hook into and change some core functionality.

### [Active Token Effects](https://foundryvtt.com/packages/ATL)

When **Active Token Effects** is installed, then the "ATL." prefix can be put on a token attribute in order for the effect to modify the token on the owning actor.

### [Dynamic Active Effects](https://foundryvtt.com/packages/dae)

The **Dynamic Active Effects** module provides some additional support which can be helpful for creating active effects, such as being able to use something like `@pools.might.max' or more complicated functions as the Effect Value.

_**NOTE:**_ You must go into the DAE module settings and check the box next to "Load DAE for untested game systems".
