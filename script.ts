import { initArrayWrappedForEach, shuffle } from "./monkeyPatches.ts";

Array.prototype.shuffle = shuffle;

var bgc = "#ebebe1";
document.body.style.backgroundColor = bgc;
var canvas = <HTMLCanvasElement>document.getElementById("ca");
var context = <CanvasRenderingContext2D>canvas.getContext("2d", { willReadFrequently: true });
var resolutionInput = <HTMLInputElement>document.getElementById("resolution");

var pr = 0;
var getCanvasSide = () => (
  window.innerWidth < window.innerHeight
    ? window.innerWidth * pr
    : window.innerHeight * pr
);

var currentResolution = 0;
var currentImage: HTMLImageElement | null = null;
var isImageLoaded = false;

var updateResolution = (canvasWidth, canvasHeight, resolution) => {
  currentResolution = Number(resolution);

  var widthNum = currentResolution;
  var heightNum = currentResolution;

  var cellWidth = canvasWidth / widthNum;
  var cellHeight = canvasHeight / heightNum;

  var sideDivider = isImageLoaded === false
    ? 1
    : currentResolution / canvasWidth;

  return {
    widthNum,
    cellWidth,
    heightNum,
    cellHeight,
    sideDivider,
  };
};

var mask = {
  empty: 0b0,
  alive: 0b10000,
  dead: 0b01111,
  aliveNext: 0b01000,
  deadNext: 0b10111,
  n: 0b00111,
  dropN: 0b11000,
};

var getColorIndicesByCoordinates = (i, j, imageNaturalWidth) => {
  var red = j * (imageNaturalWidth * 4) + i * 4;
  return [red, red + 1, red + 2, red + 3];
};

var generateCellsCallback = (rgbArray, widthNum, canvasWidth, heightNum, _, sideDivider) => {
  var i = 0;
  var j = 0;

  var cells = new Uint8Array(
    Array.from(
      { length: widthNum * heightNum },
      () => {
        i + 1 === widthNum
          ? (i = 0, j++)
          : i++;

        return rgbArray[getColorIndicesByCoordinates(
          Math.floor(i / sideDivider),
          Math.floor(j / sideDivider),
          canvasWidth,
        )[0]] < 129
          ? mask.alive
          : mask.empty;
      }
    )
  );

  return cells;
};

var isCellAliveInNextGenerationCallback = ({
  cells,
  currentIndex,
  i,
  j,
  widthNum,
  heightNum,
}) => {
  var current = cells[currentIndex];

  var nc = 0;

  ((i - 1) > 0
      && cells[currentIndex - 1] & mask.alive)
      && nc++;

  ((i + 1) < widthNum
      && cells[currentIndex + 1] & mask.alive)
      && nc++;

  ((j - 1) > 0
      && cells[currentIndex - widthNum] & mask.alive)
      && nc++;

  ((j + 1) < heightNum
      && cells[currentIndex + widthNum] & mask.alive)
      && nc++;

  cells[currentIndex] = (
    (nc === 1 || nc === 3)
      ? current | mask.aliveNext
      : current & mask.deadNext
  ) | nc;
};

var colorSet = [
  "#f0ba00",
  "#de8790",
  "#6b1f1c",
  "#333c7d",
  "#367148",
  "#91b9d6",
  "#aa2404",
];

var palette = colorSet.shuffle(0, 5);

var drawCellsCallback = ({
  currentIndex,
  cells,
  cellWidth,
  cellHeight,
  canvasWidth,
  i,
  j,
}) => {
  var current = cells[currentIndex];

  current & mask.alive
  && (
    context.fillStyle = palette[current & mask.n],
    context.fillRect(
      i * cellWidth,
      j * cellHeight,
      cellWidth,
      cellHeight
    )
  );

  cells[currentIndex] =
    (current & mask.aliveNext)
      ? (current | mask.alive) & mask.dropN
      : mask.empty;
};

var resizeCanvas = (width, height, pr) => {
  canvas.width = width;
  canvas.height = height;
  canvas.style.width = width / pr + "px";
  canvas.style.height = height / pr + "px";
};

var clock = Date.now();
var fps = 4;
var frameDuration = 1000 / fps;
var currentRafId = 0;

var drawCallback = (cells, canvasWidth, canvasHeight) => {
  var currentTime = Date.now();

  if (currentTime - clock >= frameDuration) {
    cells.wrappedForEach(isCellAliveInNextGenerationCallback);
    context.clearRect(0, 0, canvasWidth, canvasHeight);
    cells.wrappedForEach(drawCellsCallback);
    clock = currentTime;
  }

  currentRafId = requestAnimationFrame(
    drawCallback.bind(
      null,
      cells,
      canvasWidth,
      canvasHeight
    ));
};

var firstFrameCallback = (image) => {
  currentRafId > 0 && cancelAnimationFrame(currentRafId);

  var canvasWidth = getCanvasSide();
  var canvasHeight = canvasWidth;

  var {
    widthNum,
    cellWidth,
    heightNum,
    cellHeight,
    sideDivider,
  } = updateResolution(canvasWidth, canvasHeight, resolutionInput.value);

  resizeCanvas(canvasWidth, canvasHeight, pr);

  context.drawImage(image, 0, 0, canvasWidth, canvasHeight);
  var rgbArray = context.getImageData(0, 0, canvasWidth, canvasHeight).data;
  context.clearRect(0, 0, canvasWidth, canvasHeight);
  context.fillStyle = "#f00";

  var wrappedForEach = initArrayWrappedForEach(widthNum, cellWidth, canvasWidth, heightNum, cellHeight, sideDivider);
  var cells = generateCellsCallback(rgbArray, widthNum, canvasWidth, heightNum, canvasHeight, sideDivider);

  Uint8Array.prototype.wrappedForEach = wrappedForEach;
  drawCallback(cells, canvasWidth, canvasHeight);
};

var loadImage = (urlOrData) => {
  var image = new Image();
  image.src = urlOrData;
  currentImage = image;

  image.addEventListener("load", onImageLoaded.bind(null, image), { once: true });
};

var onImageLoaded = (image) => {
  isImageLoaded = true;
  firstFrameCallback(
    image
  );
};

resolutionInput!.addEventListener("change", () => {
  onImageLoaded(currentImage);
});

window.addEventListener("resize", () => {
  firstFrameCallback(currentImage);
});

var controls = <HTMLInputElement>document.getElementById("controls");
controls.addEventListener("dragover", () => {
  controls.classList.add("dragover");
});
controls.addEventListener("dragleave", () => {
  controls.classList.remove("dragover");
});

var form = <HTMLFormElement>document.getElementById("userimageform");

var getImageFromInput = () => {
  var data = new FormData(form);
  var file = data.get("userimage");

  if (!file || file.name === "") {
    return null;
  }

  return file;
};

var loadImageData = (file) => {
  var reader = new FileReader();

  reader.readAsDataURL(file);
  reader.onload = (readerEvent) => {
    loadImage(readerEvent.target.result);
  };
};

form.addEventListener("submit", () => {
  var file = getImageFromInput();
  file && loadImageData(file);

  controls.classList.remove("dragover");
});

var setup = () => {
  pr = Math.min(window.devicePixelRatio, 2);
  var userFile = getImageFromInput();
  userFile
    ? loadImageData(userFile)
    : loadImage(
      "./img3.jpg"
    );
};

setup();

var userImageInput = <HTMLInputElement>document.getElementById("userimage");
userImageInput.addEventListener("dragover", () => {
  userImageInput.classList.add("dragover");
});
userImageInput.addEventListener("dragleave", () => {
  userImageInput.classList.remove("dragover");
});
userImageInput.addEventListener("drop", () => {
  userImageInput.classList.remove("dragover");
});