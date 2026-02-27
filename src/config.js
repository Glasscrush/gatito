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
