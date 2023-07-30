/**
 * 自动获取目标视频元素
 * @return {HTMLVideoElement}
 */
function getMainVideoElement() {
  const videoEls = document.querySelectorAll("video");
  if (!videoEls.length) return undefined;
  // 认为宽度最大的 video 元素为目标元素
  let el = videoEls[0];
  for (let i = 1; i < videoEls.length; ++i) {
    if (videoEls[i].width > res.width) {
      el = videoEls[i];
    }
  }
  return el;
}

/**
 * 捕获媒体流
 * @param {HTMLVideoElement} videoEl
 * @return {MediaStream}
 */
function captureMediaStream(videoEl) {
  return videoEl.captureStream();
}

/**
 * 创建录制器
 * @param {MediaStream} mediaStream
 * @return {MediaRecorder}
 */
function createRecorder(mediaStream) {
  const recorder = new MediaRecorder(mediaStream);
  const chunks = [];

  recorder.ondataavailable = (e) => {
    if (e.data.size > 0) chunks.push(e.data);
  };

  function downloadFile(filename, chunks) {
    const url = URL.createObjectURL(new Blob(chunks));
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
  recorder.onstop = () => {
    downloadFile("download.webm", chunks);
  };

  return recorder;
}

function main() {
  const videoEl = window.videoEl ? window.videoEl : getMainVideoElement();
  if (!videoEl) {
    throw new Error("未指定目标视频元素");
  }

  const mediaStream = captureMediaStream(videoEl);
  console.log(mediaStream?.getVideoTracks()[0]?.getSettings());

  const recorder = createRecorder(mediaStream);

  const startRecord = () => {
    recorder.start();
  };

  const stopRecord = () => {
    recorder.stop();
    videoEl.pause();
    document.body.removeChild(controlPanel);
  };

  const startFromBegin = () => {
    videoEl.currentTime = 0;
    videoEl.play();
  };

  /**
   * 渲染控制面板
   */
  const controlPanel = document.createElement("div");
  controlPanel.style.cssText = `display: flex; flex-direction: column; padding: 16px; background-color: #FFF; border: 1px solid #000; position: absolute; top: 5rem; left: 5rem; z-index: 999;`;

  const playBtn = document.createElement("button");
  playBtn.innerText = "从头播放";
  playBtn.onclick = startFromBegin;
  playBtn.style.cssText = "margin-bottom: 8px;";

  const startBtn = document.createElement("button");
  startBtn.innerText = "开始录制";
  startBtn.onclick = startRecord;
  startBtn.style.cssText = "margin-bottom: 8px;";

  const stopBtn = document.createElement("button");
  stopBtn.innerText = "结束录制";
  stopBtn.onclick = stopRecord;

  controlPanel.appendChild(playBtn);
  controlPanel.appendChild(startBtn);
  controlPanel.appendChild(stopBtn);

  document.body.insertBefore(controlPanel, document.body.firstChild);
}

// 提示用户自主设定 window.videoEl
console.log("请设定 window.videoEl 并执行 main() 以使用");
