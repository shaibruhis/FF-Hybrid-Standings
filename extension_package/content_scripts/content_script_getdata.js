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
const LEAGUE_ID = getLeagueID();
const SEASON_ID = getSeasonID();
const SCOREBOARD_URL = 'http://games.espn.com/ffl/scoreboard?leagueId='+LEAGUE_ID+'&seasonId='+SEASON_ID+'&matchupPeriodId=';
const STANDINGS_URL = 'http://games.espn.com/ffl/standings?leagueId='+LEAGUE_ID+'&seasonId='+SEASON_ID;


function addRank(records, sortedOwners) {
    for (var owner in records) {
        var ownerRank = sortedOwners.indexOf(owner)+1;  // 1st place is 0 index
        if (ownerRank == 1) { ownerRank = ownerRank+'st'; }
        else if (ownerRank == 2) { ownerRank = ownerRank+'nd'; }
        else if (ownerRank == 3) { ownerRank = ownerRank+'rd'; }
        else { ownerRank = ownerRank+'th'; }
        records[owner]['ownerRank'] = ownerRank;
    }
    return records;
}

function getWins(records, owner) {
    return records[owner]['TOTAL W'] + (records[owner]['TOTAL T'] * 0.5);    // W + T
}

function addGBInfo(records, sortedOwners) {
    var leaderWins = getWins(records, sortedOwners[0]);
    for (var ownerIdx = 1; ownerIdx < sortedOwners.length; ownerIdx++) {
        var ownerWins = getWins(records, sortedOwners[ownerIdx]);
        var diff = leaderWins - ownerWins;
        if (diff) { // if 0 then leave as default
            records[sortedOwners[ownerIdx]]['GB'] = diff;
        }
    }
    return records;
}

// pasted in:
/*** Copyright 2013 Teun Duynstee Licensed under the Apache License, Version 2.0 ***/
var firstBy=function(){function n(n){return n}function t(n){return"string"==typeof n?n.toLowerCase():n}function r(r,e){if(e="number"==typeof e?{direction:e}:e||{},"function"!=typeof r){var u=r;r=function(n){return n[u]?n[u]:""}}if(1===r.length){var i=r,o=e.ignoreCase?t:n;r=function(n,t){return o(i(n))<o(i(t))?-1:o(i(n))>o(i(t))?1:0}}return-1===e.direction?function(n,t){return-r(n,t)}:r}function e(n,t){return n=r(n,t),n.thenBy=u,n}function u(n,t){var u=this;return n=r(n,t),e(function(t,r){return u(t,r)||n(t,r)})}return e}();

function sortRecords(records) {
    var sortedOwners = Object.keys(records).sort(
        firstBy(function(a,b) { return records[a]['TOTAL W'] - records[b]['TOTAL W']; }, -1) // TOTAL W
        .thenBy(function(a,b) { return records[a]['H2H W'] - records[b]['H2H W']; }, -1)  // H2H W
        .thenBy(function(a,b) { return records[a]['POINTS W'] - records[b]['POINTS W']; }, -1)  // POINTS W
        .thenBy(function(a,b) { return records[a]['PF'] - records[b]['PF']; }, -1) // PF
    );
    return sortedOwners;
}

function addPFToRecord(html ,record, teamIdx) {
    var pointsFor = $(html).find('.sortablePF');
    record['PF'] = parseFloat($(pointsFor[teamIdx]).text());    // want to add pf inside the obj inside record
    return record;
}

function getPercentage(results, numOfWeeks) {
    return (results['TOTAL W']+(results['TOTAL T']*0.5))/(2*numOfWeeks); // calc % for results
}

function getTotalResults(H2HResults, pointsResults) {
    returnObj = {};
    returnObj['H2H W'] = H2HResults[0];
    returnObj['H2H L'] = H2HResults[1];
    returnObj['H2H T'] = H2HResults[2];
    returnObj['POINTS W'] = pointsResults[0];
    returnObj['POINTS L'] = pointsResults[1];
    returnObj['POINTS T'] = pointsResults[2];
    returnObj['TOTAL W'] = returnObj['H2H W'] + returnObj['POINTS W'];
    returnObj['TOTAL L'] = returnObj['H2H L'] + returnObj['POINTS L'];
    returnObj['TOTAL T'] = returnObj['H2H T'] + returnObj['POINTS T'];
    return returnObj
}

function getDataFromRow(row, numOfWeeks, pointsResults) {

    var owner = $(row).first().children().first().attr('title');
    var teamName = $(row).first().children().first().text();
    var teamLink = $(row).first().children().first().attr('href');
    // get and build results
    var H2HResults = getH2HResults($(row)); // H2H W | H2H L | H2H T
    pointsResults = pointsResults[owner]; // Points W | Points L | Points T
    var results = getTotalResults(H2HResults, pointsResults);
    results['PCT'] = getPercentage(results, numOfWeeks);   // add % to results array
    results['GB'] = 0;
    results['teamName'] = teamName;
    results['teamLink'] = teamLink;
    var obj = {}
    obj['owner'] = owner;
    obj['results'] = results;
    return obj;
}

function parseHTML(html, pointsResults) {
    var scoreObjects = {};      // {100: [owner1], 98.7: [owner2,owner3], etc}
    var allOwners = [];
    // populate scoresObject
    var scoresArray = $(html).find('[id^=teamscrg_]');
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

function getDataFromRows(rows, html) {
    var H2HResults = getH2HResults($(rows[0]).children());
    var numOfWeeks = getNumOfWeeks(H2HResults); // wins + losses + ties
    getPointsResults(numOfWeeks, rows, function(rows, pointsResults) {
        var recordsToStore = {}
        recordsToStore['numOfWeeks'] = numOfWeeks;
        var records = {}
        for (var teamIdx = 0; teamIdx < rows.length; teamIdx++) {
            var ownerRecordObj = getDataFromRow($(rows[teamIdx]).children(), numOfWeeks, pointsResults);
            ownerRecordObj['results'] = addPFToRecord(html, ownerRecordObj['results'], teamIdx);
            records[ownerRecordObj['owner']] = ownerRecordObj['results'];
        }

        var sortedOwners = sortRecords(records);
        records = addGBInfo(records, sortedOwners);
        records = addRank(records, sortedOwners);
        console.log(records);
        recordsToStore['records'] = records;
        recordsToStore['sortedOwners'] = sortedOwners;
        // store data
        chrome.storage.local.set(recordsToStore
            , function() {
            chrome.storage.local.get(function(object) {
                console.log(object);
            });
        }
        );
    });
}

function getData() {
    $.get(STANDINGS_URL, function(html) {
        // get all tables
        var tableHeader = $(html).find(TABLE_HEADER);

        // format each table
        var idx = 0;
        while ($($(tableHeader)[idx]).parents('table:first').attr('id') != 'xstandTbl_div0') {
            getDataFromRows($($(tableHeader)[idx]).nextAll().slice(1), html);  // get all rows contains owner records
            idx++;
        }
    });
}


// MAIN
getData();