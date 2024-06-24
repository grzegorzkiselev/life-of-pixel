interface WrappedForEachParams {
  cells: number[],
  currentIndex: number,
  i: number,
  j: number,
  widthNum: number,
  cellWidth: number,
  heightNum: number,
  cellHeight: number,
  rowOffset: number,
}
interface Array<T> {
  shuffle(first?: number, last?: number): T[],
}
interface Uint8Array {
  wrappedForEach<K>(callback: (arg0: WrappedForEachParams) => K): void,
}