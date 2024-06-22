interface Array<T> {
  shuffle(first?: number, last?: number): T[],
  WrappedForEachConstructor<U>(img: any, callback: (img: any, arg0: {
    cells: number[],
    current: number,
    i: number,
    j: number,
    width: number,
    height: number,
    rowOffset: number
  }) => U): void,
  wrappedForEach<K>(callback: (img: any, arg0: {
    cells: number[],
    current: number,
    i: number,
    j: number,
    width: number,
    height: number,
    rowOffset: number
  }) => K): void,
}