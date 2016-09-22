$(document).ready(function() {

    chrome.storage.sync.get('leagueIDs', function(leagueIDsObj) {
        var leagueIDs;
        console.log(jQuery.isEmptyObject(leagueIDsObj), leagueIDsObj);
        if (jQuery.isEmptyObject(leagueIDsObj)) { 
            leagueIDs = {'espn':[]};    // add yahoo
        }
        else {
            leagueIDs = leagueIDsObj.leagueIDs;
            for (var host in leagueIDs) { // do it for each host type (for now just espn, but yahoo later)
                for (var idx = 0; idx < leagueIDs[host].length; idx++) {
                    var listItem = makeListItem(leagueIDs[host][idx]);
                    // add to UI
                    $('#leagueIDs-list-wrapper').append(listItem);
                }
            }
        }

        $('#add').click(function() {
            var newListItem = makeListItem($('#textInput').val());
            // add to UI
            $('#leagueIDs-list-wrapper').append(newListItem);
            // add to storageObj
            leagueIDs.espn.push($(newListItem).find('.league_info').text());
        });

        $('#save').click(function() {
            chrome.storage.sync.set({'leagueIDs':leagueIDs}, function() {
                chrome.storage.sync.get('leagueIDs', function(leagueIDs) {
                    console.log(leagueIDs);
                });
            });
        });

        function remove(event) {
            // remove from UI
            event.preventDefault();
            $(this).parent('.leagueIDs-list-item').remove();
            // remove from storageObj
            var idx = leagueIDs.espn.indexOf($(this).prev().text());
            leagueIDs.espn.splice(idx,1);
        }

        function makeListItem(leagueID) {
            var newListItem = $('<div class=leagueIDs-list-item></div>');
            var listItemText = $('<span class=league_info></span>');
            $(listItemText).text(leagueID);
            $(newListItem).append(listItemText);
            var listItemButton = $('<button class=remove>Remove</button>');
            $(listItemButton).click(remove);
            $(newListItem).append(listItemButton);
            return newListItem;
        }
    });
});