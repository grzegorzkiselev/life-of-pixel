import { initArrayWrappedForEach, shuffle } from "./monkeyPatches";

/**
 * Before
 */
var canvas = null;
var context = null;

/**
 * Cells
 */
var mask = {
  empty: 0b0,
  alive: 0b10000,
  dead: 0b01111,
  aliveNext: 0b01000,
  deadNext: 0b10111,
  n: 0b00111,
  dropN: 0b11000,
};

var currentResolution = 0;
var palette = shuffle([
  "#f0ba00",
  "#de8790",
  "#6b1f1c",
  "#333c7d",
  "#367148",
  "#91b9d6",
  "#aa2404",
]).slice(0, 3);

/**
 * Render
 */
var clock = Date.now();
var fps = 4;
var frameDuration = 1000 / fps;
var currentRafId = 0;

var updateResolution = (canvasWidth, canvasHeight, resolution) => {
  currentResolution = Number(resolution);

  var widthNum = currentResolution;
  var heightNum = currentResolution;

  var cellWidth = canvasWidth / widthNum;
  var cellHeight = canvasHeight / heightNum;

  var sideDivider = currentResolution / canvasWidth;

  return {
    widthNum,
    cellWidth,
    heightNum,
    cellHeight,
    sideDivider,
  };
};

var getColorIndicesByCoordinates = (i, j, imageNaturalWidth) => {
  var red = j * (imageNaturalWidth * 4) + i * 4;
  return [red, red + 1, red + 2, red + 3];
};

var generateCells = (rgbArray, widthNum, canvasWidth, heightNum, _, sideDivider) => {
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

  var n = 0;

  ((i - 1) > 0
      && cells[currentIndex - 1] & mask.alive)
      && n++;

  ((i + 1) < widthNum
      && cells[currentIndex + 1] & mask.alive)
      && n++;

  ((j - 1) > 0
      && cells[currentIndex - widthNum] & mask.alive)
      && n++;

  ((j + 1) < heightNum
      && cells[currentIndex + widthNum] & mask.alive)
      && n++;

  cells[currentIndex] = (
    (n === 1 || n === 3)
      ? current | mask.aliveNext
      : current & mask.deadNext
  ) | n;
};

var drawCellsCallback = ({
  currentIndex,
  cells,
  cellWidth,
  cellHeight,
  i,
  j,
}) => {
  var current = cells[currentIndex];

  current & mask.alive
  && (
    context.fillStyle = palette[(current & mask.n) - 1],
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

var tick = (cells, canvasWidth, canvasHeight) => {
  var currentTime = Date.now();

  if (currentTime - clock >= frameDuration) {
    cells.wrappedForEach(isCellAliveInNextGenerationCallback);
    context.clearRect(0, 0, canvasWidth, canvasHeight);
    cells.wrappedForEach(drawCellsCallback);
    clock = currentTime;
  }

  currentRafId = requestAnimationFrame(
    tick.bind(
      null,
      cells,
      canvasWidth,
      canvasHeight
    ));
};

var resizeCanvas = (canvas, width, height) => {
  canvas.width = width;
  canvas.height = height;
};

var processFirstFrame = (image, canvasWidth, canvasHeight, resolution) => {
  currentRafId > 0 && cancelAnimationFrame(currentRafId);

  resizeCanvas(canvas, canvasWidth, canvasHeight);

  var {
    widthNum,
    cellWidth,
    heightNum,
    cellHeight,
    sideDivider,
  } = updateResolution(canvasWidth, canvasHeight, resolution);

  var imageMaxSide = Math.max(image.width, image.height);
  var imageRatio = canvasWidth / imageMaxSide;
  var scaledWidth = image.width * imageRatio;
  var scaledHeight = image.height * imageRatio;
  var dx = (canvasWidth - scaledWidth) / 2;
  var dy = (canvasHeight - scaledHeight) / 2;

  context.drawImage(image, dx, dy, image.width * imageRatio, image.height * imageRatio);

  var rgbArray = context.getImageData(0, 0, canvasWidth, canvasHeight).data;
  context.clearRect(0, 0, canvasWidth, canvasHeight);
  context.fillStyle = "#f00";

  var wrappedForEach = initArrayWrappedForEach(widthNum, cellWidth, heightNum, cellHeight);
  var cells = generateCells(rgbArray, widthNum, canvasWidth, heightNum, canvasHeight, sideDivider);

  Uint8Array.prototype.wrappedForEach = wrappedForEach;
  tick(cells, canvasWidth, canvasHeight);
};

addEventListener("message", (event) => {
  var {
    canvas: transferredCanvas,
    image,
    canvasWidth,
    canvasHeight,
    resolution
  } = event.data;

  switch (event.data.message) {
  case "initCanvas":
    canvas = transferredCanvas;
    context = canvas.getContext("2d");
    break;
  case "processFirstFrame":
    processFirstFrame(
      image,
      canvasWidth,
      canvasHeight,
      resolution
    );
    break;
  }
});