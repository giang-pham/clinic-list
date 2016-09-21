var http = require('http');
var https = require('https');
var fs = require('fs');
var sanitizer = require('sanitizer');

var url = "https://www.aviva.com.sg/pdf/Aviva_MyBenefits_Clinic_Listing.pdf";
var dest = "pdf/clinic.pdf"
var raw_json = 'clinic_raw.json';

var download = function(url, dest, cb) {
  var file = fs.createWriteStream(dest);
  var request = https.get(url, function(response) {
    response.pipe(file);
    file.on('finish', function() {
      file.close(cb(dest));  // close() is async, call cb after close completes.
    });
  }).on('error', function(err) { // Handle errors
    fs.unlink(dest); // Delete the file async. (But we don't check the result)
    if (cb) cb(err.message);
  });
};

var convertPdf = function(file) {
  PDFParser = require("pdf2json");
  var pdfParser = new PDFParser();

  pdfParser.on("pdfParser_dataError", errData => console.error(errData.parserError) );
  pdfParser.on("pdfParser_dataReady", pdfData => {
     fs.writeFile(raw_json, convertJson(pdfData));
  });

  pdfParser.loadPDF(file);
}

// convert raw pdf json to understandable clinic json in order to consume
var convertJson = function(raw_json) {
  var json = raw_json;
  var result = '';
  var pages = json.formImage.Pages;
  var index = 0;
  var clinics = [];
  var clinic = {};
  var columns = {};

  for (var j = 0; j < 1; j++) {
    var page = pages[j];
    var texts = page.Texts;

    for(var i = 0; i < texts.length; i++) {
      var cell = texts[i];
      var cellText = decodeURIComponent(cell.R[0].T);

      console.log(cellText);

      var cellX = cell.x;

      if (cellText == 'S/N'||
        cellText == 'AVIVA CODE' || cellText == 'REMARKS' || cellText == 'TELEPHONE'
        || cellText == 'FAX NO.' || cellText == 'ADDRESS 1' || cellText == 'ADDRESS 2'
        || cellText == 'POSTAL' || cellText == 'PUBLIC HOLIDAY' || cellText == 'SATURDAY'
        || cellText == 'SUNDAY' || cellText == 'ZONE' || cellText == 'ESTATE') {
          columns[cellX] = cellText;
        }
    }
    console.log(columns);
  };

  for (var j = 0; j < pages.length; j++) {
    var page = pages[j];
    var texts = page.Texts;

    for(var i = 0; i < texts.length; i++) {
      var cell = texts[i];
      var cellText = decodeURIComponent(cell.R[0].T);

      var cellX = cell.x;

      var text = decodeURIComponent(cellText);
      if(isNumeric(text)) {
        if(text - 1 == index) {
          clinics.push(clinic);
          index = text;
          clinic = {};
          for (var x in columns) {
            clinic[columns[x]] = '';
          }
        }
      }
      if(columns[cellX] != null) {
        clinic[columns[cellX]] += text;
      }
    }
  }
  return JSON.stringify(clinics);

};

function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

download(url, dest, convertPdf);
