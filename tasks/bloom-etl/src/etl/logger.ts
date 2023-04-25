export class Logger {
  printLogs = true

  public log(message: string) {
    if (this.printLogs) {
      console.log(`[INFO] ${message}`)
    }
  }

  public error(err: Error) {
    console.error(`[ERROR] ${err.stack}`)
  }
}
