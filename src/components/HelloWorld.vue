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

const emit = defineEmits("showCanvas");

const generateFile = () => {
  isWorking.value = true;
  emit("showCanvas");
  let rowArray = [];

  let lastTime = textArray.value[0][0];

  let lastTempTime = 0;
  let firstTempTime = textArray.value[0][0];

  // массив данных для времени в конце строки
  let tempArray = [];
  if (documentary.value) {
    for (let i = 0; i < textArray.value.length; i++) {
      // если имя то же, и время от начала прошлого до начала этого меньше 20сек, то к строке добавить время начала этой
      if (i > 0 && textArray.value[i][2] === textArray.value[i - 1][2]) {
        if (lastTime === 0) lastTime = textArray.value[i - 1][0];
        if (timeDifference(textArray.value[i][0], lastTime) >= 20000) {
          tempArray.push({
            string: i,
            time: `${clearTime(textArray.value[i][0]).split(".")[0]}`,
          });
          lastTime = 0;
        }
      } else {
        if (i > 0) {
          lastTempTime = textArray.value[i - 1][0];
        }

        lastTime = 0;
        try {
          if (
            timeDifference(lastTempTime, firstTempTime) >=
            secondForPartitions.value * 1000
          ) {
            tempArray.forEach((el) => {
              textArray.value[el.string - 1][3] += ` (${el.time}) `;
            });
          }
        } catch (e) {}

        firstTempTime = textArray.value[i][0];

        tempArray = [];
        lastTempTime = 0;
      }
    }
    // если нет смены актера
    tempArray.forEach((el) => {
      textArray.value[el.string][3] += ` (${el.time}) `;
    });
  }

  // добавляем слэши в конце фраз
  const clearArray = [];
  for (let i = 0; i < textArray.value.length; i++) {
    if (
      i > 0 &&
      textArray.value[i][2] === clearArray[clearArray.length - 1][2]
    ) {
      clearArray[clearArray.length - 1] = stringUnite(
        clearArray[clearArray.length - 1],
        textArray.value[i]
      );
    } else {
      clearArray.push(textArray.value[i]);
    }
  }

  for (let i = 0; i < clearArray.length; i++) {
    const row = clearArray[i];
    const firstTime = row[0];
    const secondTime = row[1];
    const name = row[2];
    const text = row[3];

    const tableRow = new TableRow({
      children: [
        new TableCell({
          children: [new Paragraph({ children: [new TextRun(name)] })],
        }),
        new TableCell({
          children: [
            new Paragraph({
              children: [
                new TextRun(
                  `${clearTime(firstTime.split(".")[0])} - ${clearTime(
                    secondTime.split(".")[0]
                  )}`
                ),
              ],
            }),
          ],
        }),
        new TableCell({
          children: [
            new Paragraph({
              children: [new TextRun(text)],
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
  const time = timeDifference(first, second);
  return time > 1000 && time < 3000 ? "/ " : time > 3000 ? "// " : "";
};

const timeDifference = (first, second) => {
  const targetTime = new Date("1970-01-01T" + "0" + first.split(".")[0]);
  const secondTime = new Date("1970-01-01T" + "0" + second.split(".")[0]);
  return (
    targetTime -
    secondTime -
    Number(second.split(".")[1]) +
    Number(first.split(".")[1])
  );
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
        result.push([str[1], str[2], str[4], str[9]]);
      }
      return result;
    }, []);
    showButton.value = true;
  };
  reader.onerror = (err) => console.log("err", err);
  reader.readAsText(file.value);
};

const isWorking = ref(false);
const showButton = ref(false);

const stringUnite = (first, second) => {
  const result = [...first];
  result[3] += stringEnd(second[0], result[1]) + second[3];
  result[1] = second[1];
  return result;
};

const documentary = ref(false);

const secondForPartitions = ref(40);
</script>

<template>
  <div v-if="isWorking" class="blaine">
    <img src="src/assets/parker.gif" :class="{ magic2: isWorking }" />
    <img src="src/assets/parker.gif" :class="{ magic: isWorking }" />
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
      <div>
        <label>
          <input type="checkbox" v-model="documentary" />добавить таймкоды в
          строки?
        </label>
        <div>
          <div>
            <label v-if="documentary">
              <span style="display: block">
                длина монолога для добавления тайм-кодов
              </span>
              <input type="number" v-model="secondForPartitions" /> сек.
            </label>
          </div>
        </div>
      </div>
      <button type="button" @click="generateFile" v-if="showButton">
        сделать магию
      </button>
    </div>
  </div>
</template>

<style scoped>
img {
  cursor: pointer;
}
.image-upload > input {
  display: none;
}
.blaine {
  display: flex;
  margin-top: auto;
}
.blaine > img {
  margin: auto;
  transition: all 10s;
  z-index: 2;
  pointer-events: none;
}
.magic {
  transform: scale(-1, 1);
}
.magic2 {
  transform: scale(1);
}
</style>
