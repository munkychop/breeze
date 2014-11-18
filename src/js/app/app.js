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
	var _cityLinks;
	var _currentCityLink;
	var _currentTemperatureClassName;
	var _temperatureDisplay;

	// Add an event listener to ensure the DOM has loaded before
	// initialising the application.
	document.addEventListener("DOMContentLoaded", init);

	// -------------------------------------------------------
	// Initialisation function.
	// -------------------------------------------------------
	function init ()
	{
		_mainContainer = document.querySelector(".main-container");
		_cityLinks = document.querySelectorAll(".city-link");
		_temperatureDisplay = document.querySelector(".temperature-display");

		addListeners();
	}

	function addListeners ()
	{
		var i = 0;
		var length = _cityLinks.length;
		var currentListItem;

		for (i; i < length; i++)
		{
			currentListItem = _cityLinks[i];
			currentListItem.addEventListener("click", cityListClickHandler, false);
		}
	}

	function removeListeners ()
	{
		var i = 0;
		var length = _cityLinks.length;
		var currentListItem;

		for (i; i < length; i++)
		{
			currentListItem = _cityLinks[i];
			currentListItem.removeEventListener("click", cityListClickHandler, false);
		}
	}

	function cityListClickHandler (event)
	{
		console.log("click", this);

		// prevent the default action of anchor tags, if specified in the HTML.
		event.preventDefault();

		// disable clicks until we get a response from the API.
		removeListeners();

		if (typeof _currentCityLink !== "undefined")
		{
			_currentCityLink.classList.remove("selected");
		}

		_currentCityLink = this;

		var lat = _currentCityLink.getAttribute("data-lat");
		var lon = _currentCityLink.getAttribute("data-lon");

		getWeatherData(lat, lon);
	}

	function getWeatherData (lat, lon)
	{
		console.log("getting weather data...", lat, lon);

		// Build a request URL based on the current lat and lon values.
		var requestURL = API_URL + "&lat=" + lat + "&lon=" + lon;

		// Make an AJAX request to the API.
		atomic.get(requestURL)
			.success(apiRequestSuccess)
			.error(apiRequestError);
	}

	function apiRequestSuccess (data, xhr)
	{
		// Get the temperature from the data object returned by the API and
		// round it to the nearest integer.
		var temperature = Math.round(data.main.temp);

		_temperatureDisplay.innerHTML = temperature + "°C";
		_currentCityLink.classList.add("selected");

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

		console.log("weather data recieved.", temperature, _currentTemperatureClassName);

		// set a temperature class name on the main container element.
		_mainContainer.classList.add(_currentTemperatureClassName);

		// reenable click listeners now that the API response has been recieved.
		addListeners();
	}

	function apiRequestError (data, xhr)
	{
		console.log("error", data);

		// reenable click listeners now so we can retry requesting weather data.
		addListeners();
	}

})();