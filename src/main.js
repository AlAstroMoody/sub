import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import { initYandexMetrika } from "yandex-metrika-vue3";

const app = createApp(App);

app.use(initYandexMetrika, {
  id: 92538971,
  env: "production",
});
