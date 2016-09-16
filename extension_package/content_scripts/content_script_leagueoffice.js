
chrome.storage.local.get(function(recordsObj) {
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
});