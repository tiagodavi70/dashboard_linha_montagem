import express from 'express';
const app = express();
import * as d3 from "d3";
import * as fs from 'fs';

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let urls = ["https://ews-emea.api.bosch.com/it/application/api/augmanity-pps4-dummy/d/v1/api/bottlenecks/actual?line=10",
"https://ews-emea.api.bosch.com/it/application/api/augmanity-pps4-dummy/d/v1/api/Files/hierarchy"];

// "https://ews-emea.api.bosch.com/it/application/api/augmanity-pps4-dummy/d/v1/api/kpi/cycle-times?line=10&station=220"
// "https://ews-emea.api.bosch.com/it/application/api/augmanity-pps4-dummy/d/v1/api/kpi/current-shift?line=10&station=260"
// "https://ews-emea.api.bosch.com/it/application/api/augmanity-pps4-dummy/d/v1/api/kpi/current-shift?line=10&station=260&startDate=2022-12-02&endDate=2022-12-03"
// "https://ews-emea.api.bosch.com/it/application/api/augmanity-pps4-dummy/d/v1/api/kpi?line=10&station=260&startDate=2022-12-02&endDate=2022-12-03"
// "https://ews-emea.api.bosch.com/it/application/api/augmanity-pps4-dummy/d/v1/api/kpi?line=10&station=260"

let names = ["Bottleneck", "CycleTimes", "KPI"];
let stations = [ "10", "20", "30", "60", "70", "71", "72", "80", "90", "100", "110", "120"];

// let stations = ["15", "140", "160", "170", "200", "210", "215", "220", "225", "240", "250", "260", "270", "273", "290", "320", "320.2", "330"];

let kpi_block = ["validTo","validFrom", "locationId", "shiftIdentifier"];
let bottleneck_block = ["timeStamp", "line"];
let cycletimes_block = ["serialNumber","reference", "timeStamp", "line", "id"];

const username = '8b9f2e5b-8524-4de5-8472-7e7de6b37864';
const password = '4817a476-987f-4925-bcf0-6ec0e0334a29';
let u = btoa(`${username}:${password}`);

let url1 = "https://ews-emea.api.bosch.com/it/application/api/augmanity-pps4-dummy/d/v1/api/kpi/cycle-times?line=10&station=220";

// d3.json(url1, {
//     headers: {"Authorization": `Basic ${u}`}
// }).then(data => {
//     console.log(JSON.stringify(data));
// });

let url = names[0]; // bottleneck
let bottleneck_dataset = [];

function datagen() {
    // let c260 = JSON.parse(fs.readFileSync(`./DadosSimulados/CycleTimes260.json`)).map((d,i) => { d.station=260; d.index=i + 1;  return d})
    // let c270 = JSON.parse(fs.readFileSync(`./DadosSimulados/CycleTimes270.json`)).map((d,i) => { d.station=270; d.index=i + 1;  return d})
    // let c290 = JSON.parse(fs.readFileSync(`./DadosSimulados/CycleTimes290.json`)).map((d,i) => { d.station=290; d.index=i + 1;  return d})
    // let cycledata = c260.concat(c270).concat(c290);
    let cycledata = [];
    for (let i=0; i < stations.length; i++) {
        let c = JSON.parse(fs.readFileSync(`./DadosSimulados/CycleTimes${stations[i]}.json`)).map((d,j) => { d.station=stations[i]; d.index=j + 1;  return d});
        cycledata = cycledata.concat(c);
    }
    // fs.writeFileSync(`./simulation/CycleTimes.csv`, d3.csvFormat(cycledata));
    fs.writeFileSync(`./simulation/CycleTimes.json`, JSON.stringify(cycledata));

    // let k260 = JSON.parse(fs.readFileSync(`./DadosSimulados/KPITimeSeries260.json`)).map((d,i) => { d.station=260; d.index=i + 1;  return d})
    // let k270 = JSON.parse(fs.readFileSync(`./DadosSimulados/KPITimeSeries270.json`)).map((d,i) => { d.station=270; d.index=i + 1;  return d})
    // let k290 = JSON.parse(fs.readFileSync(`./DadosSimulados/KPITimeSeries290.json`)).map((d,i) => { d.station=290; d.index=i + 1;  return d})
    // let kpidata = k260.concat(k270).concat(k290);
    let kpidata = [];
    for (let i = 0; i < stations.length; i++) {
        let c = JSON.parse(fs.readFileSync(`./DadosSimulados/KPITimeSeries${stations[i]}.json`)).map((d,j) => { d.station=stations[i]; d.index=j + 1;  return d});
        kpidata = kpidata.concat(c);
    }
    // fs.writeFileSync(`./simulation/KPI.csv`, d3.csvFormat(kpidata));
    fs.writeFileSync(`./simulation/KPI.json`, JSON.stringify(kpidata));
}
datagen();

// fs.readFile(`./datasetsrafael/${url}.json`, (err, data) => {
//     if (err) throw err;
//     let parsed = JSON.parse(data);
//     for (let index = 0 ; index < stations.length ; index++) {
//         let station = stations[index];
//         for (let i = 0 ; i < 1 ; i++) {
//             let obj = JSON.parse(JSON.stringify(parsed));
//             for (let key of Object.keys(obj)) {
//                 if ( !bottleneck_block.includes(key))
//                     obj[key] = d3.randomUniform(0,1)();
//             }
//             // delete obj.station;
//             obj.station = station;
//             bottleneck_dataset.push(obj);
//         }
//     }
//     fs.writeFile(`simulation/${url}.json`, JSON.stringify(bottleneck_dataset[bottleneck_dataset.length-1]), (err) => {
//         if (err) throw err;
//         console.log(`Data written to ${url} file.`);
//         kpi()
//     });
// });

function kpi() {
    url = names[2];
    let kpi_dataset = [];
    fs.readFile(`./datasetsrafael/${url}.json`, (err, data) => {
        if (err) throw err;
        let parsed = JSON.parse(data);
        for (let index = 0 ; index < stations.length ; index++) {
            let station = stations[index];
            for (let i = 0 ; i < 100 ; i++) {
                let obj = JSON.parse(JSON.stringify(parsed));
                for (let key of Object.keys(obj)) {
                    if ( !kpi_block.includes(key))
                        obj[key] = d3.randomUniform(0,1)();
                }
                obj.station = station;
                obj.index = i;
                kpi_dataset.push(obj);
            }
        }
        fs.writeFile(`simulation/${url}.json`, JSON.stringify(kpi_dataset), (err) => {
            if (err) throw err;
            console.log(`Data written to ${url} file.`);
            cycletimes()
        });
    });
}

function cycletimes() {
    url = names[1];
    let cycle_dataset = [];
    fs.readFile(`./datasetsrafael/${url}.json`, (err, data) => {
        if (err) throw err;
        let parsed = JSON.parse(data);
        for (let index = 0 ; index < stations.length ; index++) {
            let station = stations[index];
            for (let i = 0 ; i < 100 ; i++) {
                let obj = JSON.parse(JSON.stringify(parsed));
                for (let key of Object.keys(obj)) {
                    if ( !cycletimes_block.includes(key))
                        obj[key] = d3.randomUniform(0,1)();
                }
                obj.station = station;
                obj.index = i;
                cycle_dataset.push(obj);
            }
        }
        fs.writeFile(`simulation/${url}.json`, JSON.stringify(cycle_dataset), (err) => {
            if (err) throw err;
            console.log(`Data written to ${url} file.`);
        });
    });
}