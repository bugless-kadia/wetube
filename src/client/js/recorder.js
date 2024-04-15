import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';

const actionBtn = document.getElementById('actionBtn');
const video = document.getElementById('preview');

let stream;
let recorder;
let videoFile;

const files = {
  input: 'recording.webm',
  output: 'output.mp4',
  thumb: 'thumbnail.jpg',
};

const downloadFile = (fileUrl, fileName) => {
  const a = document.createElement('a');
  a.href = fileUrl;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
};

const handleDownload = async () => {
  actionBtn.removeEventListener('click', handleDownload);
  actionBtn.innerText = 'Transcoding...';
  actionBtn.disabled = true;

  const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.2/dist/umd';
  const ffmpeg = new FFmpeg();
  ffmpeg.on('log', ({ message }) => console.log(message));

  // 마법의 코드
  const coreResponse = await fetch(`${baseURL}/ffmpeg-core.js`);
  const wasmResponse = await fetch(`${baseURL}/ffmpeg-core.wasm`);
  const coreBlob = new Blob([await coreResponse.text()], {
    type: 'text/javascript',
  });
  const wasmBlob = new Blob([await wasmResponse.arrayBuffer()], {
    type: 'application/wasm',
  });
  const coreURL = URL.createObjectURL(coreBlob);
  const wasmURL = URL.createObjectURL(wasmBlob);

  await ffmpeg.load({ coreURL, wasmURL });

  await ffmpeg.writeFile(files.input, await fetchFile(videoFile));
  await ffmpeg.exec(['-i', files.input, '-r', '60', files.output]);

  await ffmpeg.exec([
    '-i',
    files.input,
    '-ss',
    '00:00:01',
    '-frames:v',
    '1',
    files.thumb,
  ]);
  const thumbFile = await ffmpeg.readFile(files.thumb);
  const thumbBlob = new Blob([thumbFile.buffer], { type: 'image/jpg' });
  const thumbUrl = URL.createObjectURL(thumbBlob);

  const mp4File = await ffmpeg.readFile(files.output);
  console.log(mp4File);
  console.log(mp4File.buffer);

  const mp4Blob = new Blob([mp4File.buffer], { type: 'video/mp4' });
  const mp4Url = URL.createObjectURL(mp4Blob);

  downloadFile(mp4Url, 'MyRecording.mp4');
  downloadFile(thumbUrl, 'MyThumbnail.jpg');

  const deleteR = await ffmpeg.deleteFile(files.input);
  const deleteO = await ffmpeg.deleteFile(files.output);
  const deleteT = await ffmpeg.deleteFile(files.thumb);
  console.log(deleteR, deleteO, deleteT);

  URL.revokeObjectURL(mp4Url);
  URL.revokeObjectURL(thumbUrl);
  URL.revokeObjectURL(videoFile);

  actionBtn.disabled = false;
  actionBtn.innerText = 'record Again';
  actionBtn.addEventListener('click', handleStart);
};

const handleStart = () => {
  actionBtn.innerText = 'Recording';
  actionBtn.disabled = true;
  actionBtn.removeEventListener('click', handleStart);

  recorder = new MediaRecorder(stream);
  recorder.ondataavailable = (event) => {
    videoFile = URL.createObjectURL(event.data);
    video.srcObject = null;
    video.src = videoFile;
    video.loop = true;
    video.play();
    actionBtn.innerText = 'Download';
    actionBtn.disabled = false;
    actionBtn.addEventListener('click', handleDownload);
  };
  recorder.start();
  setTimeout(() => {
    recorder.stop();
  }, 3000);
};

const init = async () => {
  stream = await navigator.mediaDevices.getUserMedia({
    audio: false,
    video: { width: 1024, height: 576 },
  });
  video.srcObject = stream;
  video.play();
};

init();

actionBtn.addEventListener('click', handleStart);
