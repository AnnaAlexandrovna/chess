import { FigureInfo } from "@/models/figure.info.model";
import { PositionInfo } from "@/models/position.info.model";
import checkIndex from "./check.idex";

export default function bishopPossibleSteps(
    stepInfo: PositionInfo,
    rowIndex: number,
    columnIndex: number,
    desk: Array<PositionInfo[]>
): FigureInfo {
    const possibleGoSteps: string[] = [];
    const possibleBeatSteps: string[] = [];
    const directions: string[] = ["left", "right"];
    const operators: number[] = [-1, 1];
    const pathToKing: string[] = [];
    directions.forEach((direction) => {
        operators.forEach((operator) => {
            let nextStepRow;
            let nextStepColumn;
            if (direction === "left") {
                nextStepColumn = columnIndex - 1;
            } else {
                nextStepColumn = columnIndex + 1;
            }
            nextStepRow = rowIndex + 1 * operator;
            while (
                checkIndex(nextStepRow) &&
                checkIndex(nextStepColumn) &&
                !desk[nextStepRow][nextStepColumn].figure
            ) {
                possibleGoSteps.push(desk[nextStepRow][nextStepColumn].field);
                if (direction === "left") {
                    nextStepColumn = nextStepColumn - 1;
                } else {
                    nextStepColumn = nextStepColumn + 1;
                }
                nextStepRow = nextStepRow + 1 * operator;
            }
            if (checkIndex(nextStepRow) && checkIndex(nextStepColumn)) {
                const stopValue = desk[nextStepRow][nextStepColumn];
                if (
                    stopValue.figure &&
                    stepInfo.figure &&
                    stopValue.figure[0] !== stepInfo.figure[0]
                ) {
                    possibleBeatSteps.push(stopValue.field);
                    if (stopValue.figure[1] === "k") {
                        let prevStepRow = nextStepRow - 1 * operator;
                        let prevStepColumn;
                        if (direction === "left") {
                            prevStepColumn = nextStepColumn + 1;
                        } else {
                            prevStepColumn = nextStepColumn - 1;
                        }
                        let value;
                        while (rowIndex !== prevStepRow) {
                            value = desk[prevStepRow][prevStepColumn];
                            pathToKing.push(value.field);
                            prevStepRow = prevStepRow - 1 * operator;
                            if (direction === "left") {
                                prevStepColumn = prevStepColumn + 1;
                            } else {
                                prevStepColumn = prevStepColumn - 1;
                            }
                        }
                    }
                }
            }
        });
    });
    return {
        possibleGoSteps,
        possibleBeatSteps,
        stepInfo,
        currentBeatSteps: possibleGoSteps.concat(possibleBeatSteps),
        pathToKing,
    };
}