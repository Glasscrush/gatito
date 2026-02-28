/*************************
 * GATITO - RENDER
 * All canvas drawing lives here. Nothing else should call ctx directly.
 *************************/

// Coordinate debug helper state
let hoverX = 0, hoverY = 0, showCoords = false;

function draw() {
  const canvas = document.getElementById("gameCanvas");
  const ctx    = canvas.getContext("2d");

  /**** BACKGROUND GRASS ****/
  ctx.fillStyle = "#2d6e35";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  /**** ENVIRONMENT ****/
  drawPatio(ctx);
  drawBackFence(ctx);
  drawSideFences(ctx);

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
}

/*************************
 * DRAW BACK FENCE (top of canvas, wooden picket with gate)
 *************************/
function drawBackFence(ctx) {
  const f    = CONFIG.environment.backFence;
  const g    = CONFIG.environment.gate;
  const W    = CONFIG.canvas.width;
  const cx   = W / 2;

  // Gate bounds (centred)
  const gateLeft  = cx - g.width / 2;
  const gateRight = cx + g.width / 2;

  // Gate opening (grass-coloured gap)
  ctx.fillStyle = g.openColor;
  ctx.fillRect(gateLeft, 0, g.width, f.y + f.height);

  // Draw pickets left of gate and right of gate
  drawPicketSection(ctx, 0,         gateLeft,  f, true);
  drawPicketSection(ctx, gateRight, W,         f, true);

  // Gate frame posts (chunky vertical posts either side of gap)
  ctx.fillStyle = g.postColor;
  ctx.fillRect(gateLeft - 6,  0, 6, f.y + f.height + 4);
  ctx.fillRect(gateRight,     0, 6, f.y + f.height + 4);

  // Gate bars (two horizontal rails across the gap)
  ctx.fillStyle = g.color;
  ctx.fil