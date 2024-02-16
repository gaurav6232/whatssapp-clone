// const mongoose = require('mongoose');

// const msgSchema = mongoose.Schema({
//     data: String,           // Assuming you want to store text messages
//     fromUser: String,
//     toUser: String,
//     messageType: {
//         type: String,
//         enum: ['text', 'image', 'video', 'document'],  // Define the types of messages
//     },
//     file: {
//         path: String,        // Store the path or URL to the file
//         originalName: String, // Store the original file name
//     },
//     timestamp: {
//         type: Date,
//         default: Date.now,
//     },
// });

// module.exports = mongoose.model('msg', msgSchema);



const mongoose = require('mongoose');

const msgSchema = mongoose.Schema({
    data: String,           // Assuming you want to store text messages
    fromUser: String,
    toUser: String,
    messageType: {
        type: String,
        enum: ['text', 'image', 'video', 'document'],  // Define the types of messages
    },
    file: {
        data: Buffer,        // Store the file data as a Buffer
        contentType: String, // Store the content type (e.g., image/jpeg, video/mp4, application/pdf)
        originalName: String, // Store the original file name
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('msg', msgSchema);
