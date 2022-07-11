import { CastlingInfo } from "@/models/castling.info.model";
import { FigureInfo } from "@/models/figure.info.model";
import { PositionInfo } from "@/models/position.info.model";
import checkIndex from "./check.idex";
import checkIfKingCanGoToField from "./check.if.king.can.go.to.field";

export default function kingPossibleSteps(
    stepInfo: PositionInfo,
    rowIndex: number,
    columnIndex: number,
    desk: Array<PositionInfo[]>,
    isWhiteGetCheck: boolean,
    isBlackGetCheck: boolean,
    castlingStepsWhite: CastlingInfo[],
    castlingStepsBlack: CastlingInfo[],
    stepsToBeatBlack: Set<string>,
    stepsToBeatWhite: Set<string>
): FigureInfo {
    const possibleGoSteps: string[] = [];
    const possibleBeatSteps: string[] = [];
    const currentBeatSteps: string[] = [];
    const operators: number[] = [-1, 1, 0];
    const directions: string[] = ["up", "current", "down"];
    if (!stepInfo.numOfSteps) {
        const findRookOperators: number[] = [-1, 1];
        findRookOperators.forEach((operator) => {
            let columnIndexRook = columnIndex + 1 * operator;
            while (checkIndex(columnIndexRook)) {
                const position = desk[rowIndex][columnIndexRook];
                if (position.figure && stepInfo.figure) {
                    if (
                        position.figure[0] === stepInfo.figure[0] &&
                        position.figure[1] === "r" &&
                        position.numOfSteps === 0 &&
                        ((position.figure[0] === "w" && !isWhiteGetCheck) ||
                            (position.figure[0] === "b" && !isBlackGetCheck)) &&
                        checkIfKingCanGoToField(
                            stepInfo.figure[0],
                            desk[rowIndex][columnIndex + 1 * operator].field,
                            stepsToBeatWhite, stepsToBeatBlack
                        )
                    ) {
                        const kingNewCoordinates =
                            desk[rowIndex][columnIndex + 2 * operator].field;
                        possibleGoSteps.push(kingNewCoordinates);
                        const castlingInfo = {
                            rookRowIndex: rowIndex,
                            previousRookColumnIndex: columnIndexRook,
                            nextRookColumnIndex: columnIndex + 1 * operator,
                            kingNewCoordinates,
                        };
                        if (position.figure[0] === "w") {
                            castlingStepsWhite.push(castlingInfo);
                        } else {
                            castlingStepsBlack.push(castlingInfo);
                        }
                    } else {
                        break;
                    }
                }
                columnIndexRook = columnIndexRook + 1 * operator;
            }
        });
    }
    directions.forEach((direction) => {
        operators.forEach((operator) => {
            let nextRowIndex;
            const nextColumnIndex = columnIndex + 1 * operator;
            if (direction === "up") {
                nextRowIndex = rowIndex + 1;
            } else if (direction === "current") {
                nextRowIndex = rowIndex;
            } else {
                nextRowIndex = rowIndex - 1;
            }
            if (
                checkIndex(nextRowIndex) &&
                checkIndex(nextColumnIndex) &&
                !(direction === "current" && operator === 0)
            ) {
                const element = desk[nextRowIndex][nextColumnIndex];
                const color = stepInfo.figure ? stepInfo.figure[0] : "";
                if (!element.figure) {
                    if (checkIfKingCanGoToField(color, element.field, stepsToBeatWhite, stepsToBeatBlack)) {
                        possibleGoSteps.push(element.field);
                    }
                    currentBeatSteps.push(element.field);
                } else if (
                    element.figure &&
                    stepInfo.figure &&
                    element.figure[0] !== stepInfo.figure[0] &&
                    checkIfKingCanGoToField(color, element.field, stepsToBeatWhite, stepsToBeatBlack)
                ) {
                    if (checkIfKingCanGoToField(color, element.field, stepsToBeatWhite, stepsToBeatBlack)) {
                        possibleBeatSteps.push(element.field);
                    }
                    currentBeatSteps.push(element.field);
                }
            }
        });
    });
    return {
        possibleGoSteps,
        possibleBeatSteps,
        stepInfo,
        currentBeatSteps,
        pathToKing: [],
    };
}