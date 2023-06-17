//
// Actor and Item SHEET changes
//
const MODULE_NAME     = "cyphersystem-activeeffects";
const EFFECT_TEMPLATE = `modules/${MODULE_NAME}/templates/effects.html`;

Hooks.once('ready', async function() {
    libWrapper.register(MODULE_NAME, "game.cyphersystem.CypherActorSheet.prototype.getData",      get_data,      libWrapper.WRAPPER)
    libWrapper.register(MODULE_NAME, "game.cyphersystem.CypherActorSheet.prototype._renderInner", render_inner,  libWrapper.WRAPPER)

    // Items.registeredSheets[0] = CypherItemSheet
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
        const val = {
            id: effect.id,
            name: effect.name ?? effect.label,
            image: effect.icon,
            disabled: effect.disabled,
            suppressed: effect.isSuppressed
        };
        if (effect.origin) {
            val.origin = await effect._getSourceName();
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

    // Add our entry to the NAV tab
    inner.find('nav.sheet-tabs').append(`<a class="item" data-tab="effects" style="flex: 0 0 45px;">${game.i18n.localize("CSACTIVEEFFECTS.Effects")}</a>`)

    // Add the details of the FX tab
    inner.find('section.sheet-body').append(await renderTemplate(EFFECT_TEMPLATE, data));

    const thisdoc = data.document;

    // Add event handlers for the stuff we've added to the FX tab
    inner.find('.effect-toggle').on('click', (ev) => {
        const effectId = ev.currentTarget.closest('li').dataset.effectId;
        const effect = thisdoc.effects.get(effectId, { strict: true });
        effect.update({ disabled: !effect?.disabled });
    })

    inner.find('.effect-edit').on('click', (ev) => {
        const effectId = ev.currentTarget.closest('li').dataset.effectId;
        const effect = thisdoc.effects.get(effectId, { strict: true });
        effect.sheet?.render(/*force*/true, {editable: !effect.origin});
    })

    inner.find('.effect-delete').on('click', (ev) => {
        const effectId = ev.currentTarget.closest('li').dataset.effectId;
        const effect = thisdoc.effects.get(effectId, { strict: true });
        effect.deleteDialog();
    })

    inner.find('.effect-open-origin').on('click', (ev) => {
        const effectId = ev.currentTarget.closest('li').dataset.effectId;
        const effect = thisdoc.effects.get(effectId, { strict: true });
        fromUuid(effect.origin).then((item) => {
            thisdoc.items.get(item.id)?.sheet?.render(true);
        });
    })

    // Provide support for the button in the active effects tab.
    inner.find('.effect-add').on('click', async (ev) => {
        const newEffect = await CONFIG.ActiveEffect.documentClass.create({
            label: game.i18n.format('DOCUMENT.New', {
                type: game.i18n.localize('DOCUMENT.ActiveEffect'),
            }),
            icon: "icons/svg/aura.svg",
            transfer: true,
        }, { parent: thisdoc });
        newEffect?.sheet?.render(true);
    })

    return inner;
}