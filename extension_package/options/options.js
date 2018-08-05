$(document).ready(function() {

    const LEAGUE_URL = 'http://games.espn.com/ffl/leagueoffice?seasonId='+(new Date().getFullYear())+'&leagueId=';


    chrome.storage.sync.get('leagueIDs', function(leagueIDsObj) {
        var leagueIDs;
        if (jQuery.isEmptyObject(leagueIDsObj)) { 
            leagueIDs = {'espn':{}};    // add yahoo
        }
        else {
            leagueIDs = leagueIDsObj.leagueIDs;
            for (var host in leagueIDs) { // do it for each host type (for now just espn, but yahoo later)
                for (var leagueID in leagueIDs[host]) {
                    var listItem = makeListItem(leagueIDs[host][leagueID]['league-name'], leagueID);
                    // add to UI
                    $('#leagueIDs-list-wrapper').append(listItem);
                }
            }
        }

        $('#add').click(function() {
            var leagueID = $('#textInput').val();
            if (Object.keys(leagueIDs['espn']).indexOf(leagueID) == -1) {
                $.get(LEAGUE_URL+leagueID, function(html) {
                    var leagueName = $(html).find('.league-team-names').children().first().text();
                    var newListItem = makeListItem(leagueName, leagueID);
                    // add to UI
                    $('#leagueIDs-list-wrapper').append(newListItem);
                });
            }
        });

        $('#save').click(function() {
            updateTieBreakers()

            chrome.storage.sync.set({'leagueIDs':leagueIDs}, function() {
                window.close();
            });
        });

        function updateTieBreakers() {
            var leagueListItems = $('#leagueIDs-list-wrapper').children('.leagueIDs-list-item')
            for (var idx = 0; idx < leagueListItems.length; idx++) {
                var leagueListItem = leagueListItems[idx];
                var leagueID = $(leagueListItem).find('.league-info').text().match(/(\d+\))$/)[1].slice(0,-1);
                var tieBreaker = $(leagueListItem).find('.tie-breaker-drop-down')[0].value
                leagueIDs.espn[leagueID]['tie-breaker'] = tieBreaker;
            }
        }

        $('#cancel').click(function() {
            window.close();
        });

        function remove(event) {
            // remove from UI
            event.preventDefault();
            $(this).parent('.leagueIDs-list-item').remove();
            // remove from storageObj
            var leagueID = $(this).prev().text().match(/(\d+\))$/)[1].slice(0,-1);  // get leagueID from text
            delete leagueIDs.espn[leagueID];
        }

        function makeListItem(leagueName, leagueID) {
            // league name and id
            var displayText = leagueName + ' (' + leagueID + ')'
            var newListItem = $('<div class=leagueIDs-list-item></div>');
            var listItemText = $('<span class=league-info></span>');
            $(listItemText).text(displayText);
            $(newListItem).append(listItemText);

            // remove button
            var listItemButton = $('<button class=remove>Remove</button>');
            $(listItemButton).click(remove);
            $(newListItem).append(listItemButton);

            // tie breaker
            var listItemTieBreakerDiv = $('<div class=tie-breaker></div>');
            var listItemTieBreakerText = $('<span class=tie-breaker-text>Tie Breaker: </span>');
            var listItemTieBreakerDropDown = $('<select class=tie-breaker-drop-down><option value="H2H W">H2H Wins</option><option value="POINTS W">Points Wins</option><option value="PF">Points For</option></select>');
            $(listItemTieBreakerDiv).append(listItemTieBreakerText);
            $(listItemTieBreakerDiv).append(listItemTieBreakerDropDown);
            $(newListItem).append(listItemTieBreakerDiv);

            // add to storageObj
            leagueIDs.espn[leagueID] = {'league-name': leagueName, 'tie-breaker': 'H2H W'}; // default to H2H W

            return newListItem;
        }
    });
});