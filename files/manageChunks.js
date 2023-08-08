const fs = require('fs');
const path = require('path');

const removeAfterUpload = (filename, chunkId) => {
    return new Promise(async (resolve, reject) => {
        // Loop through the array of file paths and delete each file
        [filename, chunkId, chunkId + '.json'].forEach(filePath => {
            try {
                fs.unlinkSync(`./files/${filePath}`);
                resolve();
            } catch (error) {
                reject();
            }
        });
    })
}

const assembleChunks = (event) => {
    return new Promise(async (resolve, reject) => {
        const filename = event.filename;
        const id = event.file_id;


        // Construct the folder path using __dirname and folder name
        const folderPath = path.join(__dirname);

        const chunkFilePath = path.join(folderPath, id);
        const destinationFilePath = path.join(folderPath, filename);

        // Create a ReadStream from the source file
        const fileStream = fs.createReadStream(chunkFilePath);

        // Create a WriteStream to the destination file
        const writeStream = fs.createWriteStream(destinationFilePath);

        // Pipe the data from the ReadStream to the WriteStream
        fileStream.pipe(writeStream);

        // Listen for the 'finish' event to know when the data has been fully written
        writeStream.on('finish', () => {
            resolve();
        });
        writeStream.on('error', () => {
            reject();
        })
    })
}

module.exports = { removeAfterUpload, assembleChunks };