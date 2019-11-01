/* eslint-disable no-unused-vars */
let it;
let filename;
let paused = 0;
const sendNextBlobPartEvent = new Event('sendPart');

function pause() {
    document.getElementById('start').hidden = false;
    document.getElementById('pause').hidden = true;
    paused = 1;
}

function start() {
    document.getElementById('start').hidden = true;
    document.getElementById('pause').hidden = false;
    paused = 0;
    iterate();
}

async function stop() {
    paused = 1;
    document.getElementById('submit').hidden = false;
    document.getElementById('start').hidden = true;
    document.getElementById('pause').hidden = true;
    document.getElementById('stop').hidden = true;
    const blob = new Blob(['']);
    const formData = new FormData();
    formData.append('data', blob);
    const response = await postData(formData, {
        stop: true,
        file: filename
    });
    console.log(response);
}

// generate a psudo-random name
function generateRandomFileName(length) {
    const str = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    filename = '';
    for (let i = 0; i < length; i++) {
        let index = Math.floor(Math.random() * str.length);
        filename += str[index];
    }
    const fileInp = document.getElementById('fileInp');
    const uploadFile = fileInp.files[0];
    filename += '-' + uploadFile.name;
}

async function createIteratorAndSend() {
    document.getElementById('submit').hidden = true;
    document.getElementById('pause').hidden = false;
    document.getElementById('stop').hidden = false;
    it = readFile();
    generateRandomFileName(32);
    await iterate();
}

function redirectTohref() {
    document.getElementById('link').href = `/uploads/${filename}`;
    return false;
}

// read uploaded file in chunks and reset buttons on finish
function* readFile() {
    const fileInp = document.getElementById('fileInp');
    const uploadFile = fileInp.files[0];
    const totalParts = Math.ceil(uploadFile.size / (10 * 1024 * 1024));

    let partSize = 10 * 1024 * 1024; // 10 MB
    for (let i = 1; i <= totalParts + 1; i++) {
        const blobPart = uploadFile.slice((i - 1) * partSize, i * partSize);
        yield blobPart;
    }
    
    document.getElementById('submit').hidden = false;
    document.getElementById('start').hidden = true;
    document.getElementById('pause').hidden = true;
    document.getElementById('stop').hidden = true;
}

window.addEventListener('sendPart', iterate);

async function iterate() {
    let result = it.next();
    console.log(result.done);
    if (!result.done) {
        const formData = new FormData();
        formData.append('uploadData', result.value, filename);
        const response = await postData(formData);
        console.log(response);
        if (!paused) {
            window.dispatchEvent(sendNextBlobPartEvent);
        }
    }
}

// Send the file on same route as POST
async function postData(data, headers = {}) {
    const url = document.location.href;
    // Default options are marked with *
    const response = await fetch(url, {
        method: 'POST', // *GET, POST, PUT, DELETE, etc
        body: data,
        headers: {
            ...headers
        }
    });
    return await response;
}
