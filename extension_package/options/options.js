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
                    var listItem = makeListItem(leagueIDs[host][leagueID]);
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
                    var displayText = leagueName + ' (' + leagueID + ')'
                    var newListItem = makeListItem(displayText);
                    // add to UI
                    $('#leagueIDs-list-wrapper').append(newListItem);
                    // add to storageObj
                    leagueIDs.espn[leagueID] = displayText;
                });
            }
        });

        $('#save').click(function() {
            chrome.storage.sync.set({'leagueIDs':leagueIDs}, function() {
                window.close();
            });
        });

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

        function makeListItem(league) {
            var newListItem = $('<div class=leagueIDs-list-item></div>');
            var listItemText = $('<span class=league-info></span>');
            $(listItemText).text(league);
            $(newListItem).append(listItemText);
            var listItemButton = $('<button class=remove>Remove</button>');
            $(listItemButton).click(remove);
            $(newListItem).append(listItemButton);
            return newListItem;
        }
    });
});