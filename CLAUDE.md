# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Note Trainer is a web application for learning and practicing music notes on the G clef (treble clef). It helps users improve note reading, sight-reading, and aural recognition skills through visual cues and audio feedback.

## Architecture

The project follows a simple vanilla HTML/CSS/JavaScript architecture:

- **index.html**: Main entry point containing the UI layout and inline JavaScript for the note trainer functionality
- **public/assets/css/styles.css**: Contains global styles for the application
- **public/assets/js/abcjs-basic-min.js**: Third-party library for rendering music notation
- **public/assets/js/code.js**: Contains additional JavaScript for the spaced repetition challenge mode (not currently active in index.html)
- **public/sw.js**: Service worker for Progressive Web App (PWA) functionality

## Key Components

1. **Note Rendering**: Uses the abcjs library to render musical notation in ABC notation format
2. **Audio Playback**: Implements Web Audio API for playing note sounds with proper frequencies
3. **UI Components**:
   - Note grid displaying musical notes
   - Sorting and shuffling functionality
   - Audio toggle for sound feedback
   - Selected note display area
4. **PWA Support**: Includes service worker for offline capabilities

## Development Workflow

### Running the Project

The project is a static HTML/CSS/JavaScript application. You can serve it locally using any static file server. For example:

```bash
# Using Python's built-in HTTP server
python -m http.server

# Using Node.js with http-server (requires installation)
npx http-server
```

### Code Structure

- The main application logic is contained directly in the `<script>` tag in index.html
- Musical notes are defined in an array with their ABC notation, name, value, and frequency
- The application renders notes in a grid and plays the corresponding sound when a note is clicked

### Deployment

The project is deployed on Netlify. The live demo is available at: https://note-trainer.netlify.app

## License

The project is licensed under the GNU General Public License v3.0.