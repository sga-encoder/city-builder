class Resources {
    constructor(generatedAmount, type,consumed) {
        this.type = type;
        this.generatedAmount = 0;
        this.consumed = consumed;
        this.waterAmount=0;
        this.electricityAmount=0;
        this.moneyAmount=0;
        this.foodAmount=0;
    }


    calculateWateramount() {
        if (this.consumed==true) {
            this.generatedAmount-= this.waterAmount;
        }
        else{
            if (this.type === "water") {
                this.generatedAmount += this.waterAmount;
            }
    }     
    
    return this.electricityAmount;

    }
    
     calculateelectricityamount() {
        if (this.consumed==true) {
            this.generatedAmount-= this.electricityAmount;
        }
        else{
            if (this.type === "electricity") {
                this.generatedAmount += this.electricityAmount;
            }
        }     
        return this.electricityAmount;

    }

    calculateMoneyAmount() {
        if (this.consumed==true) {
            this.generatedAmount-= this.moneyAmount;
        }
        else{
            if (this.type === "money") {
                this.generatedAmount += this.moneyAmount;
            }
        }
        return this.moneyAmount;
    }

    calculateFoodAmount() {
        if (this.consumed==true) {
            this.generatedAmount-= this.foodAmount;
        }
        else{
            if (this.type === "food") {
                this.generatedAmount += this.foodAmount;
            }
        }
        
        return this.foodAmount;
    }

    
}