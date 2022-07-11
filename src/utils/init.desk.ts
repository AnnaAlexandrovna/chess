import { PositionInfo } from "@/models/position.info.model";
import getStartPosition from "./get.start.position";

export default function initDesk(rows: string[], columns: string[], desk: Array<PositionInfo[]>) {
    for (let i = 0; i < rows.length; i++) {
        desk.push([]);
        for (let j = 0; j < columns.length; j++) {
            desk[i].push({
                field: `${columns[j]}${rows[i]}`,
                figure: getStartPosition(rows[i], columns[j]),
                numOfSteps: getStartPosition(rows[i], columns[j])
                    ? 0
                    : null,
            });
        }
    }
}