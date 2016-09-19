var http = require('http');
var https = require('https');
var fs = require('fs');

var url = "https://www.aviva.com.sg/pdf/Aviva_MyBenefits_Clinic_Listing.pdf";
var dest = "pdf/clinic.pdf"

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
     fs.writeFile("clinic.json", JSON.stringify(pdfData));
  });
  
  pdfParser.loadPDF(file);
}

download(url, dest, convertPdf);
