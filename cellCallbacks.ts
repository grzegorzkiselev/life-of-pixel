var cellIsAliveNextGenerationCallback = ({
  cells,
  currentIndex,
  i,
  j,
  widthNum,
  heightNum,
}) => {
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

  console.log(nc);

  // if (nc === 1 || nc === 3) {
  //   console.log("alive");
  //   console.log(cells[currentIndex] | mask.aliveNext);
  // } else {
  //   console.log("dead");
  //   console.log(cells[currentIndex] & mask.alive);
  // }

  cells[currentIndex] = (
    (nc === 1 || nc === 3)
      ? cells[currentIndex] | mask.aliveNext
      : cells[currentIndex] & mask.alive
  );
  // | nc;
};

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

var drawCellsCallback = ({
  currentIndex,
  cells,
  i,
  j,
  cellWidth,
  cellHeight,
}) => {
  var current = cells[currentIndex];
  current & mask.alive
    && (
      // context.fillStyle = palette[current & mask.n],
      context.fillRect(i * cellWidth,
        j * cellHeight,
        cellWidth,
        cellHeight
      )
    );
};

var resetGenerationCallback = ({
  cells,
  currentIndex,
}) => {
  cells[currentIndex] =
    cells[currentIndex] & mask.aliveNext
      ? cells[currentIndex] | mask.alive
      : cells[currentIndex] & 0;
};