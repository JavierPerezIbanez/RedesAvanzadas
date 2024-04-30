const express = require('express');
const {InfluxDB, Point} = require("@influxdata/influxdb-client");

const app = express();

const url = "http://localhost:8086";
//homeToken
//const token = "MZYTLWMBmcufR_p-WBAisRUJMCJ2eYMtqOoUO3iXEUY4F4aN1FvApwmfzLI26nH5AcYQIecDr7PYPK3HfKqeUQ==";

//Consider changing this with a restricted token for security
const token = "AiIetQMWOVlZ9h6o21LOnpMjYP5KJ016cBx5twWvco9VLN4xdQ5XaF2MQgMvHsorcbAkPIyXP60VtxfBrlUKEQ==";
const org = "RA_2";
const bucket = "DataBucket";
const influxDB = new InfluxDB({url, token});

const queryApi = influxDB.getQueryApi(org);

var sensors=[];

function getSensors(){
    let fluxQuery= `import "influxdata/influxdb/v1"\n\n v1.tagValues(bucket: "${bucket}", tag: "id_sensor")`
    queryApi.queryRows(fluxQuery, {
        next: (row, tableMeta) =>{
            const tableObject = tableMeta.toObject(row)
            console.log(tableObject)
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

app.get('/botaverage', (req, res) => {

    getSensors();
    let fluxQuery='from(bucket: "DataBucket") ' +
        '|> range(start: -5m)' +
        '|> filter(fn: (r) => r["_measurement"] == "sensor_data") ' +
        '|> filter(fn: (r) => r["_field"] == "co2") ' +
        '|> filter(fn: (r) => r["id_sensor"] == "101.2" or r["id_sensor"] == "11.1" or r["id_sensor"] == "1103.2" or r["id_sensor"] == "112.1" or r["id_sensor"] == "114.1" or r["id_sensor"] == "2103.1") ' +
        '|> aggregateWindow(every: v.windowPeriod, fn: median, createEmpty: false) |> median(column: "_value")'

    var result;
    res.send('¡Hola desde el servidor 1!');
});

const PORT = 5001;
app.listen(PORT, () => {
    console.log(`Servidor 1 escuchando en el puerto ${PORT}`);
});