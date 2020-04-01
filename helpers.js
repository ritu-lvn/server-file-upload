const fileFilter = function(req, file, cb) {
    // Accept below files only
    if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG|pdf|PDF|JSON|json|odt|ODT|txt|TXT)$/)) {

        req.fileValidationError = 'Only upload the files text, pdf, json and images';
        // res.status(400).send("Only upload the files text, pdf, json and images");
        // return
        return cb(new Error('Only upload the files text, pdf, json and images'));
    }
    cb(null);
};
exports.fileFilter = fileFilter;