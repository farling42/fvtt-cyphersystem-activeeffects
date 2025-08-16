//
// Automatically update the VALUE of a pool when the MAX is changed.
//
const MODULE_NAME = "cyphersystem-activeeffects";
const SETTING = "adjustValueFromMax";

Hooks.once("init", () => {
    game.settings.register(MODULE_NAME, SETTING, {
        name: game.i18n.localize(`CSACTIVEEFFECTS.${SETTING}Name`),
        hint: game.i18n.localize(`CSACTIVEEFFECTS.${SETTING}Hint`),
        scope: "world",
        type: Boolean,
        default: false,
        config: true,
        requiresReload: true
    });

    if (game.settings.get(MODULE_NAME, SETTING)) {
        libWrapper.register(MODULE_NAME, "game.cyphersystem.CypherActor.prototype.applyActiveEffects", apply_active_effects, libWrapper.WRAPPED)
    }
})

function apply_active_effects(wrapper) {
    // Game start - the effect deltas were applied before the game was stopped.
    if (!game.ready || !this.isOwner) return wrapper();
    // We also only want the owner (or GM) to do this processing, rather than every single logged in player
    if (!game.user.isGM && game.users.find(user => user.isGM && user.active)) return wrapper();

    // Save old states before updating the actor
    let before = this.overrides?.system?.pools && duplicate(this.overrides?.system?.pools);
    wrapper();
    let after = this.overrides.system?.pools;
    if (before==undefined && after==undefined) return;

    // For each pool, check to see if it's value has changed.
    let updates;
    for (const [poolname,value] of Object.entries(this.system.pools)) {
        if (before?.[poolname]?.max === after?.[poolname]?.max) continue;
        let prev = before?.[poolname]?.max ?? this._source.system.pools[poolname].max;
        let curr = after?.[poolname]?.max  ?? this._source.system.pools[poolname].max;
        let delta = curr - prev;
        let newvalue = value.value + delta;
        if (updates===undefined) updates={}
        setProperty(updates, `system.pools.${poolname}.value`, newvalue);
        console.debug(`applyActiveEffects: changing pool ${poolname} by ${delta} to ${newvalue}`, [before, after])
    }
    if (updates) this.update(updates);
}