class Canvas{
    //将视频投射到画布上
    openCanvasVideo(){
        let that = this;
        new Promise((resolve, reject)=>{
            let inputVideo = document.querySelector('input');
            this.backstageVideo.src = window.URL.createObjectURL(inputVideo.files[0]);    //获取视频所在路径并播放
            this.backstageVideo.controls = true;
            resolve();
        }).then((e)=>{
            that.backstageVideo.play();    //异步播放视频
        })
    }
    onloadOpenVideo(videoWidth,videoHeight){
        let that = this;
        let node = that.contrast(videoWidth,videoHeight);
        let dd = 0;
        render();
        function render(){    //将视频投放到canvas上
            let x = that.nodePlot.x - node.a/2, y = that.nodePlot.y - node.b/2;

            that.ed = window.requestAnimationFrame(render);    //每秒触发60次这个函数
            
            that.videoTimedisplay[0].innerHTML = that.CanvasNode.timeChange(that.backstageVideo.currentTime);    //将当前视频时间显示在屏幕上
            that.progressoafter.style.width = (that.backstageVideo.currentTime/that.backstageVideo.duration) * that.progressobarWidth + "px";
            if(that.backstageVideo.paused)window.cancelAnimationFrame(that.ed);

            that.canvasVideoCtx.clearRect(0, 0,that.canvasVideo.width,that.canvasVideo.height);    //清空canvas
            that.canvasVideoCtx.drawImage( that.backstageVideo, 0, 0, videoWidth, videoHeight, x, y, node.a, node.b);
            //录像canvas
            that.canvasVideoTapeCtx.clearRect(0,0,that.canvasVideoTape.width,that.canvasVideoTape.height);
            that.canvasVideoTapeCtx.drawImage(that.backstageVideo, 0, 0,videoWidth,videoHeight);

            if(that.base){
                document.getElementById("base64").style.backgroundColor = "red"; 
                that.saveto.push(that.canvasVideoTape.toDataURL("image/png"));
            }
            else{
                document.getElementById("base64").style.backgroundColor = "blue";
            }
        }
    }
    //视频录制函数
    recordingVideo(){
        let stream = this.canvasVideoTape.captureStream();    //返回一个实时视频捕获画布
        this.recorder = new MediaRecorder(stream, {mimeType: 'video/webm'});    //设置一个队stream就行录制的对象
        let data = [];
        this.recorder.ondataavailable = function(event){
            if(event.data && event.data.size){    //将捕获到的媒体数据传入data里
                data.push(event.data);
            }
        }
        this.recorder.onstop = () =>{    //当结束录制时导出视频
            let url = URL.createObjectURL(
                new Blob(data, {type:'video/webm'})
            );
            this.backstageVideo.src = url;
        }
        this.recorder.start();    //开启录制
    }
    stopRecordingVideo(){    //暂停录制
        if(this.recorder){
            this.recorder.stop();
        }
    }

    timeChange(time){

        let t = parseInt(time);
        let m = parseInt(t/60).toString();
        let s = (t - m*60).toString();

        if(m.length < 2)m = '0' + m;
        if(s.length < 2)s = '0' + s;
        return `${m}:${s}`;
    }

    recordPlay(){
        let that = this;
        let img = new Image();
        func();
        function func(){
            that.playbackStatus = true;
            that.AnimationFrameVideo = window.requestAnimationFrame(func);

            that.progressoafter.style.width = ((that.videoOnload + 1)/that.saveto.length) * that.progressobarWidth + "px";
            that.videoTimedisplay[0].innerHTML = that.CanvasNode.timeChange((that.videoOnload + 1)/60);    //将当前视频时间显示在屏幕上

            img.src = that.saveto[that.videoOnload];
            img.onload = function(){
                let node = that.contrast(this.width,this.height);
                let x = that.nodePlot.x - node.a/2, y = that.nodePlot.y - node.b/2;

                that.canvasVideoCtx.clearRect(0, 0,that.canvasVideo.width,that.canvasVideo.height);    //清空canvas
                that.canvasVideoCtx.drawImage(img, 0, 0, this.width, this.height, x, y, node.a, node.b);     
            }
            that.videoOnload = that.videoOnload + 1;
            if(that.videoOnload >= that.saveto.length ){
                document.querySelector("#progressopen").click();
            }
        }
    }

    pictureLoad(){
        let that = this;
        let img = new Image();
        img.src = this.saveto[this.videoOnload];
        img.onload = function(){
            let node = that.contrast(this.width,this.height);
            let x = that.nodePlot.x - node.a/2, y = that.nodePlot.y - node.b/2;

            that.canvasVideoCtx.clearRect(0, 0,that.canvasVideo.width,that.canvasVideo.height);    //清空canvas
            that.canvasVideoCtx.drawImage(img, 0, 0, this.width, this.height, x, y, node.a, node.b);    

        }
    }

    canvasGIF(){
        this.videoOnload = 0;
        this.AnimationFrameVideo = null;
        this.playbackStatus = false;
        document.querySelector("#inputVido").value = "";
        this.backstageVideo.src = "";
        this.videoTimedisplay[0].innerHTML = "00:00";
        this.videoTimedisplay[1].innerHTML = this.CanvasNode.timeChange(this.saveto.length/60);
        this.progressoafter.style.width = "0px";
        this.videoIndex = "canvas";
    }

    saveBase64(){
        if(!this.base){
            this.base = true;  
        }
        else{
            this.base = false;
            window.cancelAnimationFrame(this.ed);
            this.backstageVideo.pause();
            document.getElementById("base64").style.backgroundColor = "blue";
        }
    }

    progressbarVideo(percent, e){
        if(this.backstageVideo.readyState === 4){  
            this.progressoafter.style.width = (e.pageX - progressobar.offsetLeft) + "px";
            this.backstageVideo.currentTime = percent * this.backstageVideo.duration;
        }
    }

    progressbarCanvas(percent, e){
        this.progressoafter.style.width = (e.pageX - progressobar.offsetLeft) + "px";
        this.videoOnload = parseInt(percent * this.saveto.length);
        this.CanvasNode.pictureLoad.call(this);
    }
}