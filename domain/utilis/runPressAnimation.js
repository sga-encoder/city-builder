export function runPressAnimation(btn) {
  return new Promise((resolve) => {
    if (!btn) return resolve();

    const DOWN_MS = 350;
    const END_MS = 450;

    const clearAllPressClasses = () => {
      btn.classList.remove(
        "is-pressing-down-hover",
        "is-pressing-down-rest",
        "is-pressing-end-hover",
        "is-pressing-end-rest",
      );
    };

    clearAllPressClasses();
    void btn.offsetWidth; // reinicia ciclo completo

    btn.classList.add(
      btn.matches(":hover") ? "is-pressing-down-hover" : "is-pressing-down-rest",
    );

    setTimeout(() => {
      btn.classList.remove("is-pressing-down-hover", "is-pressing-down-rest");
      void btn.offsetWidth;

      btn.classList.add(
        btn.matches(":hover") ? "is-pressing-end-hover" : "is-pressing-end-rest",
      );

      setTimeout(() => {
        clearAllPressClasses();
        resolve();
      }, END_MS + 20);
    }, DOWN_MS + 20);
  });
}