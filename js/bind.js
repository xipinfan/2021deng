class Bind extends Tools{    //绑定事件类，继承主类
    constructor(){
        super();
        this.eventBindingInit();
    }
    eventBindingInit(){
        let that = this,CanvasNode = new Canvas(),ImageLayerNode = new ImageLayer();    //导入工具类，以及保存this作用域
        this.penstate = false;     //开始直线绘制
        this.ImageData = [];    //保存每一次绘制的图像
        this.forwardData = [];    //保存每一次回撤前的图像
        let xbind = document.querySelector("#x1");    //显示当前鼠标所在的坐标点
        let ybind = document.querySelector('#y1');
        document.querySelector('#play1').addEventListener("click",function(e){    //播放视频
            that.backstageVideo.play(); 
        })
        document.querySelector('#pause').addEventListener("click",function(e){    //停止播放视频
            that.backstageVideo.pause();
        })
        document.querySelector('#inputVido').addEventListener("change",function(e){    //插入视频
            CanvasNode.openCanvasVideo.call(that);     //将绑定工具类的作用域
        })
        document.querySelector('#recording').addEventListener("click",function(e){    //开启视频录制
            CanvasNode.recordingVideo.call(that);
        })
        document.querySelector("#stop").addEventListener("click",function(e){    //停止视频录制
            CanvasNode.stopRecordingVideo.call(that);
        })
        this.backstageVideo.addEventListener('canplay',function(){        //准备就绪视频时调用，开启canvas打印video图像
            that.canvasVideoTape.width = this.videoWidth;
            that.canvasVideoTape.height = this.videoHeight;
            CanvasNode.onloadOpenVideo.call(that,this.videoWidth,this.videoHeight);
        })
        document.querySelector("#white").addEventListener("click",function(e){    //初始化画板
            ImageLayerNode.whiteBoard.call(that);
            that.ImageData = [];
            that.forwardData = [];
        })
        this.canvasVideo.addEventListener("mousedown",function(e){    //当鼠标在canvas按下的时候开始记录路径，且保存初始画面
            that.penstate = true;
            that.ppx = e.layerX;
            that.ppy = e.layerY;
            that.ImageData.push(that.canvasVideoCtx.getImageData(0,0,that.width,that.height));
            ImageLayerNode.graffiti.call(that,e.layerX+1,e.layerY+1,2);
        })
        this.canvasVideo.addEventListener("mouseup",function(e){    //当鼠标在canvas松开时结束一次记录
            that.penstate = false;
            ImageLayerNode.graffiti.call(that,e.layerX,e.layerY,2);
        })
        this.canvasVideo.addEventListener("mousemove",function(e){    //当鼠标按下且移动时对每移动的两个点进行连接，模拟涂鸦
            xbind.innerHTML = "X:"+e.layerX;
            ybind.innerHTML = "Y:"+e.layerY;
            ImageLayerNode.graffiti.call(that,e.layerX,e.layerY,2);
        })
        document.querySelector('#withdraw').addEventListener("click",function(e){    //回退图像
            ImageLayerNode.updownImage.call(that, that.ImageData, that.forwardData);
        })
        document.querySelector('#forward').addEventListener("click",function(e){    //前进图像
            ImageLayerNode.updownImage.call(that, that.forwardData, that.ImageData);
        })
    }
}