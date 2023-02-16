
let station_selected = -1;
let mainColor = "rgb(18, 36, 110)";
let selectionColor = "rgb(111, 111, 111)";
let mode = "map";
let specs = [];

function loadSpecs() {
    Promise.all([d3.json("specs/specOverview.json"), d3.json("specs/specCycle.json"),
                 d3.json("specs/specSamples.json")]).then((values) => {
        for (let v of values) {
            specs.push(v);
        }    
    });
}

function sn(node) {
    return d3.select(node).attr("id").substring(1)
}

function createList(stations) {
    let status_size = 15;
    console.log(stations.map(station => sn(station)));

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
                            cx="${status_size/2}" cy="${status_size/2}" r="${status_size/2}" style="fill: seagreen; stroke: black;"/>
                    </svg>
                </div>
                <div>
                    <svg width="${status_size}" height="${status_size}">
                        <circle class="status_circle" id="status_bottleneck_${sn(d)}" 
                            cx="${status_size/2}" cy="${status_size/2}" r="${status_size/2}" style="fill: seagreen; stroke: black;"/>
                    </svg>
                </div>
                <div>
                    <svg width="${status_size}" height="${status_size}">
                        <circle class="status_circle" id="status_kpi${sn(d)}" 
                            cx="${status_size/2}" cy="${status_size/2}" r="${status_size/2}" style="fill: seagreen; stroke: black;"/>
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
    stationsSelect.style("fill", mainColor)
     
    let bc = (colorlist == mainColor || colormap == mainColor ? selectionColor : mainColor);
    d3.select(`#item_${stationNumber}`).style("background-color", bc);
    d3.select(stationMap).style("fill", bc);

    if (mode == "map" ) {
        mode == "vis";
        d3.select("#svgLoaded").style("display", "none")
        d3.select("#vis-container").style("display", "block")
        
        loadVis("overview");
    } else {

    }
}

function clearSelection() {
    station_selected = -1;

}

function loadVis(vistype, attr) {
    
    function vis(spec, attr) {
        vegaEmbed("#vis1", spec, {}).then(result => {
            result.view.addEventListener('click', function(event, item) {
                // console.log('CLICK', event, item);
                console.log(item, item.datum != undefined)
                if (item.datum != undefined) {
                    let count = (item.mark.name.match(/concat/g) || []).length;
                    console.log(count);
                    let index = +item.mark.name["concat_".length];
                    switch (index){
                        case 0:{
                            loadVis(`tier${count==2?2:3}`, "cycleTimes");
                            break;
                        }
                        // case 1: {
                        //     loadVis("tier3", "cycleTimes");
                        //     break;
                        // }
                    }
                }
            });
        })
    }
    function loadData() {
        
        const username = '8b9f2e5b-8524-4de5-8472-7e7de6b37864';
        const password = '4817a476-987f-4925-bcf0-6ec0e0334a29';
        let u = btoa(`${username}:${password}`);
        
        let url = "/api"; //https://ews-emea.api.bosch.com/it/application/api/augmanity-pps4-dummy/d/v1/api/bottlenecks/actual?line=10";
        
        d3.json(url).then(data => {
            console.log(data);
        })
    }

    loadData();

    switch (vistype){
        case "overview":{
            vis(specs[0], attr);
            break;
        }
        case "tier2": {
            vis(specs[1], attr);
            break;
        }
        case "tier3": {
            vis(specs[2], attr);
            break;
        }
    }
}
