/**
 * Redes Avanzadas
 * Modelo para peticiones GET y POST
 */

#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <WiFiClient.h>
#include <ArduinoJson.h>


String serverName = "138.100.156.207:5000";
const char* ssid     = "DESKTOP-0531";
const char* password = "123456789";
String nombreNodo = "pepino";
int co2 =123;
int volatiles =234;
double temperatura= 25;
double humedad= 56.9;


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
   peticion["id_nodo"] = nombreNodo;
   peticion["temperatura"] = temperatura;
   peticion["humedad"] = humedad;
   peticion["co2"] = co2;
   peticion["volatiles"] = volatiles;

   String serverPath = "http://" + serverName + "/record";

   http.begin(client, serverPath.c_str());	
   http.addHeader("Content-Type", "application/json");
   String jsonPost="";
   // Send HTTP GET request
   //String jsonPost= "{\"id_nodo\":"\"nodoPrueba1\",\"temperatura\":24,\"humedad\":68.2,\"co2\":293,\"volatiles\":112}";
   serializeJson(peticion, jsonPost);

   int httpResponseCode = http.POST(jsonPost);
   
   if (httpResponseCode <= 0) {
    Serial.print("Error code: ");
    Serial.println(httpResponseCode);
  }
  // Free resources
  http.end();
}
