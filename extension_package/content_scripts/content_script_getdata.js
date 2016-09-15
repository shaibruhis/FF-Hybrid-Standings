function getLeagueID() {
    var matches = document.URL.match(/leagueId=(\d+)/);
    return matches[1];
}

function getSeasonID() {
    var seasonID = "2016";
    var matches = document.URL.match(/seasonId=(\d+)/);
    if (matches) {
        seasonID = matches[1];
    }
    else if ($('.games-alert-mod').children('b').text().match(/\d{4}/)) {  // some pages dont have seasonId in the URL so I check if there is the ESPN warning that I am looking at an old league
        seasonID = $('.games-alert-mod').children('b').text();
    }
    return seasonID;
}

const TABLE_HEADER = '.tableHead';
const OWNER_COLUMN_WIDTH = 22;
const NUMBER_OF_COLUMNS = 12;
const NUMBER_OF_EXISTING_COLUMNS = 6;
const COLUMN_WIDTH = ((100-OWNER_COLUMN_WIDTH)/NUMBER_OF_COLUMNS).toString() + '%';
const COLUMN_HEADERS = ['TEAM', 'TOTAL W', 'TOTAL L', 'TOTAL T', 'H2H W', 'H2H L', 'H2H T', 'POINTS W', 'POINTS L', 'POINTS T', 'PCT', 'GB'];
const LEAGUE_ID = getLeagueID();
const SEASON_ID = getSeasonID();
const SCOREBOARD_URL = 'http://games.espn.com/ffl/scoreboard?leagueId='+LEAGUE_ID+'&seasonId='+SEASON_ID+'&matchupPeriodId=';
const LIGHT_BG_COLOR = '#f8f8f2';
const DARK_BG_COLOR = '#f2f2e8';
const ON_STANDINGS_PAGE = document.URL.match(/ffl\/standings/);
const ON_SCOREBOARD_PAGE = document.URL.match(/ffl\/scoreboard/);










function getWins(records, idx) {
    var owner = Object.keys(records[idx])[0];
    return records[idx][owner]['Total W'] + (records[idx][owner]['Total T'] * 0.5);    // W + T
}

function addGBInfo(records) {
    var leaderWins = getWins(records, 0);
    for (var teamIdx = 1; teamIdx < records.length; teamIdx++) {
        var itrWins = getWins(records, teamIdx);
        var diff = leaderWins - itrWins;
        if (diff) { // if 0 then leave as default
            records[teamIdx][Object.keys(records[teamIdx])[0]]['gb'] = diff;
        }
    }
    return records;
}

// pasted in:
/*** Copyright 2013 Teun Duynstee Licensed under the Apache License, Version 2.0 ***/
var firstBy=function(){function n(n){return n}function t(n){return"string"==typeof n?n.toLowerCase():n}function r(r,e){if(e="number"==typeof e?{direction:e}:e||{},"function"!=typeof r){var u=r;r=function(n){return n[u]?n[u]:""}}if(1===r.length){var i=r,o=e.ignoreCase?t:n;r=function(n,t){return o(i(n))<o(i(t))?-1:o(i(n))>o(i(t))?1:0}}return-1===e.direction?function(n,t){return-r(n,t)}:r}function e(n,t){return n=r(n,t),n.thenBy=u,n}function u(n,t){var u=this;return n=r(n,t),e(function(t,r){return u(t,r)||n(t,r)})}return e}();

function sortRecords(records) {
    var sortedRecords = records.sort(
        firstBy(function(a,b) { return a[Object.keys(a)[0]]['Total W'] - b[Object.keys(b)[0]]['Total W']; }, -1) // TOTAL W
        .thenBy(function(a,b) { return a[Object.keys(a)[0]]['H2H W'] - b[Object.keys(b)[0]]['H2H W']; }, -1)  // H2H W
        .thenBy(function(a,b) { return a[Object.keys(a)[0]]['Points W'] - b[Object.keys(b)[0]]['Points W']; }, -1)  // POINTS W
        .thenBy(function(a,b) { return a[Object.keys(a)[0]]['pf'] - b[Object.keys(b)[0]]['pf']; }, -1) // PF
    );
    return sortedRecords;
}

function addPFToRecord(record, teamIdx) {
    var pointsFor = $('.sortablePF');
    record[Object.keys(record)[0]]['pf'] = parseFloat($(pointsFor[teamIdx]).text());    // want to add pf inside the obj inside record
    return record;
}

function getPercentage(results, numOfWeeks) {
    return (results['Total W']+(results['Total T']*0.5))/(2*numOfWeeks); // calc % for results
}

function getTotalResults(H2HResults, pointsResults) {
    returnObj = {};
    returnObj['H2H W'] = H2HResults[0];
    returnObj['H2H L'] = H2HResults[1];
    returnObj['H2H T'] = H2HResults[2];
    returnObj['Points W'] = pointsResults[0];
    returnObj['Points L'] = pointsResults[1];
    returnObj['Points T'] = pointsResults[2];
    returnObj['Total W'] = returnObj['H2H W'] + returnObj['Points W'];
    returnObj['Total L'] = returnObj['H2H L'] + returnObj['Points L'];
    returnObj['Total T'] = returnObj['H2H T'] + returnObj['Points T'];
    return returnObj
}

function getDataFromRow(row, numOfWeeks, pointsResults) {

    owner = $(row).first().children().first().attr('title');
    // get and build results
    var H2HResults = getH2HResults($(row)); // H2H W | H2H L | H2H T
    pointsResults = pointsResults[owner]; // Points W | Points L | Points T
    var results = getTotalResults(H2HResults, pointsResults);
    results['pct'] = getPercentage(results, numOfWeeks);   // add % to results array
    results['gb'] = 0;

    var obj = {}
    obj[owner] = results;
    return obj;
}

function parseHTML(HTML, pointsResults) {
    var scoreObjects = {};      // {100: [owner1], 98.7: [owner2,owner3], etc}
    var allOwners = [];
    // populate scoresObject
    var scoresArray = $(HTML).find('[id^=teamscrg_]');
    for (var idx = 0; idx < scoresArray.length; idx++) {
        var owner = $(scoresArray[idx]).find('a').attr('title');
        allOwners.push(owner);     // build array of allOwners
        var score = $(scoresArray[idx]).find('.score').attr('title');
        if (score in scoreObjects) {
            scoreObjects[score].push(owner);
        }
        else {
            scoreObjects[score] = [owner];   
        }
    }

    // get keys and sort them so we can get high scores from dict
    var scoreObjectsKeys = Object.keys(scoreObjects).sort(function(a, b) { return parseFloat(b)-parseFloat(a); } );

    // initialize pointsResults
    if (jQuery.isEmptyObject(pointsResults)) {
        for (var idx = 0; idx < allOwners.length; idx++) {
            pointsResults[allOwners[idx]] = [0,0,0];
        }
    }

    // adds results to pointresults
    var count = 1
    for (var scoreIdx = 0; scoreIdx < scoreObjectsKeys.length; scoreIdx++) {
        var owners = scoreObjects[scoreObjectsKeys[scoreIdx]];
        for (var ownerIdx = 0; ownerIdx < owners.length; ownerIdx++) {
            if (count < allOwners.length/2) {
                pointsResults[owners[ownerIdx]][0]++;  // increase owners wins by 1
            }
            else if (count == allOwners.length/2) {
                if (owners.length == 1) {
                    pointsResults[owners[ownerIdx]][0]++;  // increase owners wins by 1
                }
                else {
                    pointsResults[owners[ownerIdx]][2]++;  // increase owners ties by 1
                }
            }
            else {
                pointsResults[owners[ownerIdx]][1]++;  // increase owners losses by 1
            }
        }
        count += owners.length // increase the count by the number of people that had this score
    }
    return pointsResults;
}

function getPointsResults(numOfWeeks, rows, completionHandler) {
    var pointsResults = {};     // {'owner1':[W,L,T], 'owner2':[W,L,T], etc}
    var count = 0;
    for (var weekNum = 1; weekNum <= numOfWeeks; weekNum++) {
        $.get(SCOREBOARD_URL+weekNum, function(data) {
            pointsResults = parseHTML(data, pointsResults);
            count++;
            if(count > numOfWeeks - 1) {    // make sure all async calls completed
                completionHandler(rows, pointsResults);
            }
        });
    }
}

function getNumOfWeeks(results) {
    return results.reduce(function(a,b) {return a+b;}, 0);
}

function getH2HResults(row) {
    var results = $(row).slice(1,4);
    return $.map(results, function(elem) { return parseInt($(elem).text(),10); });
}

function getDataFromRows(rows) {
    var H2HResults = getH2HResults($(rows[0]).children());
    var numOfWeeks = getNumOfWeeks(H2HResults); // wins + losses + ties
    getPointsResults(numOfWeeks, rows, function(rows, pointsResults) {
        var recordsToStore = {}
        recordsToStore['numOfWeeks'] = numOfWeeks;
        var records = []
        for (var teamIdx = 0; teamIdx < rows.length; teamIdx++) {
            var record = getDataFromRow($(rows[teamIdx]).children(), numOfWeeks, pointsResults);
            record = addPFToRecord(record, teamIdx);
            records.push(record);
        }
        records = sortRecords(records);
        records = addGBInfo(records);

        // store data
        chrome.storage.local.set({records}, function() {
            chrome.storage.local.get(function(object) {
                console.log(object);
            });
        });
    });
}

function getData() {
    // get all tables
    var tableHeader = $(TABLE_HEADER);

    // format each table
    var idx = 0;
    while ($($(tableHeader)[idx]).parents('table:first').attr('id') != 'xstandTbl_div0') {
        getDataFromRows($($(tableHeader)[idx]).nextAll().slice(1));  // get all rows contains owner records
        idx++;
    }

}




getData();






