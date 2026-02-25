import type { WandererAPI } from './types/wanderer-api.js'

export {}
declare global {
    interface Window {
        wandererAPI: WandererAPI
    }
}