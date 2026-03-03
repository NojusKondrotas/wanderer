export let isWindowClosing = false;
export const setIsWindowClosing = (flag: boolean) => isWindowClosing = flag;

export function closeWindow() {
    isWindowClosing = true;
    window.wandererAPI.closeWindow();
}