# odin-wheres-wally

This project was completed as part of The Odin Project's 'NodeJS' course.

The concept of the application is a 'Where's Wally' (or 'Where's Waldo' in
Canada and the USA) game, where users can try to find all the characters in
the scene in the quickest time possible. When the game is complete, the user
can submit their name and time to the high-scores list, and if their time is
fast enough, they will appear on the High Scores page for that game. There are
three scenes to choose from.

Some things that could be improved:

- The game scenes and character portraits are currently stored locally, but
could be stored in a database.
- The game is not designed for devices with small screen sizes. Some of the game
scenes are so large that I had to crop them down to a respectable size, and
scaling them down reduced the quality of the image so much the characters were
no longer visible. One way I can think of to rectify this is to just have the
full-sized images and just encourage the user to zoom in. I could then have the
rest of the UI independent from the main scene image and instead have it tied to
the viewport position, so regardless of where the user currently is zoomed into
the scene image, when they complete the game or need to check which characters
are remaining, that UI would always be correctly positioned.
- Improved unit test coverage.