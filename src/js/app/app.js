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

	// -------------------------------------------------------
	// Define variables.
	// -------------------------------------------------------
	var mainContainer;
	var currentTemperatureClassName;

	// Add an event listener to ensure the DOM has loaded before
	// initialising the application.
	document.addEventListener("DOMContentLoaded", init);

	// -------------------------------------------------------
	// Initialisation function.
	// -------------------------------------------------------
	function init ()
	{
		console.log("init");

		mainContainer = document.querySelector(".main-container");

		var allListItems = document.querySelectorAll(".city-list-item");
		var i = 0;
		var length = allListItems.length;
		var currentListItem;

		for (i; i < length; i++)
		{
			currentListItem = allListItems[i];
			currentListItem.addEventListener("click", cityListClickHandler, false);
		}
	}

	function cityListClickHandler (event)
	{		
		var lat = this.getAttribute("data-lat");
		var lon = this.getAttribute("data-lon");

		getWeatherData(lat, lon);
	}

	function getWeatherData(lat, lon)
	{
		// Build a request URL based on the current lat and lon values.
		var requestURL = API_URL + "&lat=" + lat + "&lon=" + lon;

		// Make an AJAX request to the API.
		atomic.get(requestURL)
			.success(apiRequestSuccess)
			.error(apiRequestError);
	}

	function apiRequestSuccess (data, xhr)
	{
		// Get the temperature from the data object returned by the API.
		var temperature = data.main.temp;

		// If we previously set a temperature class name on the main
		// container element then remove it here.
		if (typeof currentTemperatureClassName !== "undefined")
		{
			mainContainer.classList.remove(currentTemperatureClassName);
		}

		// Set the 'currentTemperatureClassName' variable based on the
		// constants we defined earlier.
		if (temperature < 0)
		{
			currentTemperatureClassName = "freezing";
		}
		else if (temperature < 8)
		{
			currentTemperatureClassName = "cold";
		}
		else if (temperature < 16)
		{
			currentTemperatureClassName = "warm";
		}
		else if (temperature < 24)
		{
			currentTemperatureClassName = "hot";
		}
		else
		{
			currentTemperatureClassName = "very-hot";
		}

		// set a temperature class name on the main container element.
		mainContainer.classList.add(currentTemperatureClassName);
	}

	function apiRequestError (data, xhr)
	{
		console.log("error", data);
	}

})();