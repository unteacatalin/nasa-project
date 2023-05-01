const fs = require('fs');
const path = require('path');

const { parse } = require('csv-parse');

const habitablePlanets = require('./planets.mongo');

// const habitablePlanets = [];

const planetEarth = {
  kepler_name: 'Earth',
};

savePlanet(planetEarth);

function isHabitablePlanet(planet) {
  return (
    planet['koi_disposition'] === 'CONFIRMED' &&
    planet['koi_insol'] > 0.36 &&
    planet['koi_insol'] < 1.11 &&
    planet['koi_prad'] < 1.6
  );
}

/*
const promise = new Promise((resolve, reject) => {
    resolve(42)
});
promise.then((result) => {

})
const result = await promise;
*/

function loadPlanetsData() {
  return new Promise((resolve, reject) => {
    fs.createReadStream(
      path.join(__dirname, '..', '..', 'data', 'kepler_data.csv')
    )
      .pipe(
        parse({
          comment: '#',
          columns: true,
        })
      )
      .on('data', async (data) => {
        if (isHabitablePlanet(data)) {
          // habitablePlanets.push(data);
          // insert + update = upsert
          await savePlanet(data);
        }
      })
      .on('error', (err) => {
        console.error(err);
        reject(err);
      })
      .on('end', async () => {
        const countPlanetsFound = (await getAllPlanets()).length;
        console.log(`
          ${countPlanetsFound} habitable planets found!
        `);
        resolve();
      });
  });
}

async function getAllPlanets() {
  return await habitablePlanets.find({}, { keplerName: 1, _id: 1 });
}

async function savePlanet(planet) {
  try {
    await habitablePlanets.updateOne(
      { keplerName: planet.kepler_name },
      { keplerName: planet.kepler_name },
      {
        upsert: true,
      }
    );
  } catch (err) {
    console.error(`Could not save planet ${err}`);
  }
}

module.exports = {
  loadPlanetsData,
  // planets: habitablePlanets,
  getAllPlanets,
};
