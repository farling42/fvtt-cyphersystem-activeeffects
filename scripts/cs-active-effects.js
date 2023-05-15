const MODULE_NAME     = "cyphersystem-activeeffects";
const EFFECT_TEMPLATE = `modules/${MODULE_NAME}/templates/effects.html`;

Hooks.once('ready', async function() {
    libWrapper.register(MODULE_NAME, "game.cyphersystem.CypherActorSheet.prototype.getData",      get_data,      libWrapper.WRAPPER)
    libWrapper.register(MODULE_NAME, "game.cyphersystem.CypherActorSheet.prototype._renderInner", render_inner,  libWrapper.WRAPPER)

    if (!game.cyphersystem.CypherItemSheet)
        ui.notifications.warn('Active Effects are not yet available in Item sheets (awaiting an update to the core Cypher System)')
    else {
        libWrapper.register(MODULE_NAME, "game.cyphersystem.CypherItemSheet.prototype.getData",      get_data,      libWrapper.WRAPPER)
        libWrapper.register(MODULE_NAME, "game.cyphersystem.CypherItemSheet.prototype._renderInner", render_inner,  libWrapper.WRAPPER)
    }
});

//
// Add the temporary/permanent Active Effects to Item/Actor::getData()
//

async function get_data(wrapped, ...args) {
    // Get core data
    let data = await wrapped(...args);

    // Build our list of temporary & permanent effects
    data.sheetEffects = { temporary: [], permanent: [] };
    for (const effect of data.document.effects) {
        const val = {
            id: effect.id,
            label: effect.label,
            icon: effect.icon,
            disabled: effect.disabled,
            //favorite: effect.getFlag('swade', 'favorite') ?? false,
        };
        if (effect.origin) {
            val.origin = await effect._getSourceName();
        }
        if (effect.isTemporary)
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
    inner.find('.effect-action').on('click', (ev) => {
        const a = ev.currentTarget;
        const effectId = a.closest('li').dataset.effectId;
        const effect = thisdoc.effects.get(effectId, { strict: true });
        const action = a.dataset.action;
        switch (action) {
          case 'edit':
            effect.sheet?.render(true);
            break;
          case 'delete':
            effect.deleteDialog();
            break;
          case 'toggle':
            effect.update({ disabled: !effect?.disabled });
            break;
          case 'open-origin':
            fromUuid(effect.origin).then((item) => {
                thisdoc.items.get(item.id)?.sheet?.render(true);
            });
            break;
          default:
            console.warn(`The action ${action} is not currently supported`);
            break;
        }
    });

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