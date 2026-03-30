export class CssReloadObserverManager {
  static observers = new Set();
  static mutationObserver = null;
  static started = false;

  static addObserver(callback) {
    if (typeof callback !== "function") return () => {};
    this.observers.add(callback);
    this.start();
    return () => this.removeObserver(callback);
  }

  static removeObserver(callback) {
    this.observers.delete(callback);
    if (this.observers.size === 0) {
      this.stop();
    }
  }

  static notify(payload) {
    for (const callback of this.observers) {
      try {
        callback(payload);
      } catch (error) {
        console.error("[CssReloadObserverManager] callback error:", error);
      }
    }
  }

  static start() {
    if (this.started) return;
    const hasDom =
    typeof document !== "undefined" &&
    typeof MutationObserver !== "undefined" &&
    !!document.head;

    if (!hasDom) return;

    this.started = true;
    this.mutationObserver = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
        if (
            node &&
            node.nodeType === 1 &&
            node.nodeName === "LINK" &&
            node.rel === "stylesheet"
        ) {
            node.addEventListener(
            "load",
            () => this.notify({ type: "stylesheet-load", node }),
            { once: true }
            );
        }
        }
    }
    });

    this.mutationObserver.observe(document.head, { childList: true });
  }

  static stop() {
    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
      this.mutationObserver = null;
    }
    this.started = false;
  }
}