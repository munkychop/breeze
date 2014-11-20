// -------------------------------------------------------
// Create a closure to ensure that we don't pollute the
// global scope.
// -------------------------------------------------------
(function (){
	
	// -------------------------------------------------------
	// Define constants.
	// These are variables that won't change at runtime.
	// -------------------------------------------------------
	var API_KEY = "YOUR_API_KEY_HERE";
	var API_UNITS = "metric"; // otherwise change to 'imperial'.
	var API_URL = "http://api.openweathermap.org/data/2.5/weather?APPID=" + API_KEY + "&units=" + API_UNITS;

	var TEMPERATURE_FREEZING = {maxCelcius : 0, className : "freezing"};
	var TEMPERATURE_COLD = {maxCelcius : 8, className : "cold"};
	var TEMPERATURE_WARM = {maxCelcius : 16, className : "warm"};
	var TEMPERATURE_HOT = {maxCelcius : 24, className : "hot"};
	var TEMPERATURE_BLAZING = {maxCelcius : Number.POSITIVE_INFINITY, className : "blazing"};

	// Use '°C' for metric units, or  '°F' for imperial units.
	var UNITS_SUFFIX = API_UNITS === "metric" ? "°C" : "°F";

	var LOCATION_NOT_FOUND_MESSAGE = "Location not found. Please search for something else.";

	// -------------------------------------------------------
	// Define variables.
	// -------------------------------------------------------
	var _mainContainer;
	var _locationSearchForm;
	var _locationSearchInput;
	var _currentTemperatureClassName;
	var _temperatureDisplay;
	var _waitingForData;
	var _waitingForGeolocation;
	var _geolocation;

	// Add an event listener to ensure the DOM has loaded before
	// initialising the application.
	document.addEventListener("DOMContentLoaded", init);

	// -------------------------------------------------------
	// Initialisation function.
	// -------------------------------------------------------
	function init ()
	{
		_mainContainer = document.querySelector(".main-container");
		_locationLinks = document.querySelectorAll(".location-link");
		_locationSearchForm = document.querySelector("#location-search-form");
		_locationSearchInput = document.querySelector(".location-search-input");
		_locationNameDisplay = document.querySelector(".location-name-display");
		_temperatureDisplay = document.querySelector(".temperature-display");

		_waitingForData = false;

		// Add a listener for when the search form is submitted.
		_locationSearchForm.addEventListener("submit", locationSearchFormSubmitHandler, false);

		// Get the geo position of the current user (if they allow this).
		_waitingForGeolocation = true;
		_geolocation = navigator.geolocation.watchPosition(showCurrentLocationWeatherInformation, geolocationErrorHandler);
	}

	function showCurrentLocationWeatherInformation (position)
	{
		// Stop watching for geolocation changes now that we have the user's position.
		navigator.geolocation.clearWatch(_geolocation);
		_waitingForGeolocation = false;

		var lat = position.coords.latitude;
		var lon = position.coords.longitude;

		getWeatherDataFromCoords(lat, lon);
	}

	function geolocationErrorHandler (error)
	{
		// Stop watching for geolocation changes because the user has disallowed geo,
		// or there was a general error obtaining the info.
		navigator.geolocation.clearWatch(_geolocation);
		_waitingForGeolocation = false;
	}

	function locationSearchFormSubmitHandler (event)
	{
		event.preventDefault();

		if (_waitingForGeolocation)
		{
			// Stop watching for geolocation changes because the user is now searching
			// for other locations, and so we no longer need to display their geolocation.
			navigator.geolocation.clearWatch(_geolocation);
			_waitingForGeolocation = false;
		}
		
		console.log("form submit.", _locationSearchInput.value);

		if (_locationSearchInput.value !== "")
		{
			getWeatherDataFromLocationName(_locationSearchInput.value);
			_locationSearchInput.value = "";
		}
	}

	function getWeatherDataFromCoords (lat, lon)
	{
		// don't do anything if we are waiting on the response of a previous API request.
		if (_waitingForData)
		{
			return false;
		}

		// disable API requests until we receive a response.
		_waitingForData = true;

		console.log("getting weather data...", lat, lon);

		// Build a request URL based on the current lat and lon values.
		var requestURL = API_URL + "&lat=" + lat + "&lon=" + lon;

		// Make an AJAX request to the API.
		atomic.get(requestURL)
			.success(apiRequestSuccess)
			.error(apiRequestError);
	}

	function getWeatherDataFromLocationName (locationName)
	{
		// don't do anything if we are waiting on the response of a previous API request.
		if (_waitingForData)
		{
			return false;
		}

		// disable API requests until we receive a response.
		_waitingForData = true;

		console.log("getting weather data...", locationName);

		// Build a request URL based on the current lat and lon values.
		var requestURL = API_URL + "&q=" + locationName;

		// Make an AJAX request to the API.
		atomic.get(requestURL)
			.success(apiRequestSuccess)
			.error(apiRequestError);
	}

	function apiRequestSuccess (data, xhr)
	{
		console.log("weather data received.", data);

		// reenable data lookups now that the API response has been received.
		_waitingForData = false;

		if (typeof data.cod !== "undefined" && data.cod === "404")
		{
			alert(LOCATION_NOT_FOUND_MESSAGE);
			return;
		}

		// Get the location name, country code, and temperature from the data object
		// returned by the API, ensuring that we round it to the nearest integer.
		var locationName = data.name;
		var countryCode = data.sys.country;
		var temperature = Math.round(data.main.temp);

		// don't display anything if there is no name and country code.
		if (locationName === "" && countryCode === "")
		{
			alert(LOCATION_NOT_FOUND_MESSAGE);
			return;
		}

		updateLocationData(locationName, countryCode, temperature);
		updateBackgroundColor(temperature);
	}

	function apiRequestError (data, xhr)
	{
		console.log("error", data);

		// reenable data lookups so that we can retry requesting weather data.
		_waitingForData = false;
	}

	function updateLocationData(locationName, countryCode, temperature)
	{
		if (locationName !== "")
		{
			_locationNameDisplay.innerHTML = locationName + ", " + countryCode;
		}
		else
		{
			_locationNameDisplay.innerHTML = countryCode;
		}

		_temperatureDisplay.innerHTML = temperature + UNITS_SUFFIX;
	}

	function updateBackgroundColor (temperature)
	{
		// If we previously set a temperature class name on the main
		// container element then remove it here.
		if (typeof _currentTemperatureClassName !== "undefined")
		{
			_mainContainer.classList.remove(_currentTemperatureClassName);
		}

		// Set the '_currentTemperatureClassName' variable based on the
		// constants we defined earlier.
		if (temperature <= TEMPERATURE_FREEZING.maxCelcius)
		{
			_currentTemperatureClassName = TEMPERATURE_FREEZING.className;
		}
		else if (temperature <= TEMPERATURE_COLD.maxCelcius)
		{
			_currentTemperatureClassName = TEMPERATURE_COLD.className;
		}
		else if (temperature <= TEMPERATURE_WARM.maxCelcius)
		{
			_currentTemperatureClassName = TEMPERATURE_WARM.className;
		}
		else if (temperature <= TEMPERATURE_HOT.maxCelcius)
		{
			_currentTemperatureClassName = TEMPERATURE_HOT.className;
		}
		else
		{
			_currentTemperatureClassName = TEMPERATURE_BLAZING.className;
		}

		// set a temperature class name on the main container element.
		_mainContainer.classList.add(_currentTemperatureClassName);
	}

})();