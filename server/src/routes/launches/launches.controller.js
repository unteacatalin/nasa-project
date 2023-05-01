const {
  getAllLaunches,
  scheduleNewLaunch,
  abortLaunchById,
  existsLaunchWithId,
} = require('../../models/launches.model');

const { getPagination } = require('../../services/query');

async function httpGetAllLaunches(req, res) {
  const { skip, limit } = getPagination(req.query);
  const launches = await getAllLaunches(skip, limit);
  return res.status(200).json(launches);
}

async function httpAddNewLaunch(req, res) {
  const launch = req.body;

  if (
    !launch.mission ||
    !launch.launchDate ||
    !launch.rocket ||
    !launch.target
  ) {
    return res.status(400).json({
      error: 'Missing required launch property',
    });
  }

  launch.launchDate = new Date(launch.launchDate);
  if (isNaN(launch.launchDate)) {
    return res.status(400).json({
      error: 'Invalid launch date',
    });
  }

  await scheduleNewLaunch(launch);
  res.status(201).json(launch);
}

async function httpAbortLaunch(req, res) {
  const flightNumber = Number(req.params.flightNumber);
  // if launch doesn't exist
  const existsLaunch = await existsLaunchWithId(flightNumber);
  if (!existsLaunch) {
    return res.status(404).json({
      error: 'Launch not found',
    });
  }
  // if launch does exist
  const aborted = await abortLaunchById(flightNumber);
  if (!aborted) {
    return res.status(400).json({
      error: 'Launch not aborted',
    });
  }
  res.status(200).json(aborted);
}

module.exports = { httpGetAllLaunches, httpAddNewLaunch, httpAbortLaunch };
