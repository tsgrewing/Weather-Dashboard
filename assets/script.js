var apiKey = "7d3f77668baa98504881eef8fca4c435";
var searchHistory = [];
var currentWeather = $("#current-weather");
var fiveDay = $("#five-day");
var pastSearches = $("#past-cities");
var userInput = $("#new-city");
var currentCity = $('#current-city');

// Load search history, populate search history list and display weather of most recently searched city if the search history is not empty
loadHistory();
if (searchHistory[0]) {
    getWeather(searchHistory[0]);
};

function loadHistory () {
    pastSearches.html("");
    var history = JSON.parse(localStorage.getItem("searchHistory"));
    if(history){
        searchHistory = history;
        history.forEach(element => {
            pastSearches.append(
                $("<button>")
                    .text(element)
                    .addClass("btn btn-lg btn-outline-secondary btn-block pastCity")
                    .attr("data-city", element)
            );
        });
    }
};

// Add the searched for city to the searchHistory and get the weather for that city
function addCity() {
    var newCity = userInput.val().trim();
    newCity= newCity.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()});
    searchHistory.unshift(newCity);
    getWeather(newCity);
    localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
    loadHistory();
    userInput.val("");
};

// Get the current weather, uv index, and 5-day forecast for the searched city or the city that is clicked on
function getWeather (city) {
    currentWeather.html("");
    currentCity.html("");
    var queryURL = ("https://api.openweathermap.org/data/2.5/weather?q=" + city + "&units=imperial&APPID=" + apiKey);
    var fiveDayQuery = ("https://api.openweathermap.org/data/2.5/forecast?q=" + city + "&units=imperial&APPID=" + apiKey);

    $.ajax({
        url: queryURL,
        method: "GET"
      }).then(function(response) {
          // get current weather for city
            var icon = $("<img>").attr("src", "https://openweathermap.org/img/wn/"+response.weather[0].icon+"@2x.png").attr("id", "currentIcon")
            var currentLocation = (city +" "+ moment().format("L"));
            var currentTemp = $("<li>").html("Temperature: " + response.main.temp + "F<span>&#176;</span>");
            var windSpeed = $("<li>").html("Wind Speed: " + response.wind.speed + "mph");
            var humidity = $("<li>").html("Humidity: " + response.main.humidity +"%");
            var uvNum = $("<span>").attr("id", "uv-index").attr("title", "severity");
            var uvLine =$("<li>").text("UV Index: ").append(uvNum);
        
            currentCity.append(currentLocation);
            currentCity.append(icon);
            currentWeather.append(currentTemp);
            currentWeather.append(humidity);
            currentWeather.append(windSpeed);
            currentWeather.append(uvLine);

            // get and stylize the UV index
            getIndex();
            function getIndex () {
                var uvQuery =("https://api.openweathermap.org/data/2.5/uvi?APPID=" + apiKey + "&lat=" + response.coord.lat +"&lon="+ response.coord.lon);
                $.ajax({
                    url: uvQuery,
                    method: "GET"
                  }).then(function(index) {
                    var value = index.value;
                    var indexDisplay = $("#uv-index").text(value);

                    if (value <= 2) {
                        indexDisplay.css("background-color", "#02E87B");
                        indexDisplay.attr("title", "Low")
                    }
                    else if (value > 2 && value <= 5 ) {
                        indexDisplay.css("background-color", "#EBD744");
                        indexDisplay.attr("title", "Moderate")
                    }
                    else if (value > 5 && value <= 7) {
                        indexDisplay.css("background-color", "#EB840B");
                        indexDisplay.attr("title", "High")
                    }
                    else if (value > 7 && value <= 11) {
                        indexDisplay.css("background-color", "#EB3C04");
                        indexDisplay.attr("title", "Very High")
                    }
                    else if (value > 10) {
                        indexDisplay.css("background-color", "#EB0A00");
                        indexDisplay.attr("title", "Extreme")
                    }                  
                  });
            };  
      });

    // get 5 day forecast 
    $.ajax({
        url: fiveDayQuery,
        method: "GET"
      }).then(function(forecast) {
            fiveDay.html("");
            $("#forecast-header").text("5-Day Forecast:");
            var currentDay = 1;
            
            // loop over the info every 24 hours
            for (i=0; i<33; i=i + 8) {
                var forecastCard = $("<div>").addClass("col-sm-2 forecastCard");
                var forecastDate = $("<h4>").text(moment().add(currentDay, "d").format("L"));
                var forecastIcon = $("<img>").attr("src", "http://openweathermap.org/img/wn/" + forecast.list[i].weather[0].icon + ".png");
                var forecastTemp = $("<p>").html("Temperature: " + forecast.list[i].main.temp + "F<span>&#176;</span>");
                var forecastHumidity = $("<p>").text("Humidity: " + forecast.list[i].main.humidity + "%");
                forecastCard.append(forecastDate);
                forecastCard.append(forecastIcon);
                forecastCard.append(forecastTemp);
                forecastCard.append(forecastHumidity);
                fiveDay.append(forecastCard);
                currentDay++;
            };
      });

};

// Submitting search, either by clicking the search button or pressing the enter key
$('#submit-search').on('click', addCity);
userInput.on("keyup", function (event){
   if (event.key === "Enter") {
       addCity();
   }
});
// event handler to run the getWeather function when a city button is clicked
$(".pastCity").on("click", function () {
    getWeather($(this).attr("data-city"));
})
// clear search history from local storage and empty the search history list
$("#clear-button").on("click", function() {
    localStorage.clear();
    loadHistory();
    searchHistory =[];
})