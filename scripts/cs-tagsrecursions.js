// Active Effects should be disabled when the owning Item is archived, or otherwise disabled (such as a TAG being unselected or the RECURSION being different)

async function set_effect(item, disabled) {
    // Get matching effects from the parent actor, which we should enable/disable
    const itemid = item.uuid;
    const effects = item.parent.effects.filter(effect => effect.origin === itemid);
    for (const effect of effects) {
        console.log(`Setting effect '${effect.label}' to have disabled=${disabled}`)
        if (effect.disabled != disabled) await effect.update({ disabled })
    }
}

// process TAG toggle on Item update
Hooks.on("updateItem", async (item, changes, options) => {
    if (item.parent && (changes.system?.active !== undefined || changes.system?.archived !== undefined)) {
        console.log("ITEM", item, changes, options)
        // note that item.system.active might be undefined
        await set_effect(item, (item.system.active === false || item.system.archived))
    }
})

// process RECURSION toggle on Actor update
Hooks.on("updateActor", async (actor, changes, options) => {
    const recursion = changes.flags?.cyphersystem?.recursion;
    if (recursion) {
        for (const item of actor.items.filter(item => item.type == 'recursion')) {
            await set_effect(item, `@${item.name.toLowerCase()}` !== recursion)
        }
    }
})
