class Bind extends Tools{    //绑定事件类，继承主类
    constructor(){
        super();
        this.eventBindingInit();
    }
    eventBindingInit(){
        let that = this,
            CanvasNode = new Canvas(),
            ImageLayerNode = new ImageLayer(),        //导入工具类，以及保存this作用域
            lastTimesTamp = 0,
            lastCoordinate = {},
            lastLineWidth = -1;
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


        this.canvasVideo.addEventListener("mousedown",function(e){    //当鼠标在canvas按下的时候开始记录路径，且保存初始画面
            that.penstate = true;
            switch(that.toolCurrent){
                case 'pencil':
                    that.canvasVideoCtx.beginPath();    //清除路径
                    that.ppx = e.layerX;    //记录坐标
                    that.ppy = e.layerY;
                    ImageLayerNode.graffiti.call(that,e.layerX+1,e.layerY+1);
                    break;
                case 'line':
                    break;
                case 'brush':
                    lastCoordinate.x = e.layerX;
                    lastCoordinate.y = e.layerY;
                    lastTimesTamp = new Date().getTime();
                    break;
            };
            that.ImageData.push(that.canvasVideoCtx.getImageData(0,0,that.width,that.height));    //记录canvas画布数据
        })
        let drawEndBind = ['mouseup','mouseleave'];
        drawEndBind.forEach(function(item){
            that.canvasVideo.addEventListener(item,function(e){    //当鼠标在canvas松开时结束一次记录
                //ImageLayerNode.graffiti.call(that,e.layerX,e.layerY);
                that.penstate = false;
            })
        })
        this.canvasVideo.addEventListener("mousemove",function(e){    //当鼠标按下且移动时对每移动的两个点进行连接，模拟涂鸦
            if(that.penstate){
                switch(that.toolCurrent){
                    case 'pencil':
                        ImageLayerNode.graffiti.call(that,e.layerX,e.layerY);
                        break;
                    case 'line':
                        break;
                    case 'brush':
                        let curCoordinate = {
                            x:e.layerX,
                            y:e.layerY
                        },curTimestamp = new Date().getTime();

                        let s = ImageLayerNode.calcDistance.call(that,lastCoordinate, curCoordinate);
                        let t = curTimestamp - lastTimesTamp;
                        let curLineWidth = ImageLayerNode.caleLineWidth.call(that, s, t);
                        
                        ImageLayerNode.drawLine.call(that, lastCoordinate.x, lastCoordinate.y, curCoordinate.x, curCoordinate.y, 10);

                        lastCoordinate = curCoordinate;
                        lastTimesTamp = curTimestamp;
                        lastLineWidth = curLineWidth;
                        break;
                };
            }

            xbind.innerHTML = e.layerX;
            ybind.innerHTML = e.layerY;
        })
        
        document.querySelectorAll("#buttonLayout>button").forEach((element,index)=>{
            switch(element.id){
                case 'white':
                    element.addEventListener("click",function(e){    //初始化画板
                        ImageLayerNode.whiteBoard.call(that);
                        that.ImageData = [];
                        that.forwardData = [];
                    })
                    break;
                case 'withdraw':
                    element.addEventListener("click",function(e){    //回退图像
                        ImageLayerNode.updownImage.call(that, that.ImageData, that.forwardData);
                    })
                    break;
                case 'forward':
                    element.addEventListener("click",function(e){    //前进图像
                        ImageLayerNode.updownImage.call(that, that.forwardData, that.ImageData);
                    })
                    break;
                default:
                    element.addEventListener("click",function(e){
                        that.toolCurrent = that.tool[index-1];
                        console.log(that.toolCurrent);
                    })
            }
        })
        document.querySelectorAll('#sb1>input[type=button]').forEach(element => {
            element.addEventListener("click",function(e){
                switch(e.path[0].id){
                    case "addfontsize":
                        if(that.brushWidth >= 100){
                            that.brushWidth -= 50;
                        }
                        else if(that.brushWidth === 50){
                            that.brushWidth = 30;
                        }
                        else if(that.brushWidth === 30){
                            that.brushWidth = 20;
                        }
                        break;
                    case "reducefontsize":
                        if(that.brushWidth < 500){
                            that.brushWidth += 50;
                        }
                        break;
                }
            })
        });
    }
}