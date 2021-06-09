class Canvas extends Tools{
    constructor(){  
        super();
    }
    //将视频投射到画布上
    openCanvasVideo(){
        let that = this;
        let inputVideo = document.querySelector('input');
        this.backstageVideo.src = window.URL.createObjectURL(inputVideo.files[0]);    //获取视频所在路径并播放
        this.backstageVideo.controls = true;
        setTimeout(()=>{that.backstageVideo.play();},0)    //异步播放视频
    }
    onloadOpenVideo(videoWidth,videoHeight){
        let that = this;
        render();
        function render(){    //将视频投放到canvas上
            window.requestAnimationFrame(render);    //每秒触发60次这个函数
            that.canvasVideoCtx.clearRect(0, 0,that.canvasVideo.width,that.canvasVideo.height);    //清空canvas
            that.canvasVideoCtx.drawImage(that.backstageVideo, 0, 0,videoWidth,videoHeight,0,0,that.contrast(videoWidth,that.width),that.contrast(videoHeight,that.height));
            that.canvasVideoTapeCtx.clearRect(0,0,that.canvasVideoTape.width,that.canvasVideoTape.height);
            that.canvasVideoTapeCtx.drawImage(that.backstageVideo, 0, 0,videoWidth,videoHeight);
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
    stopRecordingVideo(){
        if(this.recorder){
            this.recorder.stop();
        }
    }
}