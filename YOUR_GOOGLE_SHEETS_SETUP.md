# Your Google Sheets Setup - Quick Guide

## 📊 **YOUR GOOGLE SHEET CONFIGURED**

### **Your Google Sheet Details:**
- **Sheet ID**: `1nKKi66UDzA1P9QjrnJnSX7sWrrum47Z00VUMEGiPVh4`
- **URL**: https://docs.google.com/spreadsheets/d/1nKKi66UDzA1P9QjrnJnSX7sWrrum47Z00VUMEGiPVh4/edit
- **Sheet Name**: `Sheet1` (default)

## 🔧 **NEXT STEPS TO COMPLETE SETUP**

### **Step 1: Add Google Apps Script to Your Sheet**
1. **Open your Google Sheet**: https://docs.google.com/spreadsheets/d/1nKKi66UDzA1P9QjrnJnSX7sWrrum47Z00VUMEGiPVh4/edit
2. **Go to Extensions → Apps Script**
3. **Delete the default code**
4. **Copy and paste** the code from `google-apps-script.js`
5. **Save the project** (Ctrl+S)
6. **Name it**: "ESP8266 Location Handler"

### **Step 2: Deploy as Web App**
1. **Click "Deploy" → "New deployment"**
2. **Type**: "Web app"
3. **Execute as**: "Me"
4. **Who has access**: "Anyone"
5. **Click "Deploy"**
6. **Copy the Web App URL** (looks like: `https://script.google.com/macros/s/SCRIPT_ID/exec`)

### **Step 3: Update ESP8266 Code**
1. **Open `esp8266_weather_gateway.ino`**
2. **Find line 42**: `const char* GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec";`
3. **Replace `YOUR_SCRIPT_ID`** with your actual Apps Script URL
4. **Upload to ESP8266**

### **Step 4: Test the Setup**
1. **Run the `addTestData` function** in Apps Script
2. **Check your Google Sheet** - should see test data
3. **Upload ESP8266 code** and test location submission
4. **Start webapp** and test CSV reading

## 🎯 **EXPECTED CSV FORMAT**

Your Google Sheet will have this structure:
```
| Timestamp | Location | Latitude | Longitude | Source |
|-----------|----------|----------|-----------|--------|
| 2024-01-01T10:00:00Z | New York, NY | 40.7128 | -74.0060 | esp8266 |
| 2024-01-01T10:05:00Z | London, UK | 51.5074 | -0.1278 | esp8266 |
```

## 🔍 **TESTING CHECKLIST**

### **Google Apps Script Testing**
- [ ] Apps Script code deployed successfully
- [ ] Web App URL accessible in browser
- [ ] `addTestData` function adds sample data to sheet
- [ ] Sheet shows data in correct format

### **ESP8266 Testing**
- [ ] WiFi connects to "realme 8"
- [ ] Web interface loads at ESP8266 IP
- [ ] Location submission uploads to Google Sheets
- [ ] LED blinks on successful upload
- [ ] Serial Monitor shows upload status

### **Webapp Testing**
- [ ] ESP8266 status shows in top-right corner
- [ ] CSV reading works from your Google Sheet
- [ ] Location data appears in webapp
- [ ] Satellite animation shows during connection
- [ ] Weather data loads for ESP8266 location

## 🚀 **READY TO GO!**

Once you complete the Google Apps Script setup:
1. **ESP8266 will upload** location data to your Google Sheet
2. **Webapp will read** location from your Google Sheet CSV
3. **Weather data will display** for ESP8266 location
4. **Satellite animation** will show connection status

Your Google Sheet is now configured! Just need to add the Apps Script and deploy it. 📊🛰️✨
