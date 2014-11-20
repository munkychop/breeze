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
	var API_UNITS = "metric";
	var API_URL = "http://api.openweathermap.org/data/2.5/weather?APPID=" + API_KEY + "&units=" + API_UNITS;

	var TEMPERATURE_FREEZING = {maxCelcius : 0, className : "freezing"};
	var TEMPERATURE_COLD = {maxCelcius : 8, className : "cold"};
	var TEMPERATURE_WARM = {maxCelcius : 16, className : "warm"};
	var TEMPERATURE_HOT = {maxCelcius : 24, className : "hot"};
	var TEMPERATURE_BLAZING = {maxCelcius : Number.POSITIVE_INFINITY, className : "blazing"};

	// -------------------------------------------------------
	// Define variables.
	// -------------------------------------------------------
	var _mainContainer;
	var _locationLinks;
	var _currentLocationLink;
	var _locationSearchForm;
	var _locationSearchinput;
	var _currentTemperatureClassName;
	var _temperatureDisplay;
	var _userDidSearch = false;
	var _waitingForData = false;

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

		_locationSearchForm.addEventListener("submit", locationSearchFormSubmitHandler, false);

		navigator.geolocation.getCurrentPosition(showCurrentLocationWeatherInformation);
	}

	function showCurrentLocationWeatherInformation (position)
	{
		var lat = position.coords.latitude;
		var lon = position.coords.longitude;

		getWeatherDataFromCoords(lat, lon);

		addListeners ();
	}

	function addListeners ()
	{
		var i = 0;
		var length = _locationLinks.length;
		var currentListItem;

		for (i; i < length; i++)
		{
			currentListItem = _locationLinks[i];
			currentListItem.addEventListener("click", locationListClickHandler, false);
		}
	}

	function locationListClickHandler (event)
	{
		// prevent the default action of anchor tags, if specified in the HTML.
		event.preventDefault();

		_userDidSearch = false;

		if (typeof _currentLocationLink !== "undefined")
		{
			_currentLocationLink.classList.remove("selected");
		}

		_currentLocationLink = this;

		var locationName = _currentLocationLink.getAttribute("data-location-name");

		getWeatherDataFromLocationName(locationName);
	}

	function locationSearchFormSubmitHandler (event)
	{
		event.preventDefault();
		console.log("form submit.", _locationSearchInput.value);

		_userDidSearch = true;

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
			alert("Location not found. Please search for something else.");
			return;
		}

		var locationName = data.name;
		var countryCode = data.sys.country;
		// Get the temperature from the data object returned by the API and
		// round it to the nearest integer.
		var temperature = Math.round(data.main.temp);

		if (locationName !== "")
		{
			_locationNameDisplay.innerHTML = locationName + ", " + countryCode;
		}
		else
		{
			_locationNameDisplay.innerHTML = countryCode;
		}


		_temperatureDisplay.innerHTML = temperature + "°C";

		if (typeof _currentLocationLink !== "undefined")
		{
			if (_userDidSearch)
			{
				_currentLocationLink.classList.remove("selected");
			}
			else
			{
				_currentLocationLink.classList.add("selected");
			}
		}

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

	function apiRequestError (data, xhr)
	{
		console.log("error", data);

		// reenable data lookups so that we can retry requesting weather data.
		_waitingForData = false;
	}

})();