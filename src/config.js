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
      y: 18,               // y position of fence top
      height: 14,          // fence height (shorter)
      postWidth: 8,        // width of each picket
      postSpacing: 18,     // spacing between picket centres
      color: "#c8a96e",    // warm wood colour
      shadowColor: "#8a6d3e",
      capColor: "#e0c48a"
    },

    // Gate (centre of back fence)
    gate: {
      width: 50,
      color: "#b8954e",
      postColor: "#7a5c2e",
      openColor: "#1a5c24" // gap colour (looks like outside/beyond)
    },

    // Side fences (left and right)
    sideFence: {
      postWidth: 8,
      postSpacing: 20,
      color: "#c8a96e",
      shadowColor: "#8a6d3e",
      yStart: 18,          // top (meets back fence)
      yEnd: 310            // bottom (above patio)
    },

    // Patio + house edge (bottom of canvas)
    patio: {
      // Central patio slab
      slabX: 220,
      slabY: 310,
      slabWidth: 160,
      slabHeight: 40,
      slabColor: "#a89070",
      slabBorderColor: "#7a6548",
      tileLineColor: "#9a7d5a",

      // House wall edge — partial lines either side of patio
      wallY: 348,
      wallHeight: 10,
      wallColor: "#c8b090",
      wallBorderColor: "#8a6d48",
      wallLeftX: 8,
      wallRightX: 592,

      // Roof tiles (below wall, fills bottom of canvas)
      roofY: 358,
      roofColor: "#c0522a",
      roofShadowColor: "#8a3318",
      roofHighlight: "#d46940",
      tileWidth: 40,
      tileHeight: 14,
      tileOverlap: 4
    }
  },

  assets: {
    player:         "assets/player/Gatito_sprite.png",
    playerCan:      "assets/player/Gatito_sprite_Can.png",
    playerShovel:   "assets/player/Gatito_sprite_shovel.png",
    wateringCan:    "assets/items/watering_can.png",
    shovel:         "assets/items/shovel.png",
    table:          "assets/environment/table.png",
    tableSeedless:  "assets/environment/table_seedless.png",
    shed:           "assets/environment/shed.png",
    seedTomato:     "assets/items/seeds/seed_tomato.png",
    seedSunflower:  "assets/items/seeds/seed_sunflower.png",
    seedCarrot:     "assets/items/seeds/seed_carrot.png"
  }

};
