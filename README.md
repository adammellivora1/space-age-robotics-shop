# Space Age Robotics Importer

Local Alibaba product importer for the Space Age Robotics shop.

## Requirements
- Windows 10/11
- Node.js LTS: https://nodejs.org/en/download

## Quick start
1. Download this repository using Code > Download ZIP, or clone it with Git.
2. Run START-IMPORTER.bat.
3. Open http://localhost:8787/ in your browser.
4. Paste an Alibaba product URL and import the product.

## Manual start
Open PowerShell in the project directory and run:
npm.cmd install
node server/index.js

## GitHub publishing
To publish products to your own GitHub repository, configure the required
environment variables in a local .env file. Never commit your .env file or
publish your GitHub token.

## Notes
- The importer runs locally on your computer.
- Keep the terminal open while using the importer.
- Alibaba pages may change and imports can fail if the supplier page blocks access.
