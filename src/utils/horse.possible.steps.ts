import { FigureInfo } from "@/models/figure.info.model";
import { PositionInfo } from "@/models/position.info.model";
import checkIndex from "./check.idex";

export default function horsePossibleSteps(
    stepInfo: PositionInfo,
    rowIndex: number,
    columnIndex: number,
    desk: Array<PositionInfo[]>
): FigureInfo {
    const possibleGoSteps: string[] = [];
    const possibleBeatSteps: string[] = [];
    let twoFieldsStep: number;
    let oneFieldSteps: number[];
    const operators = [-1, 1];
    const directions = ["row", "column"];
    directions.forEach((direction) => {
        operators.forEach((operator) => {
            if (direction === "row") {
                twoFieldsStep = rowIndex + 2 * operator;
                oneFieldSteps = [columnIndex + 1, columnIndex - 1];
            } else {
                twoFieldsStep = columnIndex + 2 * operator;
                oneFieldSteps = [rowIndex + 1, rowIndex - 1];
            }
            oneFieldSteps.forEach((oneFieldStep) => {
                if (checkIndex(twoFieldsStep)) {
                    if (checkIndex(oneFieldStep)) {
                        let possiblePosition: PositionInfo;
                        if (direction === "row") {
                            possiblePosition = desk[twoFieldsStep][oneFieldStep];
                        } else {
                            possiblePosition = desk[oneFieldStep][twoFieldsStep];
                        }
                        if (!possiblePosition.figure) {
                            possibleGoSteps.push(possiblePosition.field);
                        } else if (
                            stepInfo.figure &&
                            possiblePosition.figure[0] != stepInfo.figure[0]
                        ) {
                            possibleBeatSteps.push(possiblePosition.field);
                        }
                    }
                }
            });
        });
    });
    return {
        possibleGoSteps,
        possibleBeatSteps,
        stepInfo,
        currentBeatSteps: possibleGoSteps.concat(possibleBeatSteps),
        pathToKing: [],
    };
}