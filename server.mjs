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
import ChartGenerator from './genchart.mjs';


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

let rh = f => JSON.parse(fs.readFileSync(f));
let cycletimes = rh(`./simulation/CycleTimes.json`);
let kpi = rh(`./simulation/KPI.json`);
let bottleneck = rh(`./DadosSimulados/Bottleneck.json`);
let targets = rh(`./DadosSimulados/TargetsExtraSim.json`);

let stationNumbers = ["10", "20", "60", "70", "71", "72", "80", "90", "100", "110", "120"];

let kpi_station = {};
let cycle_station = {};
let c_helper = s => cycletimes.filter(d=>+d.station==s);
for (let i = 0; i < stationNumbers.length; i++) {
    kpi_station[stationNumbers[i]] = [rh(`./DadosSimulados/KPICurrentShift${stationNumbers[i]}.json`)].map(d=>{d.station = stationNumbers[i]; return d});
    cycle_station[stationNumbers[i]] = [c_helper(stationNumbers[i])[0]];
}

// let cycle_station = {"260": [c_helper(260)[0]], "270": [c_helper(270)[0]], "290": [c_helper(290)[0]]};
// let kpi_station = ["260", "270", "290"].map(d=> rh(`./DadosSimulados/KPICurrentShift${d}.json`))      
// kpi_station = { "260": [kpi_station[0]].map(d=>{d.station = 260; return d}),
//                 "270": [kpi_station[1]].map(d=>{d.station = 270; return d}),
//                 "290": [kpi_station[2]].map(d=>{d.station = 290; return d})};

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
    res.send(c_helper(url_query["station"]));
});

// http://localhost:5500/it/application/api/augmanity-pps4-dummy/d/v1/api/kpi/current-shift?line=10&station=260
app.get("/it/application/api/augmanity-pps4-dummy/d/v1/api/kpi/current-shift", (req, res) => {
    let url_query = req.query;
    // delete url_query.startDate
    // delete url_query.endDate
    // let data = filter(url_query["station"], kpi, url_query)
    // res.send(JSON.stringify(data));
    res.send(JSON.stringify(JSON.parse(fs.readFileSync(`./DadosSimulados/KPICurrentShift${url_query["station"]}.json`))))
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

function sendVis(req, res, base64string){
    // if (!req.headers['user-agent'].includes("Unity"))
	// 	if (!req.query.svg) {
    //         if (!req.query.base64) {
    //             res.send("<title> Generated Chart </title>" +
    //                 "<img src='data:image/png;base64," + base64string + "' alt='generated chart'/>");
    //         }
	// 	    else {
    //             res.send(base64string);
    //         }
    //     }
    // else {
    //     res.send(base64string);
    // }
    console.log("request done");
    res.send(base64string);
}

function sendVisImg(res, base64string){
    let img = Buffer.from(base64string, 'base64');
    res.writeHead(200, {
        'Content-Type': 'image/png',
        'Content-Length': img.length
    });
    res.end(img);
}

// http://localhost:5500/260/chartgen.png?chart=specKPI
// http://localhost:5500/260/chartgen.png?chart=specCycleTime
// http://localhost:5500/260/chartgen.png?chart=specSamples&attr=oee
// http://localhost:5500/290/chartgen.png?chart=specSamples&attr=oee&index=100
// http://localhost:5500/270/chartgen.png?chart=specSamples&attr=oee&index=90
// http://localhost:5500/270/chartgen.png?chart=specSamples&attr=oee&index=90&size=tall
// http://localhost:5500/270/chartgen.png?chart=specSamples&attr=oee&index=30,90&size=tall
let params_arr = [];
let count_vis = 0;
app.get('/:station/chartgen.png', function (req, res) {
    req.query.img = true;

    let params = req.query;
    params.station = req.params.station;
    params.id = ["specKPI", "specCycleTime", "specSamples"].indexOf(params.chart) + 1;
    console.log(params);
    params_arr.push(JSON.stringify(params));

    params.kpi = kpi_station;
    params.cycle = cycle_station;
    params.targets = targets;

    params.kpi_data = kpi;
    params.cycle_data = cycletimes;
    params.index = params.index.split(",");
    
    let chartgen = new ChartGenerator(params);
    // .replace("\\","")
    // fs.writeFile(`simulation_results/chart_params_id_${count_vis}.json`, `${JSON.stringify(params_arr)}`, function(err) {
    //     params_arr = [];
    //     count_vis++;
    //     if(err) {
    //         return console.log(err);
    //     }
    // });

    chartgen.generateChart().then(base64string => {
        if (params.img) {
            sendVisImg(res, base64string);
        } else {
            sendVis(req, res, base64string);
        }
    }).catch((err) => { console.error(err); });
});

app.use(express.urlencoded({ extended: true }));

let count = 10;
app.post("/log", function(req, res){
    count++;
    console.log(req.body);
    fs.writeFile(`simulation_results/log_id_${count}.json`, `[${Object.keys(req.body)[0]}]`, function(err) {
        if(err) {
            return console.log(err);
        }
    });
});

app.listen(port, () => {
    console.log(`App listening on port ${port}`)
})