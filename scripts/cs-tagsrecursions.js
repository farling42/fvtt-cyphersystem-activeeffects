//
// Ensure that Effects transferred to the actor exhibit the same enabled/disabled state as the Item that is providing the event.
//
// If the Item is archived, then the effects should be disabled.
// If the Item is a Tag or Recursion, then the effects should only be enabled when the tag/recursion is selected.
//

function getChangedEffects(fxchanges, actor, item, disabled) {
    // Get matching effects from the parent actor, which we should enable/disable
    const itemid = item.uuid;
    const effects = actor.effects.filter(effect => effect.origin === itemid);
    for (const effect of effects) {
        if (effect.disabled != disabled) {
            console.debug(`--${disabled?"Disabling":"Enabling"} effect '${effect.label}' from '${item.name}' on '${actor.name}'`)
            fxchanges.push({_id: effect.id, disabled})
        }
    }
}

// process TAG toggle on Item update
Hooks.on("updateItem", async (item, changes, options, userId) => {
    if (game.userId !== userId) return;
    const actor=item.parent;
    if (actor && (changes.system?.active !== undefined || changes.system?.archived !== undefined)) {
        let fxchanges=[]
        console.debug(`updateItem: checking active/archived state of '${item.name}'`)
        // note that item.system.active might be undefined
        getChangedEffects(fxchanges, actor, item, (item.system.active === false || item.system.archived))
        if (fxchanges.length > 0) {
            actor.updateEmbeddedDocuments("ActiveEffect", fxchanges);
        }
    }
})

// process RECURSION toggle on Actor update
Hooks.on("updateActor", async (actor, changes, options, userId) => {
    if (game.userId !== userId) return;
    const recursion = changes.flags?.cyphersystem?.recursion;
    if (recursion) {
        let fxchanges=[]
        console.debug(`updateActor: recursion on '${actor.name}' changed to '${recursion}'`)
        // check for effects on all recursions on the actor
        for (const item of actor.items.filter(item => item.type == 'recursion')) {
            getChangedEffects(fxchanges, actor, item, `@${item.name.toLowerCase()}` !== recursion)
        }
        if (fxchanges.length > 0) {
            actor.updateEmbeddedDocuments("ActiveEffect", fxchanges);
        }
    }
})
