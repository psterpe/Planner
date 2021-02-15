# Semester Planner

This app lets an instructor plan a semester (or term or trimester) by dragging and dropping
assignment and topic ideas around a calendar grid. It contains a simple backend server (Flask-based)
that stores your plans in Google Cloud NDB.

I'm putting this in a public repo mostly as a record of something I did from which someone might
draw inspiration. I wrote it in 2016 when I was a new college teacher. It's simplistic, but it
helped me plan, and it also let me experiment with Angular (the old stuff) and jQuery UI. Nowadays,
you'd write this with different technologies.

## How to Use It

### Create an empty calendar grid

![Specifying the grid](https://github.com/psterpe/Planner/blob/master/planner_1.png)

The first thing you want is a calendar grid representing the dates of your course. Along the left,
fill in:

* **First Monday.** Use the date picker to select the date of the first Monday of your course
* **Weeks.** Enter the number of weeks your grid should contain

Then click `Update Grid`.

You will see a calendar-like grid that looks like this:

![Empty grid](https://github.com/psterpe/Planner/blob/master/planner_2.png)

### Enter some topics, assignments, etc.

Along the left, you see color-coded areas in which you can enter Topics, Readings, Assignments,
Exams, Guests, and Holidays (in the sense of "religious or governmental day on which there are
no classes," not in the sense of "day on which I am not working"). To enter a Topic, for example,
fill in the text box above the `Add topic` button, then click that button.

Within an area, your entries can be dragged and dropped if you want to reorder them.

### Place items in the grid and move them

At any time, you can drag a Topic (or Reading, or Assignment, etc.) into the calendar grid and drop
it on the date in any square. You have to drop items on the dark rectangle containing the date,
not in the middle of a square. You can also drag items from one date to another. Once a square has
multiple items in it, you can reorder them by dragging and dropping.

If you have dragged an item into the grid and then are not sure about it, you can drag it
back to the left-side area from which it came. Drop it on the color-coded heading. (Due to a
bug, you can drop it on the wrong heading, e.g., a Topic could be dropped on the Readings
heading.)

You can delete an item by selecting it (with a click) and then clicking the `Delete selected` button
near the top of the left side.

To save a plan, fill in the **Plan name** field and click the `Save` button. To load a
previously saved plan, click the `Load` button and select your plan from the list.
