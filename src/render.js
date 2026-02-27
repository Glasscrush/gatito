/*************************
 * GATITO - RENDER
 * All canvas drawing lives here. Nothing else should call ctx directly.
 *************************/

// Coordinate debug helper state
let hoverX = 0, hoverY = 0, showCoords = false;

function draw() {
  const canvas = document.getElementById("gameCanvas");
  const ctx    = canvas.getContext("2d");

  /**** BACKGROUND ****/
  ctx.fillStyle = "#1f4d2b";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  /**** DEBUG: COORDINATE CROSSHAIR (remove when done) ****/
  if (showCoords) {
    ctx.strokeStyle = 'rgba(255,255,255,0.25)';
    ctx.lineWidth   = 1;
    ctx.beginPath();
    ctx.moveTo(hoverX, 0);   ctx.lineTo(hoverX, canvas.height);
    ctx.moveTo(0, hoverY);   ctx.lineTo(canvas.width, hoverY);
    ctx.stroke();

    const text = `x:${hoverX} y:${hoverY}`;
    ctx.font = '12px Arial';
    const w = ctx.measureText(text).width + 8;
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(8, 8, w, 18);
    ctx.fillStyle = 'white';
    ctx.fillText(text, 12, 22);
  }

  /**** SHED ****/
  if (images.shed) ctx.drawImage(images.shed, shed.x, shed.y, shed.width, shed.height);

  /**** TABLE ****/
  if (table.image) ctx.drawImage(table.image, table.x, table.y, table.width, table.height);

  /**** WORLD WATERING CAN ****/
  if (!item.pickedUp && images.wateringCan) {
    ctx.drawImage(images.wateringCan, item.x, item.y, item.width, item.height);
  }

  /**** WORLD SHOVEL ****/
  if (!shovel.pickedUp && images.shovel) {
    ctx.drawImage(images.shovel, shovel.x, shovel.y, shovel.width, shovel.height);
  }

  /**** DROPPED ITEMS ****/
  droppedItems.forEach(d => {
    if (d.image) ctx.drawImage(d.image, d.x, d.y, d.width, d.height);
  });

  /**** PLAYER ****/
  if (player.image) ctx.drawImage(player.image, player.x, player.y, player.width, player.height);

  /**** INVENTORY BAR ****/
  drawInventory(ctx, canvas);
}

function drawInventory(ctx, canvas) {
  const inv    = CONFIG.inventory;
  const invY   = canvas.height - inv.barHeight;
  const startX = inv.barPadding + 10;

  // Bar background
  ctx.fillStyle = "rgba(0,0,0,0.4)";
  ctx.fillRect(10, invY, 250, 40);

  let offsetX = startX;

  // Watering can icon
  if (inventory.wateringCan && images.wateringCan) {
    ctx.drawImage(images.wateringCan, offsetX, invY + 8, inv.iconSize, inv.iconSize);
    offsetX += inv.iconSpacing;
  }

  // Shovel icon
  if (inventory.shovel && images.shovel) {
    ctx.drawImage(images.shovel, offsetX, invY + 8, inv.iconSize, inv.iconSize);
    offsetX += inv.iconSpacing;
  }

  // Seed icons with count
  ctx.fillStyle = "white";
  ctx.font      = "14px Arial";
  for (const seedId in inventory.seeds) {
    const count = inventory.seeds[seedId];
    if (count > 0) {
      const sprite = getSeedSprite(seedId);
      if (sprite) ctx.drawImage(sprite, offsetX, invY + 8, inv.iconSize, inv.iconSize);
      ctx.fillText(count, offsetX + 20, invY + 20);
      offsetX += inv.iconSpacing;
    }
  }
}
