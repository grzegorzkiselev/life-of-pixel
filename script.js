import p5 from "p5";

/**
 * @typedef {{
 * cells: number[],
 * current: number,
 * i: number,
 * j: number,
 * width: number,
 * height: number,
 * rowOffset: number
 * }} WrappedForEachArgs
 */
/**
  * @typedef {(
  *   (WrappedForEachArgs) => void
  * )} WrappedForEachCallback
  */
/**
 * @typedef {(
 *   (callback: WrappedForEachCallback) => void
 * )} WrappedForEach
 */
/**
 * @typedef {(
 *     <T>(this: T[], first?: number, last?: number) => T[]
 * )} Shuffle
*/
/**
 * @typedef {T[] & {
 *   wrappedForEach: WrappedForEach,
 *   shuffle: Shuffle
 * }} ExtendedArray
 * @template T
 */
/**
 * @memberof Array
 * @type {Shuffle}
 */
/**
 * @param {number} widthNum
 * @param {number} heightNum
 * @returns {WrappedForEach}
 */
var initArrayWrappedForEach = (widthNum, heightNum) => {
  return function wrappedForEach(callback) {
    for (
      var i = 0, j = 0, rowOffset = 0;
      i < widthNum && j < heightNum;
      i + 1 === widthNum
        ? (i = 0, j++, rowOffset = j * widthNum)
        : i++
    ) {
      callback({
        cells: this,
        current: this[i + j * widthNum],
        i,
        j,
        width: widthNum,
        height: heightNum,
        rowOffset: rowOffset
      });
    }
  };
};

/**
 * @type {Shuffle}
 */
function shuffle(first = 0, last = this.length - 1) {
  var length = last - first;
  var result = new Array(length);
  while(last-- && last >= first) {
    const j = Math.floor(Math.random() * (last + 1));
    [this[last], this[j]] = [this[j], this[last]];
    result[--length] = this[last];
  }
  return result;
};
/** @type {ExtendedArray<any>} */(
  Array.prototype
).shuffle = shuffle;

var sketch = () => {
  var bgc = "#ebebe1";
  document.body.style.backgroundColor = bgc;

  var colorSet =
  /** @type {ExtendedArray<string>} */
  ([
    "#f0ba00",
    "#de8790",
    "#6b1f1c",
    "#333c7d",
    "#367148",
    "#91b9d6",
    "#aa2404"
  ]);

  var palette = colorSet.shuffle(0, 5);

  const getCanvasSide = () => (
    window.innerWidth < window.innerHeight
      ? window.innerWidth
      : window.innerHeight
  );

  let canvasWidth = getCanvasSide();
  let canvasHeight = canvasWidth;

  const resolutionInput = document.getElementById("resolution");

  var
    resolutionValue,
    sideDivider,
    cellWidth,
    cellHeight = 0;

  var cellByteLength = 5;
  var neibhourRepresentationLenght = 3;

  const isImageLoaded = false;

  /**
   * @type {(resolution: string | number, img: any) => {
   *   cells: ExtendedArray<number>,
   *   widthNum: number,
   *   heightNum: number
   * }}
   */
  var updateResolution = (resolution, img) => {
    resolutionValue = Number(resolution);

    var widthNum = resolutionValue;
    var heightNum = resolutionValue;

    cellWidth = canvasWidth / widthNum;
    cellHeight = canvasHeight / heightNum;

    sideDivider = isImageLoaded === false
      ? 1
      : resolutionValue / img.width;

    return {
      cells: /** @type {ExtendedArray<number>} */(
        Array.from(
          { length: widthNum * heightNum },
          () => 0
        )),
      widthNum,
      heightNum,
    };
  };

  var mask = {
    alive: 0b10000,
    aliveNext: 0b01000,
    nAll: 0b00111,
    n4: 0b00100,
    n3: 0b00011,
    n2: 0b00010,
    n1: 0b00001,
    n0: 0b00000,
  };

  var generateCellsCallback = ({
    cells,
    current,
    i,
    j,
    width,
    height,
    rowOffset
  }) => {
    cells[i + j * width] = img.get(
      Math.floor(i / sideDivider),
      Math.floor(j / sideDivider)
    )[0] < 129
      ? mask.alive
      : 0;
  };

  var cellIsAliveNextGenerationCallback = ({
    cells,
    current,
    i,
    j,
    width,
    height,
    rowOffset
  }) => {
    current = current >> neibhourRepresentationLenght << neibhourRepresentationLenght; // erase neibhours info
    var aliveCount = 0;

    i > 0
      && cells[i - 1 + rowOffset] & mask.alive
      && aliveCount++;

    i + 1 < width - 1
      && cells[i + 1 + rowOffset] & mask.alive
      && aliveCount++;

    (i > 0 && i + 1 < width - 1) && j > 0
      && cells[i + rowOffset - width] & mask.alive
      && aliveCount++;

    (i > 0 && i + 1 < width - 1) && (j - 1 < height - 1)
      && cells[i + rowOffset + width] & mask.alive
      && aliveCount++;

    current |= aliveCount;

    // debug
    current & mask.alive && (cells[i + rowOffset] = current | mask.aliveNext);
  };

  const drawCellsCallback = ({
    cells,
    current,
    i,
    j,
    width,
    height,
    rowOffset
  }) => {
    current & mask.aliveNext
          && (
            fill(
              palette[current & Number("0b".padEnd(neibhourRepresentationLenght, "1"))]
            ),
            rect(i * cellWidth,
              j * cellHeight,
              cellWidth,
              cellHeight
            )
          );
  };

  const resetGenerationCallback = ({
    cells,
    current,
    i,
    j,
    width,
    height,
    rowOffset
  }) => {
    current = (current << 1) & (1 << cellByteLength) - 1;

    cells[i + rowOffset] = current;
  };

  setup = () => {
    img = loadImage("img2.jpg", imageLoaded);

    colorMode("hsb", 360, 100, 100, 100);
    createCanvas(canvasWidth, canvasHeight);
    frameRate(4);
    noStroke();
  };

  // draw = () => {};

  const drawCallback = (cells) => {
    background(bgc);
    cells.wrappedForEach(cellIsAliveNextGenerationCallback);
    cells.wrappedForEach(drawCellsCallback);
    cells.wrappedForEach(resetGenerationCallback);
    requestAnimationFrame(drawCallback);
  };

  const firstCycleCallback = (cells) => {
    image(img, 0, 0, canvasWidth, canvasHeight);
    background(bgc);
    cells.wrappedForEach(generateCellsCallback);
    draw = drawCallback.bind(null, cells);
  };

  var imageLoaded = (img) => {
    var { cells, widthNum, heightNum } = updateResolution(/** @type {HTMLInputElement} */(resolutionInput).value, img);

    /** @type {ExtendedArray<any>} */(
      Array.prototype
    ).wrappedForEach = initArrayWrappedForEach(widthNum, heightNum);

    cells.wrappedForEach(generateCellsCallback);

    sideDivider = widthNum / img.width;
    draw = firstCycleCallback.bind(null, cells);
  };

  resolutionInput.addEventListener("change", () => {
    updateResolution(resolutionInput.value);
    draw = firstCycleCallback;
  });

  window.addEventListener("resize", () => {
    const side = canvasHeight = canvasWidth = getCanvasSide();
    resizeCanvas(side, side);
    cellWidth = canvasWidth / widthNum;
    cellHeight = canvasHeight / heightNum;
    draw = firstCycleCallback;
  });

  const controls = document.getElementById("controls");
  controls.addEventListener("dragover", () => {
    controls.classList.add("dragover");
  });
  controls.addEventListener("dragleave", () => {
    controls.classList.remove("dragover");
  });

  const form = document.getElementById("userimageform");
  form.addEventListener("submit", () => {
    const data = new FormData(form);
    const file = data.get("userimage");
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (readerEvent) => {
      img = loadImage(readerEvent.target.result, imageLoaded);
    };
    controls.classList.remove("dragover");
  });

  const userImageInput = document.getElementById("userimage");
  userImageInput.addEventListener("dragover", () => {
    userImageInput.classList.add("dragover");
  });
  userImageInput.addEventListener("dragleave", () => {
    userImageInput.classList.remove("dragover");
  });
  userImageInput.addEventListener("drop", () => {
    userImageInput.classList.remove("dragover");
  });
};

new p5(sketch);