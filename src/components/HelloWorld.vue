<script setup>
import {
  WidthType,
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

  for (let i = 0; i < textArray.value.length; i++) {
    const row = textArray.value[i];
    const tableRow = new TableRow({
      children: [
        new TableCell({
          children: [new Paragraph({ children: [new TextRun(row[4])] })],
        }),
        new TableCell({
          children: [
            new Paragraph({
              children: [
                new TextRun(
                  `${clearTime(row[1].split(".")[0])} - ${clearTime(
                    row[2].split(".")[0]
                  )}`
                ),
              ],
            }),
          ],
        }),
        new TableCell({
          children: [
            new Paragraph({
              children: [new TextRun(row[9])],
            }),
          ],
        }),
      ],
    });
    rowArray.push(tableRow);
  }

  const table = new Table({
    width: {
      size: 9000,
      type: WidthType.DXA,
    },
    columnWidths: [1500, 2500, 6000],
    rows: rowArray,
  });

  const doc = new Document({ sections: [{ children: [table] }] });

  Packer.toBlob(doc).then((blob) => {
    saveAs(blob, `${file.value.name.replace(".ass", "")}.docx`);
  });
};

const file = ref(null);
const textArray = ref(null);

const clearTime = (time) => {
  if (time.startsWith("0:")) {
    return time.slice(2);
  } else return time;
};

// const women = ref([]);
// const getWomen = () => {
//   textArray.value.forEach((string) => {
//     if (!women.value.includes(string[4])) {
//       women.value.push(string[4]);
//     }
//   });
// };

const stringEnd = (first, second) => {
  if (!second) return "";
  const targetTime = new Date("1970-01-01T" + "0" + first.split(".")[0]);
  const secondTime = new Date("1970-01-01T" + "0" + second.split(".")[0]);
  const time =
    targetTime -
    secondTime -
    Number(second.split(".")[1]) +
    Number(first.split(".")[1]);
  return time > 1000 && time < 3000 ? "/ " : time > 3000 ? "// " : "";
};

const upload = (e) => {
  e.preventDefault();
  file.value = e.target.files[0];
  const reader = new FileReader();
  reader.onload = (res) => {
    textArray.value = reader.result.split("\n").reduce((result, string) => {
      const stringArray = string.split(",");
      if (stringArray[0].startsWith("Dialogue: 0")) {
        const str = stringArray
          .slice(0, 9)
          .concat(stringArray.slice(9).flat().join());
        if (result.length > 1 && str[4] === result[result.length - 1][4]) {
          result[result.length - 1] = stringUnite(
            result[result.length - 1],
            str
          );
        } else result.push(str);
      }
      return result;
    }, []);
    // getWomen();
    showButton.value = true;
  };
  reader.onerror = (err) => console.log("err", err);
  reader.readAsText(file.value);
};

const isWorking = ref(false);
const showButton = ref(false);

const stringUnite = (first, second) => {
  const result = [...first];
  result[9] += stringEnd(second[1], result[2]) + second[9];
  result[2] = second[2];
  return result;
};
</script>

<template>
  <div v-if="isWorking" class="blaine">
    <img src="http://i.absurdopedia.net/e/e9/Blaine.JPG" />
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
      <button type="button" @click="generateFile" v-if="showButton">
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
