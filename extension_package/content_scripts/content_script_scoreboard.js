// if (no_data) {  // populate data only once per session
//     getData();  
// }



chrome.storage.local.get(function(recordsObj) {
    var teams = $('td.team');
    var numOfWeeks = 1; // get from chrome.storage
    
    for (var teamIdx = 0; teamIdx < teams.length; teamIdx++) {
        var owner = $(teams[teamIdx]).find('a').attr('title');
        var record = recordsObj['records'][owner];
        var totalResults = '('+record['TOTAL W']+'-'+record['TOTAL L']+'-'+record['TOTAL T']+')';
        $($(teams[teamIdx]).find('.record')).text(totalResults);
    }
});