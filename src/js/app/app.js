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
	var API_UNIT_TYPE = "metric"; // otherwise change to 'imperial'.
	var API_URL = "http://api.openweathermap.org/data/2.5/weather?APPID=" + API_KEY + "&units=" + API_UNIT_TYPE;

	var TEMPERATURE_FREEZING = {maxCelcius : 0, className : "freezing"};
	var TEMPERATURE_COLD = {maxCelcius : 8, className : "cold"};
	var TEMPERATURE_WARM = {maxCelcius : 16, className : "warm"};
	var TEMPERATURE_HOT = {maxCelcius : 24, className : "hot"};
	var TEMPERATURE_BLAZING = {maxCelcius : Number.POSITIVE_INFINITY, className : "blazing"};

	// Use '°C' for metric units, or  '°F' for imperial units.
	var UNITS_SUFFIX = API_UNIT_TYPE === "metric" ? "°C" : "°F";

	var MESSAGE_LOCATION_NOT_FOUND = "Location not found. Please search for something else.";
	var MESSAGE_API_REQUEST_ERROR = "There was a problem getting weather data. Please try again.";
	var MESSAGE_SEARCH_NOT_SPECIFIED = "Please specify a search term.";

	// -------------------------------------------------------
	// Define variables.
	// -------------------------------------------------------
	var _mainContainer;
	var _locationSearchForm;
	var _locationSearchSubmitWrapper;
	var _locationSearchInput;
	var _currentTemperatureClassName;
	var _locationNameDisplay;
	var _temperatureDisplay;
	var _waitingForData;

	// Add an event listener to ensure the DOM has loaded before
	// initialising the application.
	document.addEventListener("DOMContentLoaded", init);

	// -------------------------------------------------------
	// Initialisation function.
	// -------------------------------------------------------
	function init ()
	{
		_mainContainer = document.querySelector(".main-container");
		_locationSearchForm = document.querySelector("#location-search-form");
		_locationSearchSubmitWrapper = document.querySelector(".location-search-submit-wrapper");
		_locationSearchInput = document.querySelector(".location-search-input");
		_locationNameDisplay = document.querySelector(".location-name-display");
		_temperatureDisplay = document.querySelector(".temperature-display");

		_waitingForData = false;

		// Add a listener for when the search form is submitted.
		_locationSearchForm.addEventListener("submit", locationSearchFormSubmitHandler);

		// Get the geo position of the current user (if they allow this).
		navigator.geolocation.getCurrentPosition(geolocationSuccessHandler, geolocationErrorHandler);
	}

	function geolocationSuccessHandler (position)
	{
		// Get lat and lon values from the position object.
		var lat = position.coords.latitude;
		var lon = position.coords.longitude;

		// Load weather data using the lat and lon values, now that we have the user's position.
		getWeatherDataFromCoords(lat, lon);
	}

	function geolocationErrorHandler (error)
	{
		console.log("geolocationErrorHandler");
		// The user has disallowed sharing their geolocation, or there was a general error obtaining the info.
		// Even still, they will still be able to search for weather information.

		// NOTE: There is a very old bug in Firefox that prevents this error handler function being called if
		// a user chooses 'Not Now' from the geolocation popup (tested with FF 35 on OSX 10.10).
		// This will hopefully get fixed at some point, as the bug report status is currently still open:
		// https://bugzilla.mozilla.org/show_bug.cgi?id=675533.
		// Apparently Mozilla are working with Google on a new API implementation that, among other things, will fix this.
	}

	function locationSearchFormSubmitHandler (event)
	{
		event.preventDefault();
		
		console.log("form submit.", _locationSearchInput.value);

		if (_locationSearchInput.value !== "")
		{
			getWeatherDataFromLocationName(_locationSearchInput.value);

			_locationSearchSubmitWrapper.classList.add("loading");
			_locationSearchInput.value = "";
		}
		else
		{
			alert(MESSAGE_SEARCH_NOT_SPECIFIED);
		}
	}

	function getWeatherDataFromCoords (lat, lon)
	{
		// Don't do anything if we are waiting on the response of a previous API request.
		if (_waitingForData)
		{
			return false;
		}

		// Disable API requests until we receive a response.
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
		// Don't do anything if we are waiting on the response of a previous API request.
		if (_waitingForData)
		{
			return false;
		}

		// Disable API requests until we receive a response.
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

		// Reenable data lookups now that the API response has been received.
		_waitingForData = false;
		_locationSearchSubmitWrapper.classList.remove("loading");

		// The data returned by the API contains a property called 'cod',
		// rather than 'code', for the response status code. This is not a typo!
		if (typeof data.cod !== "undefined" && data.cod === "404")
		{
			alert(MESSAGE_LOCATION_NOT_FOUND);
			return;
		}

		// Get the location name, country code, and temperature from the data object
		// returned by the API, ensuring that we round it to the nearest integer.
		var locationName = data.name;
		var countryCode = data.sys.country;
		var temperature = Math.round(data.main.temp);

		// Don't display anything if there is no name and country code.
		if (locationName === "" && countryCode === "")
		{
			alert(MESSAGE_LOCATION_NOT_FOUND);
			return;
		}

		updateLocationDisplay(locationName, countryCode, temperature);
		updateBackgroundColor(temperature);
	}

	function apiRequestError (data, xhr)
	{
		alert(MESSAGE_API_REQUEST_ERROR);

		// Reenable data lookups so that we can retry requesting weather data.
		_waitingForData = false;
	}

	function updateLocationDisplay(locationName, countryCode, temperature)
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

		// Set a temperature class name on the main container element.
		_mainContainer.classList.add(_currentTemperatureClassName);
	}

})();