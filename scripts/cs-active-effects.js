const MODULE_NAME = "cyphersystem-activeeffects";

Hooks.once('ready', async function() {
    libWrapper.register(MODULE_NAME, "game.cyphersystem.CypherActorSheet.prototype.getData", actor_getData, libWrapper.WRAPPER)

    if (!game.cyphersystem.CypherItemSheet)
        game.ui.notifications('Active Effects are not yet available in Item sheets (awaiting an update to the core Cypher System)')
    else {
        libWrapper.register(MODULE_NAME, "game.cyphersystem.CypherItemSheet.prototype.getData",  item_getData,  libWrapper.WRAPPER)
        Hooks.on("renderItemSheet",  render_sheet)
    }
});


// Set up data for the Actor/Item sheet

async function getEffects(base) {
    const temporary = new Array();
    const permanent = new Array();
    for (const effect of base.effects) {
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
            temporary.push(val);
        else
            permanent.push(val);
    }
    return { temporary, permanent };
}

async function actor_getData(wrapped, ...args) {
    let data = await wrapped(...args);
    data.sheetEffects = await getEffects(this.actor)
    return data;
}

async function item_getData(wrapped, ...args) {
    let data = await wrapped(...args);
    data.sheetEffects = await getEffects(this.item)
    return data;
}

//
// Rendering for Actor and Item sheets
//

async function createActiveEffect(document) {
    const newEffect = await CONFIG.ActiveEffect.documentClass.create({
        label: game.i18n.format('DOCUMENT.New', {
            type: game.i18n.localize('DOCUMENT.ActiveEffect'),
        }),
        icon: "icons/svg/aura.svg",
        transfer: true,
    }, { parent: document });
    newEffect?.sheet?.render(true);
}

const EFFECT_TEMPLATE = `modules/${MODULE_NAME}/templates/effects.html`;

async function render_sheet(sheet, html, data) {
    // Add new navigation tab
    html.find('nav.sheet-tabs').append(`<a class="item" data-tab="effects" style="flex: 0 0 45px;">${game.i18n.localize("CSACTIVEEFFECTS.Effects")}</a>`)

    // Add actual tab
    let effects = await renderTemplate(EFFECT_TEMPLATE, data);
    html.find('section.sheet-body').append(`<div class='tab effects' data-group='primary' data-tab='effects'>${effects}</div>`);

    // Provide support for the buttons for each individual effect.
    html.find('.effect-action').on('click', (ev) => {
        const a = ev.currentTarget;
        const effectId = a.closest('li').dataset.effectId;
        const effect = sheet.object.effects.get(effectId, { strict: true });
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
                sheet.object.items.get(item.id)?.sheet?.render(true);
            });
            break;
          default:
            console.warn(`The action ${action} is not currently supported`);
            break;
        }
    });

    // Provide support for the button in the active effects tab.
    html.find('.effect-add').on('click', (ev) => {
        createActiveEffect(sheet.object);
    })
}

Hooks.on("renderActorSheet", render_sheet)