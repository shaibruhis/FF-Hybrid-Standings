chrome.runtime.onStartup.addListener(function() {
	chrome.storage.local.clear(); 	// because there is no session storage in chrome.storage
});