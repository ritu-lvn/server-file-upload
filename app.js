const express = require('express');
var multer = require('multer');
const app = express();
var fs = require('fs');
var filesArr = [];
var cors = require('cors')

function getStandardResponse(status, message, data) {
    return {
        status: status,
        message: message,
        data: data
    }
}

var myStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads');
    },
    filename: function (req, file, cb) {
        console.log("INSIDE FILENAME")
        // cb(null, file.originalname)
        cb(null, file.originalname);
    }
})


var uploader = multer({ storage: myStorage });
app.use(cors());

app.get('/', function(req, res) {
    res.status(200).send('Welcome to file upload app');
    return

})

//API to list the uploaded files
app.get('/listfiles', function (req, res) {

    //Write to file 
    fs.readFile('./database.json', 'utf-8', function (err, data) {
        if (err) {
            res.status(400).send("Unable to read JSON file");
            return
        }

        if (data) {
            filesArr = JSON.parse(data); //now it an object 
            console.log(filesArr)
            res.status(200).send(filesArr);
            return
        } else {
            res.status(400).send(getStandardResponse(false, 'No files uploaded'));
            return
        }
    })

})


//API to upload the file
app.post('/uploadfile', uploader.single('myFile'), function (req, res) {

    const fileToUpload = req.file


    if (!fileToUpload) {
        res.status(400).send(getStandardResponse(false, 'Please upload a file'));
        return
    }

    if (fileToUpload.size > 1000000) {
        res.status(400).send(getStandardResponse(false, 'File size should be more than 1MB'));
        return
    }


    var generateFileId = "id" + Math.random().toString(16).slice(2);
    var fileObj = {
        "FileID": generateFileId,
        "FileName": fileToUpload.filename,
        "FileSize": fileToUpload.size,
        "FileUploadedDate": Date.now(),
        "FilePath": fileToUpload.path
    }


    //Write to file 
    fs.readFile('./database.json', 'utf-8', function (err, data) {
        if (err) {
            res.status(400).send(getStandardResponse(false, 'Unable to read JSON file'));
            return
        }

        if (data) {
            filesArr = JSON.parse(data); //now it an object 
        }


        const fileExist = filesArr.filter((item) => item.FileName === fileObj.FileName);
        if (fileExist.length > 0) {
            res.status(400).send(getStandardResponse(false, 'File already exist in the database'));
            return
        }

        console.log(fileExist);

        stringJson = JSON.stringify(fileObj);
        filesArr.push(JSON.parse(stringJson));

        //Write to file 
        fs.writeFile('./database.json', JSON.stringify(filesArr), 'utf-8', function (err) {
            if (err) {
                res.status(400).send(getStandardResponse(false, 'Unable to write JSON file'));
                return
            } else {
                res.status(200).send(getStandardResponse(true, 'File uploaded succesfully', fileObj));
                return
            }
        })
    })
})


//API to Delete a file
app.delete('/deletefile/:id', function (req, res) {

    const id = req.params.id;
    if (id) {
        //Write to file 
        fs.readFile('./database.json', 'utf-8', function (err, data) {
            if (err) {
                res.status(400).send(getStandardResponse(false, 'Unable to read JSON file'));
                return
            }

            if (data) {
                filesArr = JSON.parse(data); //now it an object
                const filteredFiles = filesArr.filter((file) => file.FileID !== id);
                const deletingFile = filesArr.filter((file) => file.FileID === id);
                if (deletingFile.length > 0) {
                    // Delete the file like normal
                    fs.unlinkSync(deletingFile[0].FilePath)
                } else {

                    res.status(400).send(getStandardResponse(false, 'No files found'));
                    return
                }

                filesArr = filteredFiles

                //Write to file 
                fs.writeFile('./database.json', JSON.stringify(filesArr), 'utf-8', function (err) {
                    if (err) {
                        res.status(400).send(getStandardResponse(false, 'Unable to write JSON file'));
                        return
                    } else {
                        res.status(200).send(getStandardResponse(true, 'File deleted successfully'));
                        return
                    }
                })
            } else {
                res.status(400).send(getStandardResponse(false, 'No files found'));
                return
            }
        })
    } else {
        res.status(400).send(getStandardResponse(false, 'ID should not be null'));
        return
    }
})

app.listen(process.env.PORT || 3000, function () {
    console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
});
// app.listen(3000)
