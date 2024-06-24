export var initArrayWrappedForEach = (
  widthNum: number,
  cellWidth: number,
  canvasWidth: number,
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
        canvasWidth,
        heightNum,
        rowOffset,
        cellWidth,
        cellHeight,
      });
    }
  };
};

export function shuffle(first = 0, last = this.length - 1) {
  var result: string[] = [];
  while(last-- >= first) {
    const j = Math.floor(Math.random() * (last + 1));
    [this[last], this[j]] = [this[j], this[last]];
    result.push(this[last]);
  }
  return result;
}