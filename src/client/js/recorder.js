import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';

const startBtn = document.getElementById('startBtn');
const video = document.getElementById('preview');

let stream;
let recorder;
let videoFile;

// const handleDownload = async () => {
//   const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.2/dist/umd';
//   const ffmpeg = new FFmpeg();
//   ffmpeg.on('log', ({ message }) => console.log(message));
//   const coreResponse = await fetch(`${baseURL}/ffmpeg-core.js`);
//   const wasmResponse = await fetch(`${baseURL}/ffmpeg-core.wasm`);
//   const coreBlob = new Blob([await coreResponse.text()], {
//     type: 'text/javascript',
//   });
//   const wasmBlob = new Blob([await wasmResponse.arrayBuffer()], {
//     type: 'application/wasm',
//   });
//   const coreURL = URL.createObjectURL(coreBlob);
//   const wasmURL = URL.createObjectURL(wasmBlob);
//   await ffmpeg.load({ coreURL, wasmURL });
//   await ffmpeg.writeFile('recording.webm', await fetchFile(videoFile));
//   await ffmpeg.exec(['-i', 'recording.webm', 'output.mp4']);
//   const mp4File = await ffmpeg.readFile('output.mp4');

//   console.log(mp4File);
//   console.log(mp4File.buffer);

//   const mp4Blob = new Blob([mp4File.buffer], { type: 'video/mp4' });
//   const mp4Url = URL.createObjectURL(mp4Blob);
//   const a = document.createElement('a');
//   a.href = mp4Url;
//   a.download = 'My recording.mp4';
//   document.body.appendChild(a);
//   a.click();
// };

const handleStop = () => {
  startBtn.innerText = 'Download Recording';
  startBtn.removeEventListener('click', handleStop);
  startBtn.addEventListener('click', handleDownload);
  recorder.stop();
};

const handleStart = () => {
  startBtn.innerText = 'Stop Recording';
  startBtn.removeEventListener('click', handleStart);
  startBtn.addEventListener('click', handleStop);

  recorder = new MediaRecorder(stream);
  recorder.ondataavailable = (event) => {
    videoFile = URL.createObjectURL(event.data);
    video.srcObject = null;
    video.src = videoFile;
    video.loop = true;
    video.play();
  };
  recorder.start();
};

const init = async () => {
  stream = await navigator.mediaDevices.getUserMedia({
    audio: false,
    video: { width: 500, height: 400 },
  });
  video.srcObject = stream;
  video.play();
};

init();

startBtn.addEventListener('click', handleStart);
