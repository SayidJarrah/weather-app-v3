# Simple Weather Dashboard

A lightweight single-page dashboard that displays the current temperature for four cities — Kyiv, Singapore, London, and Sydney — using live data from the Open-Meteo API.

## Getting Started

This project is built with vanilla HTML, CSS, and JavaScript. No build step is required.

### Prerequisites

* [Node.js 18+](https://nodejs.org/) for running the automated tests.

### Local Development

Open `index.html` in your browser or serve the project locally:

```bash
python -m http.server 8000
```

Then visit [http://localhost:8000](http://localhost:8000).

## Testing

Run the automated test suite (with coverage) using Node's test runner:

```bash
npm test
```

## Deployment

The project includes a GitHub Actions workflow (`.github/workflows/ci.yaml`) that runs tests and deploys the site to GitHub Pages when changes are pushed to the `main` branch.
