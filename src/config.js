/*************************
 * GATITO - CONFIG
 * All tuneable game values live here.
 * Change a number here and it affects the whole game.
 *************************/
const CONFIG = {

  canvas: {
    width: 600,
    height: 400
  },

  player: {
    startX: 100,
    startY: 200,
    width: 60,
    height: 60,
    speed: 3
  },

  item: {  // watering can (world object)
    x: 300,
    y: 200,
    width: 30,
    height: 30,
    message: "Oh look a watering can! Pick up?"
  },

  shovel: {  // shovel (world object)
    x: 50,
    y: 200,
    width: 30,
    height: 30,
    message: "Oh look a shovel! Pick up?"
  },

  table: {
    x: 420,
    y: 180,
    width: 60,
    height: 60,
    message: "There are seeds on the table. Which would you like?",
    seeds: {
      tomato: 3,
      sunflower: 3,
      carrot: 3
    }
  },

  shed: {
    x: 20,
    y: 15,
    width: 150,
    height: 80,
    message: "Shed: store or retrieve tools?"
  },

  inventory: {
    maxSeeds: 3,       // max of each seed type player can carry
    barHeight: 50,     // height of inventory bar at bottom of canvas
    barPadding: 10,    // left padding inside bar
    iconSize: 30,      // size of each icon in inventory
    iconSpacing: 32    // spacing between icons
  },

  seeds: [
    { id: "tomato",    label: "Tomato" },
    { id: "sunflower", label: "Sunflower" },
    { id: "carrot",    label: "Carrot" }
  ],

  // ─── ENVIRONMENT LAYOUT ───────────────────────────────────────────

  environment: {

    // Grass area colour
    grassColor: "#2d6e35",

    // Back fence (top of canvas) - wooden picket
    backFence: {
      y: 30,               // y position of fence top
      height: 22,          // fence height
      postWidth: 8,        // width of each picket
      postSpacing: 18,     // spacing between picket centres
      color: "#c8a96e",    // warm wood colour
      shadowColor: "#8a6d3e",
      capColor: "#e0c48a"
    },

    // Gate (