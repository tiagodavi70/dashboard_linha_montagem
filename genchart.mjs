import * as d3 from 'd3';
import vega from 'vega';
import vl from 'vega-lite';
import fs from 'fs';
import specManip from "./specManip.js";

export default class ChartGenerator {

    constructor(settings, selector){
        this.chartType = settings.charttype;
        
        this.settings = settings;
        this.selector = settings.svg ? "svg" : "canvas";
        
        this.render = async function(spec) {
            let view = new vega.View(vega.parse(spec))
                .renderer('svg')        // set renderer (canvas or svg)
                .initialize();
            if (this.selector === "svg")
                return await view.toSVG().catch((err) => {console.error(err);}); // return svg string

            let canvas =  await view.toCanvas(this.settings.id == "specSamples"? 2 : 4).catch((err) => {console.error(err);}); // return canvas stream

            return canvas.toDataURL().split("base64,")[1];
        };
    };

    // call this function to generate the charts
    async generateChart() {
        let vlspec = "";
        let spec = {};

        let specfilepath = `specs/${this.settings.chart}.json`;    
        vlspec = JSON.parse(fs.readFileSync(specfilepath).toString());
        vlspec = specManip(vlspec, this.settings.attr, this.settings);

        spec = vl.compile(vlspec).spec;
        return this.render(spec);
    };
}