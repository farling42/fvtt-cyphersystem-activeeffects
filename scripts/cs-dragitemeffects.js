// Ensure that effects can be drag/dropped with Items (since core only support it for Actors)
// based on code from https://github.com/ElfFriend-DnD/foundryvtt-drop-effects-on-items/blob/main/scripts/drop-effects-on-items.js
// which uses the MIT license.
//
// The four methods emulate those in the core ActorSheet class.
//
const MODULE_NAME = "cyphersystem-activeeffects";

Hooks.once('ready', async function() {
  libWrapper.register(MODULE_NAME, "game.cyphersystem.CypherItemSheet.prototype._createDragDropHandlers", ItemSheet_createDragDropHandler,  libWrapper.WRAPPER)
});

function ItemSheet_createDragDropHandler(wrapper) {
  let result = wrapper();
  if (!result) result = [];
  const dragDrop = new foundry.applications.ux.DragDrop.implementation({
      dragSelector: '[data-effect-id]',
      dropSelector: null,
      permissions: { dragstart: ItemSheet_canDragStart.bind(this), dragdrop: ItemSheet_canDragDrop.bind(this) },
      callbacks:   { dragstart: ItemSheet_onDragStart.bind(this),  drop:     ItemSheet_onDrop.bind(this) }
  });
  result.push(dragDrop);
  return result;
}

function ItemSheet_canDragStart(selector) {
  // It is always possible to drag an effect FROM the originating Item.
  return true;
}

function ItemSheet_canDragDrop(selector) {
  // The destination Item must be editable.
  return this.isEditable;
}

function ItemSheet_onDragStart(event) {
  const li = event.currentTarget;
  const effectId = li.dataset?.effectId;
  if (!effectId) return;

  const effect = this.item.effects.get(effectId);
  if (!effect) return;

  // Set data transfer
  event.dataTransfer.setData("text/plain", JSON.stringify(effect.toDragData()));  
}

async function ItemSheet_onDrop(event) {
  const item = this.item;
  const data = foundry.applications.ux.TextEditor.implementation.getDragEventData(event);

  if (data.type !== 'ActiveEffect') return false;
  if (!item.isOwner) return false;

  const effect = await ActiveEffect.implementation.fromDropData(data);
  if (!effect) return false;
  if ( item.uuid === effect.parent?.uuid ) return false;  // don't copy to self

  // create the new effect but make the 'origin' the new parent item
  return ActiveEffect.create(effect.toObject(), {parent: item});
}

/*
 * ALLOW ITEM AND ACTIVE EFFECTS TO BE DROPPED ONTO TOKENS ON THE CANVAS.
 */
async function Canvas_dropData(canvas, data) {
  if (data.type === "ActiveEffect" || data.type === "Item") {
    // See if the drop is going to happen on an Actor token (see `targetObjects`)
    const desttokens = canvas.tokens.placeables.filter(token => {
      if ( !game.user.isGM && !token.visible) return false;   // GMs can drop onto hidden tokens
      if ( !token.isOwner ) return false;
      if ( data.uuid.startsWith(token.actor.uuid)) return false;  // no drop on self
      return Number.between(data.x, token.x, token.x + token.w) && 
             Number.between(data.y, token.y, token.y + token.h);
    });
    if (!desttokens?.length) return true;
    const object = fromUuidSync(data.uuid);
    desttokens.forEach(token => {
      if (!token.actor) return;
      if (data.type === "ActiveEffect") {
        console.debug(`Active Effect '${object.name}' added to '${token.actor.name}'`)
        ActiveEffect.create(object.toObject(), {parent: token.actor});
      } else {
        console.debug(`Item '${object.name}' added to '${token.actor.name}'`)
        Item.create(object.toObject(), {parent: token.actor});
      }
    })
    // We consumed the drop
    return false;
  }
  // We didn't handle the drop
  return true;
}

Hooks.on("dropCanvasData", Canvas_dropData)