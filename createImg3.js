// This is converted to be Sync file reads and write

// **** Define the requirements
var fs = require('fs');
var gutil = require('gulp-util');


// **** Create the functions for reading in the student JSON and outputing the .img file

function readSync(input, output, errorFile, func) {
  var contents = fs.readFileSync(input).toString();
  fs.appendFileSync(output, contents);
}

function readSyncStream(inputFileName, output, errorFile, func) {
  var fd = fs.openSync(inputFileName, 'r');
  var bufferSize = 1024;
  var buffer = new Buffer(bufferSize);

  var leftOver = '';
  var read, line, idxStart, idx;
  while ((read = fs.readSync(fd, buffer, 0, bufferSize, null)) !== 0) {
    leftOver += buffer.toString('utf8', 0, read);
    idxStart = 0
    while ((idx = leftOver.indexOf("\n", idxStart)) !== -1) {
      line = leftOver.substring(idxStart, idx);
      // console.log("one line read: " + line);
      writeConvertJsonToIMG(line, output, errorFile)
      idxStart = idx + 1;
    }
    leftOver = leftOver.substring(idxStart);
  }
}

function readAsyncStream(inputFileName, output, errorFile, func) {
  var input = fs.createReadStream(inputFileName);
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
    // fs.appendFile(output, data + "\n", (err) => {if (err) throw err;});
  	fs.appendFileSync(output, data + "\n");
}

function writeConvertJsonToIMG(data, output, errorFile) {
    var content = "";
    var regex = /^(.+\/)*(.+\..+)$/
    // console.log("About to parse: " + data);  	
    jsonObj = JSON.parse(data);

    // Slide 1
    // console.log("data: ",data);
    slideNumber += 1
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
    content = slide1.replace(/LN/, slideNumber);
    content = content.replace(/babyPic/, babyPicName);
    content = content.replace(/firstName/, firstName);
    // fs.appendFile(output, content, (err) => {if (err) throw err;});
    fs.appendFileSync(output, content);

    // Slide 2
    slideNumber += 1    
    currentPic = jsonObj.CurrentPicture;
    if (currentPic) {
    var result = currentPic.match(regex);
    var currentPicName = result[2];	// result[1] is the path
    } else {
    	var currentPicName = ""
    };
    profession = jsonObj.Whattheywanttobewhentheygrowup;
    content = slide2.replace(/LN2/, slideNumber);
    content = content.replace(/currentPic/, currentPicName);
    content = content.replace(/profession/, profession);
    // console.log("currentPic: ",currentPic);
    // console.log("profession: ",profession);
    // console.log(content);
    // fs.appendFile(output, content, (err) => {if (err) throw err;});
    fs.appendFileSync(output, content);  

    if (!babyPic || !firstName || !currentPic || !profession ) {
    	missingData = 'Missing data. Teacher: ' + teacher + ' student:' + firstName + ' ' + lastName + '\n'
    	console.log(gutil.colors.red(missingData));
	  	// fs.appendFile(errorFile,missingData , (err) => {if (err) throw err;});
      fs.appendFileSync(errorFile, missingData); 
 	}
}

function deleteIfExist(fileName) {
  try {
      fs.unlinkSync(fileName);
      console.log(gutil.colors.green('File ' + fileName + ' exists. Deleting. ' ));
  } catch (e) {
      console.log(gutil.colors.red('File ' + fileName + ' not found, so not deleting.'));
  }
}

// ******* THIS IS THE MAIN START *********
//  Prep the variables
// var inputFile = fs.createReadStream('test.json');
var inputFileName = 'test.json';
var outputFileName = "output.img";
var errorFileName = "errors.txt";
var slide1 = "[slide LN]\ngradient=0\nfilename=babyPic\nangle=0\nduration=2\nspeed=1\nno_points=0\ntext=   When firstName grows up gender ...\ntransition_id=71\nanim id=3\nanim duration=1\ntext pos=0\nplacing=0\n\n"
var slide2 = "[slide LN2]\ngradient=0\nfilename=currentPic\nangle=0\nduration=3\nspeed=4\nno_points=0\ntext=wants to be a profession\ntransition_id=20\nanim id=2\nanim duration=1\ntext pos=2\nplacing=0\nfont=Sans 22\nfont color=1;1;1;1;\nfont bgcolor=0;0;0;1;\n\n"
var slideNumber = 6;

deleteIfExist(outputFileName);
deleteIfExist(errorFileName);

// Give 5 blank lines on the console to make it easier to read
for (var i = 0; i< 10; i++ ){console.log('');} 

readSync('intro.img', outputFileName, errorFileName, writeDirect);
// readAsyncStream(inputFileName, outputFileName, errorFileName, writeConvertJsonToIMG);
readSyncStream(inputFileName, outputFileName, errorFileName);
readSync('end.img', outputFileName, errorFileName, writeDirect);