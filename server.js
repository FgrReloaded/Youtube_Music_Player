const request = require('request');
const fs = require('fs');
const ytdl = require('ytdl-core');
const express = require("express");
const app = express()
const port = process.env.PORT || 2000
let stream;



// Serve index.html page to client
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static(__dirname + '/public'));
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});



// Function to download the song
app.post('/download', (req, res) => {
    let url = req.body.url;
    let title = req.body.title;
    let filename = `${title}.mp3`;
    // download file and sent to client
    ytdl(url, {
        format: 'mp3',
        filter: 'audioonly',
    }).pipe(res);
    // download file and save to server
    // ytdl(url, {
    //     format: 'mp3',
    //     filter: 'audioonly',
    // }).pipe(fs.createWriteStream(`./public/songs/${filename}`));
    
})


app.listen(port, () => {
    console.log(`Server running at port ${port}`)
})