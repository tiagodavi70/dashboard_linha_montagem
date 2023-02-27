
let station_selected = -1;
let mainColor = "rgb(18, 36, 110)";
let selectionColor = "rgb(111, 111, 111)";
let mode = 0; // 0 - map, 1 - overview, 2 - feature, 3 - sample
let lastAttr = 0;
let specs = [];

let cycleTimes = {"00": "totalCycleTime", "01": "processTime", "10": "exitTime", "11": "changeTime"};
let kpis = {"00": "oee", "01": "fpy", "10": "partCount", "11": "partCountSetPoint", "12": "productivity"};


d3.select("#close_icon").on("click", function(event, d) {
    // const e = station_list.nodes();
    // const i = e.indexOf(this);

    mode = 0;
    d3.select("#svgLoaded").style("display", "block");
    d3.select("#vis-container").style("display", "none");

    // switch(mode) {
    //     case 1:{
    //         mode = 0;
    //         // loadVis(0);
    //         break;
    //     }
    //     case 2:{
    //         loadVis(1);
    //         break;
    //     }
    //     case 3: {
    //         loadVis(2);
    //         break;
    //     }
    //     default: {}
    // }
});

d3.select("#features_icon").on("click", function(event, d) {
    if (mode == 0) {
        mode = 1;
        d3.select("#svgLoaded").style("display", "none");
        d3.select("#vis-container").style("display", "block");

        loadVis(mode);
    }
    d3.select("#interaction-menu").style("display", "block");
});

d3.select("#filter_icon").on("click", function(event, d) {
    let iMenu = d3.select("#interaction-menu");
    if (iMenu.style("display") == "none") {
        iMenu.style("display", "block");
    } else {
        iMenu.style("display", "none");    
    }
});


function loadSpecs() {
    Promise.all([d3.json("specs/specOverview.json"), d3.json("specs/specKPI.json"),
                 d3.json("specs/specCycleTime.json"),d3.json("specs/specSampleKPI.json"), d3.json("specs/specSampleTime.json")]
    ).then((values) => {
        for (let i = 0; i < values.length; i++) {
            let v = values[i];
            v.id = i + 1;
            specs.push(v);
        }    
    });
}

function sn(node) { return d3.select(node).attr("id").substring(1) }

function createList(stations) {
    let status_size = 15;
    let helper_f = (station, data) => {
        let filtered = data.filter(d => d.station == station);
        let redCount = 0;
        for (let k of Object.keys(filtered[0])) {
            if (!["shiftIdentifier", "locationId", "validFrom", "validTo", "station", "id", "line", "serialNumber", "reference", "timeStamp", "index"]
                    .includes(k)) {
                redCount = filtered.filter(d => d[k] < .001).length;
            }
        }
        return { "isRed": redCount > 0, "color": redCount > 0 ? "crimson": "seagreen", "size": redCount > 0 ? status_size/2: status_size/4};
    };
    let isBootleneck = (station) => {
        let isRed = helper_f(station, kpi_data).isRed || helper_f(station, times_data).isRed;
        return { "isRed": isRed, "color": isRed ? "crimson": "seagreen", "size": isRed ? status_size/2: status_size/4}
    }
    
    let station_list = d3.select("#station-list")
        .selectAll("div")
            .data(stations)
        .join("div")
            .style("background-color", mainColor)
            .style("color", "white")
            .classed("station-item", true)
            .attr("id", d => `item_${sn(d)}`)
            .style("cursor", "pointer")
            .html(d => /*html*/`
                <div> 
                    <div class="text-station-id">
                        ${sn(d)}
                    </div> 
                </div>
                <div>
                    <svg width="${status_size}" height="${status_size}">
                        <circle class="status_circle" id="status_cycle_time_${sn(d)}" 
                            cx="${status_size/2}" cy="${status_size/2}" r="${helper_f(sn(d), kpi_data).size}" style="fill: ${helper_f(sn(d), kpi_data).color}; stroke: black;"/>
                    </svg>
                </div>
                <div>
                    <svg width="${status_size}" height="${status_size}">
                        <circle class="status_circle" id="status_bottleneck_${sn(d)}" 
                            cx="${status_size/2}" cy="${status_size/2}" r="${isBootleneck(sn(d)).size}" style="fill: ${isBootleneck(sn(d)).color}; stroke: black;"/>
                    </svg>
                </div>
                <div>
                    <svg width="${status_size}" height="${status_size}">
                        <circle class="status_circle" id="status_kpi${sn(d)}" 
                            cx="${status_size/2}" cy="${status_size/2}" r="${helper_f(sn(d), times_data).size}" style="fill: ${helper_f(sn(d), times_data).color}; stroke: black;"/>
                    </svg>
                </div>
            `).on("click", function(event, d) {
                // const e = station_list.nodes();
                // const i = e.indexOf(this);
                selectStation(sn(d));
            });
}

function selectStation(stationNumber) {

    let station_list = d3.select("#station-list")
        .selectAll("div.station-item");
        
    let stationMap = stationsSelect.nodes()
        .filter(d => d3.select(d).attr("id") == `p${stationNumber}`)[0];

    let colorlist = d3.select(`#item_${stationNumber}`).style("background-color"); 
    let colormap = d3.select(stationMap).style("background-color");     
    station_list.style("background-color", mainColor);
    stationsSelect.style("fill", mainColor);
    
    let sameSelect = colorlist == mainColor || colormap == mainColor;
    let bc = (sameSelect ? selectionColor : mainColor);
    d3.select(`#item_${stationNumber}`).style("background-color", bc);
    d3.select(stationMap).style("fill", bc);

    if (station_selected == stationNumber)
        station_selected = -1;
    else
        station_selected = stationNumber;
    
    if (mode == 0) {
        // mode = 1;
        // d3.select("#svgLoaded").style("display", "none");
        // d3.select("#vis-container").style("display", "block");
        // loadVis(mode);
    } else {
        
        // loadVis(mode, lastAttr);
    }
}

function clearSelection() {
    station_selected = -1;

}

function loadVis(vistype, attr) {
    if (vistype == 0) return;

    let specfilter = JSON.parse(JSON.stringify(specs[vistype - 1]));
    if (specfilter.id == 2 || specfilter.id == 3) {
        console.log(specfilter.data.url.includes("KPI"), specfilter.data.url)

        specfilter.data.url = "http://localhost:5500" + (specfilter.data.url.includes("KPI") ?  `/simulation/KPI.json` : `/simulation/CycleTimes.json`);
        specfilter.transform[0].from.data.url = "http://localhost:5500" + (specfilter.transform[0].from.data.url.includes("KPI") ? `/simulation/KPI.json` : `/simulation/CycleTimes.json`);

        specfilter.transform[1] = {"filter": `datum.station == ${station_selected}`};        
    } else if (specfilter.id == 4 || specfilter.id == 5){
        specfilter.transform[0] = {"filter": `datum.station == ${station_selected}`};
        
        specfilter.layer[0].transform[0] = {"filter": `datum.station == ${station_selected}`};
        specfilter.layer[1].transform[0] = {"filter": `datum.station == ${station_selected}`};
        // specfilter.transform[0] = {"filter": `datum.station == ${station_selected}`};
        
        specfilter.layer[0].data.url = "http://localhost:5500" + (specfilter.layer[0].data.url.includes("KPI") ? `/simulation/KPI.json` : `/simulation/CycleTimes.json`);
        specfilter.layer[1].data.url = "http://localhost:5500" + (specfilter.layer[1].data.url.includes("KPI") ? `/simulation/KPI.json` : `/simulation/CycleTimes.json`);
        // specfilter.transform[0].from.data.url = specfilter.transform[0].from.data.url.includes("KPI") ? `./simulation/KPI.json` : `./simulation/CycleTimes.json`;

        specfilter.layer[0].encoding["y"].field = attr;
        specfilter.layer[1].encoding["y"].field = attr;
    }
    function vis(spec, attr) {
        lastAttr = attr;
        mode = spec.id;
       
        
        vegaEmbed("#vis1", spec, {}).then(result => {
            result.view.addEventListener('click', function(event, item) {
                
                if (item.datum != undefined) {
                    if (spec.id == 1) {
                        let index = +item.mark.name["concat_".length];
                        switch (index){
                            case 0:{
                                loadVis(3);
                                break;
                            }
                            case 2: {
                                loadVis(2);
                                break;
                            }
                        }
                    } else if (spec.id == 2 || spec.id == 3) {
                        let key_index = (item.mark.name["concat_".length]) + (item.mark.name["concat_x_concat_".length])
                        let samples = {"4": kpis, "5": cycleTimes};
                        loadVis(+spec.id + 2, samples[""+(+spec.id + 2)][key_index])
                    }
                } 
            });
        })
    }
    // console.log("loading vis ", mode);
    
    if (specfilter.id == 4 || specfilter.id == 5){

        d3.json("http://localhost:5500" + (specfilter.layer[0].data.url.includes("KPI") ? `/simulation/KPI.json` : `/simulation/CycleTimes.json`)).then(r_data =>{

            delete specfilter.layer[0].data.url
            delete specfilter.layer[1].data.url
            delete specfilter.data.url

            let data = r_data.map( (d,i)=> {d.index = i; return d});

            specfilter.data.values = data;
            specfilter.layer[0].data.values = data; //"http://localhost:5500" + (specfilter.layer[0].data.url.includes("KPI") ? `/simulation/KPI.json` : `/simulation/CycleTimes.json`);
            specfilter.layer[1].data.values = data; //"http://localhost:5500" + (specfilter.layer[1].data.url.includes("KPI") ? `/simulation/KPI.json` : `/simulation/CycleTimes.json`);
            // specfilter.transform[0].from.data.url = specfilter.transform[0].from.data.url.includes("KPI") ? `./simulation/KPI.json` : `./simulation/CycleTimes.json`;

            // specfilter.layer[0].encoding["y"].field = attr;
            // specfilter.layer[1].encoding["y"].field = attr;
    
            vis(specfilter, attr);
        })
    } else {
        vis(specfilter, attr);
    }
    
    // function loadData() {
        
    //     const username = '8b9f2e5b-8524-4de5-8472-7e7de6b37864';
    //     const password = '4817a476-987f-4925-bcf0-6ec0e0334a29';
    //     let u = btoa(`${username}:${password}`);
        
    //     let url = "/api"; //https://ews-emea.api.bosch.com/it/application/api/augmanity-pps4-dummy/d/v1/api/bottlenecks/actual?line=10";
        
    //     d3.json(url).then(data => {
    //         console.log(data);
    //     })
    // }

    // loadData();
    // switch (vistype){
    //     case 1:{
    //         vis(specs[0], attr);
    //         break;
    //     }
    //     case 2: {
    //         vis(specs[1], attr);
    //         break;
    //     }
    //     case 3: {
    //         vis(specs[2], attr);
    //         break;
    //     }
    // }
}
