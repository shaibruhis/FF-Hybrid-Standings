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

// store numOfWeeks


// structure of object in storage
// {
//     'numOfWeeks':5,
//     'records':{
//         'owner1':{
//             'ownerName':'bob',
//             'teamName': 'bobs team',
//             'teamLink': www.bob.com,
//             'Total W':8,
//             'Total L':2,
//             'Total T':0,
//             'H2H W':5,
//             'H2H L':0,
//             'H2H T':0,
//             'Points W':3,
//             'Points L':2,
//             'Points T':0,
//             'pct':.800,
//             'gb':'--'
//             'pf': 671.1
//         },
//         owner2 - owner12
//     },
//     'sortedOwners': [
//         'owner1', 'owner2', etc
//     ]
// }



