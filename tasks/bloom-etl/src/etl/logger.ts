export class Logger {
  printLogs = true

  public log(message: string) {
    if (this.printLogs) {
      console.log(message)
    }
  }
}
