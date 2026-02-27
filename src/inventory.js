/*************************
 * GATITO - INVENTORY
 * Tracks what the player is carrying.
 * Also handles dropping items from the inventory bar.
 *************************/
const inventory = {
  wateringCan: false,
  shovel:      false,
  seeds:       {}   // e.g. { tomato: 2, sunflower: 1 }
};

// Suppress next canvas click after dropping from inventory
// (prevents the same mousedown->click from immediately re-triggering a popup)
let suppressUntil = 0;

/*************************
 * DROP ITEM FROM INVENTORY BAR
 *************************/
function handleInventoryMousedown(e) {
  const rect = document.getElementById("gameCanvas").getBoundingClientRect();
  const clickX = e.clientX - rect.left;
  const clickY = e.clientY - rect.top;

  const inv    = CONFIG.inventory;
  const invY   = CONFIG.canvas.height - inv.barHeight;
  const inBar  = clickY >= invY && clickY <= invY + 40;
  if (!inBar) return false; // not clicking inventory bar

  let offsetX = inv.barPadding + 10; // matches draw offset

  // --- Watering Can ---
  if (inventory.wateringCan) {
    if (clickX >= offsetX && clickX <= offsetX + inv.iconSize) {
      droppedItems.push({
        x: player.x, y: player.y,
        width: inv.iconSize, height: inv.iconSize,
        type: "wateringCan",
        image: images.wateringCan,
        justDropped: true
      });
      inventory.wateringCan = false;
      refreshPlayerSprite();
      suppressUntil = Date.now() + 200;
      e.stopPropagation();
      return true;
    }
    offsetX += inv.iconSpacing;
  }

  // --- Shovel ---
  if (inventory.shovel) {
    if (clickX >= offsetX && clickX <= offsetX + inv.iconSize) {
      droppedItems.push({
        x: player.x, y: player.y,
        width: inv.iconSize, height: inv.iconSize,
        type: "shovel",
        image: images.shovel,
        justDropped: true
      });
      inventory.shovel = false;
      refreshPlayerSprite();
      suppressUntil = Date.now() + 200;
      e.stopPropagation();
      return true;
    }
    offsetX += inv.iconSpacing;
  }

  // --- Seeds ---
  for (const seedId in inventory.seeds) {
    const count = inventory.seeds[seedId];
    if (count > 0) {
      if (clickX >= offsetX && clickX <= offsetX + inv.iconSize) {
        droppedItems.push({
          x: player.x, y: player.y,
          width: inv.iconSize, height: inv.iconSize,
          type: "seed",
          seedId: seedId,
          image: getSeedSprite(seedId),
          justDropped: true
        });
        inventory.seeds[seedId] -= 1;
        suppressUntil = Date.now() + 200;
        e.stopPropagation();
        return true;
      }
      offsetX += inv.iconSpacing;
    }
  }

  return false;
}
