var express = require('express');
var app = express();
var fs = require('fs');
var sanitizer = require('sanitizer');

function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

app.get('/', function (req, res) {
  var json = JSON.parse(fs.readFileSync('clinic.json', 'utf8'));
  var result = '';
  var pages = json.formImage.Pages;
  var index = 0;
  for (var j = 0; j < pages.length; j++) {
    var page = pages[j];
    var texts = page.Texts;
    for(var i = 0; i < texts.length; i++) {
      var r = texts[i].R[0];
      var text = decodeURI(r.T);
      if(text.length < 4 && isNumeric(text)) {
        if(text - 1 == index) {
          index = text;
          result += '<hr>';
        }
      }
      result += text + '<br/>';
    }
  }

  res.send(result);
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});
