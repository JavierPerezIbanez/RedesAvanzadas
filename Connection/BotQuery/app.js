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

app.get('/lastvalue',async function(req, res) {
    let avg = { "temperatura": 0, "humedad": 0, "co2": 0, "volatiles": 0 };
    let querys = prepareLast();

    // Array para almacenar las promesas de las consultas
    let promises = [];

    // Procesar cada consulta y almacenar su promesa
    Object.keys(querys).forEach(key => {
        promises.push(processQuery(querys[key], key, avg));
    });

    // Esperar a que todas las promesas se resuelvan
    await Promise.all(promises);

    // Enviar la respuesta al cliente
    res.send(avg);
});
app.get('/botaverage', async function(req, res) {
    const timeInSeconds = req.query.timeinseconds;
    let avg = { "temperatura": 0, "humedad": 0, "co2": 0, "volatiles": 0 };
    let querys;

    // Lógica para preparar las consultas según el tiempo especificado o el intervalo predeterminado
    if (timeInSeconds) {
        querys = prepareQuerys(timeInSeconds);
    } else {
        querys = prepareQuerys();
    }

    // Procesar cada consulta de forma asíncrona
    await Promise.all([
        processQuery(querys.temperatura, "temperatura", avg),
        processQuery(querys.humedad, "humedad", avg),
        processQuery(querys.co2, "co2", avg),
        processQuery(querys.volatiles, "volatiles", avg)
    ]);

    // Esperar un breve momento para asegurar la finalización de las consultas
    await new Promise(resolve => setTimeout(resolve, 50));

    // Enviar la respuesta al cliente
    res.send(avg);
});

function updateData(value,type,obj) {
    console.log(value);
    switch (type) {
        case "temperatura":
            obj.temperatura=value
            break;
        case "humedad":
            obj.humedad=value
            break;
        case "co2":
            obj.co2=value
            break;
        case "volatiles":
            obj.volatiles=value
            break;
    }
}
function processQuery(query,type,obj){
    return new Promise((resolve, reject) => {
        let sum = 0;
        let count = 0;
        queryApi.queryRows(query, {
            next: (row, tableMeta) => {
                const tableObject = tableMeta.toObject(row);
                let value = tableObject._value;
                count++;
                sum += value;
            },
            error: (error) => {
                console.error(error);
                reject(error); // Rechazar la promesa en caso de error
            },
            complete() {
                console.log('\nFinished SUCCESS');
                updateData(sum / count, type, obj);
                resolve(); // Resolver la promesa cuando la consulta esté completa
            },
        });
    });
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
function prepareLast(){
    let baseQuery='from(bucket: "DataBucket") ' +
        `|> range(start: -12h, stop: now) ` +
        '|> filter(fn: (r) => r["_measurement"] == "sensor_data") ';

    let fluxQuery1=baseQuery+'|> filter(fn: (r) => r["_field"] == "co2") |> last()';
    let fluxQuery2=baseQuery+'|> filter(fn: (r) => r["_field"] == "temperatura") |> last()';
    let fluxQuery3=baseQuery+'|> filter(fn: (r) => r["_field"] == "humedad") |> last()';
    let fluxQuery4=baseQuery+'|> filter(fn: (r) => r["_field"] == "volatiles") |> last()';

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