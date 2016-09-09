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
    const COLUMN_HEADERS = ['Team', 'Total W', 'Total L', 'Total T', 'H2H W', 'H2H L', 'H2H T', 'Points W', 'Points L', 'Points T', 'PCT', 'GB']
    const LEAGUE_ID = getLeagueID();
    const SEASON_ID = getSeasonID();


    function updateHeaderColumns(tableHeader) {
        $(tableHeader.children()[0]).attr('colspan', NUMBER_OF_COLUMNS.toString()); // increase width of header to account for added columns
    }

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


    function getPointsResults(owner) {
        return [3,9,1];
    }

    function getTotalResults(H2HResults, pointsResults) {
        returnArray = [3];
        for (var idx = 0; idx < H2HResults.length; idx++) {
            returnArray[idx] = H2HResults[idx] + pointsResults[idx];
        }
        return returnArray;
    }


    function updateRows(rows) {
        var results = getH2HResults($(rows[0]).children());
        var numOfWeeks = getNumOfWeeks(results); // wins + losses + ties
        for (var idx = 0; idx < rows.length; idx++) {
            updateRow($(rows[idx]).children(), numOfWeeks);
        }
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


    function updateRow(row, numOfWeeks) {
        // add cells
        for (var idx = NUMBER_OF_COLUMNS-NUMBER_OF_EXISTING_COLUMNS; idx < NUMBER_OF_COLUMNS; idx++) {
            var newColumn = createNewColumn("");
            $(row).parent().append(newColumn);
        }

        owner = $(row).first().children().first().attr('title');

        // get and build results
        H2HResults = getH2HResults($(row)); // H2H W | H2H L | H2H T
        pointsResults = getPointsResults(owner); // Points W | Points L | Points T
        var results = getTotalResults(H2HResults, pointsResults);
        results = results.concat(H2HResults, pointsResults);    // Total W | Total L | Total T | H2H W | H2H L | H2H T | Points W | Points L | Points T
        results.push(getPercentage(results, numOfWeeks));   // add % to results array
        results.push('--'); //TODO: implement GB calculation (might be better to populate and sort table and then do calculation)
        // edit cells to show results
        row = $(row).parent().children();   //TODO: replace this with an update function
        editCells($(row), results);
    }


    function addHybridDataToTable() {
        var tableHeader = $(TABLE_HEADER)[0];   // 2 tables on this page and we want the first one
        updateTableWidth($(tableHeader).parents('td:first'));
        updateHeaderColumns($(tableHeader));
        updateSubHeaderColumns($(tableHeader).next());
        updateRows($(tableHeader).nextAll().slice(1));  // we want to skip over the subheader and update all the rows after that
    }

    addHybridDataToTable();
});