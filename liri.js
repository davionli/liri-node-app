require('dotenv').config();
var fs = require("fs");
var axios = require("axios");
var inquirer = require("inquirer");
var Spotify = require('node-spotify-api');

var keys = require("./keys.js");
var spotify = new Spotify(keys.spotify);
var operate = process.argv[2];
var val;
if (process.argv[3])
    val = process.argv.slice(3).join("+");


function runConcert(name) {
    axios.get(`https://rest.bandsintown.com/artists/${name}/events?app_id=codingbootcamp`)
    .then(function(response) {
        var result = response.data;
        var totalConcerts = result.length;
        var index = 0;
        function logConcert(index) {
            var date = `${result[index].datetime.substr(5,2)}/${result[index].datetime.substr(8,2)}/${result[index].datetime.substr(0,4)}`;
            console.log(`-------------I found the closest concert------------------------------------------------------------------\n`);
            console.log(`Venue Name: ${result[index].venue.name}`);
            console.log(`Venue Location: ${result[index].venue.city}, ${result[index].venue.region}`);
            console.log(`Time: ${date} @ ${result[index].datetime.substr(11,5)}\n`);
            console.log(`----------------------------------------------------------------------------------------------------------\n`);
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
    .catch(function (error) {
        console.log(error);
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
        console.log(`Plot: ${response.data.Plot}`);
        console.log(`----------------------------------------------------------------------------------------------------------\n`);
    }
)};
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
        default:
            console.log("Sorry, I cannot understand your command, type 'help' to see the command menu.");
    }
}
runLiri(operate, val);