export var initArrayWrappedForEach = (
  widthNum: number,
  cellWidth: number,
  heightNum: number,
  cellHeight: number,
): typeof Uint8Array.prototype.wrappedForEach => {
  return function wrappedForEach(callback) {
    for (
      var i = 0, j = 0, rowOffset = 0;
      i < widthNum && j < heightNum;
      i + 1 === widthNum
        ? (i = 0, j++, rowOffset += widthNum)
        : i++
    ) {
      callback({
        cells: this,
        currentIndex: i + rowOffset,
        i,
        j,
        widthNum,
        heightNum,
        cellWidth,
        cellHeight,
      });
    }
  };
};

export var shuffle = (array) => {
  var result = [...array];
  var i = array.length;
  while(i--) {
    var j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};