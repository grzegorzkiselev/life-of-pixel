interface WrappedForEachParams {
  cells: number[], // 1
  currentIndex: number, // 1
  i: number, // 1
  j: number, // 1
  widthNum: number, // 1
  cellWidth: number, // 1
  heightNum: number, // 1
  cellHeight: number, // 1
}
interface Array<T> {
  shuffle(first?: number, last?: number): T[],
}
interface Uint8Array {
  wrappedForEach<K>(callback: (arg0: WrappedForEachParams) => K): void,
}