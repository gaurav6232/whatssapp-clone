// const io = require( "socket.io" )();
// const { disconnect } = require("mongoose");
// const user = require('./routes/users.js')
// var msgModel = require('./routes/msg.js')

// const socketapi = {
//     io: io
// };

// // Add your socket.io logic here!
// io.on( "connection", function( socket ) {
//     console.log( "A user connected" );
//     socket.on('userConnected', async msg =>{
//         var connectedUser = await user.findOne({
//             username: msg.username
//         })
//         connectedUser.currentSocket = socket.id
//         await connectedUser.save()
//     })

//     socket.on('newmsg', async msg =>{
//         var toUser = await user.findOne({
//             username: msg.toUser
//         })
//         var fromUser = await user.findOne({
//             username: msg.fromUser
//         })
//         var indexOfFromUser = toUser.chats.indexOf(fromUser._id)

//         if(indexOfFromUser == -1){

//             toUser.chats.push(fromUser._id)
//             fromUser.chats.push(toUser._id)
//             await toUser.save()
//             await fromUser.save()
//             msg.NewChat = true
//         }

//         msg.fromUserPic = fromUser.pic

//         var newMsg = await msgModel.create({
//             data: msg.msg,
//             // messageType:  messageType.images,video,document,
//             toUser: toUser.username,
//             fromUser: fromUser.username
//         })

//         if (toUser.currentSocket)
//         socket.to(toUser.currentSocket).emit('msg', msg)
//     })
//     socket.on('disconnect', async () =>{
//         var disconnectedUser = await user.findOneAndUpdate({
//             currentSocket: socket.id
//         },{
//             currentSocket: ""
//         })
//    })

// });
// // end of socket.io logic

// module.exports = socketapi;



const io = require("socket.io")();
const user = require('./routes/users.js');
const msgModel = require('./routes/msg.js');

const socketapi = {
    io: io
};

// Add your socket.io logic here!
io.on("connection", function (socket) {
    console.log("A user connected");

    socket.on('userConnected', async msg => {
        var connectedUser = await user.findOne({
            username: msg.username
        });
        connectedUser.currentSocket = socket.id;
        await connectedUser.save();
    });

    socket.on('newmsg', async msg => {
        var toUser = await user.findOne({
            username: msg.toUser
        });
        var fromUser = await user.findOne({
            username: msg.fromUser
        });
        var indexOfFromUser = toUser.chats.indexOf(fromUser._id);

        if (indexOfFromUser == -1) {
            toUser.chats.push(fromUser._id);
            fromUser.chats.push(toUser._id);
            await toUser.save();
            await fromUser.save();
            msg.NewChat = true;
        }

        msg.fromUserPic = fromUser.pic;

        var messageType = 'text'; // Default message type is text

        // Check if the message has a file and determine its type
        if (msg.file) {
            messageType = msg.fileType; // Set messageType based on the fileType
            msg.file.data = Buffer.from(msg.file.data, 'base64'); // Convert base64 to Buffer
        }

        var newMsg = await msgModel.create({
            data: msg.msg,
            messageType: messageType,
            toUser: toUser.username,
            fromUser: fromUser.username,
            file: msg.file // Assuming msg.file contains the necessary file information
        });

        if (toUser.currentSocket)
            socket.to(toUser.currentSocket).emit('msg', msg);
    });

    socket.on('disconnect', async () => {
        var disconnectedUser = await user.findOneAndUpdate({
            currentSocket: socket.id
        }, {
            currentSocket: ""
        });
    });

});

// end of socket.io logic

module.exports = socketapi;
