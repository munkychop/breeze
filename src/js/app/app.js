// -------------------------------------------------------
// Create a closure to ensure that we don't pollute the
// global scope.
// -------------------------------------------------------
(function (){
	
	// -------------------------------------------------------
	// Define constants.
	// -------------------------------------------------------

	// 0°C === 32°F.
	var ZERO_DEG_CELCIUS_IN_FAHRENHEIT = 32;
	var CONVERSION_MULTIPLIER = 1.8;

	// Add an event listener to ensure the DOM has loaded before
	// initialising the application.
	document.addEventListener("DOMContentLoaded", init);

	// -------------------------------------------------------
	// Initialisation function.
	// -------------------------------------------------------
	function init ()
	{
		console.log("init");
	}

	// -------------------------------------------------------
	// Utility functions.
	// -------------------------------------------------------
	function fahrenheitToCelcius (fahrenheit)
	{
		var celcius = (fahrenheit - ZERO_DEG_CELCIUS_IN_FAHRENHEIT) / CONVERSION_MULTIPLIER;
		return celcius.toFixed(1);
	}

})();