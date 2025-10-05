# Your Google Apps Script Setup - Quick Guide

## 📊 **YOUR APPS SCRIPT PROJECT CONFIGURED**

### **Your Apps Script Project Details:**
- **Project ID**: `14t7pZ0P4QxAywycVkL_ecSbMC9u0mqickA4ylRAz8VzbUdm4g0ugCZw6`
- **Editor URL**: https://script.google.com/u/0/home/projects/14t7pZ0P4QxAywycVkL_ecSbMC9u0mqickA4ylRAz8VzbUdm4g0ugCZw6/edit
- **Deployment URL**: `https://script.google.com/macros/s/14t7pZ0P4QxAywycVkL_ecSbMC9u0mqickA4ylRAz8VzbUdm4g0ugCZw6/exec`

## 🔧 **NEXT STEPS TO COMPLETE SETUP**

### **Step 1: Add the Code to Your Apps Script**
1. **Open your Apps Script project**: https://script.google.com/u/0/home/projects/14t7pZ0P4QxAywycVkL_ecSbMC9u0mqickA4ylRAz8VzbUdm4g0ugCZw6/edit
2. **Delete the default `myFunction()` code**
3. **Copy and paste** the code from `google-apps-script.js`
4. **Save the project** (Ctrl+S)
5. **Name it**: "ESP8266 Location Handler"

### **Step 2: Deploy as Web App**
1. **Click "Deploy" → "New deployment"**
2. **Type**: "Web app"
3. **Execute as**: "Me"
4. **Who has access**: "Anyone"
5. **Click "Deploy"**
6. **Authorize the script** when prompted
7. **Copy the Web App URL** (should be: `https://script.google.com/macros/s/14t7pZ0P4QxAywycVkL_ecSbMC9u0mqickA4ylRAz8VzbUdm4g0ugCZw6/exec`)

### **Step 3: Test the Deployment**
1. **Visit the deployment URL** in your browser
2. **Should see**: `{"status":"success","message":"ESP8266 Google Sheets API is working","timestamp":"..."}`
3. **Run the `addTestData` function** in Apps Script
4. **Check your Google Sheet** for test data

### **Step 4: Upload ESP8266 Code**
1. **Your ESP8266 code is already configured** with the correct URLs
2. **Upload `esp8266_weather_gateway.ino`** to your ESP8266
3. **Open Serial Monitor** (115200 baud)
4. **Test location submission** via ESP8266 web interface

## 🎯 **EXPECTED WORKFLOW**

### **ESP8266 → Google Sheets**
1. **ESP8266 connects** to "realme 8" WiFi
2. **User submits location** via ESP8266 web interface
3. **ESP8266 uploads** to your Google Sheet via Apps Script
4. **LED blinks** to confirm successful upload

### **Google Sheets → Webapp**
1. **Webapp polls** your Google Sheet CSV every 10 seconds
2. **Reads latest location** from CSV data
3. **Updates weather** for ESP8266 location
4. **Shows satellite animation** during sync

## 🔍 **TESTING CHECKLIST**

### **Apps Script Testing**
- [ ] Code deployed successfully
- [ ] Deployment URL accessible in browser
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

Your ESP8266 code is already configured with:
- ✅ **Correct Apps Script URL**: `https://script.google.com/macros/s/14t7pZ0P4QxAywycVkL_ecSbMC9u0mqickA4ylRAz8VzbUdm4g0ugCZw6/exec`
- ✅ **Correct Google Sheet ID**: `1nKKi66UDzA1P9QjrnJnSX7sWrrum47Z00VUMEGiPVh4`

Just need to:
1. **Add the Apps Script code** to your project
2. **Deploy as Web App**
3. **Upload ESP8266 code**
4. **Test the integration**

Your Google Apps Script project is ready! 📊🛰️✨
