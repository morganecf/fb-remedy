/*
*	Event page that monitors how much time you spend on facebook. 
* 	You sedentary pig. Since this is an event page make sure not 
* 	to use setInterval/Timeout. To debug the background script 
* 	go to chrome://extensions and click on view background page. 
* 	
*	Potentially useful tab stuff: https://developer.chrome.com/extensions/tabs#event-onUpdated
*/


/* Some utility functions */

var log = function (s) { console.log(s); };

function isEmptyObject (obj) {
	for (var elem in obj) return false;
	return true;
}

// The vortex of productivity 
var facebook = 'facebook.com';
var onFacebook = function (url) { 
	if (url) return url.indexOf(facebook) >= 0; 
	return false;
};

// Keep track of time spent on fb
var timer = function () {
	var T = {};
	T.total = 0;
	T.now = null;
	T.start = function () {
		T.now = Date.now();
	};
	T.stop = function () {
		if (T.now === null) log('Cannot stop unstarted timer.');
		else T.total += (Date.now() - T.now);
	};
	return T;
}();

// Keep track of tabs that are visiting facebook. 
var fbtabs = {};

// First get currently opened tabs and see if facebook is 
// one of them. Track these tabs.  
chrome.tabs.query({}, function (tabs) {
	var startTime = false;
	tabs.forEach(function (t) {
		if (onFacebook(t.url)) {
			fbtabs[t.id] = t;
			startTime = true;
		}
	});
	if (startTime) timer.start();
});

// Add event listener if tab is opened or its URL changes.
// Detect going to facebook events and navigating away 
// from facebook events. 
chrome.tabs.onUpdated.addListener(function (tab_id, change_info, tab) {
	// We only care about loaded events. User could change
	// their mind halfway through. 
	if (change_info.status == "complete") {

		log(tab.url);

		// Case 1: tab already being tracked and left facebook
		if (tab_id in fbtabs && !onFacebook(tab.url)) {
			delete fbtabs[tab_id];
			
			// Only stop timer if no other tabs on fb 
			if (isEmptyObject(fbtabs)) {
				log("stopping timer");
				timer.stop();
				log("left fb. time so far:" + (timer.total / 1000) + ' seconds');
			}
		}
		// Case 2: tab not already tracked and went to fb
		else if (!(tab_id in fbtabs) && onFacebook(tab.url)) {
			// If timer wasn't already started, start 
			if (isEmptyObject(fbtabs)) {
				log("opened fb. starting timer");
				timer.start();
			}

			fbtabs[tab_id] = tab;
		}
	}
});

// Add event listener for tabs being closed. If closed tab
// has tracked id, then remove it. 
chrome.tabs.onRemoved.addListener(function (tab_id, change_info) {
	log("exited tab!");

	if (tab_id in fbtabs) {
		delete fbtabs[tab_id];
		if (isEmptyObject(fbtabs)) {
			timer.stop();
			log("left fb. time so far:" + (timer.total / 1000) + ' seconds');
		}
	}
});