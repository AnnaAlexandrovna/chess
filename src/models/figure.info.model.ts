import { PositionInfo } from "./position.info.model";

export interface FigureInfo {
    possibleGoSteps: string[];
    possibleBeatSteps: string[];
    stepInfo: PositionInfo;
    currentBeatSteps: string[];
    pathToKing: string[];
}