/*************************
 * GATITO - PLAYER
 * Player object and movement update.
 *************************/
const player = {
  x:       CONFIG.player.startX,
  y:       CONFIG.player.startY,
  width:   CONFIG.player.width,
  height:  CONFIG.player.height,
  speed:   CONFIG.player.speed,
  targetX: CONFIG.player.startX,
  targetY: CONFIG.player.startY,
  image:   null  // set by loader after images are ready
};

/**
 * Move player toward their target position each frame.
 * Prevents walking through the shed unless targeting it.
 */
function updatePlayer() {
  const dx   = player.targetX - player.x;
  const dy   = player.targetY - player.y;
  const dist = Math.hypot(dx, dy);

  if (dist > 1) {
    const stepX   = (dx / dist) * player.speed;
    const stepY   = (dy / dist) * player.speed;
    const nextPos = {
      x: player.x + stepX,
      y: player.y + stepY,
      width:  player.width,
      height: player.height
    };

    // Allow walking into shed only when targeting it for interaction
    const allowShedCollision = pendingPickup && pendingPickup.type === 'shed';
    if (!isColliding(nextPos, shed) || allowShedCollision) {
      player.x = nextPos.x;
      player.y = nextPos.y;
    }
  }
}

/**
 * Update the player sprite to match what they're carrying.
 */
function refreshPlayerSprite() {
  if (inventory.wateringCan) {
    player.image = images.playerCan;
  } else if (inventory.shovel) {
    player.image = images.playerShovel;
  } else {
    player.image = images.player;
  }
}
