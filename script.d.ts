interface WrappedForEachParams {
  cells: number[],
  currentIndex: number,
  i: number,
  j: number,
  width: number,
  height: number,
  rowOffset: number
}
interface Array<T> {
  shuffle(first?: number, last?: number): T[],
  WrappedForEachConstructor<U>(img: any, callback: (img: any, arg0: WrappedForEachParams) => U): void,
  wrappedForEach<K>(callback: (img: any, arg0: WrappedForEachParams) => K): void,
}