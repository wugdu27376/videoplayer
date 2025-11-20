function playVideo() {
    var videoUrl = document.getElementById('videoUrl').value.trim();
    var videoPlayer = document.getElementById('videoPlayer');
    var urlRadio = document.querySelector('input[name="source"][value="url"]');
    var saveUrl = localStorage.getItem('saveVideoUrl');
    
    if (videoUrl) {
        urlRadio.checked = true;
        var url = videoUrl;
        if (url.indexOf('://') === -1) {
            url = 'https://' + url;
        }
        videoPlayer.src = url;
        videoPlayer.load();
        
        if (saveUrl === 'true') {
            localStorage.setItem('savedVideoUrl', videoUrl);
        }
    }
}

function changeSpeed(speed) {
    var videoPlayer = document.getElementById('videoPlayer');
    videoPlayer.playbackRate = parseFloat(speed);
}

function changeDownloadChannel(channel) {
    localStorage.setItem('downloadChannel', channel);
}

function downloadVideo() {
    var videoUrl = document.getElementById('videoUrl').value.trim();
    var fileInput = document.getElementById('fileInput');
    var downloadChannel = localStorage.getItem('downloadChannel') || 'external';
    
    // 检查是否正在下载
    var existingProgress = document.getElementById('downloadProgress');
    if (existingProgress && window.currentXHR) {
        return; // 如果正在下载，不执行新的下载
    }
    
    // 移除已存在的下载进度显示（如果是已完成或错误的）
    if (existingProgress) {
        document.body.removeChild(existingProgress);
    }
    
    if (downloadChannel === 'external' && videoUrl) {
        var url = videoUrl;
        if (url.indexOf('://') === -1) {
            url = 'https://' + url;
        }
        window.open(url, '_blank');
    } else {
        if (videoUrl) {
            // 创建下载进度显示元素
            var progressDiv = document.createElement('div');
            progressDiv.id = 'downloadProgress';
            progressDiv.style.marginTop = '10px';
            progressDiv.innerHTML = '下载进度: Downloading...';
            document.body.appendChild(progressDiv);
            
            var xhr = new XMLHttpRequest();
            window.currentXHR = xhr; // 保存当前下载的XHR对象
            
            xhr.open('GET', videoUrl, true);
            xhr.responseType = 'blob';
            
            var progressTimer = setInterval(function() {
                if (xhr.total > 0) {
                    progressDiv.innerHTML = '下载进度: ' + 
                        (xhr.loaded / 1024 / 1024).toFixed(2) + 'MB / ' + 
                        (xhr.total / 1024 / 1024).toFixed(2) + 'MB';
                }
            }, 1000);
            
            xhr.onprogress = function(e) {
                if (e.lengthComputable) {
                    progressDiv.innerHTML = '下载进度: ' + 
                        (e.loaded / 1024 / 1024).toFixed(2) + 'MB / ' + 
                        (e.total / 1024 / 1024).toFixed(2) + 'MB';
                }
            };
            
            xhr.onload = function() {
                clearInterval(progressTimer);
                window.currentXHR = null; // 清除当前下载的XHR对象
                if (this.status === 200) {
                    var blob = this.response;
                    var reader = new FileReader();
                    reader.onloadend = function() {
                        if (progressDiv.parentNode) {
                            document.body.removeChild(progressDiv);
                        }
                        var a = document.createElement('a');
                        a.href = reader.result;
                        var fileName = videoUrl.split('/').pop().split('?')[0] || 'video.mp4';
                        a.download = fileName;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                    };
                    reader.readAsDataURL(blob);
                } else {
                    if (progressDiv.parentNode) {
                        document.body.removeChild(progressDiv);
                    }
                }
            };
            
            xhr.onerror = function() {
                clearInterval(progressTimer);
                window.currentXHR = null; // 清除当前下载的XHR对象
                if (progressDiv.parentNode) {
                    document.body.removeChild(progressDiv);
                }
            };
            
            xhr.send();
        } else if (fileInput.files.length > 0) {
            var file = fileInput.files[0];
            var reader = new FileReader();
            reader.onloadend = function() {
                var a = document.createElement('a');
                a.href = reader.result;
                a.download = file.name;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            };
            reader.readAsDataURL(file);
        }
    }
}

// 加载保存的下载通道设置
var savedDownloadChannel = localStorage.getItem('downloadChannel');
if (savedDownloadChannel) {
    var radio = document.querySelector('input[name="downloadChannel"][value="' + savedDownloadChannel + '"]');
    if (radio) radio.checked = true;
}

function adjustSize() {
    var videoPlayer = document.getElementById('videoPlayer');
    var isHLS = videoPlayer.src.indexOf('.m3u8') !== -1;
    
    if (!isHLS && videoPlayer.videoWidth === 0 && videoPlayer.videoHeight === 0) {
        videoPlayer.style.maxWidth = '530px';
        videoPlayer.style.maxHeight = '70px';
    } else {
        videoPlayer.style.maxWidth = '100%';
        videoPlayer.style.maxHeight = '100vh';
    }
}

function changeVolume(volume) {
    var videoPlayer = document.getElementById('videoPlayer');
    videoPlayer.volume = parseFloat(volume);
    localStorage.setItem('videoVolume', volume);
}

// 加载保存的音量设置
var savedVolume = localStorage.getItem('videoVolume');
if (savedVolume) {
    var videoPlayer = document.getElementById('videoPlayer');
    videoPlayer.volume = parseFloat(savedVolume);
    var radio = document.querySelector('input[name="volume"][value="' + savedVolume + '"]');
    if (radio) radio.checked = true;
}

function handleSourceChange(source) {
    var fileInput = document.getElementById('fileInput');
    var videoPlayer = document.getElementById('videoPlayer');
    var videoUrl = document.getElementById('videoUrl').value.trim();
    
    if (source === 'none') {
        videoPlayer.src = '';
        var speedRadio = document.querySelector('input[name="speed"][value="1.0"]');
        if (speedRadio) speedRadio.checked = true;
        videoPlayer.playbackRate = 1.0;
        fileInput.value = '';
        document.getElementById('videoUrl').value = '';
        localStorage.removeItem('savedVideoUrl');
    } else if (source === 'local') {
        fileInput.click();
    } else {
        if (videoUrl) {
            var url = videoUrl;
            if (url.indexOf('://') === -1) {
                url = 'https://' + url;
            }
            videoPlayer.src = url;
        } else {
            videoPlayer.src = '';
        }
    }
}

function handleFileSelect(files) {
    var videoPlayer = document.getElementById('videoPlayer');
    var urlRadio = document.querySelector('input[name="source"][value="url"]');
    
    if (files.length > 0) {
        var file = files[0];
        var objectURL = URL.createObjectURL(file);
        videoPlayer.src = objectURL;
        var speedRadio = document.querySelector('input[name="speed"][value="1.0"]');
        if (speedRadio) speedRadio.checked = true;
        localStorage.removeItem('savedVideoUrl');
        document.getElementById('videoUrl').value = '';
    } else {
        if (urlRadio) urlRadio.checked = true;
        videoPlayer.src = '';
    }
}

function changeLoop(loop) {
    var videoPlayer = document.getElementById('videoPlayer');
    videoPlayer.loop = loop === 'true';
    localStorage.setItem('videoLoop', loop);
}

// 加载保存的循环播放设置
var savedLoop = localStorage.getItem('videoLoop');
if (savedLoop) {
    var videoPlayer = document.getElementById('videoPlayer');
    videoPlayer.loop = savedLoop === 'true';
    var radio = document.querySelector('input[name="loop"][value="' + savedLoop + '"]');
    if (radio) radio.checked = true;
}

function changeAttachment(attachment) {
    localStorage.setItem('videoAttachment', attachment);
    
    if (attachment === 'hls') {
        var script = document.createElement('script');
        script.src = 'https://unpkg.com/hls.js@latest';
        script.onload = function() {
            if (window.Hls && Hls.isSupported()) {
                var videoPlayer = document.getElementById('videoPlayer');
                var hls = new Hls();
                hls.loadSource(videoPlayer.src);
                hls.attachMedia(videoPlayer);
            }
        };
        document.head.appendChild(script);
    }
}

// 加载保存的附件设置
var savedAttachment = localStorage.getItem('videoAttachment');
if (savedAttachment) {
    var radio = document.querySelector('input[name="attachment"][value="' + savedAttachment + '"]');
    if (radio) radio.checked = true;
    if (savedAttachment === 'hls') {
        changeAttachment('hls');
    }
}

function changeSaveUrl(saveUrl) {
    localStorage.setItem('saveVideoUrl', saveUrl);
    if (saveUrl === 'false') {
        localStorage.removeItem('savedVideoUrl');
    }
}

// 加载保存的链接设置和视频链接
var savedSaveUrl = localStorage.getItem('saveVideoUrl');
if (savedSaveUrl) {
    var radio = document.querySelector('input[name="saveUrl"][value="' + savedSaveUrl + '"]');
    if (radio) radio.checked = true;
}

var savedVideoUrl = localStorage.getItem('savedVideoUrl');
if (savedVideoUrl && localStorage.getItem('saveVideoUrl') === 'true') {
    document.getElementById('videoUrl').value = savedVideoUrl;
    var videoPlayer = document.getElementById('videoPlayer');
    var url = savedVideoUrl;
    if (url.indexOf('://') === -1) {
        url = 'https://' + url;
    }
    videoPlayer.src = url;
    var urlRadio = document.querySelector('input[name="source"][value="url"]');
    if (urlRadio) urlRadio.checked = true;
}

function handleKeyPress(event) {
    if (event.key === 'Enter') {
        var videoUrl = document.getElementById('videoUrl');
        if (videoUrl.value.trim() !== '') {
            playVideo();
            videoUrl.blur();
        }
    }
}