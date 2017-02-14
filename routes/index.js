var fs = require('fs');
var path = require('path');
var express = require('express');
var router = express.Router();
var async = require('async');
var request = require('request');
var PDFMerge = require('pdf-merge');
var pdftkPath = 'C:\\Program Files (x86)\\PDFtk\\bin\\pdftk.exe';
var imageArr = [
  'https://btesimages.s3.amazonaws.com/PdfLabelFiles/flipkartShippingLabel_OD107312205540085000-1731220554008500.pdf',
  'https://btesimages.s3.amazonaws.com/PdfLabelFiles/paytm_packing_slip_order_559338486.pdf',
  'https://btesimages.s3.amazonaws.com/PdfLabelFiles/paytm_packing_slip_order_559338426.pdf'
];

/* GET home page. */
router.get('/', function(req, res, next) {
  // res.render('index', { title: 'Express' });
  var counter = 1;
  async.eachSeries(imageArr, function (imageUrl, callback) {
    request(imageUrl)
      .pipe(fs.createWriteStream(path.resolve(`./temp/${counter}.pdf`)))
      .on('close', function () {
        console.log(counter);
        console.log('done!!!');
        counter += 1;
        callback();
      });
  }, function (err) {
    if (err) {
      console.log(err);
    }
    fs.readdir(path.resolve('./temp'), (err, files) => {
      var filePath = [];
      files.forEach(function (file) {
        filePath.push(path.resolve(`./temp/${file}`));
      });
      var pdfMerge = new PDFMerge(filePath, pdftkPath);
      pdfMerge
      .asBuffer()
        .merge(function (error, buffer) {
          console.log(err);
          fs.writeFileSync(path.resolve(`merged.pdf`), buffer); 
          async.each(filePath,function (eachFilePath,callback) {
            fs.unlink(eachFilePath, function (err) {
              if (err) {
                console.log(err);
              }
              callback();
            });
          }, function (err) {
            if (err) {
              console.log(err);
            }
            return res.sendFile(path.resolve('merged.pdf'));      
          });
          
      });
    });    
  });
});

module.exports = router;
