/*************************
 * GATITO - SHED
 * Handles the store / retrieve tool menu for the shed.
 *************************/

function showShedMenu() {
  const options = [
    { id: 'store',    label: 'Store' },
    { id: 'retrieve', label: 'Retrieve' }
  ];

  showChoices(shed.message, options, (choiceId) => {

    if (choiceId === 'store') {
      const currentTool = inventory.wateringCan ? 'wateringCan' : (inventory.shovel ? 'shovel' : null);

      if (!currentTool) {
        showChoices('Nothing to store', [{ id: 'back', label: 'Back' }], (id) => {
          if (id === 'back') showShedMenu();
          else pendingPickup = null;
        });
      } else {
        const toolName = currentTool === 'wateringCan' ? 'Watering Can' : 'Shovel';
        showChoices(`Store ${toolName}?`, [{ id: 'confirm', label: 'Yes' }], (id) => {
          if (id === 'confirm') {
            shed.tools[currentTool]  = true;
            inventory.wateringCan    = false;
            inventory.shovel         = false;
            refreshPlayerSprite();
            showChoices(`${toolName} stored in shed!`, [], () => {
              pendingPickup = null;
            });
          }
        });
      }

    } else if (choiceId === 'retrieve') {
      const storedTools = [];
      if (shed.tools.wateringCan) storedTools.push({ id: 'wateringCan', label: 'Watering Can' });
      if (shed.tools.shovel)      storedTools.push({ id: 'shovel',      label: 'Shovel' });

      if (storedTools.length === 0) {
        showChoices('Nothing is in the shed', [{ id: 'back', label: 'Back' }], (id) => {
          if (id === 'back') showShedMenu();
          else pendingPickup = null;
        });
      } else {
        showChoices('Which tool to retrieve?', storedTools, (toolId) => {
          const currentTool = inventory.wateringCan ? 'wateringCan' : (inventory.shovel ? 'shovel' : null);

          // If carrying a tool, swap it into the shed
          if (currentTool) {
            shed.tools[currentTool] = true;
            inventory.wateringCan   = false;
            inventory.shovel        = false;
          }

          // Equip the retrieved tool
          shed.tools[toolId] = false;
          if (toolId === 'wateringCan') inventory.wateringCan = true;
          else if (toolId === 'shovel') inventory.shovel      = true;

          refreshPlayerSprite();
          pendingPickup = null;
        });
      }
    }
  });
}
