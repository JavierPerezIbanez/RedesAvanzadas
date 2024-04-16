var express = require('express');
var router = express.Router();
var fs = require('fs');
var mqtt=require('mqtt');

//Conection to the MQTT broker located in port 1883
var mqttClient = mqtt.connect('mqtt://localhost:1883');
/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'Data-Logger' });
});

/*GET*/
router.get('/save', function(req, res, next) {
    var now = new Date();
    var logfile_name = __dirname+'/../public/logs/' +req.query.id_sensor+ "_"+ now.getFullYear() + "_"+ now.getMonth() + "_" + now.getDate() +'.csv';
    let content = req.query.id_sensor+';'+now.getTime()+";"+req.query.temperatura+";"+req.query.humedad+";"+req.query.co2+";"+req.query.volatiles;

    fs.stat(logfile_name, function(err, stat) {
        if(err == null) {
            console.log('File %s exists', logfile_name);
            append2file(logfile_name, content+"\r\n");
        } else if(err.code === 'ENOENT') {
            // file does not exist
            let header ='id_sensor; timestamp; temperatura; humedad; CO2; volatiles\r\n';
            append2file(logfile_name, header+content+"\r\n");
        } else {
            console.log('Some other error: ', err.code);
        }
    });
    //Envio de a los topics
    //Por ahora se realiza de tal modo que se envian los datos en un solo publish
    mqttClient.publish('all',JSON.stringify({
        id_sensor:req.query.id_sensor,
        timestamp:now.getTime(),
        temperatura:req.query.temperatura,
        humedad:req.query.humedad,
        co2:req.query.co2,
        volatiles:req.query.volatiles,
    }));
    console.log("Mensaje enviado")
    /*mqttClient.publish('temperature', JSON.stringify({
        id_sensor:req.query.id_sensor,
        timestamp:now.now,
        temperature:req.query.temperatura,
    }));
    mqttClient.publish('humedad', JSON.stringify({
        id_sensor:req.query.id_sensor,
        timestamp:now.now,
        humedad:req.query.humedad,
    }));
    mqttClient.publish('co2', JSON.stringify({
        id_sensor:req.query.id_sensor,
        timestamp:now.now,
        co2:req.query.co2,
    }));
    mqttClient.publish('volatiles', JSON.stringify({
        id_sensor:req.query.id_sensor,
        timestamp:now.now,
        volatiles:req.query.volatiles,
    }));*/
    //res.render('index', { title: 'Express' });
    res.send("Saving: "+req.query.id_sensor+';'+now.getTime()+";"+req.query.temperatura+";"+req.query.humedad+";"+req.query.co2+";"+req.query.volatiles+" in: "+logfile_name);
});

/*POST*/
/*
Cambios con el get es simplemente cambiar el req.query al req.body que de procesar el json ya se encarga express 
*/
router.post('/save',function(req, res, next){
    var now = new Date();
    var logfile_name = __dirname+'/../public/logs/' +req.body.id_sensor+ "-"+ now.getFullYear() + "-"+ now.getMonth() + "-" + now.getDate() +'.csv'

    //Escritura en el documento
    fs.stat(logfile_name, function(err, stat) {
        if(err == null) {
            console.log('File %s exists', logfile_name);
            let content = req.body.id_sensor+';'+now.getTime()+";"+req.body.temperatura+";"+req.body.humedad+";"+req.body.co2+";"+req.body.volatiles+"\r\n";
            append2file(logfile_name, content);

        } else if(err.code === 'ENOENT') {
            // file does not exist
            let content ='id_sensor; timestamp; temperatura; humedad; CO2; volatiles\r\n'+req.body.id_sensor+';'+now.getTime()+";"+req.body.temperatura+";"+req.body.humedad+";"+req.body.co2+";"+req.body.volatiles+"\r\n";
            append2file(logfile_name, content);
        } else {
            console.log('Some other error: ', err.code);
        }

    });
    //Escritura los distintos topics
    //Por ahora se realiza de tal modo que se envian los datos en un solo publish
    mqttClient.publish('all', JSON.stringify({
        id_sensor:req.body.id_sensor,
        timestamp:now.now,
        temperatura:req.body.temperatura,
        humedad:req.body.humedad,
        co2:req.body.co2,
        volatiles:req.body.volatiles,
    }));
    /*mqttClient.publish('temperature', JSON.stringify({
        id_sensor:req.body.id_sensor,
        timestamp:now.now,
        temperature:req.body.temperatura,
    }));
    mqttClient.publish('humedad', JSON.stringify({
        id_sensor:req.body.id_sensor,
        timestamp:now.now,
        humedad:req.body.humedad,
    }));
    mqttClient.publish('co2', JSON.stringify({
        id_sensor:req.body.id_sensor,
        timestamp:now.now,
        co2:req.body.co2,
    }));
    mqttClient.publish('volatiles', JSON.stringify({
        id_sensor:req.body.id_sensor,
        timestamp:now.now,
        volatiles:req.body.volatiles,
    }));*/

    res.send("Saving: "+req.body.id_sensor+';'+now.getTime()+";"+req.body.temperatura+";"+req.body.humedad+";"+req.body.co2+";"+req.body.volatiles+" in: "+logfile_name);
});

function append2file (file2append, content){
    fs.appendFile(file2append, content, function (err) {
        if (err) throw err;
        console.log("Saving: "+content+" in: "+file2append);
    });
}

module.exports = router;
