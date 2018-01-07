# Artiscii

Artistic text creation made fun.

[Try it!](http://wellosoft.net/artiscii)

## Background

This is the next version of my [Ascii-Painter](https://github.com/willnode-Ascii-Painter) and it has been ported to Javascript.

Why? Because the web is cool! you don't have to install the software 😉.

## Usage

Launch the website and see yourself! Use copy + paste to move the art in and out the canvas. Your artwork will always be saved in local storage.

Hidden controls:

+ ctrl + z to `undo` (redo not available)
+ ctrl + drag at mode `selection` to drag/move the selection.
+ the resize option has an option to resize the font size in `px`

## Run Locally

[Download](https://github.com/willnode/artiscii/releases) this repo and open `index.html` directly. Note that your creation won't be saved unless you run a localhost server (see below).

To run http server (using Node.JS):

```
npm i http-server -g
http-server .
```