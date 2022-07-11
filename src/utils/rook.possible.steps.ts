import { FigureInfo } from "@/models/figure.info.model";
import { PositionInfo } from "@/models/position.info.model";
import checkIndex from "./check.idex";

export default function rookPossibleSteps(
    stepInfo: PositionInfo,
    rowIndex: number,
    columnIndex: number,
    desk: Array<PositionInfo[]>
): FigureInfo {
    const possibleGoSteps: string[] = [];
    const possibleBeatSteps: string[] = [];
    const directions: string[] = ["row", "column"];
    const operators: number[] = [-1, 1];
    const pathToKing: string[] = [];
    directions.forEach((direction) => {
        operators.forEach((operator) => {
            let nextStep;
            if (direction === "row") {
                nextStep = rowIndex + 1 * operator;
            } else {
                nextStep = columnIndex + 1 * operator;
            }
            while (
                checkIndex(nextStep) &&
                ((direction === "row" && !desk[nextStep][columnIndex].figure) ||
                    (direction === "column" && !desk[rowIndex][nextStep].figure))
            ) {
                if (direction === "row") {
                    possibleGoSteps.push(desk[nextStep][columnIndex].field);
                } else {
                    possibleGoSteps.push(desk[rowIndex][nextStep].field);
                }
                nextStep = nextStep + 1 * operator;
            }
            if (checkIndex(nextStep)) {
                let stopValue;
                if (direction === "row") {
                    stopValue = desk[nextStep][columnIndex];
                } else {
                    stopValue = desk[rowIndex][nextStep];
                }
                if (
                    stopValue.figure &&
                    stepInfo.figure &&
                    stopValue.figure[0] !== stepInfo.figure[0]
                ) {
                    possibleBeatSteps.push(stopValue.field);
                    if (stopValue.figure[1] === "k") {
                        let prevStep = nextStep - 1 * operator;
                        let value;
                        while (
                            (direction === "row" && rowIndex !== prevStep) ||
                            (direction === "column" && columnIndex !== prevStep)
                        ) {
                            if (direction === "row") {
                                value = desk[prevStep][columnIndex];
                            } else {
                                value = desk[rowIndex][prevStep];
                            }
                            pathToKing.push(value.field);
                            prevStep = prevStep - 1 * operator;
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