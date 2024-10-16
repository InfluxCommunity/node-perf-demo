import { InfluxDBClient, Point } from '@influxdata/influxdb3-client'
import dotenv from 'dotenv';

dotenv.config();

const client = new InfluxDB({
  url: process.env.INFLUXDB_URL,
  token: process.env.INFLUXDB_TOKEN
});

const writeApi = client.getWriteApi(process.env.INFLUXDB_ORG, process.env.INFLUXDB_BUCKET);
const queryApi = client.getQueryApi(process.env.INFLUXDB_ORG);

// Write performance metrics to InfluxDB bucket
async function writeMetrics(metrics) {
  const point = new Point('node_metrics')
    .floatField('cpu', metrics.cpu)
    .floatField('memory', metrics.memory)
    .floatField('latency', metrics.latency);

  await writeApi.writePoint(point);
}

async function queryMetrics(range = '1h') {

  // SQL query to get metrics from the last 5 minutes
  const query = `
                SELECT *
                FROM "${process.env.INFLUXDB_BUCKET}"
                WHERE
                time >= now() - interval '5 minute'
                AND
                "unit" IN ('node_metrics')
              `;

  const results = [];
  for await (const { values, tableMeta } of queryApi.iterateRows(query)) {
    results.push(tableMeta.toObject(values));
  }
  return results;
}

export default { writeMetrics, queryMetrics };