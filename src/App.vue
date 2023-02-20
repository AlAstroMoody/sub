<script setup>
import HelloWorld from "./components/HelloWorld.vue";
import { useYandexMetrika } from "yandex-metrika-vue3";

const yandexMetrika = useYandexMetrika();

const foo = () => {
  yandexMetrika.hit(path);
};
</script>

<template>
  <HelloWorld />
</template>

<style scoped></style>
