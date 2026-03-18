export class Logger {
  static enabled = {
    state: false,
    classes: [],
  };

  static types = {};

  static enable(classes = []) {
    this.enabled.state = true;
    this.setClassFilter(classes);
  }

  static disable() {
    this.enabled.state = false;
  }

  static setClassFilter(classes = []) {
    if (!Array.isArray(classes)) {
      this.enabled.classes = [];
      return;
    }

    this.enabled.classes = [
      ...new Set(classes.map((item) => String(item).trim()).filter(Boolean)),
    ];
  }

  static clearClassFilter() {
    this.enabled.classes = [];
  }

  static getTypes() {
    return { ...this.types };
  }

  static resetTypes() {
    this.types = {};
  }

  static _extractClass(args) {
    const classPattern = /\[([^\]]+)\]/;

    for (const arg of args) {
      if (typeof arg !== "string") {
        continue;
      }

      const match = arg.match(classPattern);
      if (match && match[1]) {
        const className = match[1].trim();
        if (className) {
          return className;
        }
      }
    }

    return null;
  }

  static _registerType(className) {
  if (!className) return;
  if (!this.enabled.state) return; // Solo registra si está habilitado
  this.types[className] = (this.types[className] || 0) + 1;
}

  static _shouldProject(className) {
    if (!this.enabled.state) {
      return false;
    }

    if (this.enabled.classes.length === 0) {
      return true;
    }

    return Boolean(className) && this.enabled.classes.includes(className);
  }

  static _project(method, args) {
    const className = this._extractClass(args);
    this._registerType(className);

    if (this._shouldProject(className)) {
      console[method](...args);
    }
  }

  static log(...args) {
    this._project("log", args);
  }

  static error(...args) {
    this._project("error", args);
  }

  static warn(...args) {
    this._project("warn", args);
  }

  static info(...args) {
    this._project("info", args);
  }

}

