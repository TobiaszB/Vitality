# TSR
HTML5 / CSS3 / Javascript (ES6)

## Getting Started
* [Install node.js](http://nodejs.org/download/)
* Install Brunch globally `npm install -g brunch`
* Install npm packages inside this repository `npm install`
* Host the client at http://localhost:443 `npm start`

## Data Schema

| Session |  |. |
| ------------- | ------------- |  ------------- |
| key | String |
| launched | Boolean |
| token | String | auto-sign into a session
| tasks | Array | Allowed tasks for this session
| sort_attribute | String |
| sort_direction | Number |