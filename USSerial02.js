var http = require('http').createServer(handler);
var io = require('socket.io').listen(http),
fs = require('fs'),
firmata = require('firmata');
//board = new firmata.Board('/dev/ttyACM0', arduinoReady);



var USSensor = new Array();
    USSensor[0] = 0;
    USSensor[1] = 0;

var SerialPort = require("serialport").SerialPort
var serialPort = new SerialPort("/dev/ttyACM0", {
  baudRate: 115200, 
  dataBits: 8, 
  parity: 'none',
  stopBits: 1, 
  flowControl: false
}, false); // this is the openImmediately flag [default is true]

var cleanData = ''; // var for storing the clean data (without 'A' and 'B')
var readData = '';  // buffer storage


http.listen(8080, "192.168.254.128");
console.log("Listening on http://192.168.254.128:8080...");

// directs page requests to html files

function handler (req, res) {
fs.readFile(__dirname + '/USSerial02.html',
function (err, data) {
if (err) {
res.writeHead(500);
return res.end('Error loading index.html');
}

res.writeHead(200);
res.end(data);
});
}

io.sockets.on('connection', function(socket) {
    
serialPort.open(function (error) {
  if (error) {
    console.log('failed to open: '+error);
  } else {
    console.log('open');
    serialPort.on('data', function(data) { // call back when data is received
      readData += data.toString(); // append data to buffer
      // if the letters 'A' and 'B' are found on the buffer then isolate what's in the middle
      // as clean data. Then clear the buffer.
      if (readData.indexOf('\n') >= 0) {
        //cleanData = readData.substring(1, readData.indexOf('\n'));
        var SensCounter = 0;
        var SensorBuffer = '';
        for (var i=0;i!=readData.length;i++)
        {
            if (readData[i] == '=')
            {
                i++;
                while (i < readData.length)
                {
                    if (readData[i] == 'c' && readData[i+1] == 'm')
                    {
                        i=i+3;
                        break;
                    }
                    else
                    {
                        SensorBuffer += readData[i];
                        i++;
                    }
                }
                
                
                
                
                var tempvalue = parseFloat(SensorBuffer);
                if (tempvalue.isNaN) // check, if the transmitted value is NaN
                    tempvalue = 0;
                if (tempvalue == 0)
                    tempvalue = 200;
                //USSensor[SensCounter] = USSensor[SensCounter]*(1.0-SmoothingWeightUS) + tempvalue*SmoothingWeightUS;
                //USSensor[SensCounter] = SensorBuffer;
                //console.log(SensCounter + ' ' + USSensor[SensCounter]);
                //SensCounter++;
                
                
                
                USSensor[SensCounter] = tempvalue;
                //console.log(SensCounter + ' ' + USSensor[SensCounter]);
                SensCounter++;
                SensorBuffer = '';
            }
        }
        readData = readData.substring(0,readData.length-1);
        console.log(readData);
        //socket.emit("klientBeri", cleanData);
        socket.emit("klientBeri", USSensor);
        readData = '';
      }
    });            
      
      
      
      
      
      
      
      
    serialPort.write("ls\n", function(err, results) {
      console.log('err ' + err);
      console.log('results ' + results);
    });
  }
});    
    
    socket.on('disconnect', function() {
        socket.send('disconnected...');
    });
});


