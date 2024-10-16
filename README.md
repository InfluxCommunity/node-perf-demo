# Node.js Sample App for Performance Monitoring purpose

Sample Node.js app to demonstrate application performance monitoring and storage using PM2 &amp; InfluxDB

## Key Technologies
- Node.js & Express.js - Backend server
- PM2 - Process manager and monitoring
- InfluxDB v3 - Time series database for metrics
- HTML, CSS, JavaScript - Frontend visualization

### Project Structure

```
node-perf-demo/
├── .env
├── .gitignore
├── package.json
├── ecosystem.config.js
├── server.js
│   influxdb.js
│   └── public/
│       ├── index.html
│       ├── styles.css
│       └── app.js
└── README.md
```

## Prerequisites
- Node.js (v14+)
- [InfluxDB Cloud account](https://www.influxdata.com/get-influxdb/) (free/no credit card needed)

## Setup & Run

- Download/Clone this project from GitHub
- Run the following commands to install the dependencies (express, pm2, influxDB v3 client library, dotenv)
- Open ```.env``` file and update and save the enviorment variables for InfluxDB that can be found in the [InfluxData Cloud portal.](https://cloud2.influxdata.com/signup)
- ``` cd node-perf-demo```
- ``` pm2 start ecosystem.config.js ```
- Open ```localhost:3000``` in your browser
