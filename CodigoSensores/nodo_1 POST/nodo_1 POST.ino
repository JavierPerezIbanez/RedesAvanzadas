/**
 * Redes Avanzadas
 * Modelo para peticiones GET y POST
 */

#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <WiFiClient.h>
#include <ArduinoJson.h>


String serverName = "10.100.0.102:80";
const char* ssid = "ArduinoConnect";
const char* password = "12345678";
String idsensor = "nodo_1";
int co2 =random(350,5000);
int volatiles =random(0, 100);
double temperatura=random(20, 30);
double humedad=random(40, 60);


void setup() {
  // put your setup code here, to run once:
  Serial.begin(9600);

  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) 
  { 
    delay(100);  
    Serial.print('.'); 
  }

  Serial.println("");
  Serial.print("Iniciado STA:\t");
  Serial.println(ssid);
  Serial.print("IP address:\t");
  Serial.println(WiFi.localIP());
}

void loop() {
  // put your main code here, to run repeatedly:

  WiFiClient client;
  HTTPClient http;

  JsonDocument peticion;
  peticion["id_sensor"] = idsensor;
  peticion["temperatura"] = temperatura;
  peticion["humedad"] = humedad;
  peticion["co2"] = co2;
  peticion["volatiles"] = volatiles;

  String serverPath = "http://" + serverName + "/save";

  http.begin(client, serverPath.c_str());	
  http.addHeader("Content-Type", "application/json");
  String jsonPost="";
  serializeJson(peticion, jsonPost);

  int httpResponseCode = http.POST(jsonPost);
  
  if (httpResponseCode <= 0) {
    Serial.print("Error code: ");
    Serial.println(httpResponseCode);
  }
  
  // Free resources
  http.end();
}
