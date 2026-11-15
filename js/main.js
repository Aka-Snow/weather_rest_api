// sky check - main script
// one rest api call: weatherapi.com current weather

'use strict';

// paste your own free key from https://www.weatherapi.com/signup.aspx
const apiKey = '209a072f34d94778b3e11012261511';
const apiUrl = 'https://api.weatherapi.com/v1/current.json';

// page elements
const citySelect = document.querySelector('#city-select');
const unitButtons = document.querySelectorAll('.unit-button');
const card = document.querySelector('#weather-card');
const message = document.querySelector('#message');
const placeEl = document.querySelector('#place');
const localTimeEl = document.querySelector('#local-time');
const iconEl = document.querySelector('#weather-icon');
const temperatureEl = document.querySelector('#temperature');
const descriptionEl = document.querySelector('#description');
const feelsLikeEl = document.querySelector('#feels-like');
const humidityEl = document.querySelector('#humidity');
const windEl = document.querySelector('#wind');

// the latest api response, kept so the unit toggle can redraw without a new request
let latestData = null;
let unit = 'c';
let requestCount = 0;

// ---------- small helpers ----------

// storage can be blocked in some browsers, so it is always wrapped
function saveSetting(name, value) {
  try {
    localStorage.setItem(name, value);
  } catch (error) {
    // not a problem, the setting just will not be remembered
  }
}

function loadSetting(name) {
  try {
    return localStorage.getItem(name);
  } catch (error) {
    return null;
  }
}

// switches the card between loading, ready and error
function showState(state, text) {
  card.dataset.state = state;
  if (text) {
    message.textContent = text;
  }
}

// ---------- theme ----------

// picks a background theme from the time of day and the weather text
function chooseTheme(isDay, conditionText) {
  const text = conditionText.toLowerCase();

  if (!isDay) {
    return 'night';
  }
  if (/rain|drizzle|thunder|shower/.test(text)) {
    return 'rain';
  }
  if (/snow|sleet|ice|blizzard|freezing/.test(text)) {
    return 'snow';
  }
  if (/cloud|overcast|mist|fog/.test(text)) {
    return 'cloudy';
  }
  return 'clear';
}

// ---------- drawing the card ----------

// local time in the selected city, built from the city's time zone
function formatLocalTime(location) {
  const date = new Date(location.localtime_epoch * 1000);

  return date.toLocaleString('en-US', {
    timeZone: location.tz_id,
    weekday: 'long',
    hour: 'numeric',
    minute: '2-digit'
  });
}

// shows the saved api response using the chosen unit (no new request needed)
function renderWeather() {
  if (!latestData) {
    return;
  }

  const location = latestData.location;
  const current = latestData.current;
  const isMetric = unit === 'c';

  placeEl.textContent = location.name + ', ' + location.country;
  localTimeEl.textContent = formatLocalTime(location);

  // the icon url starts with // so add https:, then ask for the larger 128px picture
  const iconUrl = 'https:' + current.condition.icon;
  iconEl.src = iconUrl.replace('64x64', '128x128');
  iconEl.alt = current.condition.text;

  // if the large icon is missing, fall back to the original one
  iconEl.onerror = function () {
    iconEl.onerror = null;
    iconEl.src = iconUrl;
  };

  temperatureEl.textContent = Math.round(isMetric ? current.temp_c : current.temp_f) + '°' + unit.toUpperCase();
  descriptionEl.textContent = current.condition.text;
  feelsLikeEl.textContent = Math.round(isMetric ? current.feelslike_c : current.feelslike_f) + '°' + unit.toUpperCase();
  humidityEl.textContent = current.humidity + '%';
  windEl.textContent = isMetric
    ? Math.round(current.wind_kph) + ' km/h'
    : Math.round(current.wind_mph) + ' mph';

  document.body.dataset.theme = chooseTheme(current.is_day === 1, current.condition.text);
  showState('ready');
}

// ---------- the api call ----------

async function getWeather(city) {
  // a number for this request, so a slow old answer cannot replace a newer one
  requestCount += 1;
  const thisRequest = requestCount;

  if (apiKey === 'YOUR_API_KEY_HERE') {
    showState('error', 'add your weatherapi.com key at the top of js/main.js');
    return;
  }

  showState('loading', 'loading weather...');

  try {
    const response = await fetch(apiUrl + '?key=' + apiKey + '&q=' + encodeURIComponent(city));
    const data = await response.json();

    // ignore this answer if the person already picked another city
    if (thisRequest !== requestCount) {
      return;
    }

    // the api sends an error object for problems like a bad key or unknown place
    if (data.error) {
      showState('error', data.error.message);
      return;
    }

    latestData = data;
    renderWeather();
  } catch (error) {
    if (thisRequest === requestCount) {
      showState('error', 'sorry, the weather could not be loaded. check your connection and try again.');
    }
  }
}

// ---------- events ----------

citySelect.addEventListener('change', function () {
  saveSetting('skycheck-city', citySelect.value);
  getWeather(citySelect.value);
});

unitButtons.forEach(function (button) {
  button.addEventListener('click', function () {
    unit = button.dataset.unit;
    saveSetting('skycheck-unit', unit);

    unitButtons.forEach(function (other) {
      other.setAttribute('aria-pressed', String(other === button));
    });

    renderWeather();
  });
});

// ---------- start up ----------

// bring back the last city and unit the person used
const savedCity = loadSetting('skycheck-city');
if (savedCity && citySelect.querySelector('option[value="' + savedCity + '"]')) {
  citySelect.value = savedCity;
}

const savedUnit = loadSetting('skycheck-unit');
if (savedUnit === 'f') {
  unit = 'f';
  unitButtons.forEach(function (button) {
    button.setAttribute('aria-pressed', String(button.dataset.unit === 'f'));
  });
}

getWeather(citySelect.value);
