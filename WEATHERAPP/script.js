const apikey = "2e608d95678e5e9b01615755102cf421";

const main = document.getElementById("main");
const form = document.getElementById("form");
const search = document.getElementById("search");

const apiUrl = (city) => `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apikey}`;

async function fetchWeatherData(city) {
  try {
    const response = await fetch(apiUrl(city), { origin: "cors" });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
    return null;
  }
}

function processWeatherData(data) {
  const temp = KtoC(data.main.temp);
  const humidity = data.main.humidity;
  const windSpeed = data.wind.speed;

  return {
    temp,
    humidity,
    windSpeed,
    weatherIcon: data.weather[0].icon,
    weatherMain: data.weather[0].main,
  };
}

function renderWeatherUI(data) {
  const weatherHTML = `
    <h2><img src="https://openweathermap.org/img/wn/${data.weatherIcon}@2x.png" /> ${data.temp}°C <img src="https://openweathermap.org/img/wn/${data.weatherIcon}@2x.png" /></h2>
    <small>${data.weatherMain}</small>
    <div class="more-info">
      <p>Humidity : <span>${data.humidity}%</span></p>
      <p>Wind speed : <span>${+Math.trunc(data.windSpeed * 3.16)}km/h</span></p>
    </div>
  `;

  main.innerHTML = "";
  main.appendChild(document.createElement("div")).innerHTML = weatherHTML;
}

function KtoC(K) {
  return Math.floor(K - 273.15);
}

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const city = search.value;

  if (city) {
    fetchWeatherData(city)
      .then((data) => processWeatherData(data))
      .then((data) => renderWeatherUI(data));
  }
});