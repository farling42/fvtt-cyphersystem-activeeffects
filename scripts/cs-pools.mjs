Hooks.once('ready', async function() {
    libWrapper.register(MODULE_NAME, "game.cyphersystem.CypherActor.prototype.prepareData",  prepare_data,  libWrapper.WRAPPER)
})

function prepare_data(wrapper, ...args) {
    //
    // Automatically update the VALUE of a pool when the MAX value is changed
    //
    let result = wrapper(...args);
    let oldpools = this.getFlag(MODULE_NAME, "pools")
    if (oldpools===undefined) oldpools = {};
    console.log(`BEFORE: ${JSON.stringify(oldpools)}`)
    let changed=false;
    let updates={};
    for (const pool of Object.keys(this.system.pools)) {
        const newvalue = this.system.pools[pool].max;
        if (oldpools[pool] === undefined) {
            console.log(`${pool} is undefined`)
            oldpools[pool] = newvalue;
            changed=true;
        } else if (oldpools[pool] != newvalue) {
            const delta = newvalue - oldpools[pool];
            console.log(`Pool ${pool} changed by ${delta} from ${oldpools[pool]} to ${newvalue}`)
            this.system.pools[pool].value += delta;
            oldpools[pool] = newvalue;
            updates[`system.pools.${pool}.value`] = this.system.pools[pool].value + delta;
            changed=true;
        }
    }
    console.log(`AFTER: ${JSON.stringify(oldpools)}`)
    // Don't use this.setFlag because are in the middle of an update
    if (changed) {
        console.log(`updating object`)
        updates[`flags.${MODULE_NAME}.pools`] = oldpools;
        this.update(updates);
    }
    return result;
}
