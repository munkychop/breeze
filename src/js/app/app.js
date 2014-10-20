// 0°C === 32°F.
var ZERO_DEG_CELCIUS_IN_FAHRENHEIT = 32;
var CONVERSION_MULTIPLIER = 1.8;

function fahrenheitToCelcius (fahrenheit)
{
	var celcius = (fahrenheit - ZERO_DEG_CELCIUS_IN_FAHRENHEIT) / CONVERSION_MULTIPLIER;
	return celcius.toFixed(1);
}