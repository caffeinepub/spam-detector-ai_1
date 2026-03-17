import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface SpamResult {
    reasons: Array<string>;
    snippet: string;
    isSpam: boolean;
    score: bigint;
    timestamp: bigint;
    confidence: number;
}
export interface HistoryEntry {
    id: bigint;
    snippet: string;
    isSpam: boolean;
    timestamp: bigint;
    confidence: number;
}
export interface backendInterface {
    analyzeMessage(text: string): Promise<SpamResult>;
    clearHistory(): Promise<void>;
    getHistory(): Promise<Array<HistoryEntry>>;
}
