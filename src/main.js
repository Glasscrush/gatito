/*************************
 * GATITO - MAIN
 * Entry point. Sets up input handlers, game loop, and pending pickup logic.
 * Loads images and starts the game once everything is ready.
 *************************/

const canvas = document.getElementById("gameCanvas");

/*************************
 * COLLISION DETECTION
 *************************/
function isColliding(a, b) {
  return a.x < b.x + b.width  &&
         a.x + a.width  > b.x &&
         a.y < b.y + b.height &&
         a.y + a.height > b.y;
}

/*************************
 * INPUT: CANVAS CLICK → MOVE / INTERACT
 *************************/
canvas.addEventListener("click", (e) => {
  const rect   = canvas.getBoundingClientRect();
  const clickX = e.clientX - rect.left;
  const clickY = e.clientY - rect.top;

  // Ignore clicks on the inventory bar
  const invY = CONFIG.canvas.height - CONFIG.inventory.barHeight;
  if (clickY >= invY) return;

  // Ignore one click immediately after dropping an item
  if (Date.now() < suppressUntil) {
    suppressUntil = 0;
    return;
  }

  // --- Watering can (world) ---
  if (!item.pickedUp && !popupActive &&
      clickX >= item.x && clickX <= item.x + item.width &&
      clickY >= item.y && clickY <= item.y + item.height) {
    pendingPickup    = { type: 'item' };
    player.targetX   = item.x - player.width / 2;
    player.targetY   = item.y - player.height / 2;
    wateringCanPopupDisabled = true;
    return;
  }

  // --- Shovel (world) ---
  if (!shovel.pickedUp && !popupActive &&
      clickX >= shovel.x && clickX <= shovel.x + shovel.width &&
      clickY >= shovel.y && clickY <= shovel.y + shovel.height) {
    showChoices(shovel.message, [{ id: "yes", label: "Yes" }], (choiceId) => {
      if (choiceId === "yes") {
        pendingPickup  = { type: 'shovel' };
        player.targetX = shovel.x - player.width / 2;
        player.targetY = shovel.y - player.height / 2;
      }
    });
    shovelPopupDisabled = true;
    return;
  }

  // --- Shed ---
  if (!popupActive &&
      clickX >= shed.x && clickX <= shed.x + shed.width &&
      clickY >= shed.y && clickY <= shed.y + shed.height) {
    pendingPickup  = { type: 'shed' };
    player.targetX = shed.x - player.width / 2;
    player.targetY = shed.y - player.height / 2;
    return;
  }

  // --- Dropped items on ground ---
  for (let i = 0; i < droppedItems.length; i++) {
    const d = droppedItems[i];
    if (clickX >= d.x && clickX <= d.x + d.width &&
        clickY >= d.y && clickY <= d.y + d.height) {
      let message = d.type === "wateringCan" ? "Pick up the watering can?"
                  : d.type === "shovel"      ? "Pick up the shovel?"
                  : `Pick up a ${d.seedId} seed?`;
      showChoices(message, [{ id: "yes", label: "Yes" }], (choiceId) => {
        if (choiceId === "yes") {
          pendingPickup  = { type: 'dropped', index: i };
          player.targetX = d.x - player.width / 2;
          player.targetY = d.y - player.height / 2;
        }
      });
      return;
    }
  }

  // --- Table ---
  if (table.hasSeeds && !popupActive &&
      clickX >= table.x && clickX <= table.x + table.width &&
      clickY >= table.y && clickY <= table.y + table.height) {
    pendingPickup  = { type: 'table' };
    player.targetX = table.x - player.width / 2;
    player.targetY = table.y - player.height / 2;
    return;
  }

  // --- Normal movement ---
  player.targetX = clickX - player.width / 2;
  player.targetY = clickY - player.height / 2;
});

/*************************
 * INPUT: MOUSEDOWN → DROP FROM INVENTORY
 *************************/
canvas.addEventListener("mousedown", (e) => {
  handleInventoryMousedown(e);
});

/*************************
 * DEBUG: COORDINATE HELPER (remove when done)
 *************************/
canvas.addEventListener('mousemove', (e) => {
  const rect = canvas.getBoundingClientRect();
  hoverX = Math.floor(e.clientX - rect.left);
  hoverY = Math.floor(e.clientY - rect.top);
  showCoords = true;
});
canvas.addEventListener('mouseleave', () => { showCoords = false; });

/*************************
 * PENDING PICKUP HANDLER (runs each frame in update)
 *************************/
function handlePendingPickup() {
  if (pendingPickup === null) return;

  if (pendingPickup.type === 'dropped') {
    const idx = pendingPickup.index;
    if (idx < 0 || idx >= droppedItems.length) { pendingPickup = null; return; }
    const target = droppedItems[idx];
    if (isColliding(player, target)) {
      if (target.type === "wateringCan") {
        if (inventory.shovel) {
          droppedItems.push({ x: player.x, y: player.y, width: 30, height: 30, type: "shovel", image: images.shovel, justDropped: true });
          inventory.shovel = false;
        }
        inventory.wateringCan = true;
      } else if (target.type === "shovel") {
        if (inventory.wateringCan) {
          droppedItems.push({ x: player.x, y: player.y, width: 30, height: 30, type: "wateringCan", image: images.wateringCan, justDropped: true });
          inventory.wateringCan = false;
        }
        inventory.shovel = true;
      } else if (target.type === "seed") {
        const cur = inventory.seeds[target.seedId] || 0;
        inventory.seeds[target.seedId] = Math.min(CONFIG.inventory.maxSeeds, cur + 1);
      }
      refreshPlayerSprite();
      droppedItems.splice(idx, 1);
      pendingPickup = null;
    }

  } else if (pendingPickup.type === 'item') {
    if (!item.pickedUp && isColliding(player, item) && !popupActive) {
      showChoices(item.message, [{ id: 'yes', label: 'Yes' }], (choiceId) => {
        if (choiceId === 'yes') {
          if (inventory.shovel) {
            droppedItems.push({ x: player.x, y: player.y, width: 30, height: 30, type: "shovel", image: images.shovel, justDropped: true });
            inventory.shovel = false;
          }
          item.pickedUp         = true;
          inventory.wateringCan = true;
          refreshPlayerSprite();
        }
      });
      pendingPickup = null;
    }

  } else if (pendingPickup.type === 'shovel') {
    if (!shovel.pickedUp && isColliding(player, shovel)) {
      if (inventory.wateringCan) {
        droppedItems.push({ x: player.x, y: player.y, width: 30, height: 30, type: "wateringCan", image: images.wateringCan, justDropped: true });
        inventory.wateringCan = false;
      }
      shovel.pickedUp  = true;
      inventory.shovel = true;
      refreshPlayerSprite();
      pendingPickup    = null;
    }

  } else if (pendingPickup.type === 'table') {
    if (isColliding(player, table) && !popupActive) {
      const availableSeeds = CONFIG.seeds.filter(s => table.seeds[s.id] > 0);
      if (availableSeeds.length === 0) {
        showChoices('No more seeds on the table!', [], () => {});
        table.image = images.tableSeedless;
      } else {
        showChoices(table.message, availableSeeds, (seedId) => {
          const cur = inventory.seeds[seedId] || 0;
          if (cur < CONFIG.inventory.maxSeeds && table.seeds[seedId] > 0) {
            inventory.seeds[seedId] = cur + 1;
            table.seeds[seedId]    -= 1;
            const totalLeft = Object.values(table.seeds).reduce((a, b) => a + b, 0);
            if (totalLeft === 0) table.image = images.tableSeedless;
          }
        }, true);
      }
      pendingPickup = null;
    }

  } else if (pendingPickup.type === 'shed') {
    if (isColliding(player, shed) && !popupActive) {
      showShedMenu();
      pendingPickup = null;
    }
  }
}

/*************************
 * RESET POPUP FLAGS WHEN PLAYER MOVES AWAY
 *************************/
function resetProximityFlags() {
  if (!isColliding(player, table))  tablePopupDisabled       = false;
  if (!isColliding(player, item))   wateringCanPopupDisabled = false;
  if (!isColliding(player, shovel)) shovelPopupDisabled      = false;
  if (!isColliding(player, shed))   shedPopupDisabled        = false;
}

/*************************
 * GAME LOOP
 *************************/
function update() {
  updatePlayer();
  resetProximityFlags();
  handlePendingPickup();
}

function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

function startGame() {
  requestAnimationFrame(gameLoop);
}

/*************************
 * BOOT
 *************************/
loadImages();
