/*************************
 * GATITO - ITEMS
 * World objects: watering can, shovel, table, shed, dropped items.
 *************************/

// Watering can (world pickup)
const item = {
  x:        CONFIG.item.x,
  y:        CONFIG.item.y,
  width:    CONFIG.item.width,
  height:   CONFIG.item.height,
  message:  CONFIG.item.message,
  pickedUp: false,
  get image() { return images.wateringCan; }
};

// Shovel (world pickup)
const shovel = {
  x:        CONFIG.shovel.x,
  y:        CONFIG.shovel.y,
  width:    CONFIG.shovel.width,
  height:   CONFIG.shovel.height,
  message:  CONFIG.shovel.message,
  pickedUp: false,
  get image() { return images.shovel; }
};

// Seed table
const table = {
  x:        CONFIG.table.x,
  y:        CONFIG.table.y,
  width:    CONFIG.table.width,
  height:   CONFIG.table.height,
  message:  CONFIG.table.message,
  hasSeeds: true,
  seeds: { ...CONFIG.table.seeds }, // copy so config stays pristine
  image:    null  // set to images.table after load; swaps to images.tableSeedless when empty
};

// Shed
const shed = {
  x:       CONFIG.shed.x,
  y:       CONFIG.shed.y,
  width:   CONFIG.shed.width,
  height:  CONFIG.shed.height,
  message: CONFIG.shed.message,
  tools:   { wateringCan: false, shovel: false },
  get image() { return images.shed; }
};

// Dropped items on the ground
const droppedItems = [];

// Pending pickup: tracks what the player is walking toward to interact with
let pendingPickup = null;

// Popup disable flags (prevent re-triggering when standing near an object)
let tablePopupDisabled      = false;
let wateringCanPopupDisabled = false;
let shovelPopupDisabled     = false;
let shedPopupDisabled       = false;
