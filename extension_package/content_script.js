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
    else if ($('.games-alert-mod').find('b').text()) {  // some pages dont have seasonId in the URL so I check if there is the ESPN warning that I am looking at an old league
        seasonID = $('.games-alert-mod').children('b').text();
    }
    console.log($('.games-alert-mod').children('b').text(), seasonID);
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


// make the head span across all columns (subheaders)
function updateHeaderColumns(tableHeader) {
    $(tableHeader.children()[0]).attr('colspan', NUMBER_OF_COLUMNS.toString()); // increase width of header to account for added columns
}

// make table correct width
function updateTableWidth(table) {
    $(table).attr('width', '100%');
    $(table).nextAll().remove();    // get rid of weird whitespace on right side of table
}


function createNewColumn(columnText) {
    var columnCell = $('<td></td>').text(columnText);
    columnCell.attr({
        align: 'right',
        width:  COLUMN_WIDTH,
        title:  columnText
    }); 
    return columnCell;
}


function editSubHeaderColumn(columnIdx, subHeaderColumns) {
    var columnHeaderText = COLUMN_HEADERS[columnIdx];
    // edit the preexisiting ones
    if (columnIdx <= 5) {
        $(subHeaderColumns[columnIdx]).text(columnHeaderText)
        $(subHeaderColumns[columnIdx]).attr({
            width: COLUMN_WIDTH,
            title: columnHeaderText
        });
    }
    // create and add the new ones
    else {
        var columnSubHeader = createNewColumn(columnHeaderText);
        $(subHeaderColumns).parent().append(columnSubHeader);
    }
}


function editSubHeaderColumns(subHeaderColumns) {
    $(subHeaderColumns[0]).attr('width', OWNER_COLUMN_WIDTH.toString() + '%');
    for (var idx = 1; idx < NUMBER_OF_COLUMNS; idx++) {
        editSubHeaderColumn(idx, $(subHeaderColumns))
    }
}


// add text to subheaders
function updateSubHeaderColumns(subHeader) {
    subHeaderColumns = $(subHeader).children();
    editSubHeaderColumns(subHeaderColumns);
}


function getNumOfWeeksOnStandingsPage(results) {
    return results.reduce(function(a,b) {return a+b;}, 0);
}

function getH2HResultsOnScoreboardPage(idx) {
    var results = $($('span.record')[idx]).text();
    results = results.replace(/[\(\)]+/g, '').split('-');   // remove '(' and ')'. g means globally which replaces all occurances, not just first one
    console.log(results);
    return results;
}

function getNumOfWeeksOnScoreboardPage() {
    return getH2HResultsOnScoreboardPage(0).reduce(function(a,b) { return parseInt(a)+parseInt(b); }, 0);
}

function getH2HResultsOnStandingsPage(row) {
    var results = $(row).slice(1,4);
    var numOfWeeks = $.map(results, function(elem) {
        return parseInt($(elem).text(),10);
    });
    return numOfWeeks;
}


function getTotalResults(H2HResults, pointsResults) {
    returnArray = [3];
    for (var idx = 0; idx < H2HResults.length; idx++) {
        returnArray[idx] = H2HResults[idx] + pointsResults[idx];
    }
    console.log(H2HResults, pointsResults);
    return returnArray;
}


function updateRows(rows) {
    var H2HResults = getH2HResultsOnStandingsPage($(rows[0]).children());
    var numOfWeeks = getNumOfWeeksOnStandingsPage(H2HResults); // wins + losses + ties
    getPointsResults(numOfWeeks, rows, function(rows, pointsResults) {
        for (var idx = 0; idx < rows.length; idx++) {
            updateRow($(rows[idx]).children(), numOfWeeks, pointsResults);
        }
        sortRows(rows);
        addGBInfo(rows);
    });
}


function editCells(row, results) {
    for (var idx = 1; idx < NUMBER_OF_COLUMNS; idx++) {
        $(row[idx]).text(results[idx-1]) // idx starts at one in row because we dont want to edit owner column
    }
}


function getPercentage(results, numOfWeeks) {
    var percentage = ((results[0]+(results[2]*0.5))/(2*numOfWeeks)).toFixed(3); // calc % for results
    return percentage.toString().replace(/^0+/, '');    // remove leading 0  
}


function updateRow(row, numOfWeeks, pointsResults) {
    // add cells
    for (var idx = NUMBER_OF_COLUMNS-NUMBER_OF_EXISTING_COLUMNS; idx < NUMBER_OF_COLUMNS; idx++) {
        var newColumn = createNewColumn("");
        $(row).parent().append(newColumn);
    }

    owner = $(row).first().children().first().attr('title');
    // get and build results
    var H2HResults = getH2HResultsOnStandingsPage($(row)); // H2H W | H2H L | H2H T
    pointsResults = pointsResults[owner]; // Points W | Points L | Points T
    var results = getTotalResults(H2HResults, pointsResults);

    results = results.concat(H2HResults, pointsResults);    // Total W | Total L | Total T | H2H W | H2H L | H2H T | Points W | Points L | Points T
    results.push(getPercentage(results, numOfWeeks));   // add % to results array
    results.push('--');
    // edit cells to show results
    row = $(row).parent().children();   //TODO: replace this with an update function
    editCells($(row), results);
}


function reformatTableHeader(tableHeader) {
    updateTableWidth($(tableHeader).parents('td:first'));
    // $(tableHeader).parents('tbody:first').before('<thead></thead>');
    updateHeaderColumns($(tableHeader));
    updateSubHeaderColumns($(tableHeader).next());
    // move the subheader into the <thead>, have to do this first because we are referencing it from tableHeader
    // jQuery($(tableHeader).next()).detach().appendTo('thead');
    // then we can move tableHeader
    // jQuery(tableHeader).detach().prependTo('thead');


}


function fixRowBGColor(sortedRows) {
    for (var idx = 0; idx < sortedRows.length; idx+=2) {
        $(sortedRows[idx]).attr('bgColor', LIGHT_BG_COLOR);  // light color
    }
    for (var idx = 1; idx < sortedRows.length; idx+=2) {
        $(sortedRows[idx]).attr('bgColor', DARK_BG_COLOR);  // dark color
    }
}

// pasted in:
/*** Copyright 2013 Teun Duynstee Licensed under the Apache License, Version 2.0 ***/
var firstBy=function(){function n(n){return n}function t(n){return"string"==typeof n?n.toLowerCase():n}function r(r,e){if(e="number"==typeof e?{direction:e}:e||{},"function"!=typeof r){var u=r;r=function(n){return n[u]?n[u]:""}}if(1===r.length){var i=r,o=e.ignoreCase?t:n;r=function(n,t){return o(i(n))<o(i(t))?-1:o(i(n))>o(i(t))?1:0}}return-1===e.direction?function(n,t){return-r(n,t)}:r}function e(n,t){return n=r(n,t),n.thenBy=u,n}function u(n,t){var u=this;return n=r(n,t),e(function(t,r){return u(t,r)||n(t,r)})}return e}();


function sortRows(rows) {

    // add PF column to table for sorting purposes. it will be hidden on the UI
    var pointsFor = $('.sortablePF').clone();

    for (var idx = 0; idx < rows.length; idx++) {
        $(rows[idx]).append(pointsFor[idx]);
    }
    $(pointsFor).hide();

    var sortedRows = $(rows).sort(
        firstBy(function(a,b) { return parseInt($($(a).children()[1]).text()) - parseInt($($(b).children()[1]).text()); }, -1) // TOTAL W
        .thenBy(function(a,b) { return parseInt($($(a).children()[4]).text()) - parseInt($($(b).children()[4]).text()); }, -1)  // H2H W
        .thenBy(function(a,b) { return parseInt($($(a).children()[7]).text()) - parseInt($($(b).children()[7]).text()); }, -1)  // POINTS W
        .thenBy(function(a,b) { return parseFloat($($(a).children()[12]).text()) - parseFloat($($(b).children()[12]).text()); }, -1) // PF
    );
    $(rows).parents('tbody:first').append(sortedRows);  // replace old tables

    fixRowBGColor(sortedRows);
}


function addHybridDataToTable() {
    // get all tables
    var tableHeader = $(TABLE_HEADER);

    // move tables that are on the right side of the page (multiple divisions) to there own row
    for (idx = 1; idx <= tableHeader.length/2; idx+=2) {
        var table = $($(tableHeader)[idx]).parents('td:first');
        // make a new row in table
        table.parents('tr:first').after('<tr id=moved_table'+idx.toString()+'></tr>');
        // add right side table to row
        jQuery(table).detach().appendTo('#moved_table'+idx.toString());
    }

    // format each table
    for (idx = 0; idx < tableHeader.length; idx++) {
        if ($($(tableHeader)[idx]).parents('table:first').attr('id') == 'xstandTbl_div0') { 
            break; 
        }
        else {
            reformatTableHeader($(tableHeader)[idx]);
            updateRows($($(tableHeader)[idx]).nextAll().slice(1));  // we want to skip over the subheader and update all the rows after that
        }
    }
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

function getWins(rows, idx) {
    var columns = $(rows[idx]).children();
    return parseFloat($(columns[1]).text()) + (parseFloat($(columns[3]).text())*0.5);    // W + T
}

function addGBInfo(rows) {
    var leaderWins = getWins(rows, 0);
    for (var idx = 1; idx < rows.length; idx++) {
        var itrWins = getWins(rows, idx);
        var diff = leaderWins - itrWins;
        if (diff) {
            $($(rows[idx]).children()[11]).text(diff);
        }
    }
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

// MAIN
if (ON_STANDINGS_PAGE) {
    console.log('standings');
    addHybridDataToTable();
}
else if (ON_SCOREBOARD_PAGE) {
    var numOfWeeks = getNumOfWeeksOnScoreboardPage();
    var teams = $('td.team');
    
    getPointsResults(numOfWeeks, teams, function(teams, pointsResults) {
        for (var teamIdx = 0; teamIdx < teams.length; teamIdx++) {
            var owner = $(teams[teamIdx]).find('a').attr('title');
            var H2HResults = getH2HResultsOnScoreboardPage(teamIdx);
            H2HResults = H2HResults.map(function(elem) { return parseInt(elem); });
            if (H2HResults.length == 2) {   // means they have no ties
                H2HResults.push(0) // make array 3 items long
            }
            var totalResults = getTotalResults(H2HResults, pointsResults[owner]);
            totalResults = '('+totalResults.join('-')+')';
            $($(teams[teamIdx]).find('.record')).text(totalResults);
        }
    });
}