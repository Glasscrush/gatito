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
  ctx.fillRect(gateLeft, f.y + 4,  g.width, 4);
  ctx.fillRect(gateLeft, f.y + 14, g.width, 4);

  // Gate diagonal brace
  ctx.strokeStyle = g.color;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(gateLeft,  f.y + f.height);
  ctx.lineTo(gateRight, f.y);
  ctx.stroke();
}

/*************************
 * HELPER: Draw a row of pickets between x1 and x2
 *************************/
function drawPicketSection(ctx, x1, x2, f, horizontal) {
  // Horizontal rail behind pickets
  ctx.fillStyle = f.shadowColor;
  ctx.fillRect(x1, f.y + 6, x2 - x1, 5);
  ctx.fillStyle = f.color;
  ctx.fillRect(x1, f.y + 5, x2 - x1, 4);

  // Pickets
  for (let x = x1; x < x2; x += f.postSpacing) {
    // Picket body
    ctx.fillStyle = f.color;
    ctx.fillRect(x, 0, f.postWidth, f.y + f.height - 4);
    // Pointed cap
    ctx.fillStyle = f.capColor;
    ctx.beginPath();
    ctx.moveTo(x + f.postWidth / 2, 0);
    ctx.lineTo(x,                   f.y - 6);
    ctx.lineTo(x + f.postWidth,     f.y - 6);
    ctx.closePath();
    ctx.fill();
    // Shadow line on right edge of picket
    ctx.fillStyle = f.shadowColor;
    ctx.fillRect(x + f.postWidth - 2, 0, 2, f.y + f.height - 4);
  }
}

/*************************
 * DRAW SIDE FENCES (left and right)
 *************************/
function drawSideFences(ctx) {
  const f = CONFIG.environment.sideFence;
  const W = CONFIG.canvas.width;

  // Left fence
  drawSideFenceStrip(ctx, 0, f);
  // Right fence
  drawSideFenceStrip(ctx, W - f.postWidth, f);
}

function drawSideFenceStrip(ctx, x, f) {
  // Horizontal rail
  ctx.fillStyle = f.shadowColor;
  ctx.fillRect(x, f.yStart, f.postWidth, f.yEnd - f.yStart);
  ctx.fillStyle = f.color;
  ctx.fillRect(x, f.yStart, f.postWidth - 2, f.yEnd - f.yStart);

  // Horizontal rail lines
  ctx.fillStyle = f.shadowColor;
  for (let railY = f.yStart + 10; railY < f.yEnd; railY += f.postSpacing * 1.5) {
    ctx.fillRect(x, railY, f.postWidth, 3);
  }
}

/*************************
 * DRAW PATIO + HOUSE EDGE + ROOF (bottom of canvas)
 *************************/
/*************************
 * DRAW PATIO + HOUSE EDGE + HIPPED ROOF (bottom of canvas)
 * Hipped roof viewed from above: slopes in from all 4 sides to a flat ridge.
 * Patio connects flush to the wall.
 *************************/
function drawPatio(ctx) {
  const p = CONFIG.environment.patio;
  const W = CONFIG.canvas.width;
  const H = CONFIG.canvas.height;

  // 1. Draw hipped roof (behind everything)
  drawHippedRoof(ctx, p, W, H);

  // 2. House wall — full width continuous line across entire canvas
  ctx.fillStyle = p.wallColor;
  ctx.fillRect(0, p.wallY, W, p.wallHeight);
  ctx.fillStyle = p.wallBorderColor;
  ctx.fillRect(0, p.wallY, W, 2);
  ctx.fillStyle = p.wallBorderColor;
  ctx.fillRect(0, p.wallY + p.wallHeight - 2, W, 2);

  // 3. Patio slab — top edge sits exactly at wallY so it's flush/connected
  const patioTop = p.wallY;
  const patioH   = H - patioTop;
  ctx.fillStyle = p.slabColor;
  ctx.fillRect(p.slabX, patioTop, p.slabWidth, patioH);

  // Patio tile lines (horizontal)
  ctx.strokeStyle = p.tileLineColor;
  ctx.lineWidth = 1;
  for (let ty = patioTop + 14; ty < H; ty += 14) {
    ctx.beginPath();
    ctx.moveTo(p.slabX, ty);
    ctx.lineTo(p.slabX + p.slabWidth, ty);
    ctx.stroke();
  }
  // Patio tile lines (vertical)
  for (let tx = p.slabX + 20; tx < p.slabX + p.slabWidth; tx += 20) {
    ctx.beginPath();
    ctx.moveTo(tx, patioTop);
    ctx.lineTo(tx, H);
    ctx.stroke();
  }

  // Patio left/right borders
  ctx.strokeStyle = p.slabBorderColor;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(p.slabX, patioTop);
  ctx.lineTo(p.slabX, H);
  ctx.moveTo(p.slabX + p.slabWidth, patioTop);
  ctx.lineTo(p.slabX + p.slabWidth, H);
  ctx.stroke();

  // Shadow at top of patio where it meets the wall
  ctx.fillStyle = "rgba(0,0,0,0.12)";
  ctx.fillRect(p.slabX, patioTop, p.slabWidth, 4);
}

/*************************
 * HIPPED ROOF — viewed from above
 * Four slopes meet at a flat centre ridge rectangle.
 *************************/
function drawHippedRoof(ctx, p, W, H) {
  const roofTop    = p.roofY;
  const roofBot    = H;
  const slopeDepth = 28;
  const ridgeInset = 60;

  const ridgeTop   = roofTop + slopeDepth;
  const ridgeBot   = roofBot - slopeDepth;
  const ridgeLeft  = ridgeInset;
  const ridgeRight = W - ridgeInset;

  // Far slope (top — lightest)
  ctx.fillStyle = p.roofHighlight;
  ctx.beginPath();
  ctx.moveTo(0, roofTop); ctx.lineTo(W, roofTop);
  ctx.lineTo(ridgeRight, ridgeTop); ctx.lineTo(ridgeLeft, ridgeTop);
  ctx.closePath(); ctx.fill();

  // Near slope (bottom — medium)
  ctx.fillStyle = p.roofColor;
  ctx.beginPath();
  ctx.moveTo(0, roofBot); ctx.lineTo(W, roofBot);
  ctx.lineTo(ridgeRight, ridgeBot); ctx.lineTo(ridgeLeft, ridgeBot);
  ctx.closePath(); ctx.fill();

  // Left slope (darkest)
  ctx.fillStyle = p.roofShadowColor;
  ctx.beginPath();
  ctx.moveTo(0, roofTop); ctx.lineTo(0, roofBot);
  ctx.lineTo(ridgeLeft, ridgeBot); ctx.lineTo(ridgeLeft, ridgeTop);
  ctx.closePath(); ctx.fill();

  // Right slope (mid-dark)
  ctx.fillStyle = p.roofMidColor;
  ctx.beginPath();
  ctx.moveTo(W, roofTop); ctx.lineTo(W, roofBot);
  ctx.lineTo(ridgeRight, ridgeBot); ctx.lineTo(ridgeRight, ridgeTop);
  ctx.closePath(); ctx.fill();

  // Flat ridge centre
  ctx.fillStyle = p.roofColor;
  ctx.fillRect(ridgeLeft, ridgeTop, ridgeRight - ridgeLeft, ridgeBot - ridgeTop);

  // Tile lines on near slope
  ctx.strokeStyle = "rgba(0,0,0,0.12)";
  ctx.lineWidth = 1;
  for (let i = 1; i < 4; i++) {
    const y = ridgeBot + ((roofBot - ridgeBot) * i / 4);
    const p2 = i / 4;
    ctx.beginPath();
    ctx.moveTo(ridgeLeft * (1 - p2), y);
    ctx.lineTo(W - ridgeLeft * (1 - p2), y);
    ctx.stroke();
  }
  // Tile lines on far slope
  for (let i = 1; i < 4; i++) {
    const y = roofTop + ((ridgeTop - roofTop) * i / 4);
    const p2 = i / 4;
    ctx.beginPath();
    ctx.moveTo(ridgeLeft * p2, y);
    ctx.lineTo(W - ridgeLeft * p2, y);
    ctx.stroke();
  }
  // Tile lines on ridge (vertical)
  for (let tx = ridgeLeft + 20; tx < ridgeRight; tx += 20) {
    ctx.beginPath();
    ctx.moveTo(tx, ridgeTop); ctx.lineTo(tx, ridgeBot);
    ctx.stroke();
  }

  // Hip edge lines
  ctx.strokeStyle = p.roofShadowColor;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(ridgeLeft, ridgeTop); ctx.lineTo(ridgeRight, ridgeTop);
  ctx.moveTo(ridgeLeft, ridgeBot); ctx.lineTo(ridgeRight, ridgeBot);
  ctx.moveTo(0, roofTop); ctx.lineTo(ridgeLeft, ridgeTop);
  ctx.moveTo(0, roofBot); ctx.lineTo(ridgeLeft, ridgeBot);
  ctx.moveTo(W, roofTop); ctx.lineTo(ridgeRight, ridgeTop);
  ctx.moveTo(W, roofBot); ctx.lineTo(ridgeRight, ridgeBot);
  ctx.stroke();
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