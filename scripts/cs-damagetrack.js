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
        CONFIG.statusEffects.push({id: "impaired",    label: "Impaired",    icon: `modules/${MODULE_NAME}/assets/impaired.svg`});
        CONFIG.statusEffects.push({id: "debilitated", label: "Debilitated", icon: `modules/${MODULE_NAME}/assets/debilitated.svg`});
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
            const existing = actor.effects.find(ef => ef.getFlag("core", "statusId") === effectData.id);
            if (state === new_state) {
                // Add effect if it isn't already on the Actor
                if (!existing) {
                    // as per TokenDocument#toggleActiveEffect
                    //console.debug(`ADDING effect for new state '${state}'`)
                    const createData = foundry.utils.deepClone(effectData);
                    createData.label = game.i18n.localize(`CYPHERSYSTEM.${effectData.label}`);
                    createData["flags.core.statusId"] = effectData.id;
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
    const actor_state = effect.parent?.system?.combat?.damageTrack?.state;
    if (!actor_state) return;
    const statusId = effect.getFlag("core","statusId");
    if (statusId && actor_state.toLowerCase() != statusId) {
        console.debug(`createActiveEffect: setting damage track to ${effect.label}`)
        effect.parent.update({"system.combat.damageTrack.state" : effect.label});
    }
}

// When an active effect is deleted, if our updateActor didn't do it,
// if the effect being deleted matches the current damage track state of the actor,
// then put the Actor's damage track back to "Hale"
function my_delete_effect(effect, options, userId) {
    const actor = effect.parent;
    if (options.fromActor || !actor || game.userId != userId) return;
    const actor_state = effect.parent?.system?.combat?.damageTrack?.state;
    if (!actor_state) return;
    const token_id = effect.getFlag("core","statusId");
    if (token_id === actor_state.toLowerCase()) {
        //console.debug(`createActiveEffect: setting damage track to Hale`)
        effect.parent.update({"system.combat.damageTrack.state" : "Hale"})
    }
}