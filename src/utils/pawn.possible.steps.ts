import { FigureInfo } from "@/models/figure.info.model";
import { PositionInfo } from "@/models/position.info.model";
import checkIndex from "./check.idex";

export default function pawnPossibleSteps(
    stepInfo: PositionInfo,
    rowIndex: number,
    columnIndex: number,
    desk: Array<PositionInfo[]>
): FigureInfo {
    const possibleGoSteps: string[] = [];
    const possibleBeatSteps: string[] = [];
    const currentBeatSteps: string[] = [];
    let operator = -1;
    if (stepInfo.figure === "bp") {
        operator = 1;
    }
    if (stepInfo.numOfSteps !== null && stepInfo.numOfSteps >= 0) {
        const possibleRowIndex = rowIndex + 1 * operator;
        if (checkIndex(possibleRowIndex)) {
            const position = desk[possibleRowIndex][columnIndex];
            if (!position.figure) {
                possibleGoSteps.push(position.field);
            }
        }
    }
    if (stepInfo.numOfSteps === 0) {
        const position = desk[rowIndex + 2 * operator][columnIndex];
        if (!position.figure) {
            possibleGoSteps.push(position.field);
        }
    }
    const possibleRowIndexForBeat = rowIndex + 1 * operator;
    if (checkIndex(possibleRowIndexForBeat)) {
        const positionColumnIndexForBeat = [columnIndex - 1, columnIndex + 1];
        positionColumnIndexForBeat.forEach((columnIndex) => {
            if (checkIndex(columnIndex)) {
                const positionForBeat: PositionInfo =
                    desk[possibleRowIndexForBeat][columnIndex];
                if (
                    positionForBeat.figure &&
                    stepInfo.figure &&
                    positionForBeat.figure[0] !== stepInfo.figure[0]
                ) {
                    possibleBeatSteps.push(positionForBeat.field);
                } else if (!positionForBeat.figure) {
                    currentBeatSteps.push(positionForBeat.field);
                }
            }
        });
    }
    return {
        possibleGoSteps,
        possibleBeatSteps,
        stepInfo,
        currentBeatSteps,
        pathToKing: [],
    };
}