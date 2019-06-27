require('dotenv').config();
var fs = require("fs");
var axios = require("axios");
var inquirer = require("inquirer");
var moment = require("moment");
var weather = require("weather-js");
var Spotify = require('node-spotify-api');

var keys = require("./keys.js");
var spotify = new Spotify(keys.spotify);
var operate = process.argv[2];
var val;
if (process.argv[3])
    val = process.argv.slice(3).join("+");
function logOut(text) {
    fs.appendFile("log.txt", text, function(err) {
        if (err) {
            console.log(err);
          }
    });
}
function claerLog() {
    fs.writeFile("log.txt", "", function(err) {
        if (err) {
            console.log(err);
        }
    });
}
function runConcert(name) {
    axios.get(`https://rest.bandsintown.com/artists/${name}/events?app_id=codingbootcamp`)
    .then(function(response) {
        var result = response.data;
        var totalConcerts = result.length;
        var index = 0;
        function logConcert(index) {
            var date = moment(result[index].datetime.substr(0,10),"YYYY.MM.DD").format("MM/DD/YYYY");
            console.log(`-------------I found the closest concert------------------------------------------------------------------\n`);
            console.log(`Venue Name: ${result[index].venue.name}`);
            console.log(`Venue Location: ${result[index].venue.city}, ${result[index].venue.region}`);
            console.log(`Time: ${date} @ ${result[index].datetime.substr(11,5)}\n`);
            console.log(`----------------------------------------------------------------------------------------------------------\n`);
            logOut(`-------------I found the closest concert------------------------------------------------------------------\nVenue Name: ${result[index].venue.name}\nVenue Location: ${result[index].venue.city}, ${result[index].venue.region}\nTime: ${date} @ ${result[index].datetime.substr(11,5)}\n----------------------------------------------------------------------------------------------------------\n`);
        }
        function confirmConcert() {
            inquirer.prompt([{
                type: "confirm",
                name: "confirm",
                message: "Do you want to show another event?"
            }]).then(function(answers) {
                if (answers.confirm && index < totalConcerts-1) {
                    logConcert(++index);
                    confirmConcert();
                } else if (index >= totalConcerts-1){
                    console.log("There are no more events");
                }
            });
        }
        logConcert(index);
        confirmConcert();
    })
    .catch(function (err) {
        console.log(err);
    });

}
function runSpotify(name) {
    spotify
    .request(`https://api.spotify.com/v1/search?q=${name}&type=track&market=us&limit=5`)
    .then(function(data) {
        var index = 0;
        function logSong(index) {
            var result = data.tracks.items[index]; 
            console.log(`------------------I found the song------------------------------------------------------------------------\n`);
            console.log(`Artist: ${result.artists[0].name}`);
            console.log(`Song Name: ${result.name}`);
            console.log(`Album: ${result.album.name}`);
            console.log(`A preview link: ${result.preview_url}\n`);
            console.log(`----------------------------------------------------------------------------------------------------------\n`);
            logOut(`------------------I found the song------------------------------------------------------------------------\nArtist: ${result.artists[0].name}\nSong Name: ${result.name}\nAlbum: ${result.album.name}\nA preview link: ${result.preview_url}\n----------------------------------------------------------------------------------------------------------\n`);
        }
        function confirmSong() {
            inquirer.prompt([{
                type: "confirm",
                name: "confirm",
                message: "Is this what you looking for?"
            }]).then(function(answers) {
                if (!answers.confirm&&index < 4) {
                    logSong(++index);
                    confirmSong();
                } else if (index > 3){
                    console.log("Sorry, I can't find your song!");
                }
            });
        }
        logSong(index);
        confirmSong();
    })
    .catch(function(err) {
        console.error('Error occurred: ' + err); 
    });
}
function runMovie(name) {
    axios.get(`http://www.omdbapi.com/?t=${name}&y=&plot=short&apikey=trilogy`)
    .then(function(response) {

        console.log(`------------------I found the movie-----------------------------------------------------------------------\n`);
        console.log(`Movie Name: ${response.data.Title}`);
        console.log(`Year: ${response.data.Year}`);
        console.log(`IMDB Rating: ${response.data.Ratings[0].Value}`);
        console.log(`Rotten Tomatoes Rating: ${response.data.Ratings[1].Value}`);
        console.log(`Country: ${response.data.Country}`);
        console.log(`Language: ${response.data.Language}`);
        console.log(`Actors: ${response.data.Actors}`);
        console.log(`Plot: ${response.data.Plot}\n`);
        console.log(`----------------------------------------------------------------------------------------------------------\n`);
        logOut(`------------------I found the movie-----------------------------------------------------------------------\nMovie Name: ${response.data.Title}\nYear: ${response.data.Year}\nIMDB Rating: ${response.data.Ratings[0].Value}\nRotten Tomatoes Rating: ${response.data.Ratings[1].Value}\nCountry: ${response.data.Country}\nLanguage: ${response.data.Language}\nActors: ${response.data.Actors}\nPlot: ${response.data.Plot}\n----------------------------------------------------------------------------------------------------------\n`);
    }
)};
function runWeather(name) {
    weather.find({ search: name, degreeType: "F" }, function(err, response) {
        if (err) {
          console.log(err);
        }
        var result = response[0].current;
        console.log(`------------------I found the weather---------------------------------------------------------------------\n`);
        console.log(`Location: ${response[0].location.name}`);
        console.log(`Date: ${moment(result.date,"YYYY.MM.DD").format("MM/DD/YYYY")}`)
        console.log(`Temperature: ${result.temperature} F`);
        console.log(`Temperature feels like: ${result.feelslike} F`);
        console.log(`Humidity: ${result.humidity}`);
        console.log(`Skytext: ${result.skytext}`);
        console.log(`Windspeed: ${result.windspeed}\n`);
        console.log(`----------------------------------------------------------------------------------------------------------\n`);
        logOut(`------------------I found the weather---------------------------------------------------------------------\nLocation: ${response[0].location.name}\nTemperature: ${result.temperature} F\nTemperature feels like: ${result.feelslike} F\nHumidity: ${result.humidity}\nSkytext: ${result.skytext}\nWindspeed: ${result.windspeed}\n----------------------------------------------------------------------------------------------------------\n`);
      });

}
function runSomething() {
    fs.readFile("random.txt", "utf-8", function(err, data) {
        if (err) {
            return console.log(error);
        }
        console.log(data);
        var dataArr = data.split(",");
        runLiri(dataArr[0], dataArr[1]);
    });
}
function runLiri(operate, val) {
    switch (operate) {
        case "concert-this":
            runConcert(val);
            break;
        case "spotify-this-song":
            if (val)
                runSpotify(val);
            else
                runSpotify("The+Sign+artist:Ace+of+Base");
            break;
        case "movie-this":
            if (val)
                runMovie(val);
            else 
                runMovie("Mr.+Nobody");
            break;
        case "do-what-it-says":
            runSomething();
            break;
        case "weather-there":
            runWeather(val);
            break;
        case "clear-log":
            claerLog();
            break;
        default:
            console.log("Sorry, I cannot understand your command, type 'help' to see the command menu.");
    }
}
logOut(process.argv.slice(2).join(" ")+"\n");
runLiri(operate, val);