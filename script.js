/*************************
 * CANVAS SETUP
 *************************/
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

/*************************
 * POPUP ELEMENTS
 *************************/
const popup = document.getElementById("popup");
const popupText = document.getElementById("popupText");
const choicesDiv = document.getElementById("choices"); // 🔵 dynamic popup buttons

/*************************
 * POPUP STATE
 *************************/
let popupActive = false;           // 🔵 prevents repeated popups
let popupCallback = null;          // 🔵 keeps current popup callback
let tablePopupDisabled = false;    // 🔵 disables repeated table popups
let wateringCanPopupDisabled = false; // 🔵 disables repeated watering can popups
let shovelPopupDisabled = false;   // 🔵 disables repeated shovel popups
let shedPopupDisabled = false;     // 🔵 disables repeated shed popups
// Suppress the next click (used after dropping an item so the same user click
// doesn't immediately trigger a popup or movement). Use a timestamp window
// (ignore clicks while Date.now() < suppressUntil)
let suppressUntil = 0;

// TEMP: Coordinate helper - REMOVE THIS BLOCK WHEN DONE
// Shows mouse canvas coordinates while hovering (helps pick positions)
let hoverX = 0;
let hoverY = 0;
let showCoords = false;
canvas.addEventListener('mousemove', (e) => {
  const rect = canvas.getBoundingClientRect();
  hoverX = Math.floor(e.clientX - rect.left);
  hoverY = Math.floor(e.clientY - rect.top);
  showCoords = true;
});
canvas.addEventListener('mouseleave', () => { showCoords = false; });
// END TEMP: Coordinate helper

/*************************
 * IMAGE LOADING
 *************************/
const images = {};
let imagesLoaded = 0;
const totalImages = 11;

function imageLoaded() {
  imagesLoaded++;
  if (imagesLoaded === totalImages) {
    requestAnimationFrame(gameLoop);
  }
}

// Player
images.player = new Image();
images.player.src = "assets/Gatito_sprite.png";
images.player.onload = () => {
  imageLoaded();
  player.image = images.player;
};
images.playerCan = new Image();
images.playerCan.src = "assets/Gatito_sprite_Can.png";
images.playerCan.onload = () => imageLoaded();

// Player with shovel
images.playerShovel = new Image();
images.playerShovel.src = "assets/Gatito_sprite_shovel.png";
images.playerShovel.onload = () => imageLoaded();

// Watering can
images.item = new Image();
images.item.src = "assets/watering_can.png";
images.item.onload = () => imageLoaded();

// Shovel image
images.shovel = new Image();
images.shovel.src = "assets/shovel.png";
images.shovel.onload = () => imageLoaded();

// Table
images.table = new Image();
images.table.src = "assets/table.png";
images.table.onload = () => imageLoaded();

// Shed image
images.shed = new Image();
images.shed.src = "assets/shed.png";
images.shed.onload = () => imageLoaded();

// Seeds
images.seedTomato = new Image();
images.seedTomato.src = "assets/seed_tomato.png";
images.seedTomato.onload = () => imageLoaded();
images.seedSunflower = new Image();
images.seedSunflower.src = "assets/seed_sunflower.png";
images.seedSunflower.onload = () => imageLoaded();
images.seedCarrot = new Image();
images.seedCarrot.src = "assets/seed_carrot.png";
images.seedCarrot.onload = () => imageLoaded();

// Table empty state
images.table_seedless = new Image();
images.table_seedless.src = "assets/table_seedless.png";
images.table_seedless.onload = () => imageLoaded();

/*************************
 * SEED SPRITES MAPPING
 *************************/
const seedSprites = {
  tomato: images.seedTomato,
  sunflower: images.seedSunflower,
  carrot: images.seedCarrot
};

/*************************
 * GAME OBJECTS
 *************************/

// Player
const player = {
  x: 100, y: 200, width: 60, height: 60, speed: 3, targetX: 100, targetY: 200, image: null
};

// Watering can pickup object
const item = {
  x: 300, y: 200, width: 30, height: 30,
  message: "Oh look a watering can! Pick up?",
  image: images.item, pickedUp: false
};

// Shovel pickup object (world)
const shovel = {
  x: 50, y: 200, width: 30, height: 30,
  message: "Oh look a shovel! Pick up?",
  image: images.shovel, pickedUp: false
};

// Table
const table = {
  x: 420, y: 180, width: 60, height: 60,
  message: "There are seeds on the table. Which would you like?",
  hasSeeds: true,
  seeds: { tomato: 3, sunflower: 3, carrot: 3 }, // Track available seeds on table
  image: images.table // Will switch to images.table_seedless when empty
};

// Shed (store tools) - can hold multiple tools
const shed = {
  x: 20, y: 15, width: 150, height: 80,
  message: "Shed: store or retrieve tools?",
  image: images.shed,
  tools: { wateringCan: false, shovel: false } // stores which tools are in shed
};

// Dropped items on the ground 🔵 NEW
const droppedItems = []; // holds seeds or watering can objects
// When the player clicks a dropped item and confirms pickup, we store a
// pending pickup so the player will move to it and pick it up on collision.
let pendingPickup = null;

/*************************
 * INVENTORY
 *************************/
const inventory = {
  wateringCan: false,
  shovel: false,
  seeds: {}
};

/*************************
 * SEED OPTIONS
 *************************/
const seedOptions = [
  { id: "tomato", label: "Tomato" },
  { id: "sunflower", label: "Sunflower" },
  { id: "carrot", label: "Carrot" }
];

/*************************
 * INPUT: MOVE PLAYER TO CLICK
 *************************/
canvas.addEventListener("click", (e) => {
  const rect = canvas.getBoundingClientRect();
  const clickX = e.clientX - rect.left;
  const clickY = e.clientY - rect.top;
  console.log('DEBUG: Canvas clicked at', { clickX, clickY, popupActive });
  
  /**** CHECK IF CLICKING ON INVENTORY BAR ****/
  const invY = canvas.height - 50;
  const isClickingInventory = clickY >= invY && clickY <= invY + 40;
  
  // Don't process game interactions if clicking on inventory
  if (isClickingInventory) {
    return;
  }

  // Ignore one click immediately after dropping an item from inventory.
  // This prevents the same user action (mousedown -> click) from both dropping
  // and immediately re-triggering a popup/movement.
  if (Date.now() < suppressUntil) {
    // clear suppression and ignore this click
    suppressUntil = 0;
    return;
  }
  
  /**** CHECK IF CLICKING ON WATERING CAN ON GROUND ****/
  if (!item.pickedUp && !popupActive && clickX >= item.x && clickX <= item.x + item.width &&
      clickY >= item.y && clickY <= item.y + item.height) {
    console.log('DEBUG: Watering can clicked, setting pendingPickup');
    // Set pending pickup so popup appears when player reaches the watering can
    pendingPickup = { type: 'item' };
    player.targetX = item.x - player.width / 2;
    player.targetY = item.y - player.height / 2;
    wateringCanPopupDisabled = true;
    return;
  }
  
  /**** CHECK IF CLICKING ON SHOVEL ON GROUND ****/
  if (!shovel.pickedUp && !popupActive && clickX >= shovel.x && clickX <= shovel.x + shovel.width &&
      clickY >= shovel.y && clickY <= shovel.y + shovel.height) {
    console.log('DEBUG: Shovel clicked');
    showChoices(shovel.message, [{ id: "yes", label: "Yes" }], (choiceId) => {
      console.log('DEBUG: Shovel choice:', choiceId);
      if (choiceId === "yes") {
        console.log('DEBUG: Setting pendingPickup for shovel');
        pendingPickup = { type: 'shovel' };
        player.targetX = shovel.x - player.width / 2;
        player.targetY = shovel.y - player.height / 2;
      }
    });
    shovelPopupDisabled = true;
    return;
  }

  /**** CHECK IF CLICKING ON SHED ****/
  if (!popupActive && clickX >= shed.x && clickX <= shed.x + shed.width &&
      clickY >= shed.y && clickY <= shed.y + shed.height) {
    console.log('DEBUG: Shed clicked, setting pendingPickup');
    // Set pending pickup so popup appears when player reaches shed
    pendingPickup = { type: 'shed' };
    player.targetX = shed.x - player.width / 2;
    player.targetY = shed.y - player.height / 2;
    return;
  }
  
  /**** CHECK IF CLICKING ON A DROPPED ITEM ****/
  // Only process dropped-item clicks when clicking in the game area (not inventory)
  for (let i = 0; i < droppedItems.length; i++) {
    const d = droppedItems[i];
    if (clickX >= d.x && clickX <= d.x + d.width && clickY >= d.y && clickY <= d.y + d.height) {
      // Show pickup popup for this dropped item (wateringCan, shovel, or seed)
      let message = "";
      if (d.type === "wateringCan") message = "Pick up the watering can?";
      else if (d.type === "shovel") message = "Pick up the shovel?";
      else message = `Pick up a ${d.seedId} seed?`;
      showChoices(message, [{ id: "yes", label: "Yes" }], (choiceId) => {
        if (choiceId === "yes") {
          // Set pending pickup so update() will move player and pick it up on collision
          pendingPickup = { type: 'dropped', index: i };
          player.targetX = d.x - player.width / 2;
          player.targetY = d.y - player.height / 2;
        }
      });
      return; // don't process normal movement if clicked a dropped item
    }
  }

  /**** CHECK IF CLICKING ON THE TABLE ****/
  if (table.hasSeeds && clickX >= table.x && clickX <= table.x + table.width &&
      clickY >= table.y && clickY <= table.y + table.height) {
    // Do not show popup immediately — set pending pickup so popup appears on arrival
    pendingPickup = { type: 'table' };
    player.targetX = table.x - player.width / 2;
    player.targetY = table.y - player.height / 2;
    return; // don't set normal movement
  }

  // Normal movement when clicking elsewhere
  player.targetX = clickX - player.width / 2;
  player.targetY = clickY - player.height / 2;
});

/*************************
 * INVENTORY CLICK → DROP ITEM
 *************************/
canvas.addEventListener("mousedown", (e) => {
  // Check if click is inside inventory bar (drops should always work, even with popup open)
  const invY = canvas.height - 50;
  const isClickingInventory = e.clientY - canvas.offsetTop >= invY && e.clientY - canvas.offsetTop <= invY + 40;
  
  // If not clicking inventory, don't process drops
  if (!isClickingInventory) {
    return;
  }
  
  let offsetX = 20;

  /**** WATERING CAN - DROP FROM INVENTORY ****/
  if (inventory.wateringCan && e.clientX - canvas.offsetLeft >= offsetX && e.clientX - canvas.offsetLeft <= offsetX + 30 &&
      e.clientY - canvas.offsetTop >= invY + 8 && e.clientY - canvas.offsetTop <= invY + 38) {
    // Drop watering can on ground
    droppedItems.push({
      x: player.x,
      y: player.y,
      width: 30,
      height: 30,
      type: "wateringCan",
      image: images.item,
      justDropped: true
    });
    inventory.wateringCan = false;
    player.image = images.player;
    // Prevent the next click(s) from being processed (mousedown -> click)
    // ignore clicks for the next 200ms
    suppressUntil = Date.now() + 200;
    // stop further processing of this mousedown
    e.stopPropagation();
    return;
  }
  // only move offset if watering can icon was present (matches draw())
  if (inventory.wateringCan) offsetX += 32;

  /**** SHOVEL - DROP FROM INVENTORY ****/
  if (inventory.shovel && e.clientX - canvas.offsetLeft >= offsetX && e.clientX - canvas.offsetLeft <= offsetX + 30 &&
      e.clientY - canvas.offsetTop >= invY + 8 && e.clientY - canvas.offsetTop <= invY + 38) {
    // Drop shovel on ground
    droppedItems.push({
      x: player.x,
      y: player.y,
      width: 30,
      height: 30,
      type: "shovel",
      image: images.shovel,
      justDropped: true
    });
    inventory.shovel = false;
    player.image = images.player;
    // ignore clicks for the next 200ms
    suppressUntil = Date.now() + 200;
    e.stopPropagation();
    return;
  }
  // only move offset if shovel icon was present (matches draw())
  if (inventory.shovel) offsetX += 32;

  /**** SEEDS - DROP FROM INVENTORY ****/
  for (let seedId in inventory.seeds) {
    const count = inventory.seeds[seedId];
    if (count > 0 && e.clientX - canvas.offsetLeft >= offsetX && e.clientX - canvas.offsetLeft <= offsetX + 30 &&
        e.clientY - canvas.offsetTop >= invY + 8 && e.clientY - canvas.offsetTop <= invY + 38) {
      // Drop one seed on ground
      droppedItems.push({
        x: player.x,
        y: player.y,
        width: 30,
        height: 30,
        type: "seed",
        seedId: seedId,
        image: seedSprites[seedId],
        justDropped: true
      });
      inventory.seeds[seedId] -= 1;
      // Prevent the next click(s) from being processed (mousedown -> click)
      // ignore clicks for the next 200ms
      suppressUntil = Date.now() + 200;
      // stop further processing of this mousedown
      e.stopPropagation();
      return;
    }
    offsetX += 32;
  }
});

/*************************
 * POPUP CHOICE SYSTEM
 *************************/
function showChoices(message, options, onChoose, keepOpen = false) {
  popupText.textContent = message;
  choicesDiv.innerHTML = "";

  popupCallback = onChoose;

  options.forEach(option => {
    const btn = document.createElement("button");
    btn.textContent = option.label;
    btn.onclick = () => {
      // Close the popup BEFORE calling the callback so the next popup can open
      if (!keepOpen) {
        popupActive = false;
        popup.classList.add("hidden");
      }
      onChoose(option.id);
    };
    choicesDiv.appendChild(btn);
  });

  const cancelBtn = document.createElement("button");
  cancelBtn.textContent = "Cancel";
  cancelBtn.onclick = () => {
    popupActive = false;
    popup.classList.add("hidden");
  };
  choicesDiv.appendChild(cancelBtn);

  popup.classList.remove("hidden");
  popupActive = true;
}

/*************************
 * COLLISION DETECTION
 *************************/
function isColliding(a, b) {
  return a.x < b.x + b.width &&
         a.x + a.width > b.x &&
         a.y < b.y + b.height &&
         a.y + a.height > b.y;
}

/*************************
 * SHED INTERACTION HANDLER
 *************************/
function showShedMenu() {
  const options = [
    { id: 'store', label: 'Store' },
    { id: 'retrieve', label: 'Retrieve' }
  ];

  showChoices(shed.message, options, (choiceId) => {
    console.log('DEBUG: Shed menu choice:', choiceId, 'popupActive:', popupActive);
    if (choiceId === 'store') {
      console.log('DEBUG: Store clicked');
      // Check if player has a tool
      const currentTool = inventory.wateringCan ? 'wateringCan' : (inventory.shovel ? 'shovel' : null);
      console.log('DEBUG: currentTool:', currentTool);
      if (!currentTool) {
        console.log('DEBUG: No tool, showing Nothing to store');
        // No tool in inventory - show Back button to return to Store/Retrieve menu
        showChoices('Nothing to store', [{ id: 'back', label: 'Back' }], (backChoiceId) => {
          if (backChoiceId === 'back') {
            showShedMenu(); // Return to main menu
          } else {
            pendingPickup = null; // Clear if back from nothing to store
          }
        });
      } else {
        // Build tool name for display
        const toolName = currentTool === 'wateringCan' ? 'Watering Can' : 'Shovel';
        console.log('DEBUG: Showing Store confirmation for:', toolName);
        // Show confirmation with tool name (replaces current popup)
        showChoices(`Store ${toolName}?`, [{ id: 'confirm', label: 'Yes' }], (confirmId) => {
          console.log('DEBUG: Confirm choice:', confirmId);
          if (confirmId === 'confirm') {
            // Player has a tool, store it
            shed.tools[currentTool] = true;
            inventory.wateringCan = false;
            inventory.shovel = false;
            player.image = images.player;
            showChoices(`${toolName} stored in shed!`, [], () => {
              pendingPickup = null; // Clear pending pickup after store completes
            });
          }
        });
      }
    } else if (choiceId === 'retrieve') {
      console.log('DEBUG: Retrieve clicked');
      // Check if shed has any tools
      const storedTools = [];
      if (shed.tools.wateringCan) storedTools.push({ id: 'wateringCan', label: 'Watering Can' });
      if (shed.tools.shovel) storedTools.push({ id: 'shovel', label: 'Shovel' });

      console.log('DEBUG: storedTools:', storedTools);
      if (storedTools.length === 0) {
        console.log('DEBUG: No tools stored, showing Nothing in shed');
        showChoices('Nothing is in the shed', [{ id: 'back', label: 'Back' }], (backChoiceId) => {
          if (backChoiceId === 'back') {
            showShedMenu(); // Return to main menu
          } else {
            pendingPickup = null; // Clear if back from empty shed
          }
        });
      } else {
        console.log('DEBUG: Showing tool retrieve options');
        // Show which tool to retrieve (replaces current popup)
        showChoices('Which tool to retrieve?', storedTools, (toolId) => {
          const currentTool = inventory.wateringCan ? 'wateringCan' : (inventory.shovel ? 'shovel' : null);
          const toolToRetrieve = toolId;
          
          if (!currentTool) {
            // No tool in inventory, just equip the retrieved tool
            shed.tools[toolToRetrieve] = false;
            if (toolToRetrieve === 'wateringCan') {
              inventory.wateringCan = true;
              player.image = images.playerCan;
            } else if (toolToRetrieve === 'shovel') {
              inventory.shovel = true;
              player.image = images.playerShovel;
            }
          } else {
            // Swap: current tool goes to shed, retrieved tool goes to inventory
            shed.tools[toolToRetrieve] = false;
            shed.tools[currentTool] = true;
            // clear current
            inventory.wateringCan = false;
            inventory.shovel = false;
            // equip the retrieved tool
            if (toolToRetrieve === 'wateringCan') {
              inventory.wateringCan = true;
              player.image = images.playerCan;
            } else if (toolToRetrieve === 'shovel') {
              inventory.shovel = true;
              player.image = images.playerShovel;
            }
          }
          pendingPickup = null; // Clear pending pickup after retrieve completes
        });
      }
    }
  });
}

/*************************
 * GAME LOOP - UPDATE GAME STATE
 *************************/
function update() {
  /**** PLAYER MOVEMENT ****/
  const dx = player.targetX - player.x;
  const dy = player.targetY - player.y;
  const dist = Math.hypot(dx, dy);
  if (dist > 1) {
    const stepX = (dx / dist) * player.speed;
    const stepY = (dy / dist) * player.speed;
    const nextPos = { x: player.x + stepX, y: player.y + stepY, width: player.width, height: player.height };
    // Prevent walking over the shed (but allow it if we're targeting the shed for interaction)
    const allowShedCollision = pendingPickup && pendingPickup.type === 'shed';
    if (!isColliding(nextPos, shed) || allowShedCollision) {
      player.x = nextPos.x;
      player.y = nextPos.y;
    }
  }

  /**** RESET POPUP FLAGS WHEN MOVING AWAY ****/
  if (!isColliding(player, table)) tablePopupDisabled = false;
  if (!isColliding(player, item)) wateringCanPopupDisabled = false;
  if (!isColliding(player, shovel)) shovelPopupDisabled = false;
  if (!isColliding(player, shed)) shedPopupDisabled = false;

  /**** WATERING CAN - NOTE: pickup only happens after clicking to confirm ****/
  // The player should not auto-pickup the world watering can by walking over it.
  // Pickup occurs only when the player has clicked the item (pendingPickup.type === 'item').

  /**** TABLE - SEED SELECTION (moved to pending pickup handler) ****/
  // Table popup now only appears after clicking the table and reaching it.

  /**** DROPPED ITEMS / WORLD ITEM / TABLE - PENDING PICKUP HANDLER ****/
  if (pendingPickup !== null) {
    if (pendingPickup.type === 'dropped') {
      const idx = pendingPickup.index;
      // If the item was removed or index invalid, clear pendingPickup
      if (idx < 0 || idx >= droppedItems.length) {
        pendingPickup = null;
      } else {
        const target = droppedItems[idx];
        // If player reached the item, perform the pickup
        if (isColliding(player, target)) {
          if (target.type === "wateringCan") {
            // If player currently has a shovel equipped, drop it before equipping can
            if (inventory.shovel && player.image === images.playerShovel) {
              droppedItems.push({ x: player.x, y: player.y, width: 30, height: 30, type: "shovel", image: images.shovel, justDropped: true });
              inventory.shovel = false;
            }
            inventory.wateringCan = true;
            player.image = images.playerCan;
          } else if (target.type === "shovel") {
            // If player currently has watering can displayed, drop it and equip shovel
            if (inventory.wateringCan && player.image === images.playerCan) {
              // drop watering can at player's position
              droppedItems.push({ x: player.x, y: player.y, width: 30, height: 30, type: "wateringCan", image: images.item, justDropped: true });
              inventory.wateringCan = false;
            }
            inventory.shovel = true;
            player.image = images.playerShovel;
          } else if (target.type === "seed") {
            const cur = inventory.seeds[target.seedId] || 0;
            inventory.seeds[target.seedId] = Math.min(3, cur + 1);
          }
          // remove the dropped item and clear pending pickup
          droppedItems.splice(idx, 1);
          pendingPickup = null;
        }
      }
    } else if (pendingPickup.type === 'item') {
      // World item: show pickup popup only after player reaches the item
      if (!item.pickedUp && isColliding(player, item) && !popupActive) {
        console.log('DEBUG: Player reached watering can, showing pickup popup');
        showChoices(item.message, [{ id: 'yes', label: 'Yes' }], (choiceId) => {
          if (choiceId === 'yes') {
            // If player currently has a shovel equipped, drop it before equipping can
            if (inventory.shovel && player.image === images.playerShovel) {
              droppedItems.push({ x: player.x, y: player.y, width: 30, height: 30, type: "shovel", image: images.shovel, justDropped: true });
              inventory.shovel = false;
            }
            item.pickedUp = true;
            inventory.wateringCan = true;
            player.image = images.playerCan;
          }
        });
        pendingPickup = null;
      }
    } else if (pendingPickup.type === 'shovel') {
      // World shovel pickup when player reaches the shovel
      if (!shovel.pickedUp && isColliding(player, shovel)) {
        shovel.pickedUp = true;
        // If player currently has watering can equipped (sprite showing can), drop it
        if (inventory.wateringCan && player.image === images.playerCan) {
          droppedItems.push({ x: player.x, y: player.y, width: 30, height: 30, type: "wateringCan", image: images.item, justDropped: true });
          inventory.wateringCan = false;
        }
        inventory.shovel = true;
        player.image = images.playerShovel;
        pendingPickup = null;
      }
    } else if (pendingPickup.type === 'table') {
      // Table: show seed selection popup only after player reaches the table
      if (isColliding(player, table) && !popupActive) {
        // Filter seed options to only show seeds still available on table
        const availableSeedOptions = seedOptions.filter(seed => table.seeds[seed.id] > 0);
        
        if (availableSeedOptions.length === 0) {
          // No more seeds on table
          showChoices('No more seeds on the table!', [], () => {});
          table.image = images.table_seedless;
        } else {
          showChoices(table.message, availableSeedOptions, (seedId) => {
            const currentCount = inventory.seeds[seedId] || 0;
            if (currentCount < 3 && table.seeds[seedId] > 0) {
              inventory.seeds[seedId] = currentCount + 1;
              table.seeds[seedId] -= 1; // Decrement seeds on table
              
              // Check if all seeds are taken (3+3+3 = 9 total)
              const totalSeedsLeft = table.seeds.tomato + table.seeds.sunflower + table.seeds.carrot;
              if (totalSeedsLeft === 0) {
                table.image = images.table_seedless; // Swap to empty table sprite
              }
            }
          }, true);
        }
        pendingPickup = null;
      }
    } else if (pendingPickup.type === 'shed') {
      // Shed: show store/retrieve popup only after player reaches the shed
      const isColliding_result = isColliding(player, shed);
      console.log('DEBUG: pendingPickup.type === shed, checking collision...', { playerPos: { x: player.x, y: player.y }, shedPos: { x: shed.x, y: shed.y }, isColliding: isColliding_result, popupActive });
      if (isColliding_result && !popupActive) {
        console.log('DEBUG: Player reached shed, showing popup');
        showShedMenu();
        pendingPickup = null;
      }
    }
  }
}

/*************************
 * DRAW - RENDER GAME GRAPHICS
 *************************/
function draw() {
  /**** BACKGROUND ****/
  ctx.fillStyle = "#1f4d2b";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // TEMP: draw hover coordinates and crosshair (REMOVE THIS SECTION WHEN DONE)
  if (showCoords) {
    // crosshair lines
    ctx.strokeStyle = 'rgba(255,255,255,0.25)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(hoverX, 0);
    ctx.lineTo(hoverX, canvas.height);
    ctx.moveTo(0, hoverY);
    ctx.lineTo(canvas.width, hoverY);
    ctx.stroke();

    // background for text
    const text = `x:${hoverX} y:${hoverY}`;
    ctx.font = '12px Arial';
    const w = ctx.measureText(text).width + 8;
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(8, 8, w, 18);
    ctx.fillStyle = 'white';
    ctx.fillText(text, 12, 22);
  }
  // END TEMP drawing

  /**** TABLE ****/
  /**** SHED ****/
  if (images.shed) ctx.drawImage(images.shed, shed.x, shed.y, shed.width, shed.height);

  /**** TABLE ****/
  ctx.drawImage(table.image, table.x, table.y, table.width, table.height);

  /**** WATERING CAN (IF NOT PICKED UP) ****/
  if (!item.pickedUp) ctx.drawImage(item.image, item.x, item.y, item.width, item.height);

  /**** SHOVEL (IF NOT PICKED UP) ****/
  if (!shovel.pickedUp) ctx.drawImage(shovel.image, shovel.x, shovel.y, shovel.width, shovel.height);

  /**** DROPPED ITEMS ON GROUND ****/
  droppedItems.forEach(d => {
    ctx.drawImage(d.image, d.x, d.y, d.width, d.height);
  });

  /**** PLAYER ****/
  if (player.image) ctx.drawImage(player.image, player.x, player.y, player.width, player.height);

  /**** INVENTORY BAR ****/
  const invY = canvas.height - 50;
  ctx.fillStyle = "rgba(0,0,0,0.4)";
  ctx.fillRect(10, invY, 250, 40);

  /**** INVENTORY - WATERING CAN ****/
  let offsetX = 20;
  if (inventory.wateringCan) {
    ctx.drawImage(images.item, offsetX, invY + 8, 30, 30);
    offsetX += 32;
  }
  /**** INVENTORY - SHOVEL ****/
  if (inventory.shovel) {
    ctx.drawImage(images.shovel, offsetX, invY + 8, 30, 30);
    offsetX += 32;
  }

  /**** INVENTORY - SEEDS ****/
  ctx.fillStyle = "white";
  ctx.font = "14px Arial";
  for (let seedId in inventory.seeds) {
    const count = inventory.seeds[seedId];
    if (count > 0) {
      ctx.drawImage(seedSprites[seedId], offsetX, invY + 8, 30, 30);
      ctx.fillText(count, offsetX + 20, invY + 20);
      offsetX += 32;
    }
  }
}

function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}