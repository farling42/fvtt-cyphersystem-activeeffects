const MODULE_NAME = "cyphersystem-activeeffects";

Hooks.once("init", () => {
    game.settings.register(MODULE_NAME, "rollButtons", {
        name: game.i18n.localize("CSACTIVEEFFECTS.AdjustValueWithMaxName"),
        hint: game.i18n.localize("CSACTIVEEFFECTS.AdjustValueWithMaxHint"),
        scope: "world",
        type: Boolean,
        default: false,
        config: true,
        requiresReload: true
    });

    if (game.settings.get(MODULE_NAME, "rollButtons")) {
        Hooks.once('ready', () => {
            libWrapper.register(MODULE_NAME, "game.cyphersystem.CypherActor.prototype.prepareData", prepare_data, libWrapper.WRAPPER)
        })
    }
})

function prepare_data(wrapper, ...args) {
    //
    // Automatically update the VALUE of a pool when the MAX value is changed
    //
    const result = wrapper(...args);
    let poolflags = this.getFlag(MODULE_NAME, "pools")
    if (poolflags === undefined) poolflags = {};
    //console.log(`BEFORE: ${JSON.stringify(poolflags)}`)
    let changed = false;
    let updates = {};
    for (const [poolname, pool] of Object.entries(this.system.pools)) {
        const newvalue = pool?.max;
        if (newvalue == undefined) continue;
        if (poolflags[poolname] === undefined) {
            console.log(`${poolname} is undefined`)
            poolflags[poolname] = newvalue;
            changed = true;
        } else if (poolflags[poolname] != newvalue) {
            const delta = newvalue - poolflags[poolname];
            //console.log(`Pool ${poolname} changed by ${delta} from ${poolflags[poolname]} to ${newvalue}`)
            poolflags[poolname] = newvalue;
            updates[`system.pools.${poolname}.value`] = pool.value + delta;
            changed = true;
        }
    }
    //console.log(`AFTER: ${JSON.stringify(poolflags)}`)
    if (changed) {
        // Don't use this.setFlag because are in the middle of an update
        updates[`flags.${MODULE_NAME}.pools`] = poolflags;
        this.update(updates);
    }
    return result;
}
