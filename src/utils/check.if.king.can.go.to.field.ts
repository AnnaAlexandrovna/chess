export default function checkIfKingCanGoToField(
    color: string,
    field: string,
    stepsToBeatWhite: Set<string>,
    stepsToBeatBlack: Set<string>): boolean {
    if (color === "w" && !stepsToBeatBlack.has(field)) {
        return true;
    } else if (color === "b" && !stepsToBeatWhite.has(field)) {
        return true;
    } else {
        return false;
    }
}