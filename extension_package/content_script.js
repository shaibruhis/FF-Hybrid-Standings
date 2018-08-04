function getLeagueID() {
    var matches = document.URL.match(/leagueId=(\d+)/);
    return matches[1];
}

function getSeasonID() {
    var seasonID = "2018";
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
var TIE_BREAKER;



function addRank(records, sortedOwners) {
    for (var owner in records) {
        var teamRank = sortedOwners.indexOf(owner)+1;  // 1st place is 0 index
        if (teamRank == 1) { teamRank = teamRank+'st'; }
        else if (teamRank == 2) { teamRank = teamRank+'nd'; }
        else if (teamRank == 3) { teamRank = teamRank+'rd'; }
        else { teamRank = teamRank+'th'; }
        records[owner]['teamRank'] = teamRank;
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
        firstBy(function(a,b) { return records[a]['TOTAL W'] - records[b]['TOTAL W']; }, -1)
        .thenBy(function(a,b) { return records[a][TIE_BREAKER] - records[b][TIE_BREAKER]; }, -1)
        .thenBy(function(a,b) { return records[a]['H2H W'] - records[b]['H2H W']; }, -1)
        .thenBy(function(a,b) { return records[a]['PF'] - records[b]['PF']; }, -1)
    );
    return sortedOwners;
}

function addPFToRecord(html ,record) {
    var pointsForRows = $(html).find('.sortablePF');
    // make an array of just the text inside the <a> tags
    var teamNames = pointsForRows.prev().find('a').map(function(){return $(this).text();}).get();
    var teamNameIdx = teamNames.indexOf(record["teamName"]);
	record['PF'] = parseFloat($(pointsForRows[teamNameIdx]).text());    // want to add pf inside the obj inside record
    return record;
}

function getPercentage(results, numOfWeeks) {
    // calc % for results
    var percentage = (results['TOTAL W'] + (results['TOTAL T'] * 0.5)) / (2 * numOfWeeks);
    // if season hasn't began (numOfWeeks == 0) return 0
    return  numOfWeeks == 0 ? 0 : percentage;   
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
        var score = $(scoresArray[idx]).find('.score').text();
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

    // if season hasn't began return 0s for W,T,L for all owners
    if (0 in scoreObjects && scoreObjects[0].length == allOwners.length) {
        return pointsResults;
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
    
    // if the season hasn't began parse week 1's scoreboard URL
    if (numOfWeeks == 0) {
        $.get(SCOREBOARD_URL+1, function(data) {
            pointsResults = parseHTML(data, pointsResults);
            completionHandler(rows, pointsResults);
        });
    }
    else {
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
    
}

function getNumOfWeeks(results) {
    return results.reduce(function(a,b) {return a+b;}, 0);
}

function getH2HResults(row) {
    var results = $(row).slice(1,4);
    return $.map(results, function(elem) { return parseInt($(elem).text(),10); });
}

function getDataFromRows(rows, tableIdx, html) {
    var H2HResults = getH2HResults($(rows[0]).children());
    var numOfWeeks = getNumOfWeeks(H2HResults); // wins + losses + ties
    getPointsResults(numOfWeeks, rows, function(rows, pointsResults) {
        var recordsToStore = {}
        recordsToStore['numOfWeeks'] = numOfWeeks;
        var records = {}
        // TODO: remove for loop and pass in full array into addPFToRecord
        for (var teamIdx = 0; teamIdx < rows.length; teamIdx++) {
            var ownerRecordObj = getDataFromRow($(rows[teamIdx]).children(), numOfWeeks, pointsResults);
            ownerRecordObj['results'] = addPFToRecord(html, ownerRecordObj['results']);
            records[ownerRecordObj['owner']] = ownerRecordObj['results'];
        }

        var sortedOwners = sortRecords(records);
        records = addGBInfo(records, sortedOwners);
        records = addRank(records, sortedOwners);
        recordsToStore['records'] = records;
        recordsToStore['sortedOwners'] = sortedOwners;

        url = document.location.href;
        if (/\/standings/.test(url)) { updateStandingsUI(recordsToStore, tableIdx); }
        else if (/finalstandings/.test(url)) { updateFinalStandingsUI(recordsToStore); }
        else if (/scoreboard/.test(url)) { updateScoreboardUI(recordsToStore); }
        else if (/clubhouse/.test(url)) { updateClubhouseUI(recordsToStore); }
        else if (/leagueoffice/.test(url)) { updateLeagueOfficeUI(recordsToStore, tableIdx); }
        else if (/schedule/.test(url)) { updateScheduleUI(recordsToStore); }
        else if (/boxscore|matchuppreview/.test(url)) { updateBoxscoreUI(recordsToStore); }
    });
}

function getData() {
    $.get(STANDINGS_URL, function(html) {
        // get all tables
        var tableHeader = $(html).find(TABLE_HEADER);
        // console.log(tableHeader);
        // format each table
        var idx = 0;
        while ($($(tableHeader)[idx]).parents('table:first').attr('id') != 'xstandTbl_div0' && idx <= tableHeader.length) {
            getDataFromRows($($(tableHeader)[idx]).nextAll().slice(1), idx, html);  // get all rows contains owner records
            idx++;
        }

    });
}


// MAIN
chrome.storage.sync.get('leagueIDs', function(leagueIDsObj) {
    if (Object.keys(leagueIDsObj['leagueIDs']['espn']).indexOf(LEAGUE_ID) != -1) {
        TIE_BREAKER = leagueIDsObj['leagueIDs']['espn'][LEAGUE_ID]['tie-breaker'];
        getData();
    }
});


function updateFinalStandingsUI(recordsObj) {
    var teams = $('#finalRankingsTable').find('.sortableRow');
    for (var idx = 0; idx < teams.length; idx++) {
        var owner = $(teams[idx]).find('a').attr('title');
        var record = recordsObj['records'][owner];
        if (record) {
            var recordCell = $(teams[idx]).find('.sortableREC');
            var totalResults = record['TOTAL W']+'-'+record['TOTAL L']+'-'+record['TOTAL T'];
            $(recordCell).text(totalResults)
        }
    }
}

function updateScoreboardUI(recordsObj) {
    var teams = $('td.team');
    
    for (var teamIdx = 0; teamIdx < teams.length; teamIdx++) {
        var owner = $(teams[teamIdx]).find('a').attr('title');
        var record = recordsObj['records'][owner];
        if (record) {
            var totalResults = '('+record['TOTAL W']+'-'+record['TOTAL L']+'-'+record['TOTAL T']+')';
            $($(teams[teamIdx]).find('.record')).text(totalResults);
        }
    }
}

function updateBoxscoreUI(recordsObj) {
    var ownersInMatchup = $('.teamInfoOwnerData');

    for (var ownerIdx = 0; ownerIdx < ownersInMatchup.length; ownerIdx++) {
        var teamName = $(ownersInMatchup[ownerIdx]);
        // need to get full team name (including owner) so it matches keys in recordsObj['records']
        var owners = recordsObj['sortedOwners'];
        var idx;
        for (idx = 0; idx < owners.length; idx++) {
            if (owners[idx].indexOf(teamName.text()) != -1) { break; }
        }
        var owner = owners[idx];

        var record = recordsObj['records'][owner];
        if (record) {
            var totalResults = ' '+record['TOTAL W']+'-'+record['TOTAL L']+'-'+record['TOTAL T']+'\u00A0\u00A0\u00A0\u00A0';
            $(teamName).parent().parent()[0].childNodes[7].nodeValue = totalResults
            $(teamName).parent().parent()[0].childNodes[12].nodeValue = ' '+record['teamRank'];
        }
    }
}

function updateClubhouseUI(recordsObj) {
    var ownerRecord = $('h4')[0].childNodes[1]; // use childNodes to access immediate text only (no text in children)
    var ownerRank = $('h4 em');
    var teamName = $('.team-name').text();
    teamName = teamName.slice(0,teamName.indexOf('('));
    
    var owners = recordsObj['sortedOwners'];
    var idx;
    for (idx = 0; idx < owners.length; idx++) {
        if (owners[idx].indexOf(teamName) != -1) { break; }
    }

    var owner = owners[idx];
    var record = recordsObj['records'][owner];
    var totalResults = ' '+record['TOTAL W']+'-'+record['TOTAL L']+'-'+record['TOTAL T']+' ';
    ownerRecord.nodeValue = totalResults;   // set record text
    $(ownerRank).text('('+recordsObj['records'][owner]['teamRank']+')');    // set rank text
}

function updateScheduleUI(recordsObj) {
    var table = $($('.tableSubHead:not(.roundsHeaders')[0]).nextAll();
    var idx = 0;
    while ($(table[idx]).find('nobr').length) { // check to see if it has a value in the RESULT column 
        row = $(table[idx]).children();

        var owner = $(row[3]).children().first().attr('title');
        var record = recordsObj['records'][owner];
        if (record) {
            var totalResults = ' ('+record['TOTAL W']+'-'+record['TOTAL L']+'-'+record['TOTAL T']+')';
            row[3].childNodes[1].nodeValue = totalResults;
        }
        idx++;
    }
}

function updateLeagueOfficeUI(recordsObj, divisionIdx) {
    var divisions = $('.lo-sidebar-box').find('.division-name');
    var owners = $('.lo-sidebar-box').last().find('tr');
    var sortedOwners = recordsObj['sortedOwners'];
    var user = $('.league-team-names').find('a').text();
    for (var idx = 0; idx < sortedOwners.length; idx++) {
        var owner = sortedOwners[idx];
        var record = recordsObj['records'][owner];
        var cellIdx = divisionIdx * (sortedOwners.length + 1) + (idx + 1); // (sortedOwners.length + 1) = rows for each division, (idx + 1) is because first row of each division is division name
        // set owner cell
        var ownerCell = $(owners[cellIdx]).find('a')[0];
        $(ownerCell).text(record['teamName']);
        $(ownerCell).attr({
            title: owner,
            href: record['teamLink']
        });
        // set class="your-team" for your team
        if (user == $(ownerCell).text()) {
            $(ownerCell).parents('tr:first').attr('class', 'your-team');
        }
        // otherwise remove class="your-team"
        else {
            $(ownerCell).parents('tr:first').attr('class', '');
        }

        // set records
        var totalResults = record['TOTAL W']+'-'+record['TOTAL L']+'-'+record['TOTAL T'];
        $($(owners[cellIdx]).children()[2]).text(totalResults);
    }
}

function updateStandingsUI(recordsObj, divisionIdx) {
    const RANK_COLUMN_WIDTH = 2
    const OWNER_COLUMN_WIDTH = 20;
    const NUMBER_OF_COLUMNS = 13;
    const NUMBER_OF_EXISTING_COLUMNS = 6;
    const COLUMN_WIDTH = ((100-OWNER_COLUMN_WIDTH-RANK_COLUMN_WIDTH)/NUMBER_OF_COLUMNS).toString() + '%';
    const COLUMN_HEADERS = ['RANK', 'TEAM', 'TOTAL W', 'TOTAL L', 'TOTAL T', 'H2H W', 'H2H L', 'H2H T', 'POINTS W', 'POINTS L', 'POINTS T', 'PCT', 'GB'];


    function createNewColumn(columnText) {
        var columnCell = $('<td></td>').text(columnText);
        columnCell.attr({
            align: 'right',
            width:  COLUMN_WIDTH,
            title:  columnText
        }); 
        return columnCell;
    }

    function editCells(row, owner, record) {
        // edit owner column
        var ownerCell = $(row[0]).children().first(); // row[0] because owner info is initially in 0th col
        $(ownerCell).text(record['teamName']);
        $(ownerCell).attr({
            title: owner,
            href: record['teamLink']
        });

        // edit record
        for (var idx = 0; idx < NUMBER_OF_COLUMNS; idx++) { // idx starts at 2 in row because we dont want to edit owner column
            if (idx == 0) {
                $(row[idx]).text(record['teamRank']);
            }
            else if (idx == 1) {
                $(row[idx]).empty().prepend($(ownerCell));
                $(row[idx]).attr('align', 'left');
            }
            else if (idx == 11) { // format decimal
                var percentage = record[COLUMN_HEADERS[idx]].toFixed(3); // calc % for results
                $(row[idx]).text(percentage.toString().replace(/^0+/, ''));    // remove leading 0  
            }
            else if (idx == 12 && record[COLUMN_HEADERS[idx]] == 0) {   // if 0 GB replace with '--'
                $(row[idx]).text('--');
            }
            else { $(row[idx]).text(record[COLUMN_HEADERS[idx]]); }
        }
    }

    function updateRow(row, owner, record) {
        // add cells
        for (var idx = NUMBER_OF_EXISTING_COLUMNS; idx < NUMBER_OF_COLUMNS; idx++) {
            var newColumn = createNewColumn("");
            $(row).parent().append(newColumn);
        }

        // edit cells to show results
        row = $(row).parent().children();   //TODO: replace this with an update function
        editCells($(row), owner, record);
        // make users's row bolded
        if ($('.nav-main-breadcrumbs').children().last().attr('title') == owner) {
            $(row).attr('style', 'font-weight:bold;');
        }
    }

    function updateRows(rows, recordsObj) {
        for (var rowIdx = 0; rowIdx < rows.length; rowIdx++) {
            var owner = recordsObj['sortedOwners'][rowIdx]
            updateRow($(rows[rowIdx]).children(), owner, recordsObj['records'][owner]);
        }
    }

    function editSubHeaderColumn(columnIdx, subHeaderColumns) {
        var columnHeaderText = COLUMN_HEADERS[columnIdx];
        // edit the preexisiting ones
        if (columnIdx <= 5) {
            $(subHeaderColumns[columnIdx]).text(columnHeaderText)
            if (columnIdx >= 2) {
                $(subHeaderColumns[columnIdx]).attr({
                    width: COLUMN_WIDTH,
                    title: columnHeaderText
                });
            }
        }
        // create and add the new ones
        else {
            var columnSubHeader = createNewColumn(columnHeaderText);
            $(subHeaderColumns).parent().append(columnSubHeader);
        }
    }

    function editSubHeaderColumns(subHeaderColumns) {
        $(subHeaderColumns[0]).attr({
            width: RANK_COLUMN_WIDTH.toString() + '%',
            align: 'left'
        });
        $(subHeaderColumns[1]).attr({
            width: OWNER_COLUMN_WIDTH.toString() + '%',
            align: 'left'
        });
        for (var idx = 0; idx < NUMBER_OF_COLUMNS; idx++) {
            editSubHeaderColumn(idx, $(subHeaderColumns))
        }
    }

    // add text to subheaders
    function updateSubHeaderColumns(subHeader) {
        subHeaderColumns = $(subHeader).children();
        editSubHeaderColumns(subHeaderColumns);
    }

    // make the head span across all columns (subheaders)
    function updateHeaderColumns(tableHeader) {
        $(tableHeader.children()[0]).attr('colspan', NUMBER_OF_COLUMNS.toString()); // increase width of header to account for added columns
    }

    // make table correct width
    function updateTableWidth(table) {
        $(table).attr('width', '100%');
        $(table).nextAll().remove();    // get rid of weird whitespace on right side of table
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

    function addHybridDataToTable(recordsObj, divisionIdx) {
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

        // format table
        reformatTableHeader($(tableHeader)[divisionIdx]);
        updateRows($($(tableHeader)[divisionIdx]).nextAll().slice(1), recordsObj);  // we want to skip over the subheader and update all the rows after that
    }

    // MAIN
    addHybridDataToTable(recordsObj, divisionIdx);
}