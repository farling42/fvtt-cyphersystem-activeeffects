const MODULE_NAME = "cyphersystem-activeeffects";
const SETTING = "useImageForMacro";

Hooks.once("init", () => {
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
        libWrapper.register(MODULE_NAME, "Hotbar.prototype._createDocumentSheetToggle", Hotbar_createDocumentSheetToggle,  libWrapper.WRAPPER)
    }
});

async function Hotbar_createDocumentSheetToggle(wrapper, doc) {
    let data = await wrapper(doc);
    if (doc.img) data.img = doc.img;
    return data;
}