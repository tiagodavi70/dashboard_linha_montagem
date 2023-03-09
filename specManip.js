function specManip(specRaw, attr, options=undefined) {
    let spec = JSON.parse(JSON.stringify(specRaw));

    let station = options? options.station : station_selected;
    let kpi = options? options.kpi : kpi_station;
    let cycle = options? options.cycle : cycle_station;
    let targetsjson = options? options.targets : targets;

    let times_arr = options? options.cycle_data : times_data;
    let kpi_arr   = options? options.kpi_data : kpi_data;

    let specType = spec.id ? spec.id : options.id;

    if ((specType == 1 || specType == 2) ) {
        spec.transform[1] = {"filter": `datum.station == ${station}`};
        
        spec.datasets["data-kpi"] = kpi[station];
        spec.datasets["data-times"] = cycle[station];
    } else if (specType == 3) {
        // https://raw.githubusercontent.com/tiagodavi70/dashboard_linha_montagem/main
        let isCycle = Object.values(
            {"00": "totalCycleTime", "01": "processTime", "10": "exitTime", "11": "changeTime"}
        ).includes(attr);
        spec.data.url = isCycle ?
            "./simulation/CycleTimes.json" : 
            "./simulation/KPI.json";

        let max = isCycle ?
            times_arr.filter(d => d.station == station).length :
            kpi_arr.filter(d => d.station == station).length;

        let slider_value = max;

        if (!options) {
            if (d3.select("#interaction-index").nodes()[0].children.length == 0) {
                let max_ = isCycle? 100:60;
                let min_ = isCycle? 5:3;
                
                d3.select("#interaction-index").html(`
                    <label for="index_slider"><div id="label_value"> ${(isCycle?"Samples":"Shifts") + ": " + max_} </div></label>
                    <input type="range" id="index_slider" name="index_slider" min="${min_}" max="${max_}" value="${max}">
                `);
                d3.select("#index_slider")
                    .on("input", function(e,d) {
                        d3.select("#label_value").text((isCycle?"Samples":"Shifts")+ ": " + this.value);
                    }).on("change ", function(e,d) {
                        logValue({"event": `set_slider`, "station": station_selected, "element": "vis", "value": this.value, "vis_id": spec.id, "attr": attr}, e);
                        loadVis(3, attr);
                    });
            }
        } 
        spec.layer[0].transform[0] = {"filter": `datum.station == ${station}`};
        spec.layer[1].transform[0] = {"filter": `datum.station == ${station}`};
        
        spec.layer[0].encoding["y"].field = attr;

        if (options) {
            slider_value = options.index || max;
            if (options.size == "tall") {
                spec.width  = 200;
                spec.height = 300;
            }
        }
         else {
            slider_value = d3.select("#index_slider").property("value");
        }
        spec.transform[0].filter = `datum.index >= 0 && datum.index < ${slider_value}`;
        spec.transform[1].calculate = "" + targetsjson[attr];

        let titles = {"oee": "%", "partCount": "pieces", "fpy": "%", "countNIO": "pieces", "productivity": "pieces / man * hour"};
        let y_title = "seconds";
        if (!isCycle) {
            y_title = titles[attr];
            spec.layer[0].encoding.x.title = `shifts`;
        }
        spec.layer[0].encoding.y.title = `${y_title}`;
        spec.layer[1].encoding.y.title = `${y_title}`; //  and target in green        
    }
    return spec;
}

if (module) {
    module.exports = specManip;
}
