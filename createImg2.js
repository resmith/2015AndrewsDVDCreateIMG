// Issue with this is it was aSync file reads and write so I had the ending file in the middle ....

// **** Define the requirements
var fs = require('fs');
var gutil = require('gulp-util');


// **** Create the functions for reading in the student JSON and outputing the .img file
function readLines(input, output, errorFile, func) {
  var remaining = '';
  var jsonObj = {};

  input.on('data', function(data) {
    remaining += data;
    var index = remaining.indexOf('\n');
    var last  = 0;
    while (index > -1) {
      var line = remaining.substring(last, index);
      last = index + 1;
      func(line, output,errorFile);
      index = remaining.indexOf('\n', last);
    }

    remaining = remaining.substring(last);
  });

  input.on('end', function() {
    if (remaining.length > 0) {
      func(remaining, output,errorFile);
    }
  });
}

function writeDirect(data, output, errorFile) {
  	fs.appendFile(output, data + "\n", (err) => {if (err) throw err;});
}

function writeConvertJsonToIMG(data, output, errorFile) {
  	var content = "";
  	var regex = /^(.+\/)*(.+\..+)$/
  	// console.log("About to parse: " + data);  	
  	jsonObj = JSON.parse(data);
  	slideNumber += 1

  	// Slide 1
  	// console.log("data: ",data);
  	babyPic = jsonObj.BabyPicture;
  	if (babyPic) {
		var result = babyPic.match(regex);
		var babyPicName = result[2];	// result[1] is the path
   } else {
   	var babyPicName = ""
   };
  	firstName = jsonObj.StudentFirstName;
  	lastName = jsonObj.StudentLastName
  	teacher = jsonObj.Teacher;
  	// gender = jsonObj.
  	content = slide1.replace(/LN/, slideNumber);
  	content = content.replace(/babyPic/, babyPicName);
  	content = content.replace(/firstName/, firstName);
  	// console.log("firstName: ",firstName);
  	// console.log(content);
  	fs.appendFile(output, content, (err) => {if (err) throw err;});

  	// Slide 2
	currentPic = jsonObj.CurrentPicture;
  	if (currentPic) {
		var result = currentPic.match(regex);
		var currentPicName = result[2];	// result[1] is the path
   } else {
   	var currentPicName = ""
   };
  	profession = jsonObj.Whattheywanttobewhentheygrowup;
  	content = slide2.replace(/LN2/, slideNumber + 1);
  	content = content.replace(/currentPic/, currentPicName);
  	content = content.replace(/profession/, profession);
  	// console.log("currentPic: ",currentPic);
  	// console.log("profession: ",profession);
  	// console.log(content);
 	fs.appendFile(output, content, (err) => {if (err) throw err;});

 	if (!babyPic || !firstName || !currentPic || !profession ) {
 		missingData = 'Missing data. Teacher: ' + teacher + ' student:' + firstName + ' ' + lastName
 		console.log(gutil.colors.red(missingData));
	  	fs.appendFile(errorFile,missingData , (err) => {if (err) throw err;});
 	}
}

function deleteIfExist(fileName) {
	fs.exists(fileName, function(exists) {
	  if(exists) {
	    //Show in green
	    console.log(gutil.colors.green('File exists. Deleting ' + fileName));
	    fs.unlink(fileName);
	  } else {
	    //Show in red
	    console.log(gutil.colors.red('File ' + fileName + 'not found, so not deleting.'));
	  }
	});
}

// ******* THIS IS THE MAIN START *********
//  Prep the variables
// var inputFile = fs.createReadStream('test.json');
var inputFileIntroImg = fs.createReadStream('intro.img');
var inputFileStudentJSON = fs.createReadStream('input.json');
var inputFileEndImg = fs.createReadStream('end.img');
var outputFileName = "output.img";
var errorFileName = "errors.txt";
var slide1 = "[slide LN]\ngradient=0\nfilename=babyPic\nangle=0\nduration=2\nspeed=1\nno_points=0\ntext=   When firstName grows up gender ...\ntransition_id=71\nanim id=3\nanim duration=1\ntext pos=0\nplacing=0\n\n"
var slide2 = "[slide LN2]\ngradient=0\nfilename=currentPic\nangle=0\nduration=3\nspeed=4\nno_points=0\ntext=wants to be a profession\ntransition_id=20\nanim id=2\nanim duration=1\ntext pos=2\nplacing=0\nfont=Sans 22\nfont color=1;1;1;1;\nfont bgcolor=0;0;0;1;\n\n"
var slideNumber = 8;

deleteIfExist(outputFileName);
deleteIfExist(errorFileName);

// Give 5 blank lines on the console to make it easier to read
for (var i = 0; i< 10; i++ ){console.log('');} 

readLines(inputFileIntroImg, outputFileName, errorFileName, writeDirect);
readLines(inputFileStudentJSON, outputFileName, errorFileName, writeConvertJsonToIMG);
readLines(inputFileEndImg, outputFileName, errorFileName, writeDirect);