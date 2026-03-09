import "../../../runtime/logger.js"
import "../../../runtime/error-handler.js"
import "../../../runtime/numerics.js"
import "../../../runtime/states-handler.js"
import "../../../runtime/layout.js"
import "../../../ui/titlebars/titlebar.js"
import "../../../ui/titlebars/lock.js"
import "../../../ui/context-menus/handler-context-menu.js"
import "../../../instantiable-components/component-handler.js"
import "../../../instantiable-components/path.js"
import "../../../ui/keybinds.js"
import "../../../ui/zoom-whiteboard.js"
import "../../../ui/positioning/mouse-drag-calc.js"
import "../../../ui/positioning/window-positioning.js"
import "../../../ui/positioning/whiteboard-positioning.js"
import "../../../ui/configs-menu/configs.js"

import { cfgacm, cfgfcm, cfgicm, cfgncm, cfgpcm, cfgwcm, displayConfigs, initConfigsContainer, registerConfigsFunctionalCM, registerConfigsInternalCM, registerConfigsNoteCM, registerConfigsNotepadCM, registerConfigsPathCM, registerConfigsWhiteboardCM, } from "../../../ui/configs-menu/configs.js";
import { initTitlebar } from "../../../ui/titlebars/titlebar.js";
import { initWhiteboardMovement } from "../../../utils/whiteboard-movement.js"
import { AppStates } from "../../../runtime/states-handler.js"
import { initWindowZoom } from "../../../utils/window-zoom.js"
import { Vector2D } from "../../../runtime/vector-2d.js"

initTitlebar();

window.wandererAPI.onSaveComponent(async () => {
    window.wandererAPI.saveComponentDone();
});

(async () => {
    AppStates.isPromptConfigs = true;

    initWhiteboardMovement();
    initTitlebar();
    initWindowZoom();

    const center = await window.wandererAPI.getWindowCenter();
    initConfigsContainer();

    registerConfigsFunctionalCM(cfgfcm);
    registerConfigsNoteCM(cfgncm);
    registerConfigsWhiteboardCM(cfgwcm);
    registerConfigsNotepadCM(cfgpcm);
    registerConfigsPathCM(cfgacm);
    registerConfigsInternalCM(cfgicm);

    displayConfigs(new Vector2D(center.x, center.y));
})();