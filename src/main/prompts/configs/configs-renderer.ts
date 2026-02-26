import { displayConfigs } from "../../../ui/configs-menu/configs.js";
import { initTitlebar } from "../../../ui/titlebars/titlebar.js";

initTitlebar();

function closeWindow(){
    window.wandererAPI.closeWindow()
}

window.wandererAPI.onSaveComponent(async () => {
    window.wandererAPI.saveComponentDone();
});

(async () => {
    const center = await window.wandererAPI.getWindowCenter();
    displayConfigs(center.x, center.y);
})();