function togglePause() {
    var videoPlayer = document.getElementById('videoPlayer');
    var pauseIcon = document.querySelector('#controlPauseBtn i');
    var controlPauseBtn = document.getElementById('controlPauseBtn');
    
    if (videoPlayer.paused) {
        videoPlayer.play();
        pauseIcon.className = 'fa fa-pause';
        // 更新文字模式下的按钮文字
        if (controlPauseBtn && localStorage.getItem('buttonDisplay') === 'text') {
            controlPauseBtn.innerHTML = '<b>暂停</b>';
        }
    } else {
        videoPlayer.pause();
        pauseIcon.className = 'fa fa-play';
        // 更新文字模式下的按钮文字
        if (controlPauseBtn && localStorage.getItem('buttonDisplay') === 'text') {
            controlPauseBtn.innerHTML = '<b>播放</b>';
        }
    }
}

function playVideo() {
    var videoPlayer = document.getElementById('videoPlayer');
    var controlPauseBtn = document.getElementById('controlPauseBtn');
    
    // 当视频为非暂停状态时自动暂停视频
    if (videoPlayer && !videoPlayer.paused) {
        videoPlayer.pause();
    }
    
    var videoUrl = document.getElementById('videoUrl').value.trim();
    var videoPlayer = document.getElementById('videoPlayer');
    var urlRadio = document.querySelector('input[name="source"][value="url"]');
    var saveUrl = localStorage.getItem('saveVideoUrl');
    var attachment = localStorage.getItem('videoAttachment') || 'none';
    
    // 播放下一个链接时清除之前保存的播放时间
    var savedVideoUrl = localStorage.getItem('savedVideoUrl');
    var currentVideoUrl = videoUrl;
    if (currentVideoUrl && savedVideoUrl && currentVideoUrl !== savedVideoUrl) {
        // 如果输入的新链接与保存的链接不同，清除保存的播放时间
        localStorage.removeItem('savedVideoTime_' + savedVideoUrl);
        console.log('播放下一个链接，清除之前保存的播放时间');
    }
    
    // 检查controlPauseBtn按钮是否为暂停显示，不是将此按钮改为弹出状态显示
    if (controlPauseBtn) {
        var pauseIcon = controlPauseBtn.querySelector('i');
        var buttonDisplay = localStorage.getItem('buttonDisplay') || 'icon';
        
        if (buttonDisplay === 'icon') {
            // 图标模式
            if (pauseIcon && pauseIcon.className !== 'fa fa-play') {
                pauseIcon.className = 'fa fa-play';
            }
        } else if (buttonDisplay === 'text') {
            // 文字模式
            if (controlPauseBtn.innerHTML !== '<b>播放</b>') {
                controlPauseBtn.innerHTML = '<b>播放</b>';
            }
        }
    }
    
    var videoUrl = document.getElementById('videoUrl').value.trim();
    var videoPlayer = document.getElementById('videoPlayer');
    var urlRadio = document.querySelector('input[name="source"][value="url"]');
    var saveUrl = localStorage.getItem('saveVideoUrl');
    var attachment = localStorage.getItem('videoAttachment') || 'none';
    
    if (videoUrl) {
        urlRadio.checked = true;
        var url = videoUrl;
        if (url.indexOf('://') === -1) {
            url = 'https://' + url;
        }
        videoPlayer.src = url;
        videoPlayer.currentTime = 0;
        videoPlayer.load();
        updateButtonsStatePartEl();
        
        // 检查是否需要跳转到上次播放时间
        var savedVideoUrl = localStorage.getItem('savedVideoUrl');
        var savedVideoTime = localStorage.getItem('savedVideoTime_' + savedVideoUrl);
        
        // 只有当保存的链接与当前链接完全一致时才跳转
        if (savedVideoUrl && savedVideoUrl === videoUrl && savedVideoTime) {
            // 设置一个标记，表示这是需要跳转的视频
            videoPlayer.dataset.shouldRestoreTime = 'true';
            
            // 监听视频加载完成事件来跳转时间
            var restoreTimeHandler = function() {
                if (videoPlayer.dataset.shouldRestoreTime === 'true') {
                    var time = parseFloat(savedVideoTime);
                    if (!isNaN(time) && time > 0) {
                        // 延迟一点确保视频可以跳转
                        setTimeout(function() {
                            if (videoPlayer.duration && time < videoPlayer.duration) {
                                videoPlayer.currentTime = time;
                                console.log('跳转到上次播放时间：' + time + '秒');
                            }
                            // 移除标记和事件监听
                            delete videoPlayer.dataset.shouldRestoreTime;
                            videoPlayer.removeEventListener('loadedmetadata', restoreTimeHandler);
                        }, 300);
                    }
                }
            };
            
            videoPlayer.addEventListener('loadedmetadata', restoreTimeHandler);
        }
        
        // 新增：检查是否为m3u8视频链接，如果是则启用按钮
        if (url.indexOf('.m3u8') !== -1) {
            setTimeout(function() {
                var controlBtn = document.getElementById('controlPauseBtn');
                var skipBtns = document.querySelectorAll('.skipSecondsBtn');
                var downloadBtn = document.getElementById('downloadVideoBtn');
                
                if (controlBtn) controlBtn.disabled = false;
                
                for (var i = 0; i < skipBtns.length; i++) {
                    skipBtns[i].disabled = false;
                }
                
                if (downloadBtn) {
                    downloadBtn.disabled = false;
                    downloadBtn.style.display = 'block';
                }
                
                // 如果视频当前是隐藏的，更新时间显示
                if (videoPlayer.style.display === 'none' || getComputedStyle(videoPlayer).display === 'none') {
                    updateTimeDisplay();
                }
            }, 500);
        }
        
        // 无论视频是否显示，都启用按钮
        setTimeout(function() {
            if (isVideoValid) {
                var controlBtn = document.getElementById('controlPauseBtn');
                var skipBtns = document.querySelectorAll('.skipSecondsBtn');
                var downloadBtn = document.getElementById('downloadVideoBtn');
                
                if (controlBtn) controlBtn.disabled = false;
                
                for (var i = 0; i < skipBtns.length; i++) {
                    skipBtns[i].disabled = false;
                }
                
                if (downloadBtn) {
                    downloadBtn.disabled = false;
                    downloadBtn.style.display = 'block';
                }
                
                // 如果视频当前是隐藏的，更新时间显示
                if (videoPlayer.style.display === 'none' || getComputedStyle(videoPlayer).display === 'none') {
                    updateTimeDisplay();
                }
            }
        }, 500);
        
        if (attachment === 'hls' && url.indexOf('.m3u8') !== -1) {
            if (typeof Hls === 'undefined') {
                var script = document.createElement('script');
                script.src = 'https://unpkg.com/hls.js@latest';
                script.onload = function() {
                    if (Hls.isSupported()) {
                        var hls = new Hls();
                        hls.loadSource(url);
                        hls.attachMedia(videoPlayer);
                    } else if (videoPlayer.canPlayType('application/vnd.apple.mpegurl')) {
                        videoPlayer.src = url;
                    }
                };
                document.head.appendChild(script);
            } else {
                if (Hls.isSupported()) {
                    var hls = new Hls();
                    hls.loadSource(url);
                    hls.attachMedia(videoPlayer);
                } else if (videoPlayer.canPlayType('application/vnd.apple.mpegurl')) {
                    videoPlayer.src = url;
                }
            }
        }
        
        // 如果视频被隐藏，设置定时器更新时间显示
        var displayVideoCheckbox = document.getElementById('displayVideoCheckbox');
        if (displayVideoCheckbox && !displayVideoCheckbox.checked) {
            // 视频隐藏时的处理
            setTimeout(function() {
                // 设置定时器尝试获取视频时间信息
                var timeUpdateAttempts = 0;
                var timeUpdateInterval = setInterval(function() {
                    timeUpdateAttempts++;
                    
                    // 检查视频是否已加载了部分数据
                    if (videoPlayer.readyState >= 1) { // HAVE_CURRENT_DATA
                        updateTimeDisplay();
                        
                        // 如果已获取到有效时长，清除定时器
                        if (videoPlayer.duration > 0 && !isNaN(videoPlayer.duration)) {
                            clearInterval(timeUpdateInterval);
                        }
                    }
                    
                    // 10次尝试后停止（5秒）
                    if (timeUpdateAttempts >= 10) {
                        clearInterval(timeUpdateInterval);
                    }
                }, 500);
            }, 100);
        }
        
        var autoPlayCheckbox = document.getElementById('autoPlayCheckbox');
        // 移除之前可能存在的onloadeddata事件处理器
        videoPlayer.onloadeddata = null;
        if (autoPlayCheckbox && autoPlayCheckbox.checked) {
            videoPlayer.onloadeddata = function() {
                videoPlayer.play().catch(function(e) {
                    console.log('自动播放失败:', e);
                });
            };
        }
        
        if (saveUrl === 'true') {
            localStorage.setItem('savedVideoUrl', videoUrl);
        }
    }
}

function updateButtonsStatePart() {
    var downloadBtn = document.getElementById('downloadVideoBtn');
    var controlBtn = document.getElementById('controlPauseBtn');
    var skipBtns = document.querySelectorAll('.skipSecondsBtn');
    
    if (downloadBtn) {
        downloadBtn.disabled = false;
        downloadBtn.style.display = 'block';
        // 确保按钮有相对定位以容纳提示
        downloadBtn.style.position = 'relative';
    }
    
    // 确保控制按钮也启用
    if (controlBtn) controlBtn.disabled = false;
    
    // 确保快进/快退按钮也启用
    for (var i = 0; i < skipBtns.length; i++) {
        skipBtns[i].disabled = false;
    }
}

function updateButtonsStatePartEl() {
    var downloadBtn = document.getElementById('downloadVideoBtn');
    var controlBtn = document.getElementById('controlPauseBtn');
    var skipBtns = document.querySelectorAll('.skipSecondsBtn');
    
    if (downloadBtn) {
        downloadBtn.disabled = true;
        downloadBtn.style.display = 'none';
    }
    
    if (controlBtn) controlBtn.disabled = true;
    
    // 兼容旧版浏览器的循环方式
    for (var i = 0; i < skipBtns.length; i++) {
        skipBtns[i].disabled = true;
    }
}

function updateButtonsStatePartEy() {
    if (document.getElementById('videoUrl').value !== '') {
        document.getElementById('playVideoBtn').disabled = false;
    } else {
        document.getElementById('playVideoBtn').disabled = true;
    }
}

function changeSpeed(speed) {
    var videoPlayer = document.getElementById('videoPlayer');
    videoPlayer.playbackRate = parseFloat(speed);
}

function handleCustomSpeed() {
    var videoPlayer = document.getElementById('videoPlayer');
    var customSpeedRadio = document.getElementById('customSpeedRadio');
    var editSpeedDiv = document.getElementById('editSpeedDiv');
    var customSpeedText = document.getElementById('customSpeedText');
    
    if (customSpeedRadio && customSpeedRadio.checked) {
        // 检查是否已设置自定义倍速
        var savedCustomSpeed = localStorage.getItem('customSpeedValue');
        var savedCustomSpeedText = localStorage.getItem('customSpeedText');
        
        // 如果已设置自定义倍速，直接应用，不弹出提示
        if (savedCustomSpeed && savedCustomSpeedText) {
            videoPlayer.playbackRate = parseFloat(savedCustomSpeed);
            if (customSpeedText) {
                customSpeedText.textContent = savedCustomSpeedText;
            }
            // 显示 edit 选项
            if (editSpeedDiv) {
                editSpeedDiv.style.display = 'inline-block';
            }
            return;
        }
        
        // 保存当前播放状态
        var wasPlaying = !videoPlayer.paused;
        // 如果正在播放，暂停视频
        if (wasPlaying) {
            videoPlayer.pause();
        }
        
        // 获取当前播放速率，如果未保存自定义倍速，则使用空值或当前播放速率
        var defaultSpeedValue = '';
        var currentSpeed = videoPlayer.playbackRate;
        
        // 使用 prompt 提示输入倍速
        var defaultSpeedValue = '';
        var savedCustomSpeed = localStorage.getItem('customSpeedValue');
        
        // 如果有保存的自定义倍速值，使用它作为默认值
        if (savedCustomSpeed) {
            defaultSpeedValue = savedCustomSpeed;
        } else {
            // 否则使用当前播放速率
            defaultSpeedValue = '';
        }
        
        // 使用 prompt 提示输入倍速
        var speedInput = prompt('请输入自定义倍速 (0.063 - 16.0):', defaultSpeedValue);
        
        // 恢复播放状态
        if (wasPlaying) {
            videoPlayer.play();
        }
        
        // 如果用户取消或关闭提示，取消选择 custom 选项
        if (speedInput === null) {
            // 取消时选回为当前选择倍速
            var currentSpeed = videoPlayer.playbackRate;
            
            // 查找当前播放速率对应的单选按钮
            var speedRadios = document.querySelectorAll('input[name="speed"]');
            var foundRadio = null;
            
            for (var i = 0; i < speedRadios.length; i++) {
                var radio = speedRadios[i];
                var radioValue = parseFloat(radio.value);
                
                // 跳过custom和edit选项
                if (radio.value === 'custom' || radio.value === 'edit') {
                    continue;
                }
                
                // 检查是否匹配当前播放速率
                if (Math.abs(radioValue - currentSpeed) < 0.01) {
                    foundRadio = radio;
                    break;
                }
            }
            
            // 如果找到匹配的按钮，选中它
            if (foundRadio) {
                foundRadio.checked = true;
            } else {
                // 如果没有找到，选择1.0x
                var defaultSpeedRadio = document.querySelector('input[name="speed"][value="1.0"]');
                if (defaultSpeedRadio) {
                    defaultSpeedRadio.checked = true;
                }
            }
            
            customSpeedRadio.checked = false;
            return;
        }
        
        // 如果输入为空，选择1.0倍速
        if (speedInput.trim() === '') {
            var defaultSpeedRadio = document.querySelector('input[name="speed"][value="1.0"]');
            if (defaultSpeedRadio) {
                defaultSpeedRadio.checked = true;
                videoPlayer.playbackRate = 1.0;
            }
            customSpeedRadio.checked = false;
            return;
        }
        
        // 验证输入
        var speed = parseFloat(speedInput);
        if (isNaN(speed) || speed < 0.063 || speed > 16.0) {
            console.log('请输入有效的倍速值 (0.063 - 16.0)');
            // 取消选择 custom 选项，恢复默认 1.0x
            var defaultSpeedRadio = document.querySelector('input[name="speed"][value="1.0"]');
            if (defaultSpeedRadio) {
                defaultSpeedRadio.checked = true;
                videoPlayer.playbackRate = 1.0;
            }
            customSpeedRadio.checked = false;
            return;
        }
        
        // 应用自定义倍速
        videoPlayer.playbackRate = speed;
        
        // 更新显示文本
        if (customSpeedText) {
            // 动态计算小数位数
            var speedText = formatSpeedDecimal(speed) + 'x';
            customSpeedText.textContent = speedText;
            // 保存到本地存储 - 使用格式化后的数值部分
            localStorage.setItem('customSpeedValue', speed.toString().indexOf('.') === -1 ? speed.toFixed(1) : speed.toString());
            localStorage.setItem('customSpeedText', speedText);
        }
        
        // 显示 edit 选项
        if (editSpeedDiv) {
            editSpeedDiv.style.display = 'inline-block';
        }
    }
}

function handleEditSpeed() {
    var videoPlayer = document.getElementById('videoPlayer');
    var editSpeedRadio = document.getElementById('editSpeedRadio');
    var customSpeedText = document.getElementById('customSpeedText');
    var customSpeedRadio = document.getElementById('customSpeedRadio');
    var editSpeedDiv = document.getElementById('editSpeedDiv');
    
    if (editSpeedRadio && editSpeedRadio.checked) {
        // 保存当前播放状态
        var wasPlaying = !videoPlayer.paused;
        // 如果正在播放，暂停视频
        if (wasPlaying) {
            videoPlayer.pause();
        }
        
        // 获取当前播放速率作为默认值
        var currentSpeed = videoPlayer.playbackRate;
        // 使用 prompt 提示输入倍速
        var defaultSpeedValue = '';
        var savedCustomSpeed = localStorage.getItem('customSpeedValue');
        
        // 如果有保存的自定义倍速值，使用它作为默认值
        if (savedCustomSpeed) {
            defaultSpeedValue = savedCustomSpeed;
        } else {
            // 否则使用当前播放速率
            defaultSpeedValue = '';
        }
        
        // 使用 prompt 提示输入倍速
        var speedInput = prompt('请输入自定义倍速 (0.063 - 16.0):', defaultSpeedValue);
        
        // 恢复播放状态
        if (wasPlaying) {
            videoPlayer.play();
        }
        
        // 如果用户取消或关闭提示
        if (speedInput === null) {
            // 取消时选回为当前选择的value="custom"选择
            var savedCustomSpeed = localStorage.getItem('customSpeedValue');
            var savedCustomSpeedText = localStorage.getItem('customSpeedText');
            
            if (savedCustomSpeed && savedCustomSpeedText) {
                // 检查当前播放速率是否与保存的自定义倍速匹配
                var currentSpeed = videoPlayer.playbackRate;
                var savedSpeed = parseFloat(savedCustomSpeed);
                
                if (Math.abs(currentSpeed - savedSpeed) < 0.01) {
                    // 如果当前播放速率与保存的自定义倍速匹配，保持选择custom
                    customSpeedRadio.checked = true;
                } else {
                    // 如果不匹配，查找当前播放速率对应的单选按钮
                    var speedRadios = document.querySelectorAll('input[name="speed"]');
                    var foundRadio = null;
                    
                    for (var i = 0; i < speedRadios.length; i++) {
                        var radio = speedRadios[i];
                        var radioValue = parseFloat(radio.value);
                        
                        // 跳过custom和edit选项
                        if (radio.value === 'custom' || radio.value === 'edit') {
                            continue;
                        }
                        
                        // 检查是否匹配当前播放速率
                        if (Math.abs(radioValue - currentSpeed) < 0.01) {
                            foundRadio = radio;
                            break;
                        }
                    }
                    
                    // 如果找到匹配的按钮，选中它
                    if (foundRadio) {
                        foundRadio.checked = true;
                        customSpeedRadio.checked = false;
                    } else {
                        // 如果没有找到，保持选择custom
                        customSpeedRadio.checked = true;
                    }
                }
            } else {
                // 没有保存的自定义倍速，查找当前播放速率对应的单选按钮
                var currentSpeed = videoPlayer.playbackRate;
                var speedRadios = document.querySelectorAll('input[name="speed"]');
                var foundRadio = null;
                
                for (var i = 0; i < speedRadios.length; i++) {
                    var radio = speedRadios[i];
                    var radioValue = parseFloat(radio.value);
                    
                    // 跳过custom和edit选项
                    if (radio.value === 'custom' || radio.value === 'edit') {
                        continue;
                    }
                    
                    // 检查是否匹配当前播放速率
                    if (Math.abs(radioValue - currentSpeed) < 0.01) {
                        foundRadio = radio;
                        break;
                    }
                }
                
                // 如果找到匹配的按钮，选中它
                if (foundRadio) {
                    foundRadio.checked = true;
                    customSpeedRadio.checked = false;
                } else {
                    // 如果没有找到，选择1.0x
                    var defaultSpeedRadio = document.querySelector('input[name="speed"][value="1.0"]');
                    if (defaultSpeedRadio) {
                        defaultSpeedRadio.checked = true;
                        customSpeedRadio.checked = false;
                    }
                }
            }
            return;
        }
        
        // 如果输入为空
        if (speedInput.trim() === '') {
            // 输入为空时选择1.0倍速
            var defaultSpeedRadio = document.querySelector('input[name="speed"][value="1.0"]');
            if (defaultSpeedRadio) {
                defaultSpeedRadio.checked = true;
                videoPlayer.playbackRate = 1.0;
            }
            
            // 隐藏 edit 选项
            if (editSpeedDiv) {
                editSpeedDiv.style.display = 'none';
            }
            
            // 恢复 custom 显示文本
            if (customSpeedText) {
                customSpeedText.textContent = '自定义';
            }
            
            // 清除本地存储
            localStorage.removeItem('customSpeedValue');
            localStorage.removeItem('customSpeedText');
            
            // 取消选择 edit 选项
            editSpeedRadio.checked = false;
            return;
        }
        
        // 验证输入
        var speed = parseFloat(speedInput);
        if (isNaN(speed) || speed < 0.063 || speed > 16.0) {
            console.log('请输入有效的倍速值 (0.063 - 16.0)');
            // 恢复 custom 选项的选择
            if (customSpeedRadio) {
                customSpeedRadio.checked = true;
            }
            editSpeedRadio.checked = false;
            return;
        }
        
        // 应用自定义倍速
        videoPlayer.playbackRate = speed;
        
        // 更新显示文本
        if (customSpeedText) {
            // 动态计算小数位数
            var speedText = formatSpeedDecimal(speed) + 'x';
            customSpeedText.textContent = speedText;
            // 保存到本地存储 - 使用格式化后的数值部分
            localStorage.setItem('customSpeedValue', speed.toString().indexOf('.') === -1 ? speed.toFixed(1) : speed.toString());
            localStorage.setItem('customSpeedText', speedText);
        }
        
        // 不选择 edit 选项，改为选择 custom 选项
        editSpeedRadio.checked = false;
        if (customSpeedRadio) {
            customSpeedRadio.checked = true;
        }
    }
}

// 格式化倍速小数位数
function formatSpeedDecimal(speed) {
    // 将速度转换为字符串
    var speedStr = speed.toString();
    
    // 查找小数部分
    var decimalIndex = speedStr.indexOf('.');
    
    if (decimalIndex === -1) {
        // 没有小数，添加 .0 后缀
        return speedStr + '.0';
    }
    
    // 获取小数部分
    var decimalPart = speedStr.substring(decimalIndex + 1);
    
    // 根据小数位数决定保留几位
    if (decimalPart.length <= 2) {
        // 1-2位小数，保留原样
        return speed.toFixed(decimalPart.length);
    } else {
        // 3位或更多小数，最多保留3位，并去除末尾的0
        var formatted = speed.toFixed(3);
        // 去除末尾的0
        while (formatted.endsWith('0')) {
            formatted = formatted.substring(0, formatted.length - 1);
        }
        // 如果最后是小数点，添加0
        if (formatted.endsWith('.')) {
            formatted = formatted + '0';
        }
        return formatted;
    }
}

function changeDownloadChannel(channel) {
    localStorage.setItem('downloadChannel', channel);
}

function downloadVideo() {
    var videoUrl = document.getElementById('videoUrl').value.trim();
    var fileInput = document.getElementById('fileInput');
    var downloadChannel = localStorage.getItem('downloadChannel') || 'external';
    
    // 检查是否正在下载 - 兼容IE低版本
    var existingProgress = document.getElementById('downloadProgress');
    if (existingProgress && window.currentXHR) {
        return; // 如果正在下载，不执行新的下载
    }
    
    // 移除已存在的下载进度显示（如果是已完成或错误的）- 兼容IE低版本
    if (existingProgress && existingProgress.parentNode) {
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
            progressDiv.innerHTML = '正在连接...';
            document.body.appendChild(progressDiv);
            
            var xhr;
            if (window.XMLHttpRequest) {
                xhr = new XMLHttpRequest();
            } else {
                // 兼容IE5、IE6
                xhr = new ActiveXObject("Microsoft.XMLHTTP");
            }
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
                        (e.total / 1024 / 1024).toFixed(2) + 'MB' +
                        '<button onclick="(function(){if(window.currentXHR){window.currentXHR.abort();}var progressDiv=document.getElementById(\'downloadProgress\');if(progressDiv&&progressDiv.parentNode){progressDiv.parentNode.removeChild(progressDiv);}window.currentXHR=null;})()" style="height: 14px; width: 14px; cursor: pointer; background: transparent; border: none; margin-left: 12px; position: relative; top: 5px;"><i style="position: relative; bottom: 4.5px; right: 6.5px; font-size: 18px;" class="fa fa-close"></i></button>';
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
                            setTimeout(function() {
                                document.body.removeChild(progressDiv);
                            }, 1500);
                            progressDiv.innerHTML = '下载完成';
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
                        setTimeout(function() {
                            document.body.removeChild(progressDiv);
                        }, 1500);
                        progressDiv.innerHTML = '下载完成';
                    }
                }
            };
            
            xhr.onerror = function() {
                clearInterval(progressTimer);
                window.currentXHR = null; // 清除当前下载的XHR对象
                if (progressDiv.parentNode) {
                    setTimeout(function() {
                        document.body.removeChild(progressDiv);
                    }, 1500);
                    progressDiv.innerHTML = '下载失败！';
                }
            };
            
            xhr.send();
        } else if (fileInput.files.length > 0) {
            var file = fileInput.files[0];
            var blobUrl = URL.createObjectURL(file);
            var a = document.createElement('a');
            a.href = blobUrl;
            a.download = file.name;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            // 释放 blob URL 内存
            setTimeout(function() {
                URL.revokeObjectURL(blobUrl);
            }, 100);
        }
    }
}

// 加载保存的下载通道设置
var savedDownloadChannel = localStorage.getItem('downloadChannel');
if (savedDownloadChannel) {
    var radio = document.querySelector('input[name="downloadChannel"][value="' + savedDownloadChannel + '"]');
    if (radio) radio.checked = true;
}

function seekVideo(seconds) {
    var videoPlayer = document.getElementById('videoPlayer');
    var controlBtn = document.getElementById('controlPauseBtn');
    
    // 如果视频源为空或未加载，禁用控制按钮
    if (videoPlayer.src === '' || videoPlayer.src === window.location.href) {
        if (controlBtn) controlBtn.disabled = true;
    }
    
    videoPlayer.currentTime += seconds;
}

function adjustSize() {
    var videoPlayer = document.getElementById('videoPlayer');
    
    // 更可靠的视频检测方法
    var isVideo = false;
    
    // 方法1: 检查视频尺寸（最兼容的方法，支持几乎所有浏览器）
    if (videoPlayer.videoWidth > 0 && videoPlayer.videoHeight > 0) {
        isVideo = true;
    }
    
    // 方法2: 检查readyState（支持大多数浏览器，包括旧版）
    if (!isVideo && typeof videoPlayer.readyState !== 'undefined' && videoPlayer.readyState >= 2) {
        // 如果已加载了足够的视频数据，检查是否有视频轨道
        if (typeof videoPlayer.videoTracks !== 'undefined' && videoPlayer.videoTracks.length > 0) {
            isVideo = true;
        }
        // 对于不支持videoTracks的浏览器，使用更基础的方法
        else if (videoPlayer.videoWidth !== undefined) {
            // 再次检查videoWidth，确保不是0
            if (videoPlayer.videoWidth !== 0) {
                isVideo = true;
            }
        }
    }
    
    // 新增：检查是否为m3u8视频链接
    if (!isVideo) {
        var src = videoPlayer.src || '';
        var srcLower = src.toLowerCase();
        if (srcLower.indexOf('.m3u8') !== -1) {
            isVideo = true;
        }
    }
    
    // 方法3: 检查文件扩展名或MIME类型（后备方法）
    if (!isVideo) {
        var src = videoPlayer.src || '';
        var srcLower = src.toLowerCase();
        
        // 音频文件扩展名
        var audioExtensions = ['.mp3', '.wav', '.ogg', '.aac', '.m4a', '.flac', '.webm', '.mka'];
        // 音频MIME类型（部分支持）
        var audioMimeTypes = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/aac', 'audio/x-m4a', 'audio/flac', 'audio/webm'];
        
        // 视频文件扩展名
        var videoExtensions = ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.mkv', '.webm', '.m4v', '.mpg', '.mpeg'];
        // 视频MIME类型（部分支持）
        var videoMimeTypes = ['video/mp4', 'video/avi', 'video/quicktime', 'video/x-ms-wmv', 'video/x-flv', 'video/x-matroska', 'video/webm'];
        
        // 先检查是否为音频
        var isAudioByExtension = false;
        for (var i = 0; i < audioExtensions.length; i++) {
            if (srcLower.indexOf(audioExtensions[i]) !== -1) {
                isAudioByExtension = true;
                break;
            }
        }
        
        // 如果不是音频，再检查是否为视频
        if (!isAudioByExtension) {
            for (var j = 0; j < videoExtensions.length; j++) {
                if (srcLower.indexOf(videoExtensions[j]) !== -1) {
                    isVideo = true;
                    break;
                }
            }
        }
        
        // 如果src是blob URL或data URL，检查MIME类型
        if (!isVideo && (srcLower.indexOf('blob:') === 0 || srcLower.indexOf('data:') === 0)) {
            var isAudioByMime = false;
            for (var k = 0; k < audioMimeTypes.length; k++) {
                if (srcLower.indexOf(audioMimeTypes[k]) !== -1) {
                    isAudioByMime = true;
                    break;
                }
            }
            
            if (!isAudioByMime) {
                for (var l = 0; l < videoMimeTypes.length; l++) {
                    if (srcLower.indexOf(videoMimeTypes[l]) !== -1) {
                        isVideo = true;
                        break;
                    }
                }
            }
        }
    }
    
    // 方法4: 检查文件输入（如果存在）
    if (!isVideo) {
        var fileInput = document.getElementById('fileInput');
        if (fileInput && fileInput.files && fileInput.files.length > 0) {
            var file = fileInput.files[0];
            if (file.type) {
                // 如果文件类型是video/*，则是视频
                if (file.type.indexOf('video/') === 0) {
                    isVideo = true;
                }
                // 如果文件类型是audio/*，则不是视频
                else if (file.type.indexOf('audio/') === 0) {
                    isVideo = false;
                }
            }
        }
    }
    
    // 设置播放器尺寸
    if (isVideo) {
        // 视频播放器尺寸
        videoPlayer.style.maxWidth = '100%';
        videoPlayer.style.maxHeight = '100vh';
        videoPlayer.style.width = '100%';
    } else {
        // 音频播放器尺寸
        videoPlayer.style.maxWidth = '530px';
        videoPlayer.style.maxHeight = '70px';
        videoPlayer.style.width = '100%';
    }
}

function changeVolume(volume) {
    var videoPlayer = document.getElementById('videoPlayer');
    videoPlayer.volume = parseFloat(volume);
    localStorage.setItem('videoVolume', volume);
}

function toggleMoreSpeedSelect() {
    var moreSpeedCheckbox = document.getElementById('moreSpeedSelectCheckbox');
    
    if (moreSpeedCheckbox) {
        // 保存状态到本地存储
        localStorage.setItem('moreSpeedSelect', moreSpeedCheckbox.checked ? 'true' : 'false');
        
        if (moreSpeedCheckbox.checked) {
            // 显示更多倍速选项 - 兼容所有浏览器
            var speedValues = ['5.0', '6.0', '8.0', '10.0', '12.0', '14.0', '16.0'];
            for (var i = 0; i < speedValues.length; i++) {
                var inputs = document.querySelectorAll('input[name="speed"][value="' + speedValues[i] + '"]');
                if (inputs.length > 0) {
                    var parentDiv = inputs[0].parentNode.parentNode;
                    if (parentDiv) {
                        parentDiv.style.display = 'inline-block';
                    }
                }
            }
            // 显示 custom 选项
            var customSpeedDiv = document.getElementById('customSpeedDiv');
            if (customSpeedDiv) {
                customSpeedDiv.style.display = 'inline-block';
            }
            // 检查是否有保存的自定义倍速，如果有则显示edit选项
            var editSpeedDiv = document.getElementById('editSpeedDiv');
            var savedCustomSpeed = localStorage.getItem('customSpeedValue');
            var savedCustomSpeedText = localStorage.getItem('customSpeedText');
                if (editSpeedDiv) {
                if (savedCustomSpeed && savedCustomSpeedText) {
                    editSpeedDiv.style.display = 'inline-block';
                } else {
                    editSpeedDiv.style.display = 'none';
                }
            }
            // 加载保存的自定义倍速设置
            var savedCustomSpeed = localStorage.getItem('customSpeedValue');
            var savedCustomSpeedText = localStorage.getItem('customSpeedText');
            var moreSpeedCheckbox = document.getElementById('moreSpeedSelectCheckbox');
            
            // 只有勾选了moreSpeedSelectCheckbox时才显示edit选项
            if (savedCustomSpeed && savedCustomSpeedText && moreSpeedCheckbox && moreSpeedCheckbox.checked) {
                var customSpeedText = document.getElementById('customSpeedText');
                var editSpeedDiv = document.getElementById('editSpeedDiv');
                
                if (customSpeedText) {
                    // 这里不需要修改，因为已经保存了格式化后的文本
                    customSpeedText.textContent = savedCustomSpeedText;
                }
                
                // 显示edit选项
                if (editSpeedDiv) {
                    editSpeedDiv.style.display = 'inline-block';
                }
            }
        } else {
            // 隐藏更多倍速选项 - 兼容所有浏览器
            var speedValues = ['5.0', '6.0', '8.0', '10.0', '12.0', '14.0', '16.0'];
            for (var i = 0; i < speedValues.length; i++) {
                var inputs = document.querySelectorAll('input[name="speed"][value="' + speedValues[i] + '"]');
                if (inputs.length > 0) {
                    var parentDiv = inputs[0].parentNode.parentNode;
                    if (parentDiv) {
                        parentDiv.style.display = 'none';
                    }
                }
            }
            // 隐藏 custom 和 edit 选项
            var customSpeedDiv = document.getElementById('customSpeedDiv');
            if (customSpeedDiv) {
                customSpeedDiv.style.display = 'none';
            }
            var editSpeedDiv = document.getElementById('editSpeedDiv');
            if (editSpeedDiv) {
                editSpeedDiv.style.display = 'none';
            }
        }
    }
}

function handleAutoPlay() {
    var autoPlayCheckbox = document.getElementById('autoPlayCheckbox');
    if (autoPlayCheckbox) {
        localStorage.setItem('autoPlay', autoPlayCheckbox.checked ? 'true' : 'false');
    }
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
        var timeDisplay = document.getElementById('timeDisplay');
        var timeRange = document.getElementById('timeRange');
        if (speedRadio) speedRadio.checked = true;
        videoPlayer.playbackRate = 1.0;
        fileInput.value = '';
        document.getElementById('videoUrl').value = '';
        timeDisplay.textContent = '00:00 / 00:00';
        timeRange.value = 0;
        var savedVideoUrl = localStorage.getItem('savedVideoUrl');
        if (savedVideoUrl) {
            localStorage.removeItem('savedVideoTime_' + savedVideoUrl);
        }
        localStorage.removeItem('savedVideoUrl');
        togglePause();
        updateButtonsStatePartEl();
        updateButtonsStatePartEy();
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
            fileInput.value = '';
        }
    }
}

function handleFileSelect(files) {
    var videoPlayer = document.getElementById('videoPlayer');
    var controlPauseBtn = document.getElementById('controlPauseBtn');
    
    // 当视频为非暂停状态时自动暂停视频
    if (videoPlayer && !videoPlayer.paused) {
        videoPlayer.pause();
    }
    
    // 播放本地文件时清除之前保存的播放时间
    var savedVideoUrl = localStorage.getItem('savedVideoUrl');
    if (savedVideoUrl) {
        localStorage.removeItem('savedVideoTime_' + savedVideoUrl);
    }
    
    // 检查controlPauseBtn按钮是否为暂停显示，不是将此按钮改为弹出状态显示
    if (controlPauseBtn) {
        var pauseIcon = controlPauseBtn.querySelector('i');
        var buttonDisplay = localStorage.getItem('buttonDisplay') || 'icon';
        
        if (buttonDisplay === 'icon') {
            // 图标模式
            if (pauseIcon && pauseIcon.className !== 'fa fa-play') {
                pauseIcon.className = 'fa fa-play';
            }
        } else if (buttonDisplay === 'text') {
            // 文字模式
            if (controlPauseBtn.innerHTML !== '<b>播放</b>') {
                controlPauseBtn.innerHTML = '<b>播放</b>';
            }
        }
    }
    
    var videoPlayer = document.getElementById('videoPlayer');
    var urlRadio = document.querySelector('input[name="source"][value="url"]');
    
    if (files.length > 0) {
        var file = files[0];
        var objectURL = URL.createObjectURL(file);
        videoPlayer.src = objectURL;
        videoPlayer.currentTime = 0;
        var speedRadio = document.querySelector('input[name="speed"][value="1.0"]');
        if (speedRadio) speedRadio.checked = true;
        localStorage.removeItem('savedVideoUrl');
        document.getElementById('videoUrl').value = '';
        
        // 启用按钮（无论视频是否显示）
        setTimeout(function() {
            var controlBtn = document.getElementById('controlPauseBtn');
            var skipBtns = document.querySelectorAll('.skipSecondsBtn');
            var downloadBtn = document.getElementById('downloadVideoBtn');
            
            if (controlBtn) controlBtn.disabled = false;
            
            for (var i = 0; i < skipBtns.length; i++) {
                skipBtns[i].disabled = false;
            }
            
            if (downloadBtn) {
                downloadBtn.disabled = false;
                downloadBtn.style.display = 'block';
            }
            
            // 如果视频当前是隐藏的，更新时间显示
            if (videoPlayer.style.display === 'none' || getComputedStyle(videoPlayer).display === 'none') {
                setTimeout(updateTimeDisplay, 300);
            }
        }, 300);
        
        // 如果视频被隐藏，设置定时器更新时间显示
        var displayVideoCheckbox = document.getElementById('displayVideoCheckbox');
        if (displayVideoCheckbox && !displayVideoCheckbox.checked) {
            // 视频隐藏时的处理
            setTimeout(function() {
                // 设置定时器尝试获取视频时间信息
                var timeUpdateAttempts = 0;
                var timeUpdateInterval = setInterval(function() {
                    timeUpdateAttempts++;
                    
                    // 检查视频是否已加载了部分数据
                    if (videoPlayer.readyState >= 1) { // HAVE_CURRENT_DATA
                        updateTimeDisplay();
                        
                        // 如果已获取到有效时长，清除定时器
                        if (videoPlayer.duration > 0 && !isNaN(videoPlayer.duration)) {
                            clearInterval(timeUpdateInterval);
                        }
                    }
                    
                    // 10次尝试后停止（5秒）
                    if (timeUpdateAttempts >= 10) {
                        clearInterval(timeUpdateInterval);
                    }
                }, 500);
            }, 100);
        }
        
        // 在handleFileSelect函数中，在videoPlayer.src = objectURL之后添加：
        var autoPlayCheckbox = document.getElementById('autoPlayCheckbox');
        // 移除之前可能存在的onloadeddata事件处理器
        videoPlayer.onloadeddata = null;
        if (autoPlayCheckbox && autoPlayCheckbox.checked) {
            videoPlayer.onloadeddata = function() {
                videoPlayer.play().catch(function(e) {
                    console.log('自动播放失败:', e);
                });
            };
        }
    } else {
        if (urlRadio) urlRadio.checked = true;
        videoPlayer.src = '';
        updateButtonsStatePartEl();
        updateButtonsStatePartEy();
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
    if (saveUrl === 'true') {
        var videoUrl = document.getElementById('videoUrl').value.trim();
        if (videoUrl && videoUrl.indexOf('://') !== -1) {
            localStorage.setItem('savedVideoUrl', videoUrl);
        }
    } else {
        // 同时清除该链接的播放时间
        var savedVideoUrl = localStorage.getItem('savedVideoUrl');
        if (savedVideoUrl) {
            localStorage.removeItem('savedVideoTime_' + savedVideoUrl);
        }
        localStorage.removeItem('savedVideoUrl');
        
        // 清除可能的残留时间记录
        for (var key in localStorage) {
            if (key.startsWith('savedVideoTime_')) {
                localStorage.removeItem(key);
            }
        }
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
    updateButtonsStatePartEy();
    
    // 初始状态保持按钮禁用
    updateButtonsStatePartEl();
    
    // 添加事件监听器检查链接是否有效
    videoPlayer.addEventListener('error', function() {
        // 视频加载失败，保持按钮禁用
        updateButtonsStatePartEl();
        
        // 链接失效时清除保存的播放时间
        var savedVideoTimeKey = 'savedVideoTime_' + savedVideoUrl;
        if (localStorage.getItem(savedVideoTimeKey)) {
            localStorage.removeItem(savedVideoTimeKey);
            console.log('链接失效，清除保存的播放时间');
        }
        
        // 清除跳转标记，防止后续尝试跳转
        if (videoPlayer.dataset.shouldRestoreTime) {
            delete videoPlayer.dataset.shouldRestoreTime;
        }
        
        // 移除之前可能添加的跳转事件监听器
        var existingRestoreHandler = videoPlayer.onloadedmetadata;
        if (existingRestoreHandler) {
            videoPlayer.onloadedmetadata = null;
        }
    });
    
    // 页面加载时跳转到上次播放时间
    var savedVideoTime = localStorage.getItem('savedVideoTime_' + savedVideoUrl);
    if (savedVideoTime) {
        // 设置标记，等待视频加载完成后跳转
        videoPlayer.dataset.shouldRestoreTime = 'true';
        
        var restoreTimeOnLoad = function() {
            if (videoPlayer.dataset.shouldRestoreTime === 'true') {
                var time = parseFloat(savedVideoTime);
                if (!isNaN(time) && time > 0) {
                    // 等待视频完全加载
                    var checkLoaded = function() {
                        if (videoPlayer.readyState >= 2) { // HAVE_CURRENT_DATA
                            if (videoPlayer.duration && time < videoPlayer.duration) {
                                videoPlayer.currentTime = time;
                                console.log('页面加载跳转到上次播放时间：' + time + '秒');
                                
                                // 跳转后检查是否自动播放
                                var autoPlayCheckbox = document.getElementById('autoPlayCheckbox');
                                if (autoPlayCheckbox && autoPlayCheckbox.checked) {
                                    videoPlayer.play().catch(function(e) {
                                        console.log('页面加载跳转后自动播放失败:', e);
                                    });
                                }
                                // === 新增结束 ===
                            }
                            // 清除标记
                            delete videoPlayer.dataset.shouldRestoreTime;
                        } else {
                            // 继续等待
                            setTimeout(checkLoaded, 100);
                        }
                    };
                    setTimeout(checkLoaded, 300);
                }
                // 移除事件监听
                videoPlayer.removeEventListener('loadedmetadata', restoreTimeOnLoad);
            }
        };
        
        videoPlayer.addEventListener('loadedmetadata', restoreTimeOnLoad);
    }
    
    videoPlayer.addEventListener('loadedmetadata', function() {
        // 视频加载成功，启用按钮
        var controlBtn = document.getElementById('controlPauseBtn');
        var skipBtns = document.querySelectorAll('.skipSecondsBtn');
        var downloadBtn = document.getElementById('downloadVideoBtn');
        
        if (controlBtn) controlBtn.disabled = false;
        
        for (var i = 0; i < skipBtns.length; i++) {
            skipBtns[i].disabled = false;
        }
        
        if (downloadBtn) {
            downloadBtn.disabled = false;
            downloadBtn.style.display = 'block';
        }
    });
}

function handleKeyPress(event) {
    if (event.keyCode === 13) {
        var videoUrl = document.getElementById('videoUrl');
        if (videoUrl.value.trim() !== '') {
            playVideo();
            videoUrl.blur();
        }
    }
}

// 设置电脑端最大宽度
if (document.body && document.body.style) {
    document.body.style.maxWidth = '800px';
}

function changeButtonDisplay(displayType) {
    var playBtn = document.getElementById('playVideoBtn');
    var downloadBtn = document.getElementById('downloadVideoBtn');
    var skipBtns = document.querySelectorAll('.skipSecondsBtn');
    var controlPauseBtn = document.getElementById('controlPauseBtn');
    
    // 保存设置到本地存储
    localStorage.setItem('buttonDisplay', displayType);
    
    if (displayType === 'text') {
        // 文字模式
        if (playBtn) {
            playBtn.innerHTML = '播放';
            // 清除display: none以外的样式
            playBtn.style.marginLeft = '3px';
            playBtn.style.minWidth = '43px';
            playBtn.style.width = '12%';
            playBtn.style.maxWidth = '45px';
        }
        
        if (downloadBtn) {
            downloadBtn.innerHTML = '下载';
            // 清除display: none以外的样式
            downloadBtn.style.marginLeft = '3px';
            downloadBtn.style.minWidth = '43px';
            downloadBtn.style.width = '12%';
            downloadBtn.style.maxWidth = '45px';
        }
        
        // 处理四个快进/快退按钮
        if (skipBtns && skipBtns.length >= 4) {
            skipBtns[0].innerHTML = '-30s';
            skipBtns[1].innerHTML = '-10s';
            skipBtns[2].innerHTML = '+10s';
            skipBtns[3].innerHTML = '+30s';
        }
        
        if (controlPauseBtn) {
            // 根据当前播放状态显示文字
            var videoPlayer = document.getElementById('videoPlayer');
            if (videoPlayer && videoPlayer.paused) {
                controlPauseBtn.innerHTML = '<b>播放</b>';
            } else {
                controlPauseBtn.innerHTML = '<b>暂停</b>';
            }
        }
        
        // 移除所有按钮的工具提示（如果存在）
        var allBtns = [playBtn, downloadBtn, controlPauseBtn];
        for (var i = 0; i < skipBtns.length; i++) {
            allBtns.push(skipBtns[i]);
        }
        
        for (var j = 0; j < allBtns.length; j++) {
            if (allBtns[j]) {
                var tooltip = allBtns[j].querySelector('.button-tooltip');
                if (tooltip && tooltip.parentNode) {
                    tooltip.parentNode.removeChild(tooltip);
                }
            }
        }
    } else {
        // 图标模式
        if (playBtn) {
            playBtn.innerHTML = '<i style="margin-top: -6px; margin-left: -5px; position: absolute;" class="fa fa-play"></i>';
            // 恢复原本样式
            playBtn.style.marginLeft = '3px';
            playBtn.style.minWidth = '40px';
            playBtn.style.width = '40px';
            playBtn.style.maxWidth = '40px';
        }
        
        if (downloadBtn) {
            downloadBtn.innerHTML = '<i style="margin-top: -5px; margin-left: -6.6px; position: absolute;" class="fa fa-download"></i>';
            // 恢复原本样式
            downloadBtn.style.marginLeft = '3px';
            downloadBtn.style.minWidth = '40px';
            downloadBtn.style.width = '40px';
            downloadBtn.style.maxWidth = '40px';
        }
        
        // 处理四个快进/快退按钮
        if (skipBtns && skipBtns.length >= 4) {
            skipBtns[0].innerHTML = '<i style="margin-top: -6px; margin-left: -6.6px; position: absolute;" class="fa fa-fast-backward"></i>';
            skipBtns[1].innerHTML = '<i style="margin-top: -6px; margin-left: -6.6px; position: absolute;" class="fa fa-backward"></i>';
            skipBtns[2].innerHTML = '<i style="margin-top: -6px; margin-left: -6.6px; position: absolute;" class="fa fa-forward"></i>';
            skipBtns[3].innerHTML = '<i style="margin-top: -6px; margin-left: -6.6px; position: absolute;" class="fa fa-fast-forward"></i>';
        }
        
        if (controlPauseBtn) {
            // 根据当前播放状态显示对应图标
            var videoPlayer = document.getElementById('videoPlayer');
            if (videoPlayer && videoPlayer.paused) {
                controlPauseBtn.innerHTML = '<i style="margin-top: -6px; margin-left: -6px; position: absolute;" class="fa fa-play"></i>';
            } else {
                controlPauseBtn.innerHTML = '<i style="margin-top: -6px; margin-left: -6px; position: absolute;" class="fa fa-pause"></i>';
            }
        }
        
        // 重新创建工具提示
        if (playBtn) {
            createTooltip(playBtn, '播放视频链接');
        }
        if (downloadBtn) {
            createTooltip(downloadBtn, '下载视频');
        }
        if (controlPauseBtn) {
            createTooltip(controlPauseBtn, '播放/暂停');
        }
        if (skipBtns && skipBtns.length > 0) {
            for (var i = 0; i < skipBtns.length; i++) {
                var btn = skipBtns[i];
                var text = '';
                if (i === 0) {
                    text = '后退30秒';
                } else if (i === 1) {
                    text = '后退10秒';
                } else if (i === 2) {
                    text = '前进10秒';
                } else if (i === 3) {
                    text = '前进30秒';
                }
                createTooltip(btn, text);
            }
        }
    }
}

window.addEventListener('load', function() {
    // 监听视频播放状态变化
    var videoPlayer = document.getElementById('videoPlayer');
    
    // 初始加载时，如果视频隐藏且没有源，保持按钮禁用
    var displayVideoCheckbox = document.getElementById('displayVideoCheckbox');
    if (displayVideoCheckbox && !displayVideoCheckbox.checked) {
        // 如果视频隐藏，检查是否有视频源
        if (!videoPlayer.src || videoPlayer.src === window.location.href) {
            // 没有视频源，保持按钮禁用
            updateButtonsStatePartEl();
        } else {
            // 有视频源但隐藏，启用按钮
            setTimeout(function() {
                var controlBtn = document.getElementById('controlPauseBtn');
                var skipBtns = document.querySelectorAll('.skipSecondsBtn');
                var downloadBtn = document.getElementById('downloadVideoBtn');
                
                if (controlBtn) controlBtn.disabled = false;
                
                for (var i = 0; i < skipBtns.length; i++) {
                    skipBtns[i].disabled = false;
                }
                
                if (downloadBtn) {
                    downloadBtn.disabled = false;
                    downloadBtn.style.display = 'block';
                }
            }, 100);
        }
    }
    
    // 加载保存的显示更多倍速设置
    var savedMoreSpeedSelect = localStorage.getItem('moreSpeedSelect');
    if (savedMoreSpeedSelect !== null) {
        var moreSpeedCheckbox = document.getElementById('moreSpeedSelectCheckbox');
        if (moreSpeedCheckbox) {
            moreSpeedCheckbox.checked = savedMoreSpeedSelect === 'true';
            // 应用显示更多倍速设置
            toggleMoreSpeedSelect();
        }
    }
    
    // 加载保存的自定义倍速设置
    var savedCustomSpeed = localStorage.getItem('customSpeedValue');
    var savedCustomSpeedText = localStorage.getItem('customSpeedText');
    var moreSpeedCheckbox = document.getElementById('moreSpeedSelectCheckbox');
    
    // 只有勾选了moreSpeedSelectCheckbox时才显示edit选项
    if (savedCustomSpeed && savedCustomSpeedText && moreSpeedCheckbox && moreSpeedCheckbox.checked) {
    var customSpeedText = document.getElementById('customSpeedText');
        var editSpeedDiv = document.getElementById('editSpeedDiv');
        
        if (customSpeedText) {
            // 这里不需要修改，因为已经保存了格式化后的文本
            customSpeedText.textContent = savedCustomSpeedText;
        }
        
        // 显示edit选项
        if (editSpeedDiv) {
            editSpeedDiv.style.display = 'inline-block';
        }
    }
    
    // 加载保存的自动播放设置
    var savedAutoPlay = localStorage.getItem('autoPlay');
    if (savedAutoPlay !== null) {
        var autoPlayCheckbox = document.getElementById('autoPlayCheckbox');
        if (autoPlayCheckbox) {
            autoPlayCheckbox.checked = savedAutoPlay === 'true';
        }
    }
    
    // 在页面加载事件中添加
    var autoPlayCheckbox = document.getElementById('autoPlayCheckbox');
    if (autoPlayCheckbox) {
        autoPlayCheckbox.addEventListener('change', handleAutoPlay);
    }
    videoPlayer.addEventListener('play', function() {
        var pauseIcon = document.querySelector('#controlPauseBtn i');
        var skipBtns = document.querySelectorAll('.skipSecondsBtn'); // 获取所有快进/快退按钮
        
        if (pauseIcon) {
            pauseIcon.className = 'fa fa-pause';
        }
        
        // 更新文字模式下的按钮文字
        if (controlPauseBtn && localStorage.getItem('buttonDisplay') === 'text') {
            controlPauseBtn.innerHTML = '<b>暂停</b>';
        }
        
        // 监听视频时间更新事件
        videoPlayer.addEventListener('timeupdate', function() {
            // 如果视频被隐藏，更新时间显示
            if (videoPlayer.style.display === 'none' || getComputedStyle(videoPlayer).display === 'none') {
                updateTimeDisplay();
            }
            
            // 保存当前播放时间
            var videoUrl = document.getElementById('videoUrl').value.trim();
            var saveUrlSetting = localStorage.getItem('saveVideoUrl');
            
            // 只有同时满足以下条件才保存播放时间：
            // 1. 有有效的视频URL
            // 2. 保存链接功能开启
            // 3. 当前保存的链接与正在播放的链接一致
            // 4. 视频已加载完成（避免保存刚加载的时间）
            // 5. 视频没有播放结束（新增条件）
            if (videoUrl && saveUrlSetting === 'true') {
                var savedVideoUrl = localStorage.getItem('savedVideoUrl');
                
                // 只有当保存的链接与当前播放的链接完全一致时才保存时间
                if (savedVideoUrl && savedVideoUrl === videoUrl) {
                    var currentTime = videoPlayer.currentTime;
                    // 检查视频是否播放结束（新增条件）
                    var isPlaybackEnded = videoPlayer.dataset.playbackEnded === 'true';
                    
                    // 只有在视频加载完成后且没有播放结束才开始保存时间
                    if (videoPlayer.readyState >= 4 && currentTime < videoPlayer.duration && !isPlaybackEnded) { // 修改：添加!isPlaybackEnded条件
                        // 使用更小的保存频率（每0.5秒保存一次）
                        if (!window.lastSaveTime || (Date.now() - window.lastSaveTime > 500)) {
                            localStorage.setItem('savedVideoTime_' + savedVideoUrl, currentTime);
                            window.lastSaveTime = Date.now();
                        }
                    }
                }
            }
        });
            
        // 监听视频播放结束事件
        videoPlayer.addEventListener('ended', function() {
            var videoUrl = document.getElementById('videoUrl').value.trim();
            var savedVideoUrl = localStorage.getItem('savedVideoUrl');
            
            // 如果当前视频是保存的视频链接，清除其播放时间
            if (videoUrl && savedVideoUrl && videoUrl === savedVideoUrl) {
                localStorage.removeItem('savedVideoTime_' + savedVideoUrl);
            }
            
            // 设置标记表示视频已播放结束
            videoPlayer.dataset.playbackEnded = 'true';
        });
        
        // 监听视频播放事件（重新开始播放时）
        videoPlayer.addEventListener('play', function() {
            // 清除播放结束标记
            if (videoPlayer.dataset.playbackEnded === 'true') {
                delete videoPlayer.dataset.playbackEnded;
            }
        });
        
        // 监听视频元数据加载完成
        videoPlayer.addEventListener('loadedmetadata', function() {
            // 如果视频被隐藏，初始化时间显示
            if (videoPlayer.style.display === 'none' || getComputedStyle(videoPlayer).display === 'none') {
                updateTimeDisplay();
            }
        });
    });
    
    document.getElementById('videoUrl').addEventListener('input', function() {
        updateButtonsStatePartEy();
    });
    
    videoPlayer.addEventListener('pause', function() {
        var pauseIcon = document.querySelector('#controlPauseBtn i');
        var controlBtn = document.getElementById('controlPauseBtn');
        var skipBtns = document.querySelectorAll('.skipSecondsBtn'); // 获取所有快进/快退按钮
        
        if (pauseIcon) {
            pauseIcon.className = 'fa fa-play';
        }
        
        // 更新文字模式下的按钮文字
        if (controlBtn && localStorage.getItem('buttonDisplay') === 'text') {
            controlBtn.innerHTML = '<b>播放</b>';
        }
        
        // 兼容性处理：如果视频源为空，禁用控制按钮
        if (videoPlayer.src === '' || videoPlayer.src === window.location.href) {
            if (controlBtn) controlBtn.disabled = true;
            var downloadBtn = document.getElementById('downloadVideoBtn');
            if (downloadBtn) downloadBtn.disabled = true;
            if (downloadBtn) downloadBtn.style.display = 'none';
            
            // 禁用所有快进/快退按钮
            skipBtns.forEach(function(btn) {
                btn.disabled = true;
            });
        }
    });
    
    // 监听视频元数据加载完成事件
    videoPlayer.addEventListener('loadedmetadata', function() {
        // 兼容性检查：优先检查 videoWidth 和 videoHeight
        var isVideoValid = false;
        
        // 方法1：检查视频尺寸（最兼容的方法）
        if (videoPlayer.videoWidth > 0 && videoPlayer.videoHeight > 0) {
            isVideoValid = true;
        }
        // 方法2：检查 readyState（次兼容）
        else if (typeof videoPlayer.readyState !== 'undefined' && videoPlayer.readyState >= 2) {
            isVideoValid = true;
        }
        // 方法3：检查 networkState（最后备选）
        else if (typeof videoPlayer.networkState !== 'undefined' && videoPlayer.networkState === 2) {
            isVideoValid = true;
        }
        
        if (isVideoValid) {
            var controlBtn = document.getElementById('controlPauseBtn');
            var skipBtns = document.querySelectorAll('.skipSecondsBtn');
            
            if (controlBtn) controlBtn.disabled = false;
            
            // 兼容旧版浏览器的循环方式
            for (var i = 0; i < skipBtns.length; i++) {
                skipBtns[i].disabled = false;
            }
            
            // 启用下载按钮
            var downloadBtn = document.getElementById('downloadVideoBtn');
            if (downloadBtn) {
                downloadBtn.disabled = false;
                downloadBtn.style.display = 'block';
            }
        }
    });
    
    // 监听视频错误事件
    videoPlayer.addEventListener('error', function() {
        var controlBtn = document.getElementById('controlPauseBtn');
        var skipBtns = document.querySelectorAll('.skipSecondsBtn');
        
        if (controlBtn) controlBtn.disabled = true;
        
        // 兼容旧版浏览器的循环方式
        for (var i = 0; i < skipBtns.length; i++) {
            skipBtns[i].disabled = true;
        }
        
        // 禁用下载按钮
        var downloadBtn = document.getElementById('downloadVideoBtn');
        if (downloadBtn) {
            downloadBtn.disabled = true;
        }
        
        // 如果视频被隐藏，也更新按钮状态
        var displayVideoCheckbox = document.getElementById('displayVideoCheckbox');
        if (displayVideoCheckbox && !displayVideoCheckbox.checked) {
            updateButtonsStatePartEl();
        }
    });
    
    // 获取显示视频复选框
    var displayVideoCheckbox = document.getElementById('displayVideoCheckbox');
    if (displayVideoCheckbox) {
        // 加载保存的显示视频设置
        var savedDisplayVideo = localStorage.getItem('displayVideo');
        if (savedDisplayVideo !== null) {
            displayVideoCheckbox.checked = savedDisplayVideo === 'true';
        }
        
        // 应用初始设置
        if (displayVideoCheckbox.checked) {
            videoPlayer.style.display = 'block';
            document.getElementById('videoHiddenInfo').style.display = 'none';
        } else {
            videoPlayer.style.display = 'none';
            document.getElementById('videoHiddenInfo').style.display = 'block';
            
            // 检查视频是否损坏或无效链接
            var isVideoValid = false;
            
            if (videoPlayer.src && videoPlayer.src !== window.location.href) {
                // 检查视频是否已加载元数据
                if (videoPlayer.readyState >= 2) {
                    isVideoValid = true;
                }
                // 检查是否有视频错误
                else if (videoPlayer.error) {
                    isVideoValid = false;
                }
                // 检查视频是否正在加载或已加载部分数据
                else if (videoPlayer.readyState >= 1) {
                    // 设置一个超时检查，等待视频加载
                    var checkTimer = setTimeout(function() {
                        if (videoPlayer.readyState >= 2) {
                            isVideoValid = true;
                        }
                        // 根据最终状态启用/禁用按钮
                        if (isVideoValid) {
                            setTimeout(function() {
                                var controlBtn = document.getElementById('controlPauseBtn');
                                var skipBtns = document.querySelectorAll('.skipSecondsBtn');
                                var downloadBtn = document.getElementById('downloadVideoBtn');
                                
                                if (controlBtn) controlBtn.disabled = false;
                                
                                for (var i = 0; i < skipBtns.length; i++) {
                                    skipBtns[i].disabled = false;
                                }
                                
                                if (downloadBtn) {
                                    downloadBtn.disabled = false;
                                    downloadBtn.style.display = 'block';
                                }
                                
                                // 初始更新时间显示
                                updateTimeDisplay();
                            }, 100);
                        } else {
                            // 视频损坏或无效链接，保持按钮禁用
                            updateButtonsStatePartEl();
                        }
                    }, 1000);
                    
                    // 立即禁用按钮，等待验证结果
                    updateButtonsStatePartEl();
                } else {
                    // 视频尚未开始加载，可能无效
                    isVideoValid = false;
                }
            }
            
            // 根据初始检查结果
            if (!isVideoValid) {
                // 没有视频源或视频损坏，保持按钮禁用
                updateButtonsStatePartEl();
            }
        }
        
        // 在displayVideoCheckbox的change事件监听器中，修改这部分代码：
        displayVideoCheckbox.addEventListener('change', function() {
            if (this.checked) {
                videoPlayer.style.display = 'block';
                document.getElementById('videoHiddenInfo').style.display = 'none';
                localStorage.setItem('displayVideo', 'true');
            } else {
                videoPlayer.style.display = 'none';
                document.getElementById('videoHiddenInfo').style.display = 'block';
                
                // 检查视频是否损坏或无效链接
                var isVideoValid = false;
                
                // 方法1: 检查视频源是否存在
                if (videoPlayer.src && videoPlayer.src !== window.location.href) {
                    // 方法2: 检查视频是否已加载元数据（readyState >= 2）
                    if (videoPlayer.readyState >= 2) {
                        isVideoValid = true;
                    }
                    // 方法3: 检查是否有视频错误
                    else if (videoPlayer.error) {
                        isVideoValid = false;
                    }
                    // 方法4: 检查视频是否正在加载或已加载部分数据
                    else if (videoPlayer.readyState >= 1) {
                        // 设置一个超时检查，等待视频加载
                        var checkTimer = setTimeout(function() {
                            if (videoPlayer.readyState >= 2) {
                                isVideoValid = true;
                            }
                            // 根据最终状态启用/禁用按钮
                            if (isVideoValid) {
                                enableHiddenVideoButtons();
                            } else {
                                updateButtonsStatePartEl(); // 保持按钮禁用
                            }
                        }, 1000);
                        
                        // 立即禁用按钮，等待验证结果
                        updateButtonsStatePartEl();
                        return;
                    }
                }
                
                // 根据检查结果启用或禁用按钮
                if (isVideoValid) {
                    // 启用按钮
                    setTimeout(function() {
                        var controlBtn = document.getElementById('controlPauseBtn');
                        var skipBtns = document.querySelectorAll('.skipSecondsBtn');
                        var downloadBtn = document.getElementById('downloadVideoBtn');
                        
                        if (controlBtn) controlBtn.disabled = false;
                        
                        for (var i = 0; i < skipBtns.length; i++) {
                            skipBtns[i].disabled = false;
                        }
                        
                        if (downloadBtn) {
                            downloadBtn.disabled = false;
                            downloadBtn.style.display = 'block';
                        }
                        
                        // 初始更新时间显示
                        updateTimeDisplay();
                        adjustSize();
                    }, 100);
                } else {
                    // 视频损坏或无效链接，保持按钮禁用
                    updateButtonsStatePartEl();
                }
                
                localStorage.setItem('displayVideo', 'false');
            }
        });
    }
    
    // 加载保存的按钮显示设置
    var savedButtonDisplay = localStorage.getItem('buttonDisplay');
    if (savedButtonDisplay) {
        var radio = document.querySelector('input[name="buttonDisplay"][value="' + savedButtonDisplay + '"]');
        if (radio) {
            radio.checked = true;
            // 应用显示设置
        changeButtonDisplay(savedButtonDisplay);
        }
    } else {
        // 如果没有保存的设置，默认使用图标模式并初始化
        changeButtonDisplay('icon');
    }
});

// 更新时间显示的函数
function updateTimeDisplay() {
    var videoPlayer = document.getElementById('videoPlayer');
    var timeDisplay = document.getElementById('timeDisplay');
    var timeRange = document.getElementById('timeRange');
    
    if (videoPlayer && timeDisplay && timeRange) {
        // 使用更可靠的方式获取当前时间，避免NaN
        var currentTime = videoPlayer.currentTime || 0;
        var duration = videoPlayer.duration || 0;
        
        // 如果duration不是有效数字，设为0
        if (isNaN(duration) || duration === Infinity) {
            duration = 0;
        }
        
        // 格式化时间显示
        var formatTime = function(seconds) {
            var mins = Math.floor(seconds / 60);
            var secs = Math.floor(seconds % 60);
            
            var minsStr = mins.toString();
            var secsStr = secs.toString();
            
            if (minsStr.length < 2) minsStr = '0' + minsStr;
            if (secsStr.length < 2) secsStr = '0' + secsStr;
            
            return minsStr + ':' + secsStr;
        };
        
        timeDisplay.textContent = formatTime(currentTime) + ' / ' + formatTime(duration);
        
        // 更新进度条
        if (duration > 0 && !isNaN(duration)) {
            var percentage = (currentTime / duration) * 100;
            
            // 确保percentage在0-100范围内
            if (percentage < 0) percentage = 0;
            if (percentage > 100) percentage = 100;
            
            timeRange.value = percentage;
        } else {
            timeRange.value = 0;
        }
    }
}

// 通过进度条更新视频时间
function updateVideoTimeByRange(value) {
    var videoPlayer = document.getElementById('videoPlayer');
    var timeDisplay = document.getElementById('timeDisplay');
    
    if (videoPlayer && timeDisplay) {
        var duration = videoPlayer.duration || 0;
        var newTime = (value / 100) * duration;
        videoPlayer.currentTime = newTime;
        
        // 更新显示的时间
        updateTimeDisplay();
    }
}

function createTooltip(button, text) {
    var tooltip = document.createElement('div');
    tooltip.className = 'button-tooltip';
    tooltip.textContent = text;
    tooltip.style.cssText = 'position: absolute; background: white; color: black; padding: 2px 4px; border: 1px solid #000; font-size: 12px; white-space: nowrap; z-index: 1000; pointer-events: none; opacity: 0; visibility: hidden;';
    button.style.position = 'relative';
    button.appendChild(tooltip);
    
    // 使用setTimeout确保DOM已渲染
    setTimeout(function() {
        // 临时显示工具提示以获取尺寸
        var originalOpacity = tooltip.style.opacity;
        var originalVisibility = tooltip.style.visibility;
        tooltip.style.opacity = '0';
        tooltip.style.visibility = 'visible';
        
        // 获取按钮和工具提示的尺寸位置
        var buttonRect = button.getBoundingClientRect();
        var tooltipRect = tooltip.getBoundingClientRect();
        
        // 初始位置：按钮底部中间
        var left = buttonRect.width / 2 - tooltipRect.width / 2;
        var top = buttonRect.height;
        
        // 检查是否超出屏幕右侧
        var screenRight = window.innerWidth || document.documentElement.clientWidth;
        var tooltipRight = buttonRect.left + left + tooltipRect.width;
        if (tooltipRight > screenRight) {
            left = buttonRect.width - tooltipRect.width;
        }
        
        // 检查是否超出屏幕左侧
        var tooltipLeft = buttonRect.left + left;
        if (tooltipLeft < 0) {
            left = 0;
        }
        
        // 设置最终位置
        tooltip.style.left = left + 'px';
        tooltip.style.top = top + 'px';
        
        // 恢复隐藏状态
        tooltip.style.opacity = originalOpacity;
        tooltip.style.visibility = originalVisibility;
    }, 0);
    
    // 判断是否为移动端
    var isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    // 计算工具提示位置
    function calculatePosition() {
        // 获取按钮位置和尺寸
        var buttonRect = button.getBoundingClientRect();
        var tooltipRect = tooltip.getBoundingClientRect();
        
        // 初始位置：按钮底部中间
        var left = buttonRect.width / 2 - tooltipRect.width / 2;
        var top = buttonRect.height;
        
        // 检查是否超出屏幕右侧
        var screenRight = window.innerWidth || document.documentElement.clientWidth;
        var tooltipRight = buttonRect.left + left + tooltipRect.width;
        if (tooltipRight > screenRight) {
            left = buttonRect.width - tooltipRect.width;
        }
        
        // 检查是否超出屏幕左侧
        var tooltipLeft = buttonRect.left + left;
        if (tooltipLeft < 0) {
            left = 0;
        }
        
        // 设置最终位置
        tooltip.style.left = left + 'px';
        tooltip.style.top = top + 'px';
    }
    
    if (!isMobile) {
        // 桌面端：鼠标悬停显示 - 仅在按钮未禁用时显示，延迟0.5秒
        var hoverTimer;
        button.addEventListener('mouseenter', function() {
            if (!this.disabled) {
                clearTimeout(hoverTimer);
                // 先显示（透明度为0）以计算尺寸
                tooltip.style.opacity = '0';
                tooltip.style.visibility = 'visible';
                // 计算位置
                calculatePosition();
                hoverTimer = setTimeout(function() {
                    tooltip.style.opacity = '1';
                }, 100);
            }
        });
        button.addEventListener('mouseleave', function() {
            clearTimeout(hoverTimer);
            tooltip.style.opacity = '0';
            // 隐藏但不移除，保持位置计算
        });
    } else {
        // 移动端：激活状态显示 - 仅在按钮未禁用时显示，延迟0.5秒
        var touchTimer;
        button.addEventListener('touchstart', function() {
            if (!this.disabled) {
                clearTimeout(touchTimer);
                // 先显示（透明度为0）以计算尺寸
                tooltip.style.opacity = '0';
                tooltip.style.visibility = 'visible';
                // 计算位置
                calculatePosition();
                touchTimer = setTimeout(function() {
                    tooltip.style.opacity = '1';
                }, 500);
            }
        });
        button.addEventListener('touchend', function() {
            clearTimeout(touchTimer);
            tooltip.style.opacity = '0';
            // 隐藏但不移除，保持位置计算
        });
        button.addEventListener('touchcancel', function() {
            clearTimeout(touchTimer);
            tooltip.style.opacity = '0';
        });
    }
}

// 为播放按钮和下载按钮添加提示
var playBtn = document.getElementById('playVideoBtn');
var downloadBtn = document.getElementById('downloadVideoBtn');

if (playBtn) {
    createTooltip(playBtn, '播放视频链接');
}

if (downloadBtn) {
    createTooltip(downloadBtn, '下载视频');
}

// 为控制暂停按钮和快进/快退按钮添加提示
var controlPauseBtn = document.getElementById('controlPauseBtn');
var skipSecondsBtns = document.querySelectorAll('.skipSecondsBtn');

if (controlPauseBtn) {
    createTooltip(controlPauseBtn, '播放/暂停');
}

// 修复：使用兼容旧浏览器的循环方式
if (skipSecondsBtns && skipSecondsBtns.length > 0) {
    // 使用传统for循环替代forEach
    for (var i = 0; i < skipSecondsBtns.length; i++) {
        var btn = skipSecondsBtns[i];
        var text = '';
        // 根据按钮位置设置不同的提示文本
        if (i === 0) {
            text = '后退30秒';
        } else if (i === 1) {
            text = '后退10秒';
        } else if (i === 2) {
            text = '前进10秒';
        } else if (i === 3) {
            text = '前进30秒';
        }
        createTooltip(btn, text);
    }
}