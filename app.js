
let station_selected = -1;
let mainColor = "rgb(18, 36, 110)";
let selectionColor = "rgb(111, 111, 111)";
let mode = 0; // 0 - map, 1 - kpi, 2 - cycle, 3 - sample kpi, 4 - sample cycle times
let lastAttr = 0;
let specs = [];

let cycleTimes = {"00": "totalCycleTime", "01": "processTime", "10": "exitTime", "11": "changeTime"};
let kpis = {"00": "oee", "01": "fpy", "10": "partCount", "11": "partCountSetPoint", "12": "productivity"};


d3.select("#close_icon").on("click", function(event, d) {
    mode = 0;
    d3.select("#svgLoaded").style("display", "block");
    d3.select("#vis-container").style("display", "none");
    
});

d3.select("#features_icon").on("click", function(event, d) {
    if (station_selected != -1) { // mode == 0
        mode = 1;
        d3.select("#svgLoaded").style("display", "none");
        d3.select("#vis-container").style("display", "block");
        loadVis(mode);
    }
});

d3.select("#cycle_icon").on("click", function(event, d) {
    if (station_selected != -1) {
        mode = 2;
        d3.select("#svgLoaded").style("display", "none");
        d3.select("#vis-container").style("display", "block");
        loadVis(mode);
    }
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
    Promise.all([d3.json("specs/specKPI.json"), d3.json("specs/specCycleTime.json"),
                 d3.json("specs/specSamples.json")]
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
    let helper_f = (station, type) => {
        // let filtered = data.filter(d => d.station == station);
        // let redCount = 0;
        let redcheck = {"260": {"cycle": true, "kpi":true}, "270": {"cycle": false, "kpi":false}, "290": {"cycle": false, "kpi":false}}
        let isRed = redcheck[station][type];
        return { "isRed": isRed, "color": isRed ? "crimson": "seagreen", "size": isRed ? status_size/2 : status_size/4};
    };
    let isBootleneck = (station) => {   
        let isRed = station == bottleneck.station;
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
                            cx="${status_size/2}" cy="${status_size/2}" r="${helper_f(sn(d), "cycle").size}" style="fill: ${helper_f(sn(d), "cycle").color}; stroke: black;"/>
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
                            cx="${status_size/2}" cy="${status_size/2}" r="${helper_f(sn(d), "kpi").size}" style="fill: ${helper_f(sn(d), "kpi").color}; stroke: black;"/>
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

    if (station_selected == stationNumber) {
        station_selected = -1;
        clearSelection();
    }
    else
        station_selected = stationNumber;

    if (mode != 0) {
        loadVis(mode, lastAttr);
    }
}

function clearSelection() {
    station_selected = -1;
    mode = 0;
    loadVis(mode);
    
    let station_list = d3.select("#station-list")
        .selectAll("div.station-item");
    station_list.style("background-color", mainColor);
    stationsSelect.style("fill", mainColor);
    
    d3.select("#svgLoaded").style("display", "block");
    d3.select("#vis-container").style("display", "none");
}

function loadVis(vistype, attr) {
    if (vistype != 3) d3.select("#interaction-index").selectAll("*").remove();
    if (vistype == 0) return;

    let spec = JSON.parse(JSON.stringify(specs[vistype-1]));
    spec = specManip(spec, attr)

    function vis(spec, attr) {
        lastAttr = attr;
        mode = spec.id;
        
        vegaEmbed("#vis1", spec, {}).then(result => {
            result.view.addEventListener('click', function(event, item) {
                
                if (item.datum != undefined) {
                    if (spec.id == 0) {
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
                    } else if (spec.id == 1 || spec.id == 2) {
                        let key_index = (item.mark.name["concat_".length]) + (item.mark.name["concat_x_concat_".length])
                        let samples = {"3": kpis, "4": cycleTimes};
                        loadVis(3, samples[""+(+spec.id + 2)][key_index])
                    }
                } 
            });
        })
    }
    vis(spec, attr);
}
