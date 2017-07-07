# Microblog

This is an incomplete implementation of a Twitter-like single-user microblog timeline. 

Please implement the spec (design and product) using these instructions. 

## Resources

* [Zeplin spec](https://zpl.io/Tycej) - use this as the design reference; request an invite first
* [Roboto font](https://fonts.google.com/specimen/Roboto)
* [Material Icons](http://google.github.io/material-design-icons/)
* [Better logo](better-icon.svg)

## Technical requirements

* The stub data (i.e. the posts and users) in `index.html` should not be modified. Everything else can be changed as necessary.
* There is no need for persistence (database or otherwise) - feel free to only use the client-side data.
* Feel free to use any libraries you like (or no libraries at all).
* Please provide pre-built ("dist") artifacts with your pull request - it should be possible for a non-engineer to simply open `index.html` and review your work.
* Avoid requiring running a server if possible. It's not necessary to mock out an API.
* Please keep the original Git commit as is.
* Browser support can be limited to "evergreen" browsers (Chrome, Firefox, Edge)

## Spec

* Create a single-user timeline of posts.
* The timeline must support new posts by the current user.
* New posts must appear before older posts, except in reply threads.
* Posts should not be empty and should gracefully support overly-long non-wrapping message text.
* Every post must have the following elements:
  * User identifiers: name, real name, photo, and verified status
  * Text of the post
  * A relative timestamp of the time the post was published; this should be updated in real time
  * Zero or more photo attachments that are automatically generated if an image link is detected in the post text
    * There is no need to design any upload or cropping functionality - if an image link exists in text, it should be converted to an attachment and the image should be loaded and "cropped" via CSS as best as possible
* New post length must be limited and must not be zero; the character counter must be functional (check Zeplin spec for more details).
* Posts must support the following interactions:
  * Reply: this creates a new post in reply to the original post; replies are visually distinct in the timeline
  * Repost: this reposts the original post once in the reposting user's timeline
  * Like: this would save the original post in the reposting user's liked posts lists; in this project, it's only used to count 
  likes
* Post interactions should only increment/decrement their counters once.
* Post interactions should appear via hover on desktop and via tap on mobile; they do not need different hover colors.
* Posts should revert to their pre-interaction state once an interaction has been completed.
* The interface should be responsive; it should scale with the viewport size.
* The message entry text box should be visible at all times.
* Replies should be nested under the posts they are replying to.
* Post metadata (real name, username, timestamp) should not wrap at mobile sizes.

## How to submit your work

* Fork this repo
* Push your changes
* Open a pull request

Please contact us if you have any questions.
