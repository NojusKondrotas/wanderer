export function writeMessages(...messages: string[]) {
    console.log(...messages);
}

export function logMessage(message) {
    window.wandererAPI.logMessage(message);
}