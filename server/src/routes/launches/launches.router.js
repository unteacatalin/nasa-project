const express = require('express');

const {
  httpGetAllLaunches,
  httpAddNewLaunch,
  httpAbortLaunch,
} = require('./launches.controller');

const launchesRouter = express.Router();

launchesRouter.route('/').get(httpGetAllLaunches).post(httpAddNewLaunch);
launchesRouter.delete('/:flightNumber', httpAbortLaunch);

module.exports = launchesRouter;
