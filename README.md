# Vitality One
HTML5 / CSS3 / Javascript (ES6)

## Getting Started
* [Install node.js](http://nodejs.org/download/)
* Install Brunch globally `npm install -g brunch`
* Install npm packages inside this repository `npm install`
* Host the client at http://localhost:443 `npm start`

## Data Schema

| Session |  |. |
| ------------- | ------------- |  ------------- |
| user | Key | 
| token | String | auto-sign into a session

| Course |  |. |
| ------------- | ------------- |  ------------- |
| name | String | 
| admin | Key | 
| thumbnail | URL | 
| blocks | Array | `[{ key: <key>, options: <object> }]`
| language | String |
| created_at | Date |
| published_at | Date |

| Ticket |  |. |
| ------------- | ------------- |  ------------- |
| course | Key |
| user | Key |
| blocks | Array | `[{ options: <object>, html: <string>, input: <object> }]`
| created_at | Date |
| started_at | Date |


| User |  |. |
| ------------- | ------------- |  ------------- |
| name | String |
| avatar | URL |
| role | String |


| Block |  |. |
| ------------- | ------------- |  ------------- |
| html | HTML |
| created_at | Date |
| options | Object | `{ <label>: <option type> }`
