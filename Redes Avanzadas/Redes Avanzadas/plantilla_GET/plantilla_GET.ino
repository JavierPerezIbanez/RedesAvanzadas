/**
 * Redes Avanzadas
 * Modelo para peticiones GET y POST
 */

#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <WiFiClient.h>

String serverName = "Servidor destino";
const char* ssid     = "";
const char* password = "";
String nombreNodo = "";

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

   String serverPath = "http:\\localhost\...";

   http.begin(client, serverPath.c_str());	
   http.addHeader("Content-Type", "application/json");
   // Send HTTP GET request
   String jsonPost= "{\"id_nodo\":\"nodoPrueba1\",\"temperatura\":24,\"humedad\":68.2,\"co2\":293,\"volatiles\":112}"
   int httpResponseCode = http.POST(jsonPost);
   
   if (httpResponseCode <= 0) {
    Serial.print("Error code: ");
    Serial.println(httpResponseCode);
  }
  // Free resources
  http.end();
}
