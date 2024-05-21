/**
 * Redes Avanzadas
 * Modelo para peticiones GET y POST
 */

#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <WiFiClient.h>


String serverName = "10.100.0.102:80";
const char* ssid     = "ArduinoConnect";
const char* password = "12345678";
String idsensor = "nodo_2";
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

   String serverPath = "http://" + serverName + "/save?id_sensor="+idsensor+"&temperatura="+temperatura+
    "&humedad="+humedad+"&co2="+co2+"&volatiles="+volatiles;

   http.begin(client, serverPath.c_str());

   // Send HTTP GET request
   int httpResponseCode = http.GET();
   
   if (httpResponseCode <= 0) {
    Serial.print("Error code: ");
    Serial.println(httpResponseCode);
  }

  // Free resources
  http.end();
}
