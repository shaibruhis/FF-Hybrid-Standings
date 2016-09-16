chrome.storage.local.get(function(recordsObj) {
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
});