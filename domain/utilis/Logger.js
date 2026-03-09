class Logger {
  static enabled = false;

  static enable() {
    this.enabled = true;
  }

  static disable() {
    this.enabled = false;
  }

  static log(...args) {
    if (this.enabled) {
      console.log(...args);
    }
  }

  static error(...args) {
    if (this.enabled) {
      console.error(...args);
    }
  }

  static warn(...args) {
    if (this.enabled) {
      console.warn(...args);
    }
  }

  static info(...args) {
    if (this.enabled) {
      console.info(...args);
    }
  }
}
