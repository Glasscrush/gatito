/*************************
 * GATITO - POPUP
 * Handles all in-game dialog popups and choice buttons.
 *************************/
const popup     = document.getElementById("popup");
const popupText = document.getElementById("popupText");
const choicesDiv = document.getElementById("choices");

let popupActive   = false;
let popupCallback = null;

/**
 * Show a popup with a message and choice buttons.
 * @param {string}   message   - Text shown in the popup
 * @param {Array}    options   - Array of { id, label } button objects
 * @param {Function} onChoose  - Callback called with the chosen id
 * @param {boolean}  keepOpen  - If true, popup stays open after a choice (for multi-pick)
 */
function showChoices(message, options, onChoose, keepOpen = false) {
  popupText.textContent = message;
  choicesDiv.innerHTML  = "";
  popupCallback         = onChoose;

  options.forEach(option => {
    const btn = document.createElement("button");
    btn.textContent = option.label;
    btn.onclick = () => {
      if (!keepOpen) {
        closePopup();
      }
      onChoose(option.id);
    };
    choicesDiv.appendChild(btn);
  });

  // Always add a Cancel button
  const cancelBtn = document.createElement("button");
  cancelBtn.textContent = "Cancel";
  cancelBtn.onclick = closePopup;
  choicesDiv.appendChild(cancelBtn);

  popup.classList.remove("hidden");
  popupActive = true;
}

function closePopup() {
  popupActive = false;
  popup.classList.add("hidden");
}
