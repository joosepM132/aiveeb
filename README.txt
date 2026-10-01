FALLEN ATLAS
============
An interactive atlas built with HTML, CSS, and JavaScript.

OPEN
Double-click index.html or serve this folder with any static web server.
No build step, account, API key, or network connection is required.
Data, country outlines, font, photograph, and D3 are bundled locally.

EXPLORE
Switch between aviation incidents, shipwrecks, and seismic events.
Click map points for records and source links. Filter by region, severity,
depth, magnitude, and date. Drag timeline handles or play through the years.
Search all collections with the search button or the / key.
Drag to pan; use the wheel or + and - controls to zoom.
Notable stories opens selected incidents and famous wrecks.

COVERAGE
4,967 historical aviation records, 1908-2019.
6,220 NOAA AWOIS coastal wreck records, plus five featured wrecks.
1,607 USGS earthquakes, magnitude 7.0+, 1900-2025.
This historical snapshot is not a complete worldwide register or live feed.
Unmapped aviation records are searchable. Most aircraft positions are automated
geocodes and may be approximate or incorrect; selected positions are checked.
NOAA survey depths indicate clearance above wrecks. Featured shipwrecks use
approximate seafloor depths. The website identifies the difference.
Data sources & coverage includes further caveats and all source links.
Source data retrieved on 1 October 2026.

FILES
index.html            Layout and accessible controls.
styles.css            Responsive design.
app.js                Map rendering, filters, popups, search, and timeline.
data/                 Locally bundled records and geographic outlines.
assets/               D3, DM Sans, photograph, licenses, and favicon.
download-data.ps1     Optional data refresh script; read before executing.
tests/smoke.html      Functional browser checks.
tests/mobile.html     Exact 390px viewport checks.
tests/*-results.html  Saved verification reports.

VERIFICATION
Tested in Google Chrome at 1440px and an exact 390px iframe viewport.
21 functional checks pass, including filters, search, popups, and playback.
File-based iframe tests require --allow-file-access-from-files in Chrome.
Alternatively, serve the folder and open the test pages over localhost.

CREDITS
Natural Earth country boundaries: public domain.
D3 7.9.0: BSD license, assets/LICENSE-d3.txt.
DM Sans: SIL Open Font License, assets/LICENSE-font.txt.
Aircraft photograph: Unsplash, Ross Parmly.
Public dataset links are available inside the website.
