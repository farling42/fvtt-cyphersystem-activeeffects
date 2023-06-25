// Ensure that effects can be drag/dropped with Items (since core only support it for Actors)
// based on code from https://github.com/ElfFriend-DnD/foundryvtt-drop-effects-on-items/blob/main/scripts/drop-effects-on-items.js
// which uses the MIT license.
//
const MODULE_NAME = "cyphersystem-activeeffects";

Hooks.on('renderItemSheet', (app,html,data) => {
    const effectsList = html.find('.effects-list');
    if (!effectsList) {
        return;
    }

    const dragDrop = new DragDrop({
        dragSelector: '[data-effect-id]',
        dropSelector: '.effects-list',
        permissions: { dragstart: () => true, dragdrop: () => app.isEditable && !app.item.isOwned },
        callbacks: { dragstart: Item_onDragStart(app.object), drop: Item_onDrop(app.object) }
    });

    dragDrop.bind(html[0]);
})



const Item_onDragStart = (effectParent) => (event) =>  {
  if (!effectParent) {
    console.debug('Item_onDragStart no parent');
    return;
  }

  const li = event.currentTarget;
  const effectId = li.dataset?.effectId;
  
  if (!effectId) {
    return;
  }

  const effect = effectParent.effects.get(effectId);
  
  if (!effect) {
    return;
  }

  // outputs the type and uuid
  const dragData = effect.toDragData();

  console.debug('DragDrop dragStart:', {
    effect,
    dragData,
  });

  // Set data transfer
  event.dataTransfer.setData("text/plain", JSON.stringify(dragData));  
}

  
const Item_onDrop = (effectParent) => async (event) =>  {

  if (!effectParent) {
    return;
  }

  // Try to extract the data
  let dropData;
  try {
    dropData = JSON.parse(event.dataTransfer.getData('text/plain'));

    console.debug('DragDrop drop', {
      event,
      dropData,
    });
  } catch (err) {
    console.debug('DragDrop drop', {
      err,
    });

    return false;
  }

  if (dropData.type !== 'ActiveEffect') return false;

  const effectDocument = await ActiveEffect.implementation.fromDropData(dropData);

  if (!effectDocument) {
    return false;
  }

  console.debug('DragDrop drop starting:', {
    effectParent,
    dropData,
    effectDocument,
  });

  // create the new effect but make the 'origin' the new parent item
  return ActiveEffect.create(
    {
      ...effectDocument.toObject(),
      //origin: effectParent.uuid,
    }, {parent: effectParent}
  );
}