const MODULE_NAME = "cyphersystem-activeeffects";
const SETTING = "damageTrackAsEffect";

Hooks.on("init", () => {

    game.settings.register(MODULE_NAME, SETTING, {
        name: game.i18n.localize(`CSACTIVEEFFECTS.${SETTING}Name`),
        hint: game.i18n.localize(`CSACTIVEEFFECTS.${SETTING}Hint`),
        scope: "world",
        type: Boolean,
        default: true,
        config: true,
        requiresReload: true
    });

    if (game.settings.get(MODULE_NAME, SETTING)) {
        CONFIG.statusEffects.push({id: "impaired",    name: "CYPHERSYSTEM.Impaired",    icon: `modules/${MODULE_NAME}/assets/impaired.svg`});
        CONFIG.statusEffects.push({id: "debilitated", name: "CYPHERSYSTEM.Debilitated", icon: `modules/${MODULE_NAME}/assets/debilitated.svg`});
        Hooks.on("updateActor", my_update_actor);
        Hooks.on("createActiveEffect", my_create_effect);
        Hooks.on("deleteActiveEffect", my_delete_effect);
    }
})

// see Token.toggleEffect(effect, {active: true})

async function my_update_actor(actor, changes, options, userId) {
    //console.debug("preUpdateActor", actor, changes, options, userId);
    if (game.userId != userId) return;
    const new_state = changes.system?.combat?.damageTrack?.state;
    if (new_state) {
        for (const state of ["Hale","Impaired","Debilitated"]) {
            const effectData = CONFIG.statusEffects.find(ef => ef.id === state.toLowerCase());
            if (!effectData) continue;
            let existing = actor.effects.find(ef => ef.statuses.has(effectData.id));

            if (state === new_state) {
                // Add effect if it isn't already on the Actor
                if (!existing) {
                    // as per TokenDocument#toggleActiveEffect
                    //console.debug(`ADDING effect for new state '${state}'`)
                    const createData = foundry.utils.deepClone(effectData);
                    createData.name = game.i18n.localize(effectData.name);
                    createData.statuses = [effectData.id];

                    delete createData.id;
                    const cls = getDocumentClass("ActiveEffect");
                    await cls.create(createData, {parent: actor, fromActor:true});
                }
            } else {
                // Remove the effect if it is on the actor
                if (existing) {
                    //console.debug(`REMOVING effect for old state '${state}'`)
                    await existing.delete({fromActor:true});
                }
            }
        }
    }
}

// When an active effect is created, if our updateActor didn't do it,
// ensure the actor's damage track state matches the new effect.
// (This might have the effect of cancelling the old active effect if switching between Impaired and Debilitated)
function my_create_effect(effect, options, userId) {
    const actor = effect.parent;
    if (options.fromActor || !actor || game.userId != userId) return;
    const current_state = actor.system?.combat?.damageTrack?.state;
    if (!current_state) return;
    let new_state;
    if (effect.statuses.has('impaired'))
        new_state = "Impaired";
    else if (effect.statuses.has('debilitated'))
        new_state = "Debilitated";
    if (new_state && current_state != new_state) {
        //console.debug(`createActiveEffect: setting damage track to ${statusId.capitalize()}`)
        actor.update({"system.combat.damageTrack.state" : new_state});
    }
}

// When an active effect is deleted, if our updateActor didn't do it,
// if the effect being deleted matches the current damage track state of the actor,
// then put the Actor's damage track back to "Hale"
function my_delete_effect(effect, options, userId) {
    const actor = effect.parent;
    if (options.fromActor || !actor || game.userId != userId) return;
    const actor_state = actor.system?.combat?.damageTrack?.state;
    if (!actor_state) return;
    if (effect.statuses.has(actor_state.toLowerCase())) {
        //console.debug(`createActiveEffect: setting damage track to Hale`)
        actor.update({"system.combat.damageTrack.state" : "Hale"})
    }
}