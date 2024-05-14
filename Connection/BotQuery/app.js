const express = require('express');
const {InfluxDB, Point} = require("@influxdata/influxdb-client");
const e = require("express");

const app = express();

const url = "http://localhost:8086";
//homeToken
//const token = "MZYTLWMBmcufR_p-WBAisRUJMCJ2eYMtqOoUO3iXEUY4F4aN1FvApwmfzLI26nH5AcYQIecDr7PYPK3HfKqeUQ==";

//Consider changing this with a restricted token for security
const token = "UHt34RryJY09lbsWFXCdra_9ujVbBpterQE3LUleseDsllj4_lAaXLzT5c3f5eFpiOr5rxRi39WRcUIu1ODTBA==";
const org = "RA_2";
const bucket = "DataBucket";
const influxDB = new InfluxDB({url, token});

const queryApi = influxDB.getQueryApi(org);

const sensors=[];
const timeInterval="5h"

async function getSensors(){
    let fluxQuery= `import "influxdata/influxdb/v1"\n\n v1.tagValues(bucket: "${bucket}", tag: "id_sensor")`
    queryApi.queryRows(fluxQuery, {
        next: (row, tableMeta) =>{
            const tableObject = tableMeta.toObject(row);
            var value=tableObject._value;

            if(!sensors.includes(value)){
               sensors.push(value);
               //console.log(value)
            }
            //console.log(value)

        },
        error:(error) =>{
            console.error(error)
        },
        complete() {
            console.log('\nFinished SUCCESS')
        },
    })
}

//Time Logger
app.use(function (req, res, next) {
    const now = new Date();
    const options = { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' };
    const date=("["+now.toLocaleString('es-ES', options).replace(',', '')+"]");
    process.stdout.write(date)
    next()
})

app.get('/botaverage',async function(req, res) {
    const timeInSeconds=req.query.timeinseconds;
    var querys;
    
    if(timeInSeconds){
        querys= prepareQuerys(timeInSeconds);
    }else {
        querys= prepareQuerys(timeInterval);
    }
    processQuery(querys.temperatura,"temperatura");
    processQuery(querys.humedad,"humedad");
    processQuery(querys.co2,"co2");
    processQuery(querys.volatiles,"volatiles");
    //Falta que sea sincrono
    await new Promise((resolve) => {
        setTimeout(() => {
            resolve('resolved');
        }, 40);
    });
    res.send(avg);
});

let avg={"temperatura":0,"humedad":0,"co2":0,"volatiles":0};
function updateData(value,type) {
    console.log(value);
    switch (type) {
        case "temperatura":
            avg.temperatura=value
            break;
        case "humedad":
            avg.humedad=value
            break;
        case "co2":
            avg.co2=value
            break;
        case "volatiles":
            avg.volatiles=value
            break;
    }
}
function processQuery(query,type){
    let sum=0;
    let count=0;
    queryApi.queryRows(query, {
        next: (row, tableMeta) =>{
            const tableObject = tableMeta.toObject(row);
            let value=tableObject._value;
            count++;
            sum+=value
            //console.log(value)
        },
        error:(error) =>{
            console.error(error)
        },
        complete() {
            console.log('\nFinished SUCCESS')
            //console.log(sum/count)
            updateData(sum/count,type)
        },
    });

    /*console.log(count)
    console.log(sum/count)*/

}
function prepareQuerys(time){
    let baseQuery='from(bucket: "DataBucket") ' +
        `|> range(start: -${time}) ` +
        '|> filter(fn: (r) => r["_measurement"] == "sensor_data") ';

    let fluxQuery1=baseQuery+'|> filter(fn: (r) => r["_field"] == "co2") |> filter(fn: (r) => ';
    let fluxQuery2=baseQuery+'|> filter(fn: (r) => r["_field"] == "temperatura") |> filter(fn: (r) => ';
    let fluxQuery3=baseQuery+'|> filter(fn: (r) => r["_field"] == "humedad") |> filter(fn: (r) => ';
    let fluxQuery4=baseQuery+'|> filter(fn: (r) => r["_field"] == "volatiles") |> filter(fn: (r) => ';

    sensors.forEach((sensor,indice)=>{
        if(indice<sensors.length-1){
            //console.log(sensor);
            fluxQuery1+=`r["id_sensor"] == "${sensor}" or `
            fluxQuery2+=`r["id_sensor"] == "${sensor}" or `
            fluxQuery3+=`r["id_sensor"] == "${sensor}" or `
            fluxQuery4+=`r["id_sensor"] == "${sensor}" or `
        }else {
            fluxQuery1+=`r["id_sensor"] == "${sensor}" )`
            fluxQuery2+=`r["id_sensor"] == "${sensor}" )`
            fluxQuery3+=`r["id_sensor"] == "${sensor}" )`
            fluxQuery4+=`r["id_sensor"] == "${sensor}" )`
        }
    });
    fluxQuery1+=`|> aggregateWindow(every: ${timeInterval}, fn: median, createEmpty: false) |> median(column: "_value") |> yield(name: "mean")`;
    fluxQuery2+=`|> aggregateWindow(every: ${timeInterval}, fn: median, createEmpty: false) |> median(column: "_value") |> yield(name: "mean")`;
    fluxQuery3+=`|> aggregateWindow(every: ${timeInterval}, fn: median, createEmpty: false) |> median(column: "_value") |> yield(name: "mean")`;
    fluxQuery4+=`|> aggregateWindow(every: ${timeInterval}, fn: median, createEmpty: false) |> median(column: "_value") |> yield(name: "mean")`;

    return {
        "co2":fluxQuery1,
        "temperatura":fluxQuery2,
        "humedad":fluxQuery3,
        "volatiles":fluxQuery4}
}

const PORT = 5001;
app.listen(PORT, () => {
    console.log(`Servidor 1 escuchando en el puerto ${PORT}`);
    getSensors();
});