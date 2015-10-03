/* The animation functionality */

$(document).ready(function () {

	// The total time the app has been running, in seconds
	var running = 180348;	// Test case: 2 days, 2 hours, 5 minutes, 48 seconds

	// Return the total time running in proper format format 
	var format_running = function () {
		var days = Math.floor(running / 86400);
		var left = ((running / 86400) - days) * 86400;
		var hours = parseInt(running / 3600) % 24;
		var minutes = parseInt(running / 60) % 60;
		var seconds = running % 60;
		return days + 'd, ' + hours + 'h, ' + minutes + 'm, ' + seconds + 's';
	};

	// Get the page height and width 
	var height = $(document).height();
	var width = $(document).width();

	// Make the canvas the size of the page 
	var paper = Raphael(0, 15, width, height);

	var start = 100,
		end = width - 100,
		length = end - 100,
		opac = 0.5,
		opac2 = 0.95,
		fill = "#fff",
		font_size = 100,
		font_size2 = 40;

	// The height of each time line 
	var y_start = 80;
	var y_starts = {
		seconds: y_start,
		minutes: y_start * 2,
		hours: y_start * 3
	};

	// Radius of each timeline dot 
	var radii = {
		seconds: 1,
		minutes: 3,
		hours: 5
	};

	// #BFFF71, #7FD7EF, #7A82E7, #BA00B1, #CD0077
	var colors = {
		seconds: "#BFFF71",
		minutes: "#7A82E7",
		hours: "#CD0077"
	};

	var c, space, last_cx;

	// The seconds line (60 points)
	space = length / 60.0;
	var seconds = [];
	for (var i = 0; i < 60; i++) {
		c = paper.circle(start + (i * space), y_starts.seconds, radii.seconds);
		c.attr({"fill": fill, "opacity": opac, "stroke": "none"});
		seconds.push(c);
	}

	// The minutes line (60 points)
	var minutes = [];
	for (var i = 0; i < 60; i++) {
		last_cx = start + (i * space);
		c = paper.circle(last_cx, y_starts.minutes, radii.minutes);
		c.attr({"fill": fill, "opacity": opac, "stroke": "none"});
		minutes.push(c);
	}

	// The hours line (24 points)
	space = (last_cx - start) / 23.0;
	var hours = [];
	for (var i = 0; i < 24; i++) {
		c = paper.circle(start + (i * space), y_starts.hours, radii.hours);
		c.attr({"fill": fill, "opacity": opac, "stroke": "none"});
		hours.push(c);
	}

	// The text to display the total time spent on facebook
	var hours_spent = paper.text(width / 2 - 140, y_starts.hours + 150, "00:");
	var minutes_spent = paper.text(width / 2, y_starts.hours + 150, "00:");
	var seconds_spent = paper.text(width / 2 + 130, y_starts.hours + 150, "00");

	// The text to display the percentage of time wasted 
	var wasted_str = function (p) { return p + "% time wasted"; };
	var wasted = paper.text(width / 2 - 10, y_starts.hours + 260, wasted_str(0));

	// Styles for all the text elements 
	hours_spent.attr({"fill": colors.hours, "font-size": font_size});
	minutes_spent.attr({"fill": colors.minutes, "font-size": font_size});
	seconds_spent.attr({"fill": colors.seconds, "font-size": font_size});
	wasted.attr({"fill": "#fff", "font-size": font_size2, "opacity": opac2});


	/* Animation functions */

	// Animates a line given the time interval and final time point
	function animate_line (a, fx, fy, color, stroke_width) {
		var x = a[0].attrs.cx - 10,
			y = a[0].attrs.cy;

		var l = paper.path("M" + x + "," + y + "L" + x + "," + y);
		l.attr({"stroke": color, "stroke-width": stroke_width, "stroke-linecap": "butt"});
		l.animate({"path": [l.attrs.path[0], ["L", fx, fy]]}, 500, "<");	 // ease in 
	}

	// Steps through a set of numbers
	function animate_time (n, text, colon) {
		var i = parseInt(text[0].textContent.split(":")[0]) - 1;
		var inc = 500 / n;

		var step = function () {
			if (i == n) return;

			var ni = i + 1;
			if (ni <= 9) si = "0" + ni;
			else si = ni;
			
			text[0].textContent = si;
			if (colon) text[0].textContent += ":";

			i ++;
			setTimeout(step, inc);
		};

		setTimeout(step, 1);
	}

	// Animates everything given a time spent
	function animate (h, m, s) {
		// Animate seconds line  
		if (s > 0) animate_line(seconds, seconds[s - 1].attrs.cx, seconds[s - 1].attrs.cy, colors.seconds, 10);

		// Animate the minutes line 
		if (m > 0) animate_line(minutes, minutes[m - 1].attrs.cx, minutes[m - 1].attrs.cy, colors.minutes, 20);

		// Animate the hours line 
		if (h > 0) animate_line(hours, hours[h - 1].attrs.cx, hours[h - 1].attrs.cy, colors.hours, 30);

		// Display the total time (flip through s/m/h)
		animate_time(s, seconds_spent, false);
		animate_time(m, minutes_spent, true);
		animate_time(h, hours_spent, true);

		// Figure out percentage of time that was wasted
		var time_in_s = (h * 24 * 60) + (m * 60) + s;
		var p = Math.round((time_in_s / running) * 100);

		// Update the percentage time wasted 
		wasted[0].textContent = wasted_str(p);
	};


	/* Event handlers */

	// Get the time spent
	$("#button").click(function () {
		var ts = $("#time-spent").val().split(":");
		var h = parseInt(ts[0]),
			m = parseInt(ts[1]),
			s = parseInt(ts[2]);

		animate(h, m, s);
	});

	// Elements associated with refresh button
	var l1, l2, t1, t2;

	// Refresh button functionality 
	$("#refresh").click(function () {
		var reset = confirm("Are you sure you want to reset everything?");
		if (reset) animate(0, 0, 0);

	}).mouseenter(function () {
		// button is 42 x 38

		// Display total time running 
		var startx = 55, starty = 0, dx = 250, width1 = 45, width2 = 31;
		l1 = paper.path("M" + startx + "," + starty + "L" + startx + "," + starty);
		l1.attr({"stroke": "#eee", "stroke-width": width1, "stroke-linecap": "butt"});
		l1.animate({"path": [l1.attrs.path[0], ["L", dx, starty]]}, dx * 0.8, "<", function () {
			// Display text 
			t1 = paper.text(startx + 97, starty + 11, "Runtime: " + format_running());
			t1.attr({fill: "#333", "font-size": 15});
		});

		var offset = 30;
		l2 = paper.path("M" + startx + "," + (starty + offset) + "L" + startx + "," + (starty + offset));
		l2.attr({"stroke": "#FA0202", "stroke-width": 16, "stroke-linecap": "butt"});
			// or 80637C or 00C29E or 7FD7EF
		l2.animate({"path": [l2.attrs.path[0], ["L", dx, (starty + offset)]]}, dx * 0.8, "<", function () {
			// Display text 
			t2 = paper.text(startx + 95, starty + offset, "Clicking the refresh button will reset the timer.");
			t2.attr({fill: "#fff", "font-size": 8});
		});

	}).mouseleave(function () {
		// Hide total time running 
		l1.remove();
		l2.remove();
		t1.remove();
		t2.remove();
	});


	/* Interacting with background script */

	// Query local storage for total time app has been running
	chrome.storage.local.get('fb-app-start', function (d) {
		running = Math.ceil((Date.now() - d['fb-app-start']) / 1000);
	});

	// Query local storage for total time spent on fb 
	chrome.storage.local.get('fb-track-time', function (d) {
		var seconds = parseInt(d['fb-track-time'] / 1000);
		var h = parseInt(seconds / 3600) % 24;
		var m = parseInt(seconds / 60) % 60;
		var s = seconds % 60;

		animate(h, m, s);
	});


	// Test case: have spent 8 hours, 45 minutes, 55 seconds on facebook 
	// var test = {h: 8, m: 45, s: 55};
	// animate(test.h, test.m, test.s);


	/*
		======THEMES======
		2) #D5F903, #FA0202, #00C29E : http://www.colourlovers.com/palette/3434284/Warning_light.
		3) #BFFF71, #7FD7EF, #7A82E7, #BA00B1, #CD0077: http://www.colourlovers.com/palette/1430577/melting_popsicles
		4) CEF7CD, A3E4DB, C3E5DD, E0E3FB, F0DCE1: http://www.colourlovers.com/palette/2909600/p_o_p_s_i_c_l_e
		==================

		TO DO 
		- shouldn't be resetting! 
		- reset functionality
		- make sure runtime information is aligned for all screen sizes 
	*/

});		