/*************************
 * GATITO - LOADER
 * Loads all game images.
 * Calls startGame() when every image is ready.
 *************************/
const images = {};
let imagesLoaded = 0;
const totalImages = Object.keys(CONFIG.assets).length; // auto-counts from config

function imageLoaded() {
  imagesLoaded++;
  if (imagesLoaded === totalImages) {
    // All images ready — set up objects that need image refs, then start
    player.image  = images.player;
    table.image   = images.table;
    startGame();
  }
}

function loadImages() {
  for (const [key, src] of Object.entries(CONFIG.assets)) {
    images[key] = new Image();
    images[key].src = src;
    images[key].onload = imageLoaded;
  }
}

// Seed sprite lookup (used by inventory and dropped items)
function getSeedSprite(seedId) {
  const map = {
    tomato:    images.seedTomato,
    sunflower: images.seedSunflower,
    carrot:    images.seedCarrot
  };
  return map[seedId] || null;
}
