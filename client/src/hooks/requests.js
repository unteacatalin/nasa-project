const API_URL = 'http://localhost:5000/api/v1';

async function httpGetPlanets() {
  // Load planets and return as JSON.
  try {
    const response = await fetch(`${API_URL}/planets`);
    return await response.json();
  } catch (err) {
    console.log(err);
  }
}

async function httpGetLaunches() {
  // Load launches, sort by flight number, and return as JSON.
  try {
    const response = await fetch(`${API_URL}/launches`);
    const fetchedLaunches = await response.json();
    const newFetchedLaunches = fetchedLaunches.map((launch) =>
      Object.assign(launch, {
        target: launch.target.keplerName,
      })
    );
    return newFetchedLaunches.sort((a, b) => {
      return a.flightNumber - b.flightNumber;
    });
  } catch (err) {
    console.log(err);
  }
}

async function httpSubmitLaunch(launch) {
  // Submit given launch data to launch system.
  try {
    const result = await fetch(`${API_URL}/launches`, {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(launch),
    });
    return result;
  } catch (err) {
    console.log(err);
    return { ok: false };
  }
}

async function httpAbortLaunch(id) {
  // Delete launch with given ID.
  try {
    return await fetch(`${API_URL}/launches/${id}`, {
      method: 'delete',
    });
  } catch (err) {
    console.log(err);
    return { ok: false };
  }
}

export { httpGetPlanets, httpGetLaunches, httpSubmitLaunch, httpAbortLaunch };
