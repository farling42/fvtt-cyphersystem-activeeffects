//
// Ensure that Effects transferred to the actor exhibit the same enabled/disabled state as the Item that is providing the event.
//
// If the Item is archived, then the effects should be disabled.
// If the Item is a Tag or Recursion, then the effects should only be enabled when the tag/recursion is selected.
//

async function set_effect(item, disabled) {
    // Get matching effects from the parent actor, which we should enable/disable
    const itemid = item.uuid;
    const effects = item.parent.effects.filter(effect => effect.origin === itemid);
    for (const effect of effects) {
        if (effect.disabled != disabled) {
            console.debug(`--${disabled?"Disabling":"Enabling"} effect '${effect.label}' from '${item.name}' on '${item.parent.name}'`)
            await effect.update({ disabled })
        }
    }
}

// process TAG toggle on Item update
Hooks.on("updateItem", async (item, changes, options, userId) => {
    if (game.userId !== userId) return;
    if (item.parent && (changes.system?.active !== undefined || changes.system?.archived !== undefined)) {
        console.debug(`updateItem: checking active/archived state of '${item.name}'`)
        // note that item.system.active might be undefined
        await set_effect(item, (item.system.active === false || item.system.archived))
    }
})

// process RECURSION toggle on Actor update
Hooks.on("updateActor", async (actor, changes, options, userId) => {
    if (game.userId !== userId) return;
    const recursion = changes.flags?.cyphersystem?.recursion;
    if (recursion) {
        console.debug(`updateActor: recursion on '${actor.name}' changed to '${recursion}'`)
        for (const item of actor.items.filter(item => item.type == 'recursion')) {
            await set_effect(item, `@${item.name.toLowerCase()}` !== recursion)
        }
    }
})
