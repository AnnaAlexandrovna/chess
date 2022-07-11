export default function getStartPosition(
    row: string,
    column: string
): string | null {
    let position = null;
    if (row === "1" || row === "2" || row === "7" || row === "8") {
        let color = "b";
        if (row === "8" || row === "7") {
            color = "w";
        }
        let figure = "p";
        if (row === "1" || row === "8") {
            if (column === "A" || column === "H") {
                figure = "r";
            } else if (column === "B" || column === "G") {
                figure = "n";
            } else if (column === "C" || column === "F") {
                figure = "b";
            } else if (column === "D") {
                figure = "q";
            } else if (column === "E") {
                figure = "k";
            }
        }
        position = `${color}${figure}`;
    }
    return position;
}
