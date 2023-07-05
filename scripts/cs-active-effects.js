//
// Actor and Item SHEET changes
//
const MODULE_NAME     = "cyphersystem-activeeffects";
const EFFECT_TEMPLATE = `modules/${MODULE_NAME}/templates/effects.html`;

Hooks.once('init', async function() {
    // Must be done before Actors are loaded into the world.
    CONFIG.ActiveEffect.legacyTransferral = false;
})

Hooks.on("renderChatMessage", render_chat);
Hooks.on("renderActiveEffectConfig", ActiveEffectDialog_render);

// We can't use renderActorSheet and renderItemSheet hooks, because that would prevent the FX tab remaining open
// when an actor sheet is re-rendered.

Hooks.once('ready', async function() {
    libWrapper.register(MODULE_NAME, "ActorSheet.prototype.getData",      sheet_getData,      libWrapper.WRAPPER)
    libWrapper.register(MODULE_NAME, "ActorSheet.prototype._renderInner", sheet_renderInner,  libWrapper.WRAPPER)

    libWrapper.register(MODULE_NAME, "ItemSheet.prototype.getData",      sheet_getData,      libWrapper.WRAPPER)
    libWrapper.register(MODULE_NAME, "ItemSheet.prototype._renderInner", sheet_renderInner,  libWrapper.WRAPPER)
});

//
// Add a new "sheetEffects" to the data for the temporary/permanent Active Effects to Item/Actor::getData(),
//

async function sheet_getData(wrapped, ...args) {
    // Get core data
    let data = await wrapped(...args);

    // Build our list of temporary & permanent effects
    data.sheetEffects = { temporary: [], permanent: [], inactive: [] };
    const effects = data.document.allApplicableEffects?.() ?? data.document.effects;
    for (const effect of effects) {
        const editable = effect.isOwner;
        const val = {
            id: effect.id,
            name: effect.name ?? effect.label,
            image: effect.img,
            disabled: effect.disabled,
            suppressed: effect.isSuppressed,
            noToggleDelete: !editable,
            canEdit: editable && !effect.origin
        };
        if (effect.origin) {
            // only when legacyTransferral = True
            const original = await fromUuid(effect.origin);
            if (original) val.origin = original.name;
        } else if (effect.transfer && effect.parent != data.document) {
            // Only if the item is embedded (in an Actor)
            val.origin = effect.parent.name;
        }
        if (effect.disabled)
            data.sheetEffects.inactive.push(val);
        else if (effect.isTemporary)
            data.sheetEffects.temporary.push(val);
        else
            data.sheetEffects.permanent.push(val);
    }

    // Return the combined data object
    return data;
}

//
// Rendering for Actor and Item sheets:
//
// The TABS aren't set up properly if we wait until the render hook,
// So we have to inject the HTML during the _renderInner,
//
async function sheet_renderInner(wrapper, data) {
    // Get original HTML
    let inner = await wrapper(data);
    const thisdoc = data.document;
    if (thisdoc.permission < CONST.DOCUMENT_OWNERSHIP_LEVELS.OBSERVER) return inner;

    function getEffect(ev) {
        const effectId = ev.currentTarget.closest('li').dataset.effectId;
        if (thisdoc.allApplicableEffects) {
            for (const effect of thisdoc.allApplicableEffects())
                if (effect.id === effectId) return effect;
            return null;
        }
        else
            return thisdoc.effects.get(effectId);
    }
    // Add our entry to the NAV tab
    inner.find('nav.sheet-tabs').append(`<a class="item" data-tab="effects" style="flex: 0 0 45px;">${game.i18n.localize("CSACTIVEEFFECTS.Effects")}</a>`)

    // Add the details of the FX tab
    inner.find('section.sheet-body').append(await renderTemplate(EFFECT_TEMPLATE, data));

    // Add event handlers for the stuff we've added to the FX tab
    inner.find('.effect-toggle').on('click', ev => {
        const effect = getEffect(ev);
        effect?.update({ disabled: !effect.disabled });
    })

    inner.find('.effect-edit').on('click', ev => {
        const effect = getEffect(ev);
        effect?.sheet?.render(/*force*/true, {editable: !effect.origin });
    })

    inner.find('.effect-delete').on('click', ev => {
        getEffect(ev)?.deleteDialog();
    })

    inner.find('.effect-open-origin').on('click', ev => {
        getEffect(ev)?.parent.sheet.render(true);
    })

    // Provide support for the button in the active effects tab.
    inner.find('.effect-add').on('click', ev => {
        CONFIG.ActiveEffect.documentClass.create({
            label: game.i18n.format('DOCUMENT.New', { type: game.i18n.localize('DOCUMENT.ActiveEffect') }),
            icon: "icons/svg/aura.svg",
            transfer: true,
        }, { parent: thisdoc }).then(effect => effect?.sheet?.render(true));
    })

    return inner;
}


function render_chat(message, html, data) {
    // If there's no item involved in the chat message, then don't do anything.
    let itemid = message.flags.data.itemID;
    if (!itemid) return;
    // If we can't find the item, then we can't process the button
    let item = fromUuidSync(`${message.flags.data.actorUuid}.Item.${itemid}`);
    if (!item) return;
    // At least one effect needs to be transferrable
    let fxlist = item.effects.filter(ae => ae.transfer !== true && (!ae.flags?.dae?.selfTargetAlways && !ae.flags?.dae?.selfTarget));
    if (!fxlist) return;

    html.find('.chat-card-buttons').prepend(`<a class="transferFX" title="${game.i18n.localize('CSACTIVEEFFECTS.TransferToTarget')}"><i class="fas fa-person-rays"></i></a>`)
    html.find('a.transferFX').on('click', async (ev) => {
        //console.log(`copy effects from ${item.uuid} to`, game.user.targets)
        for (const token of game.user.targets) {
            for (const fx of fxlist) {
                let newfx;
                // Replace with a special effect (if applicable)
                if (fx.changes.length === 1 && fx.changes[0].key == 'statusId') {
                    const effectData = CONFIG.statusEffects.find(ef => ef.id === fx.changes[0].value);
                    if (effectData) {
                        newfx = foundry.utils.deepClone(effectData);
                        newfx.name = game.i18n.localize(effectData.label);
                        newfx.statuses = [effectData.id];
                        delete newfx.id;
                    }
                }
                if (!newfx) newfx = fx.toObject();

                await ActiveEffect.implementation.create(newfx, {parent: token.actor})
            }
        }
    })
}


async function ActiveEffectDialog_render(app, html, data) {
    // let's add in an additional row to allow display of status effect array.
    // It will be editable when we work out how to set the value of a Set from a space-separated string.
    let status = $(`
    <div class="form-group">
    <label>Status Effects</label>
    <input type="text" name="statusEffects" disabled value="${Array.from(data.effect.statuses).join(" ")}">
    </div>`);

    html.find('div.form-group.stacked').after(status);

    if (!app._minimized) {
		let pos = app.position;
		pos.height = 'auto'
		app.setPosition(pos);
	}
}