<template>
  <div class="home">
    <div class="form-container">
      <div class="center-elements">
        <div class="title"><span>Добро пожаловать!</span></div>
        <div class="title">
          <span>Для продолжения, пожалуйста, заполните форму ниже.</span>
        </div>
      </div>
      <input
        placeholder="Введите имя первого игрока"
        v-model="firstPlayerName"
        class="text-input"
        type="text"
      />
      <input
        placeholder="Введите время на все ходы первого игрока в минутах"
        v-model="firstPlayerTime"
        class="text-input fieldset-custom"
        type="number"
        min="0"
      />
      <div class="fieldset-custom">
        <fieldset>
          <legend align="left">Цвет первого игрока:</legend>
          <label>
            <input
              type="radio"
              name="firstPlayerColor"
              v-model="firstPlayerColor"
              value="white"
            />
            Белый
          </label>
          <label>
            <input
              type="radio"
              name="firstPlayerColor"
              v-model="firstPlayerColor"
              value="black"
            />
            Черный
          </label>
        </fieldset>
      </div>
      <input
        placeholder="Введите имя второго игрока"
        v-model="secondPlayerName"
        class="text-input"
        type="text"
      />
      <input
        placeholder="Введите время на все ходы второго игрока в минутах"
        v-model="secondPlayerTime"
        class="text-input fieldset-custom"
        type="number"
        min="0"
      />
      <div class="fieldset-custom">
        <fieldset>
          <legend align="left">Цвет втогоро игрока:</legend>
          <label>
            <input
              type="radio"
              name="secondPlayerColor"
              v-model="secondPlayerColor"
              value="white"
            />
            Белый
          </label>
          <label>
            <input
              type="radio"
              name="secondPlayerColor"
              v-model="secondPlayerColor"
              value="black"
            />
            Черный
          </label>
        </fieldset>
      </div>
      <div class="center-elements">
        <button
          :disabled="isContinueButtonDisabled"
          @click="onContinueButtonClick"
        >
          Продожить
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import router from "@/router";

@Options({
  watch: {
    firstPlayerColor(newColor) {
      if (newColor === "black") {
        this.secondPlayerColor = "white";
      } else {
        this.secondPlayerColor = "black";
      }
    },
    secondPlayerColor(newColor) {
      if (newColor === "black") {
        this.firstPlayerColor = "white";
      } else {
        this.firstPlayerColor = "black";
      }
    },
  },
  computed: {
    isContinueButtonDisabled() {
      return !(
        this.firstPlayerName &&
        this.secondPlayerName &&
        this.firstPlayerTime &&
        this.secondPlayerTime
      );
    },
  },
})
export default class HomeView extends Vue {
  public firstPlayerName = "";
  public secondPlayerName = "";
  public firstPlayerColor = "white";
  public secondPlayerColor = "black";
  public firstPlayerTime: number | null = null;
  public secondPlayerTime: number | null = null;
  onContinueButtonClick() {
    localStorage.setItem("firstPlayerName", this.firstPlayerName);
    localStorage.setItem("secondPlayerName", this.secondPlayerName);
    localStorage.setItem("firstPlayerColor", this.firstPlayerColor);
    localStorage.setItem("secondPlayerColor", this.secondPlayerColor);
    localStorage.setItem("firstPlayerTime", `${this.firstPlayerTime}`);
    localStorage.setItem("secondPlayerTime", `${this.secondPlayerTime}`);
    router.push("/play");
  }
}
</script>

<style lang="scss" scoped>
@import "../styles/colors.scss";
@import "../styles/constants.scss";
.home {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  height: 100vh;
  background-image: url("@/assets/images/chess2.jpg");
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
}
.form-container {
  width: 50%;
  border-radius: $border-radius;
  padding: 1%;
  margin-top: 10%;
  background: white;
}
.fieldset-custom {
  margin-top: 10px;
}
img {
  width: 10%;
}
.center-elements {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 10x;
  margin-bottom: 10px;
}
.title {
  font-weight: 600;
}
</style>
