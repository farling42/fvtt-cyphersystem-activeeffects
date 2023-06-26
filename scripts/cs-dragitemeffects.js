// Ensure that effects can be drag/dropped with Items (since core only support it for Actors)
// based on code from https://github.com/ElfFriend-DnD/foundryvtt-drop-effects-on-items/blob/main/scripts/drop-effects-on-items.js
// which uses the MIT license.
//
// The four methods emulate those in the core ActorSheet class.
//
const MODULE_NAME = "cyphersystem-activeeffects";

let foundry_V10=false;

Hooks.once('ready', async function() {
  libWrapper.register(MODULE_NAME, "game.cyphersystem.CypherItemSheet.prototype._createDragDropHandlers", ItemSheet_createDragDropHandler,  libWrapper.WRAPPER)
  foundry_V10=game.version.startsWith("10.");
});

function ItemSheet_createDragDropHandler(wrapper) {
  let result = wrapper();
  if (!result) result = [];
  const dragDrop = new DragDrop({
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
  // The destination Item must be editable, and on Foundry V10 or earlier it can NOT be embedded.
  return this.isEditable && !(foundry_V10 && this.item.isEmbedded);
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
  const data = TextEditor.getDragEventData(event);

  if (data.type !== 'ActiveEffect') return false;
  if (!item.isOwner) return false;

  const effect = await ActiveEffect.implementation.fromDropData(data);
  if (!effect) return false;
  if ( item.uuid === effect.parent?.uuid ) return false;  // don't copy to self

  // create the new effect but make the 'origin' the new parent item
  return ActiveEffect.create(effect.toObject(), {parent: item});
}