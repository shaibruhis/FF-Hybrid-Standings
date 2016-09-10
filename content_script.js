$(document).ready(function() {


    function getLeagueID() {
        var url = window.location.toString();
        regExp = /leagueId=(\d+)/;
        var matches = regExp.exec(url);
        return matches[1];
    }

    function getSeasonID() {
        var seasonID = "2016"
        var url = window.location.toString();
        regExp = /seasonId=(\d+)/;
        var matches = regExp.exec(url);
        if (matches[1]) {
            seasonID = matches[1];
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


    function getNumOfWeeks(results) {
        return numOfWeeks = results.reduce(function(a,b) {return a+b;}, 0);
    }


    function getH2HResults(row) {
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
        return returnArray;
    }


    function updateRows(rows) {
        var H2HResults = getH2HResults($(rows[0]).children());
        var numOfWeeks = getNumOfWeeks(H2HResults); // wins + losses + ties
        getPointsResults(numOfWeeks, rows, function(rows, pointsResults) {
            for (var idx = 0; idx < rows.length; idx++) {
                updateRow($(rows[idx]).children(), numOfWeeks, pointsResults);
            }
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
        var H2HResults = getH2HResults($(row)); // H2H W | H2H L | H2H T
        pointsResults = pointsResults[owner]; // Points W | Points L | Points T
        var results = getTotalResults(H2HResults, pointsResults);

        results = results.concat(H2HResults, pointsResults);    // Total W | Total L | Total T | H2H W | H2H L | H2H T | Points W | Points L | Points T
        results.push(getPercentage(results, numOfWeeks));   // add % to results array
        results.push('--'); //TODO: implement GB calculation (might be better to populate and sort table and then do calculation)
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

    // pasted in:
    /*** Copyright 2013 Teun Duynstee Licensed under the Apache License, Version 2.0 ***/
    var firstBy=function(){function n(n){return n}function t(n){return"string"==typeof n?n.toLowerCase():n}function r(r,e){if(e="number"==typeof e?{direction:e}:e||{},"function"!=typeof r){var u=r;r=function(n){return n[u]?n[u]:""}}if(1===r.length){var i=r,o=e.ignoreCase?t:n;r=function(n,t){return o(i(n))<o(i(t))?-1:o(i(n))>o(i(t))?1:0}}return-1===e.direction?function(n,t){return-r(n,t)}:r}function e(n,t){return n=r(n,t),n.thenBy=u,n}function u(n,t){var u=this;return n=r(n,t),e(function(t,r){return u(t,r)||n(t,r)})}return e}();


    function sortRows(rows) {
        var sortedRows = $(rows).sort(
            firstBy(function(a,b) { return parseInt($($(a).children()[1]).text()) - parseInt($($(b).children()[1]).text()); }, -1) // TOTAL W
            .thenBy(function(a,b) { return parseInt($($(a).children()[4]).text()) - parseInt($($(b).children()[4]).text()); }, -1)  // H2H W
            .thenBy(function(a,b) { return parseInt($($(a).children()[7]).text()) - parseInt($($(b).children()[7]).text()); }, -1)  // POINTS W
        );


        $(rows).parents('tbody:first').append(sortedRows);  // replace old tables
    }


    function addHybridDataToTable() {
        var tableHeader = $(TABLE_HEADER)[0];   // 2 tables on this page and we want the first one
        // get rows before we rearrange html elements
        // var rows = $(tableHeader).nextAll().slice(1)
        reformatTableHeader($(tableHeader));
        updateRows($(tableHeader).nextAll().slice(1));  // we want to skip over the subheader and update all the rows after that
        // var tableHeader = $(TABLE_HEADER)[0]; // need to update tableHeader
    }



    function parseHTML(HTML, pointsResults) {
        var scoreObjects = [];      // [{owner:'owner1', score:100}, {owner:'owner2', score:97}, etc]

        var scoresArray = $(HTML).find('[id^=teamscrg_]');
        for (var idx = 0; idx < scoresArray.length; idx++) {
            var owner = $(scoresArray[idx]).find('a').attr('title');
            var score = $(scoresArray[idx]).find('.score').attr('title');
            var obj = {}
            obj['owner'] = owner;
            obj['score'] = parseFloat(score);
            scoreObjects.push(obj);
        }

        scoreObects = scoreObjects.sort(function(a, b) {
            return b.score-a.score;
        });

        if (jQuery.isEmptyObject(pointsResults)) {
            for (var idx = 0; idx < scoreObjects.length; idx++) {
                var obj = {};
                pointsResults[scoreObjects[idx].owner] = [0,0,0];
            }
        }
        scoreObjects = scoreObjects.slice(0,scoreObjects.length/2);
        // store into pointsResults
        for (var idx = 0; idx < scoreObjects.length; idx++) {
            pointsResults[scoreObjects[idx].owner][0] += 1;
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
                if(count > numOfWeeks - 1) {
                    completionHandler(rows, pointsResults);
                    sortRows(rows);
                }
            });
        }
    }

    addHybridDataToTable();
});