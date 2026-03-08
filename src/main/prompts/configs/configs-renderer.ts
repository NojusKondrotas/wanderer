import "../../../runtime/logger.js"
import "../../../runtime/error-handler.js"
import "../../../runtime/numerics.js"
import "../../../runtime/states-handler.js"
import "../../../runtime/layout.js"
import "../../../ui/titlebars/titlebar.js"
import "../../../ui/titlebars/whiteboard/lock.js"
import "../../../ui/context-menus/handler-context-menu.js"
import "../../../instantiable-components/component-handler.js"
import "../../../instantiable-components/path.js"
import "../../../ui/keybinds.js"
import "../../../ui/zoom-whiteboard.js"
import "../../../ui/positioning/mouse-drag-calc.js"
import "../../../ui/positioning/window-positioning.js"
import "../../../ui/positioning/whiteboard-positioning.js"
import "../../../ui/configs-menu/configs.js"

import { displayConfigs, initConfigsContainer, } from "../../../ui/configs-menu/configs.js";
import { initTitlebar } from "../../../ui/titlebars/titlebar.js";
import { initWhiteboardMovement } from "../../../utils/whiteboard-movement.js"
import { AppStates } from "../../../runtime/states-handler.js"

initTitlebar();

function closeWindow(){
    window.wandererAPI.closeWindow()
}

window.wandererAPI.onSaveComponent(async () => {
    window.wandererAPI.saveComponentDone();
});

(async () => {
    AppStates.isPromptConfigs = true;

    const center = await window.wandererAPI.getWindowCenter();
    initConfigsContainer();
    displayConfigs(center.x, center.y);

    initWhiteboardMovement();
})();