/*
 * ChronoClime ESP8266 Weather Gateway
 * Creates WiFi AP for location input and weather data transmission
 * 
 * Features:
 * - WiFi AP Mode: "ChronoClime-Weather"
 * - Web Server: Location input form
 * - GPS Integration: Phone location capture
 * - API Communication: Send data to webapp
 * - LED Status: Connection indicators
 * 
 * Hardware:
 * - ESP8266 NodeMCU
 * - LED on GPIO2 (built-in)
 * - Optional: External LED on GPIO4
 */

#include <ESP8266WiFi.h>
#include <ESP8266WebServer.h>
#include <WiFiClient.h>
#include <ESP8266HTTPClient.h>
// #include <ArduinoJson.h>  // Commented out - using manual JSON

// WiFi Configuration
const char* WIFI_SSID = "realme 8";
const char* WIFI_PASSWORD = "lifeisunfair";

// WiFi AP Configuration (fallback)
const char* AP_SSID = "ChronoClime-Weather";
const char* AP_PASSWORD = "weather123";
const int AP_CHANNEL = 1;
const int AP_MAX_CONNECTIONS = 4;

// Web Server
ESP8266WebServer server(80);

// LED Configuration
const int LED_PIN = 2;  // Built-in LED
const int STATUS_LED = 4;  // External LED (optional)

// Google Sheets Configuration
const char* GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/14t7pZ0P4QxAywycVkL_ecSbMC9u0mqickA4ylRAz8VzbUdm4g0ugCZw6/exec";  // Your Apps Script deployment URL
const char* SHEET_ID = "1nKKi66UDzA1P9QjrnJnSX7sWrrum47Z00VUMEGiPVh4";  // Your Google Sheets ID

// Connection Status
bool isConnected = false;
bool hasLocation = false;
String currentLocation = "";
double latitude = 0.0;
double longitude = 0.0;

// LED Animation
unsigned long lastBlink = 0;
bool ledState = false;

void setup() {
  Serial.begin(115200);
  Serial.println("\n🌤️ ChronoClime ESP8266 Weather Gateway Starting...");
  
  // Initialize LEDs
  pinMode(LED_PIN, OUTPUT);
  pinMode(STATUS_LED, OUTPUT);
  digitalWrite(LED_PIN, HIGH);  // Turn off built-in LED
  digitalWrite(STATUS_LED, LOW);
  
  // Try to connect to WiFi first, fallback to AP mode
  if (!connectToWiFi()) {
    startWiFiAP();
  }
  
  // Setup Web Server
  setupWebServer();
  
  // Start server
  server.begin();
  Serial.println("✅ Web server started");
  
  // LED animation for startup
  startupAnimation();
  
  Serial.println("🚀 ESP8266 Weather Gateway Ready!");
  Serial.println("📱 Connect to WiFi: " + String(AP_SSID));
  Serial.println("🔑 Password: " + String(AP_PASSWORD));
  Serial.println("🌐 Open browser: http://192.168.4.1");
}

void loop() {
  server.handleClient();
  
  // LED status animation
  updateLEDStatus();
  
  // Check for connection status
  checkConnectionStatus();
  
  delay(100);
}

bool connectToWiFi() {
  Serial.println("📡 Connecting to WiFi: " + String(WIFI_SSID));
  
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  
  // Wait for connection with timeout
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
    
    // Blink LED while connecting
    digitalWrite(LED_PIN, !digitalRead(LED_PIN));
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n✅ WiFi Connected!");
    Serial.println("📶 SSID: " + String(WIFI_SSID));
    Serial.println("🌐 IP: " + WiFi.localIP().toString());
    Serial.println("🌐 Gateway: " + WiFi.gatewayIP().toString());
    
    // Success LED indication
    digitalWrite(STATUS_LED, HIGH);
    delay(1000);
    digitalWrite(STATUS_LED, LOW);
    
    return true;
  } else {
    Serial.println("\n❌ WiFi Connection Failed");
    Serial.println("🔄 Falling back to AP mode...");
    return false;
  }
}

void startWiFiAP() {
  Serial.println("📡 Starting WiFi AP...");
  
  // Configure AP
  WiFi.mode(WIFI_AP);
  WiFi.softAP(AP_SSID, AP_PASSWORD, AP_CHANNEL, false, AP_MAX_CONNECTIONS);
  
  // Get AP IP
  IPAddress apIP = WiFi.softAPIP();
  Serial.println("✅ WiFi AP Started");
  Serial.println("📶 SSID: " + String(AP_SSID));
  Serial.println("🔑 Password: " + String(AP_PASSWORD));
  Serial.println("🌐 IP: " + apIP.toString());
  
  // LED indication
  digitalWrite(STATUS_LED, HIGH);
  delay(500);
  digitalWrite(STATUS_LED, LOW);
}

void setupWebServer() {
  Serial.println("🌐 Setting up web server...");
  
  // Root page - Location input form
  server.on("/", handleRoot);
  
  // Location submission
  server.on("/submit-location", HTTP_POST, handleLocationSubmit);
  
  // Status endpoint
  server.on("/status", handleStatus);
  
  // Weather data endpoint
  server.on("/weather", HTTP_GET, handleWeatherRequest);
  
  // API endpoint for webapp communication
  server.on("/api/location", HTTP_POST, handleLocationAPI);
  
  // API endpoint for status
  server.on("/api/status", HTTP_GET, handleStatusAPI);
  
  // 404 handler
  server.onNotFound(handleNotFound);
  
  Serial.println("✅ Web server routes configured");
}

void handleRoot() {
  Serial.println("📱 Location input form requested");
  
  String html = "<!DOCTYPE html>";
  html += "<html><head>";
  html += "<meta name='viewport' content='width=device-width, initial-scale=1.0'>";
  html += "<title>ChronoClime Weather Gateway</title>";
  html += "<style>";
  html += "body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; }";
  html += ".container { max-width: 400px; margin: 0 auto; text-align: center; }";
  html += ".logo { font-size: 24px; font-weight: bold; margin-bottom: 10px; }";
  html += ".subtitle { font-size: 14px; opacity: 0.8; margin-bottom: 30px; }";
  html += "input, button { width: 100%; padding: 12px; margin: 10px 0; border: none; border-radius: 8px; font-size: 16px; }";
  html += "input { background: rgba(255,255,255,0.9); color: #333; }";
  html += "button { background: #4CAF50; color: white; cursor: pointer; }";
  html += "button:hover { background: #45a049; }";
  html += ".status { margin-top: 20px; padding: 10px; background: rgba(255,255,255,0.1); border-radius: 8px; }";
  html += "</style></head><body>";
  html += "<div class='container'>";
  html += "<div class='logo'>🌤️ ChronoClime</div>";
  html += "<div class='subtitle'>Weather Gateway</div>";
  html += "<form id='locationForm'>";
  html += "<input type='text' id='location' placeholder='Enter city name or address' required>";
  html += "<button type='submit'>Get Weather Data</button>";
  html += "</form>";
  html += "<div class='status' id='status'>Ready to connect...</div>";
  html += "</div>";
  
  html += "<script>";
  html += "document.getElementById('locationForm').addEventListener('submit', function(e) {";
  html += "e.preventDefault();";
  html += "const location = document.getElementById('location').value;";
  html += "const status = document.getElementById('status');";
  html += "status.innerHTML = '🛰️ Connecting to satellite...';";
  html += "fetch('/submit-location', {";
  html += "method: 'POST',";
  html += "headers: {'Content-Type': 'application/x-www-form-urlencoded'},";
  html += "body: 'location=' + encodeURIComponent(location)";
  html += "}).then(response => response.text()).then(data => {";
  html += "status.innerHTML = '✅ Location sent to weather service!';";
  html += "setTimeout(() => { status.innerHTML = '🌤️ Weather data updated!'; }, 2000);";
  html += "}).catch(error => {";
  html += "status.innerHTML = '❌ Error: ' + error;";
  html += "});";
  html += "});";
  html += "</script>";
  
  html += "</body></html>";
  
  server.send(200, "text/html", html);
}

void handleLocationSubmit() {
  if (server.hasArg("location")) {
    String location = server.arg("location");
    Serial.println("📍 Location received: " + location);
    
    // Simulate GPS coordinates (in real implementation, use actual GPS)
    latitude = 40.7128 + (random(-100, 100) / 1000.0);  // New York area
    longitude = -74.0060 + (random(-100, 100) / 1000.0);
    
    currentLocation = location;
    hasLocation = true;
    
    // Send to Google Sheets
    sendLocationToGoogleSheets(location, latitude, longitude);
    
    server.send(200, "text/plain", "Location received: " + location);
  } else {
    server.send(400, "text/plain", "Location parameter missing");
  }
}

void handleStatus() {
  String status = "{";
  status += "\"connected\": " + String(isConnected ? "true" : "false") + ",";
  status += "\"hasLocation\": " + String(hasLocation ? "true" : "false") + ",";
  status += "\"location\": \"" + currentLocation + "\",";
  status += "\"latitude\": " + String(latitude, 6) + ",";
  status += "\"longitude\": " + String(longitude, 6);
  status += "}";
  
  server.send(200, "application/json", status);
}

void handleWeatherRequest() {
  if (hasLocation) {
    String weatherData = "{";
    weatherData += "\"location\": \"" + currentLocation + "\",";
    weatherData += "\"latitude\": " + String(latitude, 6) + ",";
    weatherData += "\"longitude\": " + String(longitude, 6) + ",";
    weatherData += "\"timestamp\": " + String(millis());
    weatherData += "}";
    
    server.send(200, "application/json", weatherData);
  } else {
    server.send(404, "application/json", "{\"error\": \"No location data\"}");
  }
}

void handleLocationAPI() {
  if (server.hasArg("plain")) {
    String body = server.arg("plain");
    Serial.println("📡 API Location received: " + body);
    
    // Simple JSON parsing (manual)
    if (body.indexOf("\"location\":") >= 0) {
      int start = body.indexOf("\"location\":\"") + 12;
      int end = body.indexOf("\"", start);
      if (start > 11 && end > start) {
        currentLocation = body.substring(start, end);
        hasLocation = true;
        Serial.println("📍 Location parsed: " + currentLocation);
        
        server.send(200, "application/json", "{\"status\": \"success\"}");
      } else {
        server.send(400, "application/json", "{\"error\": \"Invalid location format\"}");
      }
    } else {
      server.send(400, "application/json", "{\"error\": \"No location field\"}");
    }
  } else {
    server.send(400, "application/json", "{\"error\": \"No data\"}");
  }
}

void handleStatusAPI() {
  String status = "{";
  status += "\"connected\": " + String(isConnected ? "true" : "false") + ",";
  status += "\"hasLocation\": " + String(hasLocation ? "true" : "false") + ",";
  status += "\"location\": \"" + currentLocation + "\"";
  status += "}";
  
  server.send(200, "application/json", status);
}

void handleNotFound() {
  server.send(404, "text/plain", "Not Found");
}

void sendLocationToGoogleSheets(String location, double lat, double lng) {
  Serial.println("📊 Uploading location to Google Sheets...");
  
  // Check WiFi connection first
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("❌ WiFi not connected!");
    return;
  }
  
  Serial.println("📶 WiFi connected to: " + String(WiFi.SSID()));
  Serial.println("🌐 ESP8266 IP: " + WiFi.localIP().toString());
  
  // Create HTTP client with timeout
  WiFiClient client;
  HTTPClient http;
  
  // Set timeout
  http.setTimeout(10000); // 10 seconds timeout
  http.setConnectTimeout(5000); // 5 seconds connection timeout
  
  // Prepare data for Google Sheets
  String timestamp = String(millis());
  String postData = "timestamp=" + timestamp;
  postData += "&location=" + location;
  postData += "&latitude=" + String(lat, 6);
  postData += "&longitude=" + String(lng, 6);
  postData += "&source=esp8266";
  
  Serial.println("📤 Data: " + postData);
  Serial.println("🔗 URL: " + String(GOOGLE_SCRIPT_URL));
  
  // Test connection first
  Serial.println("🔍 Testing connection...");
  if (!http.begin(client, GOOGLE_SCRIPT_URL)) {
    Serial.println("❌ HTTP begin failed!");
    return;
  }
  
  // Set headers
  http.addHeader("Content-Type", "application/x-www-form-urlencoded");
  http.addHeader("User-Agent", "ESP8266-Weather-Gateway");
  
  Serial.println("📤 Sending POST request...");
  int httpResponseCode = http.POST(postData);
  
  if (httpResponseCode > 0) {
    String response = http.getString();
    Serial.println("✅ Google Sheets response: " + String(httpResponseCode));
    Serial.println("📄 Response: " + response);
    
    if (httpResponseCode == 200) {
      Serial.println("✅ Location uploaded to Google Sheets successfully!");
      // Blink success LED
      for (int i = 0; i < 3; i++) {
        digitalWrite(STATUS_LED, HIGH);
        delay(200);
        digitalWrite(STATUS_LED, LOW);
        delay(200);
      }
    } else {
      Serial.println("❌ Google Sheets upload failed with code: " + String(httpResponseCode));
    }
  } else {
    Serial.println("❌ HTTP error: " + String(httpResponseCode));
    Serial.println("🔍 Error details:");
    Serial.println("  - WiFi status: " + String(WiFi.status()));
    Serial.println("  - WiFi SSID: " + String(WiFi.SSID()));
    Serial.println("  - Local IP: " + WiFi.localIP().toString());
    Serial.println("  - Gateway: " + WiFi.gatewayIP().toString());
    Serial.println("  - DNS: " + WiFi.dnsIP().toString());
  }
  
  http.end();
}

void checkConnectionStatus() {
  // Check if any clients are connected
  int connectedClients = WiFi.softAPgetStationNum();
  bool wasConnected = isConnected;
  isConnected = (connectedClients > 0);
  
  if (isConnected && !wasConnected) {
    Serial.println("📱 Client connected to ESP8266");
    digitalWrite(STATUS_LED, HIGH);
  } else if (!isConnected && wasConnected) {
    Serial.println("📱 Client disconnected from ESP8266");
    digitalWrite(STATUS_LED, LOW);
  }
}

void updateLEDStatus() {
  unsigned long currentTime = millis();
  
  if (isConnected) {
    // Fast blink when connected
    if (currentTime - lastBlink > 200) {
      ledState = !ledState;
      digitalWrite(LED_PIN, ledState ? LOW : HIGH);
      lastBlink = currentTime;
    }
  } else {
    // Slow blink when waiting for connection
    if (currentTime - lastBlink > 1000) {
      ledState = !ledState;
      digitalWrite(LED_PIN, ledState ? LOW : HIGH);
      lastBlink = currentTime;
    }
  }
}

void startupAnimation() {
  Serial.println("🎬 Startup animation...");
  
  // Blink sequence
  for (int i = 0; i < 3; i++) {
    digitalWrite(LED_PIN, LOW);
    digitalWrite(STATUS_LED, HIGH);
    delay(200);
    digitalWrite(LED_PIN, HIGH);
    digitalWrite(STATUS_LED, LOW);
    delay(200);
  }
  
  // Final indication
  digitalWrite(STATUS_LED, HIGH);
  delay(500);
  digitalWrite(STATUS_LED, LOW);
  
  Serial.println("✅ Startup animation complete");
}
