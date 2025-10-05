# ESP8266 Weather Gateway Setup Guide

## 🛰️ **ESP8266 ARDUINO SETUP**

### **Step 1: Upload Code to ESP8266**
1. **Open Arduino IDE**
2. **Install ESP8266 Board Package** (if not already installed)
3. **Select Board**: Tools → Board → NodeMCU 1.0 (ESP-12E Module)
4. **Select Port**: Tools → Port → (your ESP8266 port)
5. **Open `esp8266_weather_gateway.ino`**
6. **Upload to ESP8266**

### **Step 2: WiFi Configuration**
The ESP8266 is configured to connect to your WiFi network:
- **SSID**: `realme 8`
- **Password**: `lifeisunfair`

### **Step 3: Find ESP8266 IP Address**
After uploading, open **Serial Monitor** (115200 baud) to see:
```
✅ WiFi Connected!
📶 SSID: realme 8
🌐 IP: 192.168.1.XXX  ← Note this IP address
🌐 Gateway: 192.168.1.1
```

## 🌐 **WEBAPP CONFIGURATION**

### **Step 1: Update ESP8266 IP in Webapp**
1. **Open `src/services/esp8266Service.ts`**
2. **Find line 31**: `private baseURL = 'http://192.168.1.100';`
3. **Replace with your ESP8266's actual IP**: `http://192.168.1.XXX`

### **Step 2: Test Connection**
1. **Start your webapp**: `npm run dev`
2. **Look for ESP8266 status** in top-right corner
3. **Click "Connect"** to test the connection

## 🎯 **USAGE FLOW**

### **ESP8266 Mode (Connected to your WiFi)**
1. **ESP8266 connects** to "realme 8" WiFi automatically
2. **Webapp discovers** ESP8266 IP address automatically
3. **Location input** via ESP8266 web interface
4. **Weather data** synced to webapp

### **Fallback AP Mode (If WiFi fails)**
1. **ESP8266 creates** "ChronoClime-Weather" hotspot
2. **Connect phone** to "ChronoClime-Weather" WiFi
3. **Configure location** via phone browser
4. **Data sync** to webapp

## 🔧 **TROUBLESHOOTING**

### **ESP8266 Not Found**
- **Check WiFi connection** in Serial Monitor
- **Verify IP address** is correct in webapp
- **Ensure both devices** are on same network

### **Connection Issues**
- **Restart ESP8266** (power cycle)
- **Check firewall settings** on your router
- **Try AP mode** as fallback

### **Webapp Integration**
- **Check browser console** for connection errors
- **Verify ESP8266 IP** in `esp8266Service.ts`
- **Test ESP8266 endpoints** directly in browser

## 📱 **EXPECTED BEHAVIOR**

### **ESP8266 Status Indicators**
- **🟢 Green**: Connected with location data
- **🔵 Blue**: Connected, no location
- **🔴 Red**: Connection error
- **⚪ Gray**: Offline

### **Satellite Animation**
- **"Connecting to satellite..."** when establishing connection
- **Progress indicators** during data sync
- **Success/error feedback** after connection

## 🚀 **READY TO USE!**

Once configured, your ESP8266 will:
1. **Connect to "realme 8" WiFi** automatically
2. **Serve location input form** at its IP address
3. **Sync location data** with your webapp
4. **Show weather** for ESP8266 location
5. **Provide satellite connection** animation

The system is now ready for IoT weather gateway functionality! 🛰️📡✨
