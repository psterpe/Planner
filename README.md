# Semester Planner

This app lets an instructor plan a semester (or term or trimester) by dragging and dropping
assignment and topic ideas around a calendar grid. It contains a simple backend server (Flask-based)
that stores your plans in Google Cloud NDB.

I wrote this in 2016 when I was a new college teacher. It's simplistic, but it helped me plan, and
it also let me experiment with Angular and jQuery UI. Nowadays, you'd write this with different
technologies. Even back than you'd have written it differently, i.e., you'd have written better code
than I did!

I'm putting this in a public repo because ... I can. :-)

This README.md is still in progress...

## How to Use It

![Specifying the grid](link to image)

The first thing you want is a calendar grid representing the dates of your course. Along the left,
fill in:

* **Owner.** Enter your name or initials
* **First Monday.** Use the date picker to select the date of the first Monday of your course
* **Weeks.** Enter the number of weeks your grid should contain

Then click `Update Grid`.

You will see a calendar-like grid that looks like this:

![Empty grid](link to image)

## How to Get It Running

...
