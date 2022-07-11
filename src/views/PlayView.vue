<template>
  <div class="page-container">
    <div class="history-container">
      <div class="margin-text">История ходов белых</div>
      <div v-for="step in whiteSteps" :key="step">{{ step }}</div>
    </div>
    <div>
      <div class="player-info">
        <img src="@/assets/images/bplayer.svg" class="player-logo" />
        <span class="margin-right-elements">{{
          firstPlayerColor === "black" ? firstPlayerName : secondPlayerName
        }}</span>
        <div>
          <span ref="bminutes">{{
            firstPlayerColor === "black"
              ? formatTime(parseInt(`${this.firstPlayerTime / 60}`))
              : formatTime(parseInt(`${this.secondPlayerTime / 60}`))
          }}</span
          >:<span ref="bseconds">{{
            firstPlayerColor === "black"
              ? this.formatTime(firstPlayerTime % 60)
              : this.formatTime(secondPlayerTime % 60)
          }}</span>
        </div>
        <span v-show="isBlackGetCheck">Шаx</span>
        <div
          v-for="(figure, index) in beatenFigures"
          :key="`${index}${figure}`"
          class="beaten-figures-container"
        >
          <img
            v-show="figure[0] === 'w'"
            :src="require(`@/assets/images/${figure}.png`)"
            class="beaten-figures"
          />
        </div>
      </div>
      <div class="desk">
        <div v-for="(row, rowIndex) in rows" class="row" :key="row">
          <div
            class="cell"
            v-for="(column, columnIndex) in columns"
            :key="`${column}${row}`"
            :id="`${column}${row}`"
            :style="getStyleByRowId(rowIndex, columnIndex)"
            @click="onClickToRow(rowIndex, columnIndex)"
            :ref="`${column}${row}`"
            @mouseover="mouseOver(rowIndex, columnIndex)"
            @mouseout="mouseOut(rowIndex, columnIndex)"
          >
            <div v-show="column === 'A'">{{ row }}</div>
            <div class="column-name" v-show="row === '8'">
              {{ column }}
            </div>
          </div>
        </div>
      </div>
      <div class="player-info">
        <img src="@/assets/images/wplayer.svg" class="player-logo" />
        <span class="margin-right-elements">{{
          firstPlayerColor === "white" ? firstPlayerName : secondPlayerName
        }}</span>
        <div class="margin-right-elements">
          <span ref="wminutes">{{
            firstPlayerColor === "white"
              ? formatTime(parseInt(`${this.firstPlayerTime / 60}`))
              : formatTime(parseInt(`${this.secondPlayerTime / 60}`))
          }}</span
          >:<span ref="wseconds">{{
            firstPlayerColor === "white"
              ? this.formatTime(firstPlayerTime % 60)
              : this.formatTime(secondPlayerTime % 60)
          }}</span>
        </div>
        <span v-show="isWhiteGetCheck">Шаx</span>
        <div
          v-for="(figure, index) in beatenFigures"
          :key="`${index}${figure}`"
        >
          <img
            v-show="figure[0] === 'b'"
            :src="require(`@/assets/images/${figure}.png`)"
            class="beaten-figures"
          />
        </div>
      </div>
    </div>
    <div class="history-container">
      <div class="margin-text">История ходов черных</div>
      <div v-for="step in blackSteps" :key="step">{{ step }}</div>
    </div>
    <div
      v-show="
        isWhiteGetCheckAndMat ||
        isBlackGetCheckAndMat ||
        isWhiteTimeEnds ||
        isBlackTimeEnds ||
        isPat
      "
      class="modal"
    >
      <div class="modal-content">
        <div class="margin-text">Результат</div>
        <div class="margin-text" v-show="isWhiteGetCheckAndMat">Мат белым</div>
        <div class="margin-text" v-show="isBlackGetCheckAndMat">Мат черным</div>
        <div class="margin-text" v-show="isWhiteTimeEnds">
          Время белых истекло. Черные победили.
        </div>
        <div class="margin-text" v-show="isBlackTimeEnds">
          Время черных истекло. Белые победили.
        </div>
        <div class="margin-text" v-show="isPat">Пат</div>
        <button @click="onOkButtonClick()">Ок</button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import router from "@/router";
import { PositionInfo } from "@/models/position.info.model";
import { CastlingInfo } from "@/models/castling.info.model";
import { CheckInfo } from "@/models/check.info.model";
import pawnPossibleSteps from "@/utils/pawn.possible.steps";
import rookPossibleSteps from "@/utils/rook.possible.steps";
import horsePossibleSteps from "@/utils/horse.possible.steps";
import bishopPossibleSteps from "@/utils/bishop.possible.steps";
import kingPossibleSteps from "@/utils/king.possible.steps";
import initDesk from "@/utils/init.desk";

@Options({
  created() {
    this.firstPlayerName = localStorage.getItem("firstPlayerName");
    this.firstPlayerColor = localStorage.getItem("firstPlayerColor");
    const firstPlayerTime = localStorage.getItem("firstPlayerTime");
    if (firstPlayerTime) {
      this.firstPlayerTime = parseInt(firstPlayerTime, 10) * 60;
    }
    this.secondPlayerColor = localStorage.getItem("secondPlayerColor");
    this.secondPlayerName = localStorage.getItem("secondPlayerName");
    const secondPlayerTime = localStorage.getItem("secondPlayerTime");
    if (secondPlayerTime) {
      this.secondPlayerTime = parseInt(secondPlayerTime, 10) * 60;
    }
    initDesk(this.rows, this.columns, this.desk);
    this.calculateStepForBeat();
  },
  mounted() {
    this.interval = setInterval(() => this.setTimer(), 1000);
  },
  unmounted() {
    clearInterval(this.interval);
  },
})
export default class PlayView extends Vue {
  public firstPlayerName = "";
  public secondPlayerName = "";
  public firstPlayerColor = "white";
  public secondPlayerColor = "black";
  public firstPlayerTime: number | null = null;
  public secondPlayerTime: number | null = null;
  public columns = ["A", "B", "C", "D", "E", "F", "G", "H"];
  public rows = ["1", "2", "3", "4", "5", "6", "7", "8"];
  public desk: Array<PositionInfo[]> = [];
  private selectedFigure: PositionInfo | null = null;
  private possibleSteps: string[] = [];
  public whiteSteps: string[] = [];
  public blackSteps: string[] = [];
  public turn: "w" | "b" = "w";
  private stepsToBeatWhite: Set<string> = new Set();
  private stepsToBeatBlack: Set<string> = new Set();
  private stepsToGoWhite: Set<string> = new Set();
  private stepsToGoBlack: Set<string> = new Set();
  public isWhiteGetCheck = false;
  public isBlackGetCheck = false;
  public isWhiteGetCheckAndMat = false;
  public isBlackGetCheckAndMat = false;
  public isPat = false;
  private castlingStepsWhite: CastlingInfo[] = [];
  private castlingStepsBlack: CastlingInfo[] = [];
  private whiteKingPosition = "E8";
  private blackKingPosition = "E1";
  private blackCheckInfo: CheckInfo[] = [];
  private whiteCheckInfo: CheckInfo[] = [];
  public beatenFigures: string[] = [];
  private interval = 0;
  public isWhiteTimeEnds = false;
  public isBlackTimeEnds = false;

  getStyleByRowId(rowIndex: number, columnIndex: number) {
    const style = {
      "background-image": "none",
      "background-size": "cover",
    };
    const figure = this.desk[rowIndex][columnIndex].figure;
    if (figure) {
      style["background-image"] =
        "url(" + require(`@/assets/images/${figure}.png`) + ")";
    }
    return style;
  }

  onClickToRow(rowIndex: number, columnIndex: number) {
    if (
      !this.isBlackGetCheckAndMat &&
      !this.isWhiteGetCheckAndMat &&
      !this.isPat &&
      !this.isBlackTimeEnds &&
      !this.isWhiteTimeEnds
    ) {
      const stepInfo: PositionInfo = this.desk[rowIndex][columnIndex];
      if (this.possibleSteps.includes(stepInfo.field) && this.selectedFigure) {
        if (
          this.selectedFigure.figure &&
          this.selectedFigure.figure[0] === "w"
        ) {
          this.whiteSteps.push(`${this.selectedFigure.field} -
        ${stepInfo.field}`);
        } else {
          this.blackSteps.push(`${this.selectedFigure.field} -
        ${stepInfo.field}`);
        }
        const previousRowIndex = this.rows.indexOf(
          this.selectedFigure.field[1]
        );
        const previousColumnIndex = this.columns.indexOf(
          this.selectedFigure.field[0]
        );
        const previousPosition =
          this.desk[previousRowIndex][previousColumnIndex];
        if (previousPosition.numOfSteps !== null) {
          this.desk[rowIndex][columnIndex].numOfSteps =
            previousPosition.numOfSteps + 1;
        }
        const beatenFigure = this.desk[rowIndex][columnIndex].figure;
        if (beatenFigure) {
          this.beatenFigures.push(beatenFigure);
        }
        this.desk[rowIndex][columnIndex].figure = previousPosition.figure;
        this.desk[previousRowIndex][previousColumnIndex].numOfSteps = null;
        this.desk[previousRowIndex][previousColumnIndex].figure = null;
        if (
          ((this.turn === "w" && this.castlingStepsWhite.length) ||
            (this.turn === "b" && this.castlingStepsBlack.length)) &&
          stepInfo.figure &&
          stepInfo.figure[1] === "k"
        ) {
          const castlingInfoArray =
            this.turn === "w"
              ? this.castlingStepsWhite
              : this.castlingStepsBlack;
          castlingInfoArray.forEach((step) => {
            if (step.kingNewCoordinates === stepInfo.field) {
              this.desk[step.rookRowIndex][
                step.nextRookColumnIndex
              ].figure = `${this.turn}r`;
              this.desk[step.rookRowIndex][
                step.nextRookColumnIndex
              ].numOfSteps = 1;
              this.desk[step.rookRowIndex][
                step.previousRookColumnIndex
              ].figure = null;
              this.desk[step.rookRowIndex][
                step.previousRookColumnIndex
              ].numOfSteps = null;
            }
          });
        }
        this.cleanBoxShadow();
        this.selectedFigure = null;
        this.possibleSteps = [];
        if (this.turn === "w") {
          this.turn = "b";
        } else {
          this.turn = "w";
        }
        this.calculateStepForBeat();
        this.checkWin();
      } else {
        this.cleanBoxShadow();
        if (stepInfo.figure && stepInfo.figure[0] === this.turn) {
          let options = this.getFigureStepsInfo(
            stepInfo,
            rowIndex,
            columnIndex
          );
          if (options) {
            this.showPossibleStepInfo(
              options?.possibleGoSteps,
              options?.possibleBeatSteps,
              options?.stepInfo
            );
          }
        }
      }
    }
  }

  showPossibleStepInfo(
    possibleGoSteps: string[],
    possibleBeatSteps: string[],
    stepInfo: PositionInfo
  ) {
    possibleGoSteps.forEach((step) => {
      const element = (this.$refs[step] as HTMLElement[])[0];
      element.style.boxShadow = "inset 5em 5em 5em rgba(178, 222, 39, 0.4)";
    });
    possibleBeatSteps.forEach((step) => {
      const element = (this.$refs[step] as HTMLElement[])[0];
      element.style.boxShadow = "inset 5em 5em 5em rgba(207, 0, 15, 0.4)";
    });
    this.selectedFigure = stepInfo;
    this.possibleSteps = [
      ...this.possibleSteps,
      ...possibleGoSteps,
      ...possibleBeatSteps,
    ];
  }

  calculateStepForBeat() {
    this.castlingStepsWhite = [];
    this.castlingStepsBlack = [];
    this.whiteCheckInfo = [];
    this.blackCheckInfo = [];
    this.stepsToBeatBlack.clear();
    this.stepsToBeatWhite.clear();
    this.stepsToGoWhite.clear();
    this.stepsToGoBlack.clear();
    const turns = [];
    if (this.turn === "w") {
      turns.push("b");
      turns.push("w");
    } else {
      turns.push("w");
      turns.push("b");
    }
    turns.forEach((turn) => {
      this.desk.forEach((row, rowIndex) => {
        row.forEach((position, columnIndex) => {
          if (position.figure) {
            const stepsForBeat = [];
            const stepsToGo = [];
            if (position.figure[0] === turn) {
              const options = this.getFigureStepsInfo(
                position,
                rowIndex,
                columnIndex
              );
              if (options) {
                stepsForBeat.push(...options.currentBeatSteps);
                stepsToGo.push(...options.possibleGoSteps);
              }
              if (position.figure[0] === "w") {
                if (position.figure[1] === "k") {
                  this.whiteKingPosition = position.field;
                }
                stepsToGo.forEach((step) => this.stepsToGoWhite.add(step));
                stepsForBeat.forEach((step) => {
                  this.stepsToBeatWhite.add(step);
                  if (step === this.blackKingPosition) {
                    this.blackCheckInfo.push({
                      pathToKing: options?.pathToKing ?? [],
                      position: position.field,
                    });
                  }
                });
              } else {
                if (position.figure[1] === "k") {
                  this.blackKingPosition = position.field;
                }
                stepsToGo.forEach((step) => this.stepsToGoBlack.add(step));
                stepsForBeat.forEach((step) => {
                  this.stepsToBeatBlack.add(step);
                  if (step === this.whiteKingPosition) {
                    this.whiteCheckInfo.push({
                      pathToKing: options?.pathToKing ?? [],
                      position: position.field,
                    });
                  }
                });
              }
            }
          }
        });
      });
    });
  }

  checkWin() {
    if (this.stepsToBeatBlack.has(this.whiteKingPosition)) {
      this.isWhiteGetCheck = true;
    } else {
      this.isWhiteGetCheck = false;
    }
    if (this.isWhiteGetCheck && !this.stepsToGoWhite.size) {
      this.isWhiteGetCheckAndMat = true;
      clearInterval(this.interval);
    }
    if (this.stepsToBeatWhite.has(this.blackKingPosition)) {
      this.isBlackGetCheck = true;
    } else {
      this.isBlackGetCheck = false;
    }
    if (this.isBlackGetCheck && !this.stepsToGoBlack.size) {
      this.isBlackGetCheckAndMat = true;
      clearInterval(this.interval);
    }
    if (
      (!this.isBlackGetCheck && !this.stepsToGoBlack.size) ||
      (!this.isWhiteGetCheck && !this.stepsToGoWhite.size)
    ) {
      this.isPat = true;
      clearInterval(this.interval);
    }
  }

  getFigureStepsInfo(
    stepInfo: PositionInfo,
    rowIndex: number,
    columnIndex: number
  ) {
    const figure = stepInfo.figure ?? "";
    let options;
    if (figure[1] === "p") {
      options = pawnPossibleSteps(stepInfo, rowIndex, columnIndex, this.desk);
    } else if (figure[1] === "r") {
      options = rookPossibleSteps(stepInfo, rowIndex, columnIndex, this.desk);
    } else if (figure[1] === "n") {
      options = horsePossibleSteps(stepInfo, rowIndex, columnIndex, this.desk);
    } else if (figure[1] === "b") {
      options = bishopPossibleSteps(stepInfo, rowIndex, columnIndex, this.desk);
    } else if (figure[1] === "q") {
      options = rookPossibleSteps(stepInfo, rowIndex, columnIndex, this.desk);
      const additionalOptions = bishopPossibleSteps(
        stepInfo,
        rowIndex,
        columnIndex,
        this.desk
      );
      options.possibleGoSteps = options.possibleGoSteps.concat(
        additionalOptions.possibleGoSteps
      );
      options.possibleBeatSteps = options.possibleBeatSteps.concat(
        additionalOptions.possibleBeatSteps
      );
      options.currentBeatSteps = options.currentBeatSteps.concat(
        additionalOptions.currentBeatSteps
      );
      options.pathToKing = options.pathToKing.concat(
        additionalOptions.pathToKing
      );
    } else if (figure[1] === "k") {
      options = kingPossibleSteps(
        stepInfo,
        rowIndex,
        columnIndex,
        this.desk,
        this.isWhiteGetCheck,
        this.isBlackGetCheck,
        this.castlingStepsWhite,
        this.castlingStepsBlack,
        this.stepsToBeatBlack,
        this.stepsToBeatWhite
      );
    }
    if (
      options &&
      stepInfo.figure &&
      ((stepInfo.figure[0] === "w" && this.whiteCheckInfo.length) ||
        (stepInfo.figure[0] === "b" && this.blackCheckInfo.length))
    ) {
      if (figure[1] !== "k") {
        const checkInfo =
          this.turn === "w" ? this.whiteCheckInfo : this.blackCheckInfo;
        options.possibleGoSteps = options.possibleGoSteps.filter((step) => {
          let result = false;
          checkInfo.forEach((position) => {
            if (position.pathToKing.indexOf(step) >= 0) {
              result = true;
            }
          });
          return result;
        });
        options.possibleBeatSteps = options.possibleBeatSteps.filter((step) => {
          let result = false;
          checkInfo.forEach((info) => {
            if (info.position === step) {
              result = true;
            }
          });
          return result;
        });
      }
    }
    return options;
  }

  cleanBoxShadow() {
    for (const ref in this.$refs) {
      const element = (this.$refs[ref] as HTMLElement[])[0];
      if (element) {
        element.style.boxShadow = "none";
      }
    }
  }

  mouseOver(rowIndex: number, columnIndex: number) {
    const chosenElement = this.desk[rowIndex][columnIndex];
    if (
      !this.isWhiteGetCheckAndMat &&
      !this.isBlackGetCheckAndMat &&
      !this.isPat &&
      !this.isBlackTimeEnds &&
      !this.isWhiteTimeEnds
    ) {
      if (chosenElement.figure && chosenElement.figure[0] === this.turn) {
        const element = (this.$refs[chosenElement.field] as HTMLElement[])[0];
        element.style.boxShadow = "inset 5em 5em 5em rgba(255, 148, 112, 0.4)";
      }
    }
  }

  mouseOut(rowIndex: number, columnIndex: number) {
    const chosenElement = this.desk[rowIndex][columnIndex];
    if (chosenElement.figure && chosenElement.figure[0] === this.turn) {
      const element = (this.$refs[chosenElement.field] as HTMLElement[])[0];
      element.style.boxShadow = "none";
    }
  }

  onOkButtonClick() {
    localStorage.removeItem("firstPlayerName");
    localStorage.removeItem("secondPlayerName");
    localStorage.removeItem("firstPlayerColor");
    localStorage.removeItem("secondPlayerColor");
    localStorage.removeItem("firstPlayerTime");
    localStorage.removeItem("secondPlayerTime");
    router.push("/");
  }

  formatTime(val: number) {
    return val > 9 ? `${val}` : "0" + val;
  }
  setTimer() {
    const sec = this.$refs[`${this.turn}seconds`] as HTMLElement;
    const min = this.$refs[`${this.turn}minutes`] as HTMLElement;
    if (
      this.turn === this.firstPlayerColor[0] &&
      this.firstPlayerTime !== null
    ) {
      if (this.firstPlayerTime > 0) {
        sec.innerHTML = this.formatTime(--this.firstPlayerTime % 60);
        min.innerHTML = this.formatTime(
          parseInt(`${this.firstPlayerTime / 60}`)
        );
      } else {
        this.setEndOfTime();
      }
    } else if (this.secondPlayerTime !== null) {
      if (this.secondPlayerTime > 0) {
        sec.innerHTML = this.formatTime(--this.secondPlayerTime % 60);
        min.innerHTML = this.formatTime(
          parseInt(`${this.secondPlayerTime / 60}`)
        );
      } else {
        this.setEndOfTime();
      }
    }
  }

  setEndOfTime() {
    if (this.turn === "w") {
      this.isWhiteTimeEnds = true;
    } else {
      this.isBlackTimeEnds = true;
    }
  }
}
</script>

<style lang="scss" scoped>
@import "../styles/colors.scss";
@import "../styles/constants.scss";
.page-container {
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-around;
}
.desk {
  margin-top: 1%;
  margin-bottom: 1%;
  display: flex;
  width: 800px;
  height: 800px;
  border: 1px solid black;
  flex-direction: column;
}

.row {
  display: flex;
  height: calc(100% / 8);
}

.cell {
  width: calc(100% / 8);
  background-color: #fedbd0;
  display: flex;
}

.row:nth-child(odd) .cell:nth-child(even) {
  background-color: #442c2e;
  color: #fedbd0;
}

.row:nth-child(even) .cell:nth-child(odd) {
  background-color: #442c2e;
  color: #fedbd0;
}

.margin-text {
  margin-bottom: 2%;
}

.beaten-figures {
  width: 40px;
}

.history-container {
  margin: 1%;
  display: flex;
  align-items: center;
  flex-direction: column;
}

.player-logo {
  width: 40px;
  display: inline;
}

.beaten-figures-container {
  display: inline;
}

.column-name {
  align-self: flex-end;
}

.player-info {
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-top: 1%;
}

.margin-right-elements {
  margin-right: 6px;
}
</style>
