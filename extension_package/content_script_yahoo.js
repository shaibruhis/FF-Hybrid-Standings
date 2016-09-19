// get info from League > record book
// Football '16
// League > Overview
// My Team > !Team Info
// Matchups


function getLeagueID() {
    var matches = document.URL.match(/f1\/(\d)+(\/)?/)[0].split('/');
    return matches[1];
}

const TABLE_HEADER = '.tableHead';
const LEAGUE_ID = getLeagueID();
const SCOREBOARD_URL = 'http://football.fantasysports.yahoo.com/f1/'+LEAGUE_ID+'/matchup?week=';
const STANDINGS_URL = 'http://football.fantasysports.yahoo.com/f1/'+LEAGUE_ID;


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
    var owner = $(row).find('Mawpx-250').text();
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
    var scoresArray = $(html).find('.Fz-lg');
    console.log(scoresArray);
    for (var idx = 0; idx < scoresArray.length; idx++) {
        var owner = $(scoresArray[idx]).parents('.Grid-u-1-4').first().next().find('a').first().text();
        console.log(owner);
    }
    //     allOwners.push(owner);     // build array of allOwners
    //     var score = $(scoresArray[idx]).text();
    //     if (score in scoreObjects) {
    //         scoreObjects[score].push(owner);
    //     }
    //     else {
    //         scoreObjects[score] = [owner];   
    //     }
    // }

    // // get keys and sort them so we can get high scores from dict
    // var scoreObjectsKeys = Object.keys(scoreObjects).sort(function(a, b) { return parseFloat(b)-parseFloat(a); } );

    // // initialize pointsResults
    // if (jQuery.isEmptyObject(pointsResults)) {
    //     for (var idx = 0; idx < allOwners.length; idx++) {
    //         pointsResults[allOwners[idx]] = [0,0,0];
    //     }
    // }

    // // adds results to pointresults
    // var count = 1
    // for (var scoreIdx = 0; scoreIdx < scoreObjectsKeys.length; scoreIdx++) {
    //     var owners = scoreObjects[scoreObjectsKeys[scoreIdx]];
    //     for (var ownerIdx = 0; ownerIdx < owners.length; ownerIdx++) {
    //         if (count < allOwners.length/2) {
    //             pointsResults[owners[ownerIdx]][0]++;  // increase owners wins by 1
    //         }
    //         else if (count == allOwners.length/2) {
    //             if (owners.length == 1) {
    //                 pointsResults[owners[ownerIdx]][0]++;  // increase owners wins by 1
    //             }
    //             else {
    //                 pointsResults[owners[ownerIdx]][2]++;  // increase owners ties by 1
    //             }
    //         }
    //         else {
    //             pointsResults[owners[ownerIdx]][1]++;  // increase owners losses by 1
    //         }
    //     }
    //     count += owners.length // increase the count by the number of people that had this score
    // }
    return pointsResults;
}

function getPointsResults(numOfWeeks, rows, completionHandler) {
    var pointsResults = {};     // {'owner1':[W,L,T], 'owner2':[W,L,T], etc}
    var count = 0;
    for (var weekNum = 1; weekNum <= numOfWeeks; weekNum++) {
        $.get(SCOREBOARD_URL+weekNum, function(data) {
            pointsResults = parseHTML(data, pointsResults);
            count++;
            // if(count > numOfWeeks - 1) {    // make sure all async calls completed
            //     completionHandler(rows, pointsResults);
            // }
        });
    }
}

function getNumOfWeeks(results) {
    return results.reduce(function(a,b) {return a+b;}, 0);
}

function getH2HResults(row) {
    var results = $(row).children('.Tst-wlt').text().split('-');
    return $.map(results, function(elem) { return parseInt(results,10); });
}

function getDataFromRows(rows) {
    var H2HResults = getH2HResults(rows.first());
    var numOfWeeks = getNumOfWeeks(H2HResults); // wins + losses + ties
    console.log(numOfWeeks);
    getPointsResults(1, rows, function(rows, pointsResults) {
        var recordsToStore = {}
        recordsToStore['numOfWeeks'] = numOfWeeks;
        var records = {}
        for (var teamIdx = 0; teamIdx < rows.length; teamIdx++) {
            var ownerRecordObj = getDataFromRow($(rows[teamIdx]), numOfWeeks, pointsResults);
            // ownerRecordObj['results'] = addPFToRecord(html, ownerRecordObj['results'], teamIdx);
            // records[ownerRecordObj['owner']] = ownerRecordObj['results'];
        }

        // var sortedOwners = sortRecords(records);
        // records = addGBInfo(records, sortedOwners);
        // records = addRank(records, sortedOwners);
        // recordsToStore['records'] = records;
        // recordsToStore['sortedOwners'] = sortedOwners;
        
        // url = document.location.href;
        // if (/standings/.test(url)) { updateStandingsUI(recordsToStore, tableIdx); }
        // else if (/scoreboard/.test(url)) { updateScoreboardUI(recordsToStore); }
        // else if (/clubhouse/.test(url)) { updateClubhouseUI(recordsToStore); }
        // else if (/leagueoffice/.test(url)) { updateLeagueOfficeUI(recordsToStore); }
        // else if (/schedule/.test(url)) { updateScheduleUI(recordsToStore); }
        // else if (/boxscore/.test(url)) { updateBoxscoreUI(recordsToStore); }
    });
}

function getData() {
    $.get(STANDINGS_URL, function(html) {
        // get all tables
        var table = $(html).find('#standingstable')[0];
        // console.log($($(table).children('tbody')[0]).children());
        getDataFromRows($($(table).children('tbody')[0]).children());  // get all rows contains owner records
    });
}


// MAIN
getData();

function updateScoreboardUI(recordsObj) {
    var teams = $('td.team');
    var numOfWeeks = 1; // get from chrome.storage
    
    for (var teamIdx = 0; teamIdx < teams.length; teamIdx++) {
        var owner = $(teams[teamIdx]).find('a').attr('title');
        var record = recordsObj['records'][owner];
        var totalResults = '('+record['TOTAL W']+'-'+record['TOTAL L']+'-'+record['TOTAL T']+')';
        $($(teams[teamIdx]).find('.record')).text(totalResults);
    }
}

function updateBoxscoreUI(recordsObj) {
    var ownersInMatchup = $('.teamInfoOwnerData');
    for (var idx = 0; idx < ownersInMatchup.length; idx++) {
        var teamName = $(ownersInMatchup[idx]);

        // need to get full team name (including owner) so it matches keys in recordsObj['records']
        var regex = new RegExp($(teamName).text());   
        var owners = recordsObj['sortedOwners'];
        var idx;
        for (idx = 0; idx < owners.length; idx++) {
            if (owners[idx].match(regex)) { break; }
        }
        var owner = owners[idx];

        var record = recordsObj['records'][owner];
        var totalResults = ' '+record['TOTAL W']+'-'+record['TOTAL L']+'-'+record['TOTAL T']+'\u00A0\u00A0\u00A0\u00A0';

        $(teamName).parent().parent()[0].childNodes[7].nodeValue = totalResults
        $(teamName).parent().parent()[0].childNodes[12].nodeValue = ' '+record['teamRank'];
    }
}

function updateClubhouseUI(recordsObj) {
    var ownerRecord = $('h4')[0].childNodes[1]; // use childNodes to access immediate text only (no text in children)
    var ownerRank = $('h4 em');

    var teamName = $('.team-name').text();
    teamName = teamName.slice(0,teamName.indexOf('('));
    var regex = new RegExp(teamName);
    
    var owners = recordsObj['sortedOwners'];
    var idx;
    for (idx = 0; idx < owners.length; idx++) {
        if (owners[idx].match(regex)) { break; }
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
    while ($(table[idx]).find('nobr').length) { // check to see if it has a value in the RESULE column 
        row = $(table[idx]).children();

        var owner = $(row[3]).children().first().attr('title');
        var record = recordsObj['records'][owner];
        var totalResults = ' ('+record['TOTAL W']+'-'+record['TOTAL L']+'-'+record['TOTAL T']+')';
        row[3].childNodes[1].nodeValue = totalResults;

        idx++;
    }
}

function updateLeagueOfficeUI(recordsObj) {
    var owners = $('.lo-sidebar-box').last().find('tr');
    var sortedOwners = recordsObj['sortedOwners'];
    for (var idx = 0; idx < sortedOwners.length; idx++) {
        var owner = sortedOwners[idx];
        var record = recordsObj['records'][owner];
        // set owner cell
        var ownerCell = $(owners[idx+1]).find('a')[0];  // first row is table title so we skip it (idx+1)
        $(ownerCell).text(record['teamName']);
        $(ownerCell).attr({
            title: owner,
            href: ['teamLink']
        });

        // set records
        var totalResults = record['TOTAL W']+'-'+record['TOTAL L']+'-'+record['TOTAL T'];
        $($(owners[idx+1]).children()[2]).text(totalResults);
    }
}

function updateStandingsUI(recordsObj, tableIdx) {
    const OWNER_COLUMN_WIDTH = 22;
    const NUMBER_OF_COLUMNS = 12;
    const NUMBER_OF_EXISTING_COLUMNS = 6;
    const COLUMN_WIDTH = ((100-OWNER_COLUMN_WIDTH)/NUMBER_OF_COLUMNS).toString() + '%';
    const COLUMN_HEADERS = ['TEAM', 'TOTAL W', 'TOTAL L', 'TOTAL T', 'H2H W', 'H2H L', 'H2H T', 'POINTS W', 'POINTS L', 'POINTS T', 'PCT', 'GB'];


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
        var ownerCell = $(row[0]).children().first();
        $(ownerCell).text(record['teamName']);
        $(ownerCell).attr({
            title: owner,
            href: record['teamLink']
        });

        // edit record
        for (var idx = 1; idx < NUMBER_OF_COLUMNS; idx++) { // idx starts at one in row because we dont want to edit owner column
            if (idx == 10) { // format decimal
                var percentage = record[COLUMN_HEADERS[idx]].toFixed(3); // calc % for results
                $(row[idx]).text(percentage.toString().replace(/^0+/, ''));    // remove leading 0  
            }
            else if (idx == 11 && record[COLUMN_HEADERS[idx]] == 0) {   // if 0 GB replace with '--'
                $(row[idx]).text('--');
            }
            else { $(row[idx]).text(record[COLUMN_HEADERS[idx]]); }
        }
    }

    function updateRow(row, owner, record) {
        // add cells
        for (var idx = NUMBER_OF_COLUMNS-NUMBER_OF_EXISTING_COLUMNS; idx < NUMBER_OF_COLUMNS; idx++) {
            var newColumn = createNewColumn("");
            $(row).parent().append(newColumn);
        }

        // edit cells to show results
        row = $(row).parent().children();   //TODO: replace this with an update function
        editCells($(row), owner, record);
        // make owner's row bolded
        if ($('.nav-main-breadcrumbs').children().last().attr('title') == owner) {
            $(row).attr('style', 'font-weight:bold;');
        }
    }

    function updateRows(rows, recordsObj) {
        for (var idx = 0; idx < rows.length; idx++) {
            var owner = recordsObj['sortedOwners'][idx]
            updateRow($(rows[idx]).children(), owner, recordsObj['records'][owner]);
        }
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

    function addHybridDataToTable(recordsObj) {
        // what to turn table into
        // <tr>
        //     <th class="Ta-c Px-sm Tst-rank-th"><span>Rank</span></th>
        //         <th class="Px-sm Tst-manager-th"><span>Team</span></th>
        //         <th class="Ta-c Px-sm Tst-wlt-th"><div>TOTAL</div><div>W-L-T</div></th> 
        //         <th class="Ta-c Px-sm Tst-wlt-th"><div>H2H</div><div>W-L-T</div></th>
        //         <th class="Ta-c Px-sm Tst-wlt-th"><div>POINTS</div><div>W-L-T</div></th>
        //         <th class="Ta-c Px-sm">Pts For</th>
        //         <th class="Ta-c Px-sm">Pts Agnst</th>
        //         <th class="Ta-c Px-sm">Streak</th>            
        //         <th class="Ta-c Px-sm"><span>Waiver</span></th>
        //         <th class="last Ta-c Px-sm">Moves</th>
        // </tr>

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
        reformatTableHeader($(tableHeader));
        updateRows($($(tableHeader)).nextAll().slice(1), recordsObj);  // we want to skip over the subheader and update all the rows after that
    }

    addHybridDataToTable(recordsObj);
}