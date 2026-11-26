export function nextId(items: ReadonlyArray<{ id: number }>): number {
  return items.reduce((max, item) => Math.max(max, item.id), 0) + 1
}
