
Building.initConfig().then(() => {
    let city = new City({
        id: 1,
        mayor: "John Doe",
        name: "New City",
        location: "USA",
        map: {
            layout: [
                ["r", "r", "r", "r", "r", "r", "r", "r", "r", "r", "r", "r", "r", "r", "r"],
                ["r", "R1", "R2", "R1", "S1", "P1", "S2", "r", "I1", "I2", "I1", "r", "C1", "C2", "r"],
                ["r", "R2", "R1", "R2", "S3", "g", "g", "r", "I2", "I1", "g", "r", "C2", "C1", "r"],
                ["r", "R1", "R2", "R1", "g", "P1", "g", "r", "I1", "I2", "I1", "r", "C1", "g", "r"],
                ["r", "r", "r", "r", "r", "r", "r", "r", "r", "r", "r", "r", "r", "r", "r"],
                ["r", "R1", "R2", "R1", "S2", "P1", "S1", "r", "U1", "U2", "g", "r", "C1", "C2", "r"],
                ["r", "R2", "R1", "R2", "S3", "g", "g", "r", "U2", "U1", "U1", "r", "C2", "C1", "r"],
                ["r", "R1", "R2", "R1", "g", "P1", "g", "r", "U1", "U2", "g", "r", "C1", "C2", "r"],
                ["r", "r", "r", "r", "r", "r", "r", "r", "r", "r", "r", "r", "r", "r", "r"],
                ["r", "R1", "R2", "R1", "S1", "P1", "S2", "r", "g", "g", "g", "r", "C1", "C2", "r"],
                ["r", "R2", "R1", "R2", "S3", "g", "g", "r", "g", "g", "g", "r", "C2", "C1", "r"],
                ["r", "R1", "R2", "R1", "g", "P1", "g", "r", "g", "g", "g", "r", "C1", "g", "r"],
                ["r", "r", "r", "r", "r", "r", "r", "r", "r", "r", "r", "r", "r", "r", "r"],
                ["g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g"],
                ["g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g", "g"],
            ],
            widthChunck: 5,
            heightChunk: 5,
            nameCointainer: ".container",
        },
        initialMoney: 1000,
        initialEnergy: 100,
        initialWater: 100,
        initialFood: 100,
        score: 0,
    });
});
