//
// Actor and Item SHEET changes
//
const MODULE_NAME     = "cyphersystem-activeeffects";
const EFFECT_TEMPLATE = `modules/${MODULE_NAME}/templates/effects.html`;

Hooks.once('ready', async function() {
    libWrapper.register(MODULE_NAME, "game.cyphersystem.CypherActorSheet.prototype.getData",      get_data,      libWrapper.WRAPPER)
    libWrapper.register(MODULE_NAME, "game.cyphersystem.CypherActorSheet.prototype._renderInner", render_inner,  libWrapper.WRAPPER)

    libWrapper.register(MODULE_NAME, "game.cyphersystem.CypherItemSheet.prototype.getData",      get_data,      libWrapper.WRAPPER)
    libWrapper.register(MODULE_NAME, "game.cyphersystem.CypherItemSheet.prototype._renderInner", render_inner,  libWrapper.WRAPPER)
});

//
// Add the temporary/permanent Active Effects to Item/Actor::getData()
//

async function get_data(wrapped, ...args) {
    // Get core data
    let data = await wrapped(...args);

    // Build our list of temporary & permanent effects
    data.sheetEffects = { temporary: [], permanent: [], inactive: [] };
    for (const effect of data.document.effects) {
        const editable = effect.isOwner;
        const val = {
            id: effect.id,
            name: effect.name ?? effect.label,
            image: effect.icon,
            disabled: effect.disabled,
            suppressed: effect.isSuppressed,
            noToggleDelete: !editable,
            canEdit: editable && !effect.origin
        };
        if (effect.origin) {
            const original = await fromUuid(effect.origin);
            if (original) val.origin = original.name;
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
async function render_inner(wrapper, data) {
    // Get original HTML
    let inner = await wrapper(data);
    const thisdoc = data.document;
    if (thisdoc.permission < CONST.DOCUMENT_OWNERSHIP_LEVELS.OBSERVER) return inner;

    // Add our entry to the NAV tab
    inner.find('nav.sheet-tabs').append(`<a class="item" data-tab="effects" style="flex: 0 0 45px;">${game.i18n.localize("CSACTIVEEFFECTS.Effects")}</a>`)

    // Add the details of the FX tab
    inner.find('section.sheet-body').append(await renderTemplate(EFFECT_TEMPLATE, data));

    // Add event handlers for the stuff we've added to the FX tab
    inner.find('.effect-toggle').on('click', ev => {
        const effectId = ev.currentTarget.closest('li').dataset.effectId;
        const effect = thisdoc.effects.get(effectId, { strict: true });
        effect.update({ disabled: !effect?.disabled });
    })

    inner.find('.effect-edit').on('click', ev => {
        const effectId = ev.currentTarget.closest('li').dataset.effectId;
        const effect = thisdoc.effects.get(effectId, { strict: true });
        effect.sheet?.render(/*force*/true, {editable: !effect.origin });
    })

    inner.find('.effect-delete').on('click', ev => {
        const effectId = ev.currentTarget.closest('li').dataset.effectId;
        const effect = thisdoc.effects.get(effectId, { strict: true });
        effect.deleteDialog();
    })

    inner.find('.effect-open-origin').on('click', ev => {
        const effectId = ev.currentTarget.closest('li').dataset.effectId;
        const effect = thisdoc.effects.get(effectId, { strict: true });
        fromUuid(effect.origin).then((item) => {
            thisdoc.items.get(item.id)?.sheet?.render(true);
        });
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


function dae_render_chat(message, html, data) {
    // If there's no item involved in the chat message, then don't do anything.
    let itemid = message.flags.data.itemID;
    if (!itemid) return;
    // If we can't find the item, then we can't process the button
    let item = fromUuidSync(`${message.flags.data.actorUuid}.Item.${itemid}`);
    if (!item) return;
    // At least one effect needs to be transferrable
    let onefx = item.effects.find(ae => ae.transfer !== true && (!ae.flags?.dae?.selfTargetAlways && !ae.flags?.dae?.selfTarget));
    if (!onefx) return;

    html.find('.chat-card-buttons').prepend(`<a class="transferFX" title="${game.i18n.localize('CSACTIVEEFFECTS.TransferToTarget')}"><i class="fas fa-person-rays"></i></a>`)
    html.find('a.transferFX').on('click', ev => {
        DAE.doEffects(item, true, game.user.targets)
    })
}

Hooks.once("DAE.setupComplete", () => Hooks.on("renderChatMessage", dae_render_chat));
