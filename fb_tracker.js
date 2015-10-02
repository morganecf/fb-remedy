/* The animation functionality */

$(document).ready(function () {

	// The total time the app has been running, in seconds
	var running = 432000;	// Test case: 5 days

	// Get the page height and width 
	var height = $(document).height();
	var width = $(document).width();

	// Make the canvas the size of the page 
	var paper = Raphael(0, 40, width, height);

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
		var i = parseInt(text[0].textContent.split(":")[0]);

		var step = function () {
			if (i == n) return;

			var ni = i + 1;
			if (ni <= 9) si = "0" + ni;
			else si = ni;
			
			text[0].textContent = si;
			if (colon) text[0].textContent += ":";

			i ++;
			setTimeout(step, 50);
		};

		setTimeout(step, 1);
	}

	// Get the time spent
	$("#button").click(function () {
		var ts = $("#time-spent").val().split(":");
		var h = parseInt(ts[0]),
			m = parseInt(ts[1]),
			s = parseInt(ts[2]);

		// Animate seconds line  
		animate_line(seconds, seconds[s - 1].attrs.cx, seconds[s - 1].attrs.cy, colors.seconds, 10);

		// Animate the minutes line 
		animate_line(minutes, minutes[m - 1].attrs.cx, minutes[m - 1].attrs.cy, colors.minutes, 20);

		// Animate the hours line 
		animate_line(hours, hours[h - 1].attrs.cx, hours[h - 1].attrs.cy, colors.hours, 30);

		// Display the total time (flip through s/m/h)
		animate_time(s, seconds_spent, false);
		animate_time(m, minutes_spent, true);
		animate_time(h, hours_spent, true);

		// Figure out percentage of time that was wasted
		var time_in_s = (h * 24 * 60) + (m * 60) + s;
		var p = Math.round((time_in_s / running) * 100);

		// Update the percentage time wasted 
		wasted[0].textContent = wasted_str(p);

	});


	/*
		======THEMES======
		2) #D5F903, #FA0202, #00C29E : http://www.colourlovers.com/palette/3434284/Warning_light.
		3) #BFFF71, #7FD7EF, #7A82E7, #BA00B1, #CD0077: http://www.colourlovers.com/palette/1430577/melting_popsicles
		4) CEF7CD, A3E4DB, C3E5DD, E0E3FB, F0DCE1: http://www.colourlovers.com/palette/2909600/p_o_p_s_i_c_l_e
		==================

		TO DO 
		- add total time
		- add percentage time wasted
		- add refresh 

		- fix animation (both should be aligned)

		- communication between front and background 
	*/

});		