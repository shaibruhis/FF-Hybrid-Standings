$(document).ready(function() {

    const TABLE_HEADER = '.tableHead';
    const OWNER_COLUMN_WIDTH = 22;
    const NUMBER_OF_COLUMNS = 12;
    const COLUMN_WIDTH = ((100-OWNER_COLUMN_WIDTH)/NUMBER_OF_COLUMNS).toString() + '%';
    const COLUMN_HEADERS = ['Team', 'Total W', 'Total L', 'Total T', 'H2H W', 'H2H L', 'H2H T', 'Points W', 'Points L', 'Points T', 'PCT', 'GB']

    function updateHeaderColumns(tableHeader) {
        $(tableHeader.children()[0]).attr('colspan', NUMBER_OF_COLUMNS.toString()); // increase width of header to account for added columns
    }

    function updateTableWidth(table) {
        $(table).attr('width', '100%');
        $(table).nextAll().remove()
    }


    function editSubHeaderColumn(columnIdx, subHeaderColumns) {
        // edit the preexisiting ones
        if (columnIdx <= 5) {
            $(subHeaderColumns[columnIdx]).text(COLUMN_HEADERS[columnIdx]).attr('width', COLUMN_WIDTH);    
        }
        // create and add the new ones
        else {
            var columnSubHeader = $('<td></td>').text(COLUMN_HEADERS[columnIdx]);
            columnSubHeader.attr({
                align: 'right',
                width:  COLUMN_WIDTH
            });
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


    function updateRows(rows) {
        for (var idx = 0; idx < rows.length; idx++) {
            updateRow(rows[idx].children());
        }
    }


    function updateRow(row) {
        owner = row[0].first().attr('title');

    }


    function addHybridDataToTable() {
        var tableHeader = $(TABLE_HEADER)[0];   // 2 tables on this page and we want the first one
        updateTableWidth($(tableHeader).parents('td:first'));
        updateHeaderColumns($(tableHeader));
        updateSubHeaderColumns($(tableHeader).next());
        // updateRows($(tableHeader).nextAll().slice(1));  // we want to skip over the subheader and update all the rows after that
    }

    addHybridDataToTable();
});