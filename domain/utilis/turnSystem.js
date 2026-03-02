class turnBaseSystem {
  constructor(dict) {
    this.actualTurn = dict.actualTurn;
    this.turnDuration = dict.turnDuration;
  }

  nextTurn = () => {
    this.actualTurn += 1;
    
  }
}