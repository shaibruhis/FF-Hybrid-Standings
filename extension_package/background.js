chrome.runtime.onStartup.addListener(function() {
    chrome.storage.local.clear();   // because there is no session storage in chrome.storage
});

// chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
//     if (changeInfo['status'] == 'complete' && /games\.espn\.com\/.*leagueId/.test(tab.url)) {
//         // chrome.storage.local.get(null, function(recordsObj) {
//             // if (!Object.keys(recordsObj).length) {
//         chrome.tabs.executeScript({file: "content_scripts/content_script_getdata.js"};
//             // }
//         // });
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



