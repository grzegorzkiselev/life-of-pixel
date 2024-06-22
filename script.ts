import p5 from "p5";

var initArrayWrappedForEach = (img: any, widthNum: number, heightNum: number): typeof Array.prototype.wrappedForEach => {
  return function wrappedForEach(callback) {
    for (
      var i = 0, j = 0, rowOffset = 0;
      i < widthNum && j < heightNum;
      i + 1 === widthNum
        ? (i = 0, j++, rowOffset = j * widthNum)
        : i++
    ) {
      callback(
        img, {
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

function shuffle(first = 0, last = this.length - 1) {
  // var length = last - first;
  var result: string[] = [];
  while(last-- >= first) {
    const j = Math.floor(Math.random() * (last + 1));
    [this[last], this[j]] = [this[j], this[last]];
    result.push(this[last]);
  }
  return result;
};

Array.prototype.shuffle = shuffle;

var sketch = (p: p5) => {
  var bgc = "#ebebe1";
  document.body.style.backgroundColor = bgc;

  var colorSet = [
    "#f0ba00",
    "#de8790",
    "#6b1f1c",
    "#333c7d",
    "#367148",
    "#91b9d6",
    "#aa2404"
  ];

  var palette = colorSet.shuffle(0, 5);

  var getCanvasSide = () => (
    window.innerWidth < window.innerHeight
      ? window.innerWidth
      : window.innerHeight
  );

  let canvasWidth = getCanvasSide();
  let canvasHeight = canvasWidth;

  var resolutionInput = <HTMLInputElement>document.getElementById("resolution");

  var resolutionValue,
    sideDivider,
    cellWidth,
    cellHeight,
    currentWidthNum, 
    currentHeightNum = 0;

  var currentImage = null;
  var currentCells = [];
  var isImageLoaded = false;

  var updateResolution = (resolution, img) => {
    resolutionValue = Number(resolution);

    var widthNum = resolutionValue;
    currentWidthNum = widthNum;
    var heightNum = resolutionValue;
    currentHeightNum = resolutionValue;

    cellWidth = canvasWidth / widthNum;
    cellHeight = canvasHeight / heightNum;

    sideDivider = isImageLoaded === false
      ? 1
      : resolutionValue / img.width;

    return {
      cells: 
        Array.from(
          { length: widthNum * heightNum },
          () => 0
        ),
      widthNum,
      heightNum,
    };
  };

  var mask = {
    empty: 0b0,
    alive: 0b10000,
    aliveNext: 0b1000,
    n: 0b111,
  };

  var generateCellsCallback = (
    img, {
    cells,
    i,
    j,
    width,
  }) => {
    cells[i + j * width] = img.get(
      Math.floor(i / sideDivider),
      Math.floor(j / sideDivider)
    )[0] < 129
      ? mask.alive
      : mask.empty;

    currentCells = cells;
  };

  var cellIsAliveNextGenerationCallback = (_, {
    cells,
    current,
    i,
    j,
    width,
    height,
    rowOffset
  }) => {
    current = mask.empty | (current & mask.alive) | (current & mask.aliveNext);
    var nc = 0;

    i - 1 > 0
      && (cells[i - 1 + rowOffset] & mask.alive)
      && nc++;

    i + 1 < width
      && (cells[i + 1 + rowOffset] & mask.alive)
      && nc++;

    j - 1 > 0
      && (cells[i + rowOffset - width] & mask.alive)
      && nc++;

    j + 1 < height
      && (cells[i + rowOffset + width] & mask.alive)
      && nc++;

    current |= nc;

    if (
      !(nc === 0
      || nc === 2
      || nc === 4
    )) {
      (cells[i + rowOffset] = current | mask.aliveNext);
    }
  };

  var drawCellsCallback = (_, {
    current,
    i,
    j,
  }) => {
    (current & mask.aliveNext)
      && (
        p.fill(
          palette[current & mask.n]
        ),
        p.rect(i * cellWidth,
          j * cellHeight,
          cellWidth,
          cellHeight
        )
      );
  };

  var resetGenerationCallback = (_, {
    cells,
    current,
    i,
    rowOffset
  }) => {
    if (current & mask.aliveNext) {
      current = current ^ mask.aliveNext;
      cells[i + rowOffset] = current | mask.alive;
    }
    // cells[i + rowOffset] = current << 1 & (1 << Math.floor(Math.log2(Math.abs(current))) + 1) - 1;
  };

  p.setup = () => {
    p.loadImage("img3.jpg", imageLoaded);
    p.colorMode("hsb", 360, 100, 100, 100);
    p.createCanvas(canvasWidth, canvasHeight);
    p.frameRate(4);
    p.noStroke();
  };

  p.draw = () => {};

  const drawCallback = (cells) => {
    cells.wrappedForEach(cellIsAliveNextGenerationCallback);
    p.background(bgc);
    cells.wrappedForEach(drawCellsCallback);
    cells.wrappedForEach(resetGenerationCallback);
  };

  const firstCycleCallback = (cells, img) => {
    p.image(img, 0, 0, canvasWidth, canvasHeight);
    p.background(bgc);
    cells.wrappedForEach(generateCellsCallback);
    p.draw = drawCallback.bind(null, cells);
  };

  var imageLoaded = (img) => {
    currentImage = img;
    var { cells, widthNum, heightNum } = updateResolution(resolutionInput.value, img);
    
    Array.prototype.wrappedForEach = initArrayWrappedForEach(img, widthNum, heightNum);

    cells.wrappedForEach(generateCellsCallback);

    sideDivider = widthNum / img.width;
    p.draw = firstCycleCallback.bind(null, cells, img);
  };

  resolutionInput!.addEventListener("change", () => {
    imageLoaded(currentImage);
  });

  window.addEventListener("resize", () => {
    var side = canvasHeight = canvasWidth = getCanvasSide();
    p.resizeCanvas(side, side);
    cellWidth = canvasWidth / currentWidthNum;
    cellHeight = canvasHeight / currentHeightNum;
    p.draw = firstCycleCallback.bind(null, currentCells, currentImage);
  });

  const controls = <HTMLInputElement>document.getElementById("controls");
  controls.addEventListener("dragover", () => {
    controls.classList.add("dragover");
  });
  controls.addEventListener("dragleave", () => {
    controls.classList.remove("dragover");
  });

  var form = <HTMLFormElement>document.getElementById("userimageform");
  form.addEventListener("submit", () => {
    var data = new FormData(form);
    var file = <Blob>data.get("userimage");
    var reader = new FileReader();

    reader.readAsDataURL(file);
    reader.onload = (readerEvent) => {
      p.loadImage(readerEvent.target.result, imageLoaded);
    };
    controls.classList.remove("dragover");
  });

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
};

new p5(sketch);