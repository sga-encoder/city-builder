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
                this.amount += this.generatedAmount;
    
            case true://resta a los recursos
                this.amount -= this.generatedAmount;

            default: 
                console.log("su cara si es muy fea")
        
        return this.amount;
                
        }
    }

    static calculateAllAmount(energy, water, money, food) {
        if (energy instanceof Resources && energy.type !== "energy") {
            return false
        };
        if (water instanceof Resources && water.type !== "water") {
            return false
        };
        if (money instanceof Resources && money.type !== "money") {
            return false
        };
        if (food instanceof Resources && food.type !== "food") {
            return false
        }

        return energy.calculateAmount() + water.calculateAmount() + money.calculateAmount() + food.calculateAmount();

    }

    
}