import { TokenData } from "./types";

export function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}