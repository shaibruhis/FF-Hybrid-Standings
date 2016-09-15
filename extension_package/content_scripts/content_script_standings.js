const TABLE_HEADER = '.tableHead';
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
    var idx = 0;
    while ($($(tableHeader)[idx]).parents('table:first').attr('id') != 'xstandTbl_div0') {
        reformatTableHeader($(tableHeader)[idx]);
        updateRows($($(tableHeader)[idx]).nextAll().slice(1), recordsObj);  // we want to skip over the subheader and update all the rows after that
        idx++;
    }
}

// MAIN
chrome.storage.local.get(function(recordsObj) {
    // if (jQuery.isEmptyObject(object)) { // data isn't stored so we must go fetch and store it
    //     chrome.tabs.executeScript(null, {file: "content_script_getdata.js"});
    // }
    console.log(recordsObj);
    addHybridDataToTable(recordsObj);
});

