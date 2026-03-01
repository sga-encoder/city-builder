Building.initConfig().then(async data => {
  const svgInjector = await SVGInjector.create(data.builds);
  let city = new City({
    id: 1,
    mayor: "John Doe",
    name: "New City",
    location: "USA",
    map: {
      layout: [
        ["I1"]
      ],
      widthChunck: 100,
      heightChunk: 100,
      nameCointainer: ".container",
      SVGInjector: svgInjector,
    },
    initialMoney: 1000,
    initialEnergy: 100,
    initialWater: 100,
    initialFood: 100,
    score: 0,
  });
});

