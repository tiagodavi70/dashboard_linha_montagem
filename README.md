# Dashboard Linha de montagem


## Install
First install Node.js, then execute the foloowing command in this folder:
```
npm i
```
## Usage


UsageThis application needs a server running:
```
node server.mjs
```

Now the pages and access points are accessible.

* Dashboard:
```
http://localhost:5500/
```

* API requests examples (simulated):
```
http://localhost:5500/it/application/api/augmanity-pps4-dummy/d/v1/api/kpi/cycle-times?line=10&station=220
http://localhost:5500/it/application/api/augmanity-pps4-dummy/d/v1/api/kpi/cycle-times?line=10&station=220&startDate=2022-12-02&endDate=2022-12-03

http://localhost:5500/it/application/api/augmanity-pps4-dummy/d/v1/api/kpi/current-shift?line=10&station=220
http://localhost:5500/it/application/api/augmanity-pps4-dummy/d/v1/api/kpi?line=10&station=220&startDate=2022-12-02&endDate=2022-12-03

http://localhost:5500/it/application/api/augmanity-pps4-dummy/d/v1/api/bottlenecks/actual?line=10
```

* Image requisitions:
```
http://localhost:5500/260/chartgen.png?chart=specKPI
http://localhost:5500/260/chartgen.png?chart=specCycleTime

http://localhost:5500/260/chartgen.png?chart=specSamples&attr=oee
http://localhost:5500/290/chartgen.png?chart=specSamples&attr=oee&index=100
http://localhost:5500/270/chartgen.png?chart=specSamples&attr=oee&index=90
http://localhost:5500/270/chartgen.png?chart=specSamples&attr=oee&index=90&size=tall
```

## Unity Chart generation usage:

None of the values should be null, except the isTall directive for samples chart.
``` cs
GetKPI(string station)
GetCycleTime(string station)

GetSample(string station, string attr, int index, bool isTall) // if index is not set by the slider it should be the max value
```