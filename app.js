
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

    // console.log(station);
    // if (index == truck_selected) {
    //     clearSelection();
    // } else {
    //     truck_selected = index;
    // }
    
    // if (truck_selected >= 0) {

    // d3.select(".empty-selection").remove();
    // d3.select("#station-list")
    //     .selectAll(".station-item")
    //     .style("background-color",(d,i) => i != truck_selected? "" : "DarkSlateGray");
    // d3.select("#station-selected")
    //     .html(/*html*/`
    //     <div id="truck-selection" style="margin-top: 4vh">
            
    //         <div>
    //             <div class="small-header">Id</div>
    //             <div class="truck-box-text">${data[index].id}</div>
    //         </div>
    //         <div id="truck-icons" style="display: flex;">
    //             <i class="fa fa-phone fa-2x"></i>
    //             <i class="fa fa-gas-pump fa-2x"></i>
    //             <i class="fa fa-wifi fa-2x"></i>
    //             <i class="fas fa-map-marker-alt fa-2x"></i>
    //         </div>
    //         <div>
    //             <div>
    //                 <div class="small-header">Partida</div>
    //                 <div class="truck-box-text" style="background-color: grey">[${data[index].lat}, ${data[index].lng}]</div>
    //             </div>
    //             <div>
    //                 <div class="small-header">Chegada</div>
    //                 <div class="truck-box-text" style="background-color: grey">[${data[index].lat}, ${data[index].lng}]</div>
    //             </div>
    //         </div>
    //         <div>
    //             <div class="small-header">Nova posição</div>
    //             <input type="text" class="truck-box-text" id="manual-position"/>
    //             <button id="manual-position-button"> Definir posicao </button>
    //             <button id="map-position-button"> Definir posicao no mapa</button>
    //             <div style="display: none; margin-top: 2vh" id="popup-manual"> Posição enviada <div>
    //         </div>
    //     </div>
    //     `)

    //     d3.select("#map-position-button").on("click", (e,d) => {
    //         selectPosition = true;
    //     });
    // }
}

function clearSelection() {
    station_selected = -1;

    // let html_empty = /*html*/`<div class="empty-selection">Selecione um caminhão <i class="fa fa-truck"></i> ao lado ou acima.</div>`
    // d3.select("#truck-selected")
    //     .html(html_empty);
    // d3.select("#truck-list").selectAll(".truck-item").style("background-color", "");
}

function loadVis(vistype, attr) {
    // function timer() {
    //     setInterval(() => {
    //         vegaEmbed(`#vis1`, specs[i], {}).then(result => {
    //             result.view.addEventListener('click', function(event, item) {
    //                 console.log('CLICK', event, item);
    //             });
    //         })
    //         i++;
    //     }, 3000);
    // }
    // timer();

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

        // d3.json(url, {crossOrigin: "anonymous", mode: "no-cors",
        // headers: new Headers({
        //     "Authorization": `Basic ${u}`,
        //     'Access-Control-Allow-Credentials': 'true',
        //     'Access-Control-Allow-Origin': '*',
        //     // 'Access-Control-Allow-Headers': '*'
        //   })
        // }).then(data => {
        //     console.log(data);
        // });

        // // now we configure the fetch request to the url endpoint.
        // // we should probably put it inside a separate function since
        // // you're using a browser, you probably will bind this request
        // // to a click event or something.
        // function login() {
        //     return fetch(url, {
        //         // in the case of a login request most APIs use the POST method offered by
        //         // RESTful APIs
        //         method: 'post', // can be 'get', 'put', 'delete', and many more

        //         // now we set any needed headers specified by the API
        //         headers: {
        //         // most APIs I have worked with use
        //         'Content-Type': 'application/json',
        //         // but some might need more, they will specify anyway.
                
        //         },

        //         // because we are using the 'post' method then we will need to add
        //         // a body to the request with all our data, body excepts a string so
        //         // we do the following
        //         body: JSON.stringify({
        //         username: username,
        //         password: password,
        //         }),
        //     })
        //     // Now we handle the response because the function returns a promise
        //     .then((response) => {
        //         // An important thing to note is that an error response will not throw
        //         // an error so if the result is not okay we should throw the error
        //         if(!response.ok) {
        //         throw response;
        //         }

        //         // since we expect a json response we will return a json call
        //         return response.json();
        //     })
        // }
        // login().then(data => {
        //     console.log(data);
        // })
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
