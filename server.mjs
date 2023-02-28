import express from 'express';
const app = express();

import * as d3 from "d3";
import vega from 'vega';
import vl from 'vega-lite';

import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import fs from 'fs';

const port = 5500

const username = '8b9f2e5b-8524-4de5-8472-7e7de6b37864';
const password = '4817a476-987f-4925-bcf0-6ec0e0334a29';
let u = btoa(`${username}:${password}`);

app.use('/', express.static(__dirname, {index: "index.html"}));

// app.get("/api", (req, res) => {
//     let url = "https://ews-emea.api.bosch.com/it/application/api/augmanity-pps4-dummy/d/v1/api/kpi/current-shift?line=10&station=260";
//     d3.json(url, {
//         headers: {"Authorization": `Basic ${u}`}
//     }).then(data => {
//         res.send(data);
//     });
// });

// "https://ews-emea.api.bosch.com/it/application/api/augmanity-pps4-dummy/d/v1/api/kpi/cycle-times?line=10&station=260"
// "https://ews-emea.api.bosch.com/it/application/api/augmanity-pps4-dummy/d/v1/api/kpi/current-shift?line=10&station=260"
// "https://ews-emea.api.bosch.com/it/application/api/augmanity-pps4-dummy/d/v1/api/kpi?line=10&station=260&startDate=2022-12-02&endDate=2022-12-03"

let cycletimes = JSON.parse(fs.readFileSync(`./simulation/CycleTimes.json`));
let kpi = JSON.parse(fs.readFileSync(`./simulation/KPI.json`));
let bottleneck = JSON.parse(fs.readFileSync(`./DadosSimulados/Bottleneck.json`));

function filter(station, list, q) {
    let filtered = list.filter(d => d.station == station);
    let data = [];
    if (q["startDate"] != undefined || q["endDate"] != undefined) {
        data = filtered;
    } else {
        data = filtered[filtered.length-1];
    }
    return data;
}

// http://localhost:5500/it/application/api/augmanity-pps4-dummy/d/v1/api/kpi/cycle-times?line=10&station=260
app.get("/it/application/api/augmanity-pps4-dummy/d/v1/api/kpi/cycle-times", (req, res) => {
    let url_query = req.query;
    // let data = filter(url_query["station"], cycletimes, url_query)
    // res.send(JSON.stringify(data.length == undefined? [data] : data));
    res.send(cycletimes[url_query["station"]]);
});

// http://localhost:5500/it/application/api/augmanity-pps4-dummy/d/v1/api/kpi/current-shift?line=10&station=260
app.get("/it/application/api/augmanity-pps4-dummy/d/v1/api/kpi/current-shift", (req, res) => {
    let url_query = req.query;
    // delete url_query.startDate
    // delete url_query.endDate
    // let data = filter(url_query["station"], kpi, url_query)
    // res.send(JSON.stringify(data));
    res.send(JSON.stringify(JSON.parse(fs.readFileSync(`./simulation/KPICurrentShift${url_query["station"]}.json`))))
});

// http://localhost:5500/it/application/api/augmanity-pps4-dummy/d/v1/api/kpi?line=10&station=260&startDate=2022-12-02&endDate=2022-12-03
app.get("/it/application/api/augmanity-pps4-dummy/d/v1/api/kpi", (req, res) => {
    let url_query = req.query;
    if (url_query.startDate == undefined) res.send("error");

    let data = filter(url_query["station"], kpi, url_query)
    res.send(JSON.stringify(data));
});

// http://localhost:5500/it/application/api/augmanity-pps4-dummy/d/v1/api/bottlenecks/actual?line=10
app.get("/it/application/api/augmanity-pps4-dummy/d/v1/api/bottlenecks/actual", (req, res) => {
    let url_query = req.query;

    // let data = filter(url_query["station"], bottleneck, url_query)
    // if (stardate station)
    res.send(JSON.stringify(bottleneck));
});

// app.post("log", (req,res) =>{
// });

app.listen(port, () => {
  console.log(`App listening on port ${port}`)
})