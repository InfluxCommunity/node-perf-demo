import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';
import { InfluxDBClient, Point } from '@influxdata/influxdb3-client';
import pm2 from 'pm2';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const app = express();
const port = 3000;

const host = process.env.INFLUXDB_URL;
const token = process.env.INFLUXDB_TOKEN;
const database = process.env.INFLUXDB_DATABASE;
const org = process.env.INFLUXDB_ORG;
const measurement = "node_metrics";

const client = new InfluxDBClient({ host, token, org });

app.use(express.static(path.join(__dirname, 'public')));

let requestCount = 0;

function getPM2Metrics() {
  return new Promise((resolve, reject) => {
    pm2.describe('node-perf-demo', (err, processDescription) => {
      if (err) {
        reject(err);
        return;
      }

      const metrics = processDescription[0].monit;
      resolve({
        cpu: metrics.cpu,
        memory: metrics.memory,
        uptime: processDescription[0].pm2_env.pm_uptime,
        restarts: processDescription[0].pm2_env.restart_time,
        activeRequests: processDescription[0].pm2_env.axm_monitor['Active requests']?.value || 0
      });
    });
  });
}

async function writeMetrics(metrics) {
  try {
    const point = Point.measurement(measurement)
      .setFloatField('cpu', metrics.cpu)
      .setFloatField('memory', metrics.memory)
      .setIntegerField('restarts', metrics.restarts)
      .setIntegerField('uptime', metrics.uptime)
      .setIntegerField('requestsPerFiveSeconds', metrics.requestsPerFiveSeconds)
      .setIntegerField('activeRequests', metrics.activeRequests)
      .setTimestamp(new Date());

    await client.write(point, database);
    console.log('Metrics written:', metrics);
  } catch (error) {
    console.error('Error writing metrics:', error);
  }
}

async function queryMetrics() {
  const query = `
    SELECT *
    FROM "${measurement}"
    WHERE time >= now() - interval '5 seconds'
    ORDER BY time DESC
    LIMIT 1
  `;

  try {
    console.log('Executing query:', query);
    const results = [];
    const queryResult = client.query(query, database, { type: 'sql' });
    for await (const row of queryResult) {
      results.push({
        cpu: row.cpu,
        memory: row.memory,
        restarts: row.restarts.toString(),
        uptime: row.uptime.toString(),
        requestsPerFiveSeconds: row.requestsPerFiveSeconds.toString(),
        activeRequests: row.activeRequests.toString(),
        time: row.time.toString()
      });
    }
    console.log('Query results:', results);
    return results;
  } catch (error) {
    console.error('Error querying metrics:', error);
    throw error;
  }
}

app.get('/api/metrics', async (req, res) => {
  try {
    const metrics = await queryMetrics();
    res.json(metrics);
  } catch (error) {
    console.error('Error in /api/metrics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Increment request count for each request
app.use((req, res, next) => {
  requestCount++;
  next();
});

// Collect and write metrics every 5 seconds
setInterval(async () => {
  try {
    const pm2Metrics = await getPM2Metrics();
    const metrics = {
      ...pm2Metrics,
      requestsPerFiveSeconds: requestCount
    };
    await writeMetrics(metrics);
    requestCount = 0; // Reset request count after writing
  } catch (error) {
    console.error('Error collecting metrics:', error);
  }
}, 5000);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

process.on('SIGINT', async () => {
  console.log('Shutting down gracefully');
  await client.close();
  process.exit(0);
});