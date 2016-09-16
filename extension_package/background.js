chrome.runtime.onStartup.addListener(function() {
    chrome.storage.local.clear();   // because there is no session storage in chrome.storage
});

// chrome.tabs.onUpdated.addListener(function(integer tabId, object changeInfo, Tab tab) {
//     if (changeInfo.status == 'complete' && changeInfo.url.match(/^(http:\/\/games\.espn\.com\/ffl\/)(leagueId=){1}/)) {

//         function getSeasonID() {
//             var seasonID = "2016";
//             var matches = changeInfo.url.match(/seasonId=(\d+)/);
//             if (matches) {
//                 seasonID = matches[1];
//             }
//             else if ($('.games-alert-mod').children('b').text().match(/\d{4}/)) {  // some pages dont have seasonId in the URL so I check if there is the ESPN warning that I am looking at an old league
//                 seasonID = $('.games-alert-mod').children('b').text();
//             }
//             return seasonID;
//         }

//         const LEAGUE_ID = changeInfo.url.match(/leagueId=(\d+)/)[1];
//         const SEASON_ID = getSeasonID();

//     }
// });


// structure of object in storage
// {
//     'numOfWeeks':5,
//     'records':{
//         'owner1':{
//             'ownerName':'bob',
//             'teamName': 'bobs team',
//             'teamLink': www.bob.com,
//             'teamRank': '1st'
//             'TOTAL W':8,
//             'TOTAL L':2,
//             'TOTAL T':0,
//             'H2H W':5,
//             'H2H L':0,
//             'H2H T':0,
//             'POINTS W':3,
//             'POINTS L':2,
//             'POINTS T':0,
//             'PCT':.800,
//             'GB':'--'
//             'PF': 671.1
//         },
//         owner2 - owner12
//     },
//     'sortedOwners': [
//         'owner1', 'owner2', etc
//     ]
// }



