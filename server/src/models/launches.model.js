const axios = require('axios');
// const launches = new Map();
const launchesDatabase = require('./launches.mongo');
const planets = require('./planets.mongo');

const DEFAULT_FLIGHT_NUMBER = 100;

const SPACEX_API_URL = 'https://api.spacexdata.com/v4/launches/query';

async function populateSpaceXLaunches() {
  console.log('Downloading launch data...');
  const spaceXData = await axios({
    url: SPACEX_API_URL,
    method: 'post',
    headers: {
      'content-type': 'application/json',
    },
    data: {
      options: {
        pagination: false,
        populate: [
          {
            path: 'rocket',
            select: { name: 1 },
          },
          {
            path: 'payloads',
            select: { customers: 1 },
          },
        ],
      },
    },
  });

  if (spaceXData.status !== 200) {
    console.error('Problem downloading SpaceX launch data');
    throw new Error('SpaceX launch data download failed');
  }
  // const results = await spaceXData.json();
  const launchDocs = spaceXData.data.docs;
  for (const launchDoc of launchDocs) {
    const payloads = launchDoc['payloads'];
    const customers = payloads.flatMap((payload) => payload['customers']);
    const launch = {
      flightNumber: launchDoc['flight_number'],
      mission: launchDoc['name'],
      rocket: launchDoc['rocket']['name'],
      launchDate: launchDoc['date_local'],
      customers,
      upcoming: launchDoc['upcoming'],
      success: launchDoc['success'],
      target: 'Earth',
    };
    await saveLaunch(launch);
  }
}

async function loadLaunchData() {
  const firstLaunch = await findLaunch({
    flightNumber: 1,
    rocket: 'Falcon 1',
    mission: 'FalconSat',
  });

  if (firstLaunch) {
    console.log('Launch data already loaded');
    return;
  }

  await populateSpaceXLaunches();
}

async function findLaunch(filter) {
  return await launchesDatabase.findOne(filter);
}

// launches.set(launch.flightNumber, launch);
async function saveLaunch(launch) {
  const existingPlanet = await planets.findOne(
    { keplerName: launch.target },
    { __v: 0 }
  );
  if (!existingPlanet) {
    throw new Error('No matching planet found!');
  }

  const newLaunch = Object.assign(launch, {
    target: existingPlanet._id,
  });
  await launchesDatabase.findOneAndUpdate(
    {
      flightNumber: launch.flightNumber,
    },
    newLaunch,
    {
      upsert: true,
    }
  );
}

async function existsLaunchWithId(launchId) {
  return await findLaunch({ flightNumber: launchId });
  // return launches.has(launchId);
}

async function getLatestFlightNumber() {
  const latestLaunch = await launchesDatabase.findOne().sort('-flightNumber');

  if (!latestLaunch) {
    return DEFAULT_FLIGHT_NUMBER;
  }
  return latestLaunch.flightNumber;
}

async function getAllLaunches(skip, limit) {
  // return Array.from(launches.values());
  return await launchesDatabase
    .find({}, { __v: 0, _id: 0 })
    .sort({ flightNumber: 1 })
    .skip(skip)
    .limit(limit);
}

async function scheduleNewLaunch(launch) {
  const lastFlightNumber = await getLatestFlightNumber();
  const newLaunch = Object.assign(launch, {
    flightNumber: lastFlightNumber + 1,
    customers: ['NASA', 'ZTM'],
  });
  await saveLaunch(newLaunch);
}

async function abortLaunchById(flightNumber) {
  return await launchesDatabase.findOneAndUpdate(
    { flightNumber },
    {
      upcoming: false,
      success: false,
    },
    {
      returnDocument: 'after',
    }
  );
  // const aborted = launches.get(flightNumber);
  // aborted.upcoming = false;
  // aborted.success = false;
  // return aborted;
}

module.exports = {
  getAllLaunches,
  scheduleNewLaunch,
  abortLaunchById,
  existsLaunchWithId,
  loadLaunchData,
};
