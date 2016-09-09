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


    function getResults(row) {
        var results = $(row).slice(1,4);
        var numOfWeeks = $.map(results, function(elem) {
            return parseInt($(elem).text(),10);
        });
        return numOfWeeks;
    }


    function updateRows(rows) {
        var results = getResults($(rows[0]).children());
        var numOfWeeks = getNumOfWeeks(results); // wins + losses + ties
        for (var idx = 0; idx < rows.length; idx++) {
            updateRow($(rows[idx]).children(), numOfWeeks);
        }
    }

    function updateRow(row, numOfWeeks) {

        for (var idx = NUMBER_OF_COLUMNS-NUMBER_OF_EXISTING_COLUMNS; idx < NUMBER_OF_COLUMNS; idx++) {
            var newColumn = createNewColumn("");
            $(row).parent().append(newColumn);
        }

        owner = $(row).first().children().first().attr('title');

        results = getResults($(row));
        console.log(results);

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