/**
   EWC-CAM for ESP32-CAM 遠端控制載入程式
*/
#include <WiFi.h>
#include <HTTPUpdate.h>

const char* ssid = "your_SSID";
const char* password = "your_PASSWORD";
const char* url = "https://cypswu.github.io/espmqtt/CAM/esp32_cam.bin";

void setup() {
  Serial.begin(115200);

  // 連接到WiFi
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Connecting to WiFi...");
  }
  Serial.println("Connected to WiFi");

  WiFiClientSecure client;  // 使用安全的WiFi客戶端進行HTTPS
  client.setInsecure();  // 選填：設置insecure選項以跳過證書驗證（生產環境不推薦）

  // 嘗試更新固件
  t_httpUpdate_return ret = httpUpdate.update(client, url);
  switch (ret) {
    case HTTP_UPDATE_FAILED:
      Serial.printf("HTTP_UPDATE_FAILED Error (%d): %s\n", httpUpdate.getLastError(), httpUpdate.getLastErrorString().c_str());
      break;
    case HTTP_UPDATE_NO_UPDATES:
      Serial.println("HTTP_UPDATE_NO_UPDATES");
      break;
    case HTTP_UPDATE_OK:
      Serial.println("HTTP_UPDATE_OK");
      break;
  }
}

void loop() {
  // your regular code
}
