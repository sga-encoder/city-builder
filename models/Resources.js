class Resources {
    constructor(generatedAmount, type,consumed) {
        this.type = type;
        this.generatedAmount = 0;
        this.consumed = consumed;
        this.amount=0;
    }

    calculateAmount() {
        switch (this.consumed) {
            case false://suma a los recursos
                switch (this.type) {
                    case "electricity":
                        this.amount += this.generatedAmount;
                        break;
                    case "water":
                        this.amount += this.generatedAmount;
                        break;
                    case "money":
                        this.amount += this.generatedAmount;
                        break;
                    case "food":
                        this.amount += this.generatedAmount;
                        break;
                    default:
                        console.warn(`Tipo de recurso invalido: ${this.type}`);
                }
            case true://resta a los recursos
                switch (this.type) {
                    case "electricity":
                        this.amount -= this.generatedAmount;
                        break;
                    case "water":
                        this.amount -= this.generatedAmount;
                        break;
                    case "money":
                        this.amount -= this.generatedAmount;
                        break;
                    case "food":
                        this.amount -= this.generatedAmount;
                        break;
                    default:
                        console.warn(`Tipo de recurso invalido: ${this.type}`);    
                }
        
        return this.amount;
                
        }
    }

    
}