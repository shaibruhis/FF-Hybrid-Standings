chrome.storage.local.get(function(recordsObj) {
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
});