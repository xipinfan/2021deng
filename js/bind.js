class Bind extends Canvas{
    constructor(){
        super();
        this.eventBindingInit();
    }
    eventBindingInit(){
        let that = this;
        document.querySelector('#play1').addEventListener("click",function(e){    //播放视频
            that.backstageVideo.play(); 
        })
        document.querySelector('#pause').addEventListener("click",function(e){    //停止播放视频
            that.backstageVideo.pause();
        })
        document.querySelector('#inputVido').addEventListener("change",function(e){    //插入视频
            that.openCanvasVideo();
        })
        document.querySelector('#recording').addEventListener("click",function(e){    //开启视频录制
            that.recordingVideo();
        })
        document.querySelector("#stop").addEventListener("click",function(e){    //停止视频录制
            that.stopRecordingVideo();
        })
        this.backstageVideo.addEventListener('canplay',function(){
            that.canvasVideoTape.width = this.videoWidth;
            that.canvasVideoTape.height = this.videoHeight;
            that.onloadOpenVideo(this.videoWidth,this.videoHeight)
        })
    }
}