class turnBaseSystem {
  constructor(dict) {
    this.actualTurn = dict.actualTurn;
    this.turnDuration = dict.turnDuration; // en milisegundos
    this.timerId = null;
    this.isRunning = false;
    this.onTurnChange = null; // callback cuando cambia turno
  }

  nextTurn = () => {
    this.actualTurn += 1;
    console.log(`Turno: ${this.actualTurn}`);
    if (this.onTurnChange) {
      this.onTurnChange(this.actualTurn);
    }
  }

  // Iniciar el sistema de detección de tiempo
  start = () => {
    if (this.isRunning) return;
    this.isRunning = true;
    this.timerId = setInterval(() => {
      this.nextTurn();
    }, this.turnDuration);
    console.log(`Sistema iniciado. Turno cada ${this.turnDuration}ms`);
  }

  // Pausar el sistema
  pause = () => {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.isRunning = false;
      console.log('Sistema pausado');
    }
  }

  // Reanudar el sistema
  resume = () => {
    this.start();
  }

  // Resetear
  reset = () => {
    this.pause();
    this.actualTurn = 0;
    console.log('Sistema detenido y reseteado');
  }

  // Ejecutar una función en cada cambio de turno
  onTurnChange = (callback) => {
    this.onTurnChange = callback;
  }

  getTurn = () => {
    return this.actualTurn;
  }
}