
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


    // for (var idx = 0; idx < ownersInMatchup.length; idx++) {
    //     var teamName = $(ownersInMatchup[idx]);

    //     // need to get full team name (including owner) so it matches keys in recordsObj['records']
    //     var regex = new RegExp($(teamName).text());   
    //     var owners = recordsObj['sortedOwners'];
    //     var idx;
    //     for (idx = 0; idx < owners.length; idx++) {
    //         if (owners[idx].match(regex)) { break; }
    //     }
    //     var owner = owners[idx];

    //     var record = recordsObj['records'][owner];
    //     var totalResults = ' '+record['TOTAL W']+'-'+record['TOTAL L']+'-'+record['TOTAL T']+'\u00A0\u00A0\u00A0\u00A0';

    //     $(teamName).parent().parent()[0].childNodes[7].nodeValue = totalResults
    //     $(teamName).parent().parent()[0].childNodes[12].nodeValue = ' '+record['teamRank'];
    // }
});