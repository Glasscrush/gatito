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
    startX: 300,
    startY: 200,
    width: 60,
    height: 60,
    speed: 3
  },

  item: {
    x: 300,
    y: 200,
    width: 30,
    height: 30,
    message: "Oh look a watering can! Pick up?"
  },

  shovel: {
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
    y: 10,
    width: 150,
    height: 80,
    message: "Shed: store or retrieve tools?"
  },

  inventory: {
    maxSeeds: 3,
    barHeight: 50,
    barPadding: 10,
    iconSize: 30,
    iconSpacing: 32
  },

  seeds: [
    { id: "tomato",    label: "Tomato" },
    { id: "sunflower", label: "Sunflower" },
    { id: "carrot",    label: "Carrot" }
  ],

  // ─── ENVIRONMENT LAYOUT ───────────────────────────────────────────

  environment: {

    grassColor: "#2d6e35",

    // Back fence (top of canvas) - wooden picket
    backFence: {
      y: 18,
      height: 14,
      postWidth: 8,
      postSpacing: 18,
      color: "#c8a96e",
      shadowColor: "#8a6d3e",
      capColor: "#e0c48a"
    },

    // Gate (centre of back fence)
    gate: {
      width: 50,
      color: "#b8954e",
      postColor: "#7a5c2e",
      openColor: "#1a5c24"
    },

    // Side fences (left and right)
    sideFence: {
      postWidth: 8,
      postSpacing: 20,
      color: "#c8a96e",
      shadowColor: "#8a6d3e",
      yStart: 18,
      yEnd: 400
    },

    // Patio + house edge (bottom of canvas)
    patio: {
      // Central patio slab
      slabX: 220,
   