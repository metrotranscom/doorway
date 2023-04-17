
export interface LoaderInterface {
  open(): void
  load(rows: object): void
  close(): void
}
