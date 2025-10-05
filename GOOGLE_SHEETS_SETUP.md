# Google Sheets CSV Integration Setup Guide

## 📊 **GOOGLE SHEETS SETUP**

### **Step 1: Create Google Sheet**
1. **Go to Google Sheets** (sheets.google.com)
2. **Create a new spreadsheet**
3. **Name it**: "ChronoClime Location Data"
4. **Note the Sheet ID** from the URL: `https://docs.google.com/spreadsheets/d/SHEET_ID/edit`

### **Step 2: Set Up Google Apps Script**
1. **Open your Google Sheet**
2. **Go to Extensions → Apps Script**
3. **Delete the default code**
4. **Copy and paste** the code from `google-apps-script.js`
5. **Save the project** (Ctrl+S)
6. **Name it**: "ESP8266 Location Handler"

### **Step 3: Deploy as Web App**
1. **Click "Deploy" → "New deployment"**
2. **Type**: "Web app"
3. **Execute as**: "Me"
4. **Who has access**: "Anyone"
5. **Click "Deploy"**
6. **Copy the Web App URL** (looks like: `https://script.google.com/macros/s/SCRIPT_ID/exec`)

### **Step 4: Test the Setup**
1. **Run the `addTestData` function** in Apps Script
2. **Check your Google Sheet** - should see test data
3. **Verify the Web App URL** works by visiting it in browser

## 🔧 **ESP8266 CONFIGURATION**

### **Update ESP8266 Code**
1. **Open `esp8266_weather_gateway.ino`**
2. **Find line 41**: `const char* GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec";`
3. **Replace with your Web App URL**
4. **Find line 42**: `const char* SHEET_ID = "1ABC123DEF456GHI789JKL";`
5. **Replace with your Google Sheet ID**

### **Upload to ESP8266**
1. **Upload the modified code** to your ESP8266
2. **Open Serial Monitor** (115200 baud)
3. **Check for WiFi connection** to "realme 8"
4. **Test location submission** via web interface

## 🌐 **WEBAPP CONFIGURATION**

### **Update Google Sheets Service**
1. **Open `src/services/googleSheetsService.ts`**
2. **Find line 95**: `sheetId: '1ABC123DEF456GHI789JKL'`
3. **Replace with your Google Sheet ID**
4. **Find line 96**: `sheetName: 'LocationData'`
5. **Replace with your sheet name** (usually "Sheet1")

### **Test the Integration**
1. **Start your webapp**: `npm run dev`
2. **Look for ESP8266 status** in top-right corner
3. **Click "Connect"** to test CSV reading
4. **Check browser console** for connection logs

## 🎯 **EXPECTED WORKFLOW**

### **ESP8266 → Google Sheets**
1. **ESP8266 connects** to "realme 8" WiFi
2. **User submits location** via ESP8266 web interface
3. **ESP8266 uploads data** to Google Sheets via Apps Script
4. **LED blinks** to confirm successful upload

### **Google Sheets → Webapp**
1. **Webapp polls Google Sheets** every 10 seconds
2. **Reads CSV data** from published sheet
3. **Updates location** when new data is found
4. **Shows satellite animation** during connection

## 🔍 **TROUBLESHOOTING**

### **ESP8266 Issues**
- **Check Serial Monitor** for upload status
- **Verify Web App URL** is correct
- **Test Apps Script** by visiting the URL directly
- **Check WiFi connection** to "realme 8"

### **Webapp Issues**
- **Check browser console** for CSV reading errors
- **Verify Google Sheet ID** is correct
- **Test CSV URL** directly in browser
- **Check sheet permissions** (should be public)

### **Google Sheets Issues**
- **Verify Apps Script** is deployed correctly
- **Check sheet permissions** (should be viewable by anyone)
- **Test with sample data** using `addTestData` function
- **Check Apps Script logs** for errors

## 📋 **TESTING CHECKLIST**

### **ESP8266 Testing**
- [ ] WiFi connects to "realme 8"
- [ ] Web interface loads at ESP8266 IP
- [ ] Location submission works
- [ ] Data uploads to Google Sheets
- [ ] LED blinks on successful upload

### **Webapp Testing**
- [ ] ESP8266 status shows in top-right
- [ ] CSV reading works from Google Sheets
- [ ] Location data appears in webapp
- [ ] Satellite animation shows during connection
- [ ] Weather data loads for ESP8266 location

## 🚀 **READY TO USE!**

Once configured, the system will:
1. **ESP8266 captures location** and uploads to Google Sheets
2. **Webapp reads location** from Google Sheets CSV
3. **Weather data displays** for ESP8266 location
4. **Satellite animation** shows connection status

The Google Sheets CSV integration provides a reliable, simple way to sync ESP8266 location data with your webapp! 📊🛰️✨
