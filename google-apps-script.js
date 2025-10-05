/**
 * Google Apps Script for ESP8266 Location Data
 * 
 * Instructions:
 * 1. Create a new Google Sheet
 * 2. Go to Extensions > Apps Script
 * 3. Replace the default code with this script
 * 4. Save and deploy as web app
 * 5. Set permissions to "Anyone" and "Execute as: Me"
 * 6. Copy the web app URL to ESP8266 code
 */

function doPost(e) {
  try {
    // Get the active spreadsheet
    const sheet = SpreadsheetApp.getActiveSheet();
    
    // Parse the POST data
    const timestamp = e.parameter.timestamp || new Date().toISOString();
    const location = e.parameter.location || '';
    const latitude = parseFloat(e.parameter.latitude) || 0;
    const longitude = parseFloat(e.parameter.longitude) || 0;
    const source = e.parameter.source || 'esp8266';
    
    // Log the received data
    console.log('Received data:', {
      timestamp,
      location,
      latitude,
      longitude,
      source
    });
    
    // Add header row if sheet is empty
    if (sheet.getLastRow() === 0) {
      sheet.getRange(1, 1, 1, 5).setValues([
        ['Timestamp', 'Location', 'Latitude', 'Longitude', 'Source']
      ]);
    }
    
    // Add the new data row
    const newRow = [
      timestamp,
      location,
      latitude,
      longitude,
      source
    ];
    
    sheet.appendRow(newRow);
    
    // Return success response
    return ContentService
      .createTextOutput(JSON.stringify({
        status: 'success',
        message: 'Location data added successfully',
        timestamp: timestamp
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    console.error('Error processing request:', error);
    
    // Return error response
    return ContentService
      .createTextOutput(JSON.stringify({
        status: 'error',
        message: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  // Handle GET requests (for testing)
  return ContentService
    .createTextOutput(JSON.stringify({
      status: 'success',
      message: 'ESP8266 Google Sheets API is working',
      timestamp: new Date().toISOString()
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Test function to add sample data
 */
function addTestData() {
  const sheet = SpreadsheetApp.getActiveSheet();
  
  // Add header if empty
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, 5).setValues([
      ['Timestamp', 'Location', 'Latitude', 'Longitude', 'Source']
    ]);
  }
  
  // Add test data
  const testData = [
    [new Date().toISOString(), 'New York, NY', 40.7128, -74.0060, 'esp8266'],
    [new Date().toISOString(), 'London, UK', 51.5074, -0.1278, 'esp8266']
  ];
  
  testData.forEach(row => {
    sheet.appendRow(row);
  });
  
  console.log('Test data added successfully');
}
