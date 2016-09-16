chrome.storage.local.get(function(recordsObj) {
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

        console.log(recordsObj, record['teamRank']);
        $(teamName).parent().parent()[0].childNodes[7].nodeValue = totalResults
        $(teamName).parent().parent()[0].childNodes[12].nodeValue = ' '+record['teamRank'];
    }
});