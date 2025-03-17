const API_KEY = "de816c3713b77c5cb27688fda8055b29"; // Replace with your OpenWeatherMap API key

// Function to fetch weather data
function getWeather() {
    const city = document.getElementById("cityInput").value;
    if (!city) {
        alert("Please enter a city name!");
        return;
    }

    fetchWeatherData(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`);
}

// Function to get weather data based on user's location
function getLocationWeather() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            position => {
                const { latitude, longitude } = position.coords;
                fetchWeatherData(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`);
            },
            error => alert("Unable to retrieve location. Please enable location access.")
        );
    } else {
        alert("Geolocation is not supported by this browser.");
    }
}

// Fetch weather data and update UI
function fetchWeatherData(url) {
    fetch(url)
        .then(response => response.json())
        .then(data => {
            updateWeatherUI(data);
            changeBackground(data.weather[0].main); // Ensures background updates after search
        })
        .catch(error => alert("Error fetching data: " + error));
}

// Update UI with weather data
function updateWeatherUI(data) {
    if (data.cod !== 200) {
        alert("City not found!");
        return;
    }

    document.getElementById("city-name").textContent = data.name;
    document.getElementById("country-name").textContent = data.sys.country;
    document.getElementById("country-flag").src = `https://flagcdn.com/w40/${data.sys.country.toLowerCase()}.png`;
    document.getElementById("weather-main").textContent = data.weather[0].main;
    document.getElementById("weather-icon").src = `https://openweathermap.org/img/wn/${data.weather[0].icon}.png`;
    document.getElementById("temp").textContent = data.main.temp;
    document.getElementById("feels-like").textContent = data.main.feels_like;
    document.getElementById("wind").textContent = data.wind.speed;
    document.getElementById("humidity").textContent = data.main.humidity;
    document.getElementById("visibility").textContent = (data.visibility / 1000).toFixed(1);
    document.getElementById("sunrise").textContent = formatTime(data.sys.sunrise);
    document.getElementById("sunset").textContent = formatTime(data.sys.sunset);
}

// Convert Unix timestamp to readable time
function formatTime(timestamp) {
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// Function to toggle dark mode
const toggleMode = document.getElementById("toggle-mode");
const body = document.body;

toggleMode.addEventListener("click", () => {
    body.classList.toggle("light-mode");
});

/* Ensure it toggles smoothly */
if (localStorage.getItem("mode") === "light") {
    document.body.classList.add("light-mode");
}


// Function to fetch city suggestions (Updated to display properly)
async function fetchCitySuggestions() {
    const cityInput = document.getElementById("cityInput").value.trim();
    if (cityInput.length < 3) {
        document.getElementById("suggestions").innerHTML = "";
        return;
    }

    const apiKey = "de816c3713b77c5cb27688fda8055b29"; // Replace with your actual OpenWeather API key
    const apiUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${cityInput}&limit=5&appid=${apiKey}`;

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error(`HTTP Error! Status: ${response.status}`);

        const data = await response.json();
        console.log("City Suggestions:", data); // Debugging purpose

        if (data.length > 0) {
            // Remove duplicates based on city and country
            const uniqueCities = new Map();
            data.forEach(city => {
                const key = `${city.name}, ${city.country}`;
                if (!uniqueCities.has(key)) {
                    uniqueCities.set(key, city);
                }
            });

            // Convert to list items
            const suggestionsList = Array.from(uniqueCities.keys())
                .map(city => `<li class="list-group-item" onclick="selectCity('${city}')">${city}</li>`)
                .join("");

            document.getElementById("suggestions").innerHTML = suggestionsList;
        } else {
            document.getElementById("suggestions").innerHTML = "<li class='list-group-item disabled'>No suggestions found</li>";
        }
    } catch (error) {
        console.error("Error fetching city suggestions:", error);
        document.getElementById("suggestions").innerHTML = "<li class='list-group-item disabled'>Error fetching suggestions</li>";
    }
}



function selectCity(city) {
    document.getElementById("cityInput").value = city;
    document.getElementById("suggestions").innerHTML = "";
}

// Function to select a city from suggestions
function selectCity(city) {
    document.getElementById("cityInput").value = city;
    document.getElementById("suggestions").innerHTML = "";
}

// Function to change background image based on weather
function changeBackground(weather) {
    let query = "nature";
    if (weather.includes("Clear")) query = "sunny sky";
    else if (weather.includes("Clouds")) query = "cloudy sky";
    else if (weather.includes("Rain")) query = "rainy weather";
    else if (weather.includes("Thunderstorm")) query = "thunderstorm";
    else if (weather.includes("Snow")) query = "snow winter";
    else if (weather.includes("Fog") || weather.includes("Mist")) query = "foggy mist";

    fetch(`https://api.unsplash.com/photos/random?query=${query}&client_id=PyPot6jO9iqlIurJe9cus0JNH1CdcCi2fliTADSvBts`)
    .then(response => response.json())
    .then(data => {
        document.body.style.background = `url('${data.urls.regular}') no-repeat center center/cover`;
    })
    .catch(error => console.error("Error fetching background image:", error));
}


// Event listener to trigger suggestions as user types
document.getElementById("cityInput").addEventListener("input", fetchCitySuggestions);
