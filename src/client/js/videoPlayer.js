const video = document.querySelector('video');
const playBtn = document.getElementById('play');
const playBtnIcon = playBtn.querySelector('i');
const muteBtn = document.getElementById('mute');
const muteBtnIcon = muteBtn.querySelector('i');
const volumeRange = document.getElementById('volume');
const currentTime = document.getElementById('currentTime');
const totalTime = document.getElementById('totalTime');
const timeline = document.getElementById('timeline');
const fullScreenBtn = document.getElementById('fullScreen');
const fullScreenIcon = fullScreenBtn.querySelector('i');
const videoContainer = document.getElementById('videoContainer');
const videoControls = document.getElementById('videoControls');
const textarea = document.querySelector('textarea');

let controlsTimeout = null;
let controlsMovementTimeout = null;
let volumeValue = 0.5;
video.volume = volumeValue;

const handlePlayClick = (event) => {
  if (video.paused) {
    video.play();
  } else {
    video.pause();
  }
  playBtnIcon.classList = video.paused ? 'fas fa-play' : 'fas fa-pause';
};

const handleMuteClick = (event) => {
  if (video.muted) {
    video.muted = false;
  } else {
    video.muted = true;
  }
  muteBtnIcon.classList = video.muted
    ? 'fas fa-volume-mute'
    : 'fas fa-volume-up';
  volumeRange.value = video.muted ? 0 : volumeValue;
};

const handleVolumeChange = (event) => {
  const {
    target: { value },
  } = event;
  if (video.muted) {
    video.muted = false;
    muteBtn.innerText = 'Mute';
  }
  volumeValue = value;
  video.volume = value;
};

const formatTime = (seconds) =>
  new Date(seconds * 1000).toISOString().substring(14, 19);

const handleLoadedMetadata = () => {
  totalTime.innerText = formatTime(Math.floor(video.duration));
  timeline.max = Math.floor(video.duration);
};

const handleTimeUpdate = () => {
  currentTime.innerText = formatTime(Math.floor(video.currentTime));
  timeline.value = Math.floor(video.currentTime); // currentTime을 range에 가져오고 있음
};

const handleTimelineChange = (event) => {
  const {
    target: { value },
  } = event;
  video.currentTime = value; // currentTime에 range 값을 알려주고 있음
};

const handleFullscreen = () => {
  const fullscreen = document.fullscreenElement;
  if (fullscreen) {
    document.exitFullscreen();
    fullScreenIcon.classList = 'fas fa-expand';
  } else {
    videoContainer.requestFullscreen();
    fullScreenIcon.classList = 'fas fa-compress';
  }
};

const checkFullScreen = () => {
  const fullscreen = document.fullscreenElement;
  if (!fullscreen) {
    fullScreenBtn.innerText = 'Enter Full Screen';
  }
};

const hideControls = () => videoControls.classList.remove('showing');

// 비디오 위에서 마우스를 움직일 때 showing class를 주기 위한 함수
const handleMouseMove = () => {
  if (controlsTimeout) {
    clearTimeout(controlsTimeout);
    controlsTimeout = null;
  }
  // 비디오 위에서 마우스를 움직일 때마다 timeout 취소(2)
  if (controlsMovementTimeout) {
    clearTimeout(controlsMovementTimeout);
    controlsMovementTimeout = null;
  }
  // 비디오 위에서 마우스를 움직일 때마다 timeout 생성(1)
  videoControls.classList.add('showing');
  controlsMovementTimeout = setTimeout(hideControls, 3000);
};

const handleMouseLeave = () => {
  controlsTimeout = setTimeout(hideControls, 3000);
};

const handleEnded = () => {
  const { id } = videoContainer.dataset;
  fetch(`/api/videos/${id}/view`, {
    method: 'POST',
  });
};

playBtn.addEventListener('click', handlePlayClick);
muteBtn.addEventListener('click', handleMuteClick);
volumeRange.addEventListener('input', handleVolumeChange);
video.readyState
  ? handleLoadedMetadata()
  : video.addEventListener('loadeddata', handleLoadedMetadata);
video.addEventListener('timeupdate', handleTimeUpdate);
timeline.addEventListener('input', handleTimelineChange);
fullScreenBtn.addEventListener('click', handleFullscreen);
video.addEventListener('ended', handleEnded);
videoContainer.addEventListener('mousemove', handleMouseMove);
videoContainer.addEventListener('mouseleave', handleMouseLeave);
document.addEventListener('keydown', (event) => {
  if (event.target !== textarea) {
    if (event.code === 'Space') {
      event.preventDefault(); // 화면 내려감 방지
      handlePlayClick();
    }
    if (event.key === 'f') {
      handleFullscreen();
    }
    if (event.key === 'm') {
      handleMuteClick();
    }
  }
});
document.addEventListener('fullscreenchange', checkFullScreen);
video.addEventListener('click', handlePlayClick);
