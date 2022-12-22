<script setup>
import {
  WidthType,
  BorderStyle,
  Document,
  Paragraph,
  Packer,
  TextRun,
  Table,
  TableRow,
  TableCell,
} from "docx";
import { saveAs } from "file-saver";
import { ref } from "vue";

const generateFile = () => {
  isWorking.value = true;

  let rowArray = [];
  textArray.value.forEach((row) => {
    const tableRow = new TableRow({
      children: [
        new TableCell({
          children: [new Paragraph({ children: [new TextRun(row[4])] })],
        }),
        new TableCell({
          children: [new Paragraph({ children: [new TextRun(row[1])] })],
        }),
        new TableCell({
          children: [new Paragraph({ children: [new TextRun(row[9])] })],
        }),
        new TableCell({
          children: [new Paragraph({ children: [new TextRun(row[2])] })],
        }),
      ],
    });
    rowArray.push(tableRow);
  });

  const table = new Table({
    width: {
      size: 9000,
      type: WidthType.DXA,
    },
    columnWidths: [1500, 1500, 5500, 1500],
    rows: rowArray,
  });

  const doc = new Document({ sections: [{ children: [table] }] });

  Packer.toBlob(doc).then((blob) => {
    saveAs(blob, "example.docx");
  });
  // setTimeout(() => (isWorking.value = false), 1000);
};

const file = ref(null);
const textArray = ref(null);
const women = ref([]);
const getWomen = () => {
  textArray.value.forEach((string) => {
    if (!women.value.includes(string[4])) {
      women.value.push(string[4]);
    }
  });
};

const upload = (e) => {
  e.preventDefault();
  file.value = e.target.files[0];
  const reader = new FileReader();
  reader.onload = (res) => {
    textArray.value = reader.result.split("\n").reduce((result, string) => {
      const stringArray = string.split(",");
      if (stringArray[0].startsWith("Dialogue: 0")) {
        result.push(
          stringArray.slice(0, 9).concat(stringArray.slice(9).flat().join())
        );
      }
      return result;
    }, []);
    getWomen();
  };
  reader.onerror = (err) => console.log(err);
  reader.readAsText(file.value);
};

const isWorking = ref(false);
</script>

<template>
  <div v-if="isWorking" class="blaine">
    <img src=" http://i.absurdopedia.net/e/e9/Blaine.JPG" />
  </div>
  <div v-else>
    <div class="image-upload">
      <label for="file-input">
        <img
          src="https://icons.iconarchive.com/icons/dtafalonso/android-lollipop/128/Downloads-icon.png"
        />
      </label>

      <input id="file-input" type="file" @input="upload($event)" />
    </div>
    <div class="card" v-if="file">
      <div>{{ file.name }}</div>
      <button type="button" @click="generateFile" v-if="!isWorking">
        сделать магию
      </button>
    </div>
  </div>
</template>

<style scoped>
.image-upload > input {
  display: none;
}
.blaine {
  display: flex;
}
.blaine > img {
  margin: auto;
}
</style>
