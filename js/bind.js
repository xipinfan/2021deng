class Bind extends Tools{    //绑定事件类，继承主类
    constructor(){
        super();
        this.thisBind();
        this.videoBindingInit();
        this.videoButtonBindInit();
        this.canvasBindInit();
        this.canvasButtonBindInit();
        this.canvasDemoBindInit();
    }
    thisBind(){
        this.penstate = false;     //开始直线绘制
        this.ImageData = [];    //保存每一次绘制的图像
        this.forwardData = [];    //保存每一次回撤前的图像
        this.ImageLayerNode = new ImageLayer();      //导入工具类
        this.CanvasNode = new Canvas();  
    }
    videoBindingInit(){
        let that = this;    //保存this作用域
        this.backstageVideo.addEventListener('canplay',function(){        //准备就绪视频时调用，开启canvas打印video图像
            that.canvasVideoTape.width = this.videoWidth;
            that.canvasVideoTape.height = this.videoHeight;
            that.CanvasNode.onloadOpenVideo.call(that,this.videoWidth,this.videoHeight);
        })
    }
    canvasBindInit(){
        let that = this,
            lastCoordinate = {},
            beginLine = {};
        let xbind = document.querySelector("#x1");    //显示当前鼠标所在的坐标点
        let ybind = document.querySelector('#y1');
        this.canvasVideo.addEventListener("mousedown",function(e){    //当鼠标在canvas按下的时候开始记录路径，且保存初始画面
            that.penstate = true;
            switch(that.toolCurrent){
                case 'pencil':
                    that.canvasVideoCtx.beginPath();    //清除路径
                    that.ppx = e.layerX;    //记录坐标
                    that.ppy = e.layerY;
                    that.ImageLayerNode.graffiti.call(that,e.layerX+1,e.layerY+1);
                    break;
                case 'line':
                    break;
                case 'brush':
                    lastCoordinate.x = e.layerX;
                    lastCoordinate.y = e.layerY;
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
                        that.ImageLayerNode.graffiti.call(that,e.layerX,e.layerY);
                        break;
                    case 'line':
                        break;
                    case 'brush':
                        let curCoordinate = {
                            x:e.layerX,
                            y:e.layerY
                        };
                        that.ImageLayerNode.drawLine.call(that, lastCoordinate.x, lastCoordinate.y, curCoordinate.x, curCoordinate.y);
                        lastCoordinate = curCoordinate;
                        break;
                };
            }

            xbind.innerHTML = e.layerX;
            ybind.innerHTML = e.layerY;
        })
    }
    canvasButtonBindInit(){
        let that = this;
        document.querySelectorAll("#buttonLayout>button").forEach((element,index)=>{
            switch(element.id){
                case 'white':
                    element.addEventListener("click",function(e){    //初始化画板
                        that.ImageLayerNode.whiteBoard.call(that);
                        that.ImageData = [];
                        that.forwardData = [];
                    })
                    break;
                case 'withdraw':
                    element.addEventListener("click",function(e){    //回退图像
                        that.ImageLayerNode.updownImage.call(that, that.ImageData, that.forwardData);
                    })
                    break;
                case 'forward':
                    element.addEventListener("click",function(e){    //前进图像
                        that.ImageLayerNode.updownImage.call(that, that.forwardData, that.ImageData);
                    })
                    break;
                default:
                    element.addEventListener("click",function(e){
                        that.toolCurrent = that.tool[index-1];
                        if(that.toolCurrent === "line"){
                            that.canvasDemo.style.zIndex = 1001;
                        }
                        else{
                            that.canvasDemo.style.zIndex = 1;
                        }
                    })
            }
        })
        document.querySelectorAll('#sb1>input[type=button]').forEach(element => {
            element.addEventListener("click",function(e){
                switch(e.path[0].id){
                    case "addfontsize":
                        if(that.pensize<=12){
                            that.pensize += 2;
                        }
                        break;
                    case "reducefontsize":
                        if(that.pensize >= 4){
                            that.pensize -= 2;
                        }
                        break;
                }
            })
        });
    }
    videoButtonBindInit(){
        let that = this;    //保存this作用域
        document.querySelector('#play1').addEventListener("click",function(e){    //播放视频
            that.backstageVideo.play(); 
        })
        document.querySelector('#pause').addEventListener("click",function(e){    //停止播放视频
            that.backstageVideo.pause();
        })
        document.querySelector('#inputVido').addEventListener("change",function(e){    //插入视频
            that.CanvasNode.openCanvasVideo.call(that);     //将绑定工具类的作用域
        })
        document.querySelector('#recording').addEventListener("click",function(e){    //开启视频录制
            that.CanvasNode.recordingVideo.call(that);
        })
        document.querySelector("#stop").addEventListener("click",function(e){    //停止视频录制
            that.CanvasNode.stopRecordingVideo.call(that);
        })
    }
    canvasDemoBindInit(){
        let that = this,  beginLine = {}, endLine = {},nodeState = false, controlnode = true, operation = true, beginmobile = {}, endmobile = {};
        this.canvasDemo.addEventListener("mousedown", function(e){
            if(!controlnode){
                if(e.layerX<=Math.max(beginLine.x, endLine.x)+5 &&e.layerX >= Math.min(beginLine.x,endLine.x)-5 &&e.layerY<=Math.max(beginLine.y, endLine.y)+5&& e.layerY>=Math.min(beginLine.y ,endLine.y)-5 ){
                    beginmobile.x = e.layerX;
                    beginmobile.y = e.layerY;
                    operation = false;
                }
                else{
                    that.canvasDemoCtx.clearRect(0,0,this.width,this.height);
                    that.ImageLayerNode.drawDemoLine.call(that, that.canvasVideoCtx, beginLine, endLine);  
                    operation = true;
                }
            }
            else{
                beginLine.x = e.layerX;
                beginLine.y = e.layerY;
                nodeState = true;
            }
        });
        this.canvasDemo.addEventListener('mouseup', function(e){
            if(operation){
                endLine.x = e.layerX;
                endLine.y = e.layerY;
                if(controlnode){
                    if(that.toolCurrent === "line"){
                        that.ImageLayerNode.lineBox.call(that, beginLine.x, beginLine.y, endLine.x , endLine.y);    //直线框
                    }
                    else{
                        that.ImageLayerNode.dottedBox.call(that, beginLine.x, beginLine.y, endLine.x , endLine.y);    //矩形框
                    }
                }
                nodeState = false;
                controlnode = !controlnode;    
            }
            else{
                operation = !operation;
            }
        })
        this.canvasDemo.addEventListener("mousemove",function(e){
            console.log(operation);
            if(nodeState&&controlnode){
                endLine.x = e.layerX;
                endLine.y = e.layerY;
                that.canvasDemoCtx.clearRect(0,0,this.width,this.height);
                that.ImageLayerNode.drawDemoLine.call(that, that.canvasDemoCtx,beginLine, endLine);  
            }
            else if(!controlnode){
                that.ImageLayerNode.mousePointer.call(that, e, beginLine, endLine, that.ImageLayerNode.boundary);
            }
            if(!operation){
                if(that.toolCurrent === "line"){
                    let spot;
                    if(e.layerX <= beginLine.x+5 && e.layerX >= beginLine.x+5 &&  e.layerY <= beginLine.y+5 && e.layerY >= beginLine.y-5 ){

                    }
                    else if(e.layerX <= endLine.x+5 && e.layerX >= endLine.x+5 &&  e.layerY <= endLine.y+5 && e.layerY >= endLine.y-5 ){

                    }
                    else if(){

                    }
                }
                else{
                    let node = that.ImageLayerNode.boundary(e, beginLine, endLine);
                    switch(node){
                        case "core":
                            endmobile.x = e.layerX - beginmobile.x;
                            endmobile.y = e.layerY - beginmobile.y;
                            beginmobile.x = e.layerX;
                            beginmobile.y = e.layerY;
                            beginLine.x += endmobile.x;
                            beginLine.y += endmobile.y;
                            endLine.x += endmobile.x;
                            endLine.y += endmobile.y;
                            that.canvasDemoCtx.clearRect(0,0,this.width,this.height);
                            that.ImageLayerNode.drawDemoLine.call(that, that.canvasDemoCtx, beginLine, endLine);
                            that.ImageLayerNode.dottedBox.call(that, beginLine.x, beginLine.y, endLine.x , endLine.y);
                            break;
                        case "topleft":
                            endmobile.x = e.layerX - beginmobile.x;
                            beginmobile.x = e.layerX;
                            beginmobile.y = e.layerY;
                            if(beginLine.x>endLine.x)endLine.x += endmobile.x;
                            else beginLine.x += endmobile.x;
                            if(beginLine.y>endLine.y)endLine.y += endmobile.y;
                            else beginLine.y += endmobile.y;
                            that.canvasDemoCtx.clearRect(0,0,this.width,this.height);
                            that.ImageLayerNode.drawDemoLine.call(that, that.canvasDemoCtx, beginLine, endLine);
                            that.ImageLayerNode.dottedBox.call(that, beginLine.x, beginLine.y, endLine.x , endLine.y);
                            break;
                        case "lowerleft":
                            break;
                        case "topright":
                            break;
                        case "lowerright":
                            break;
                        case "top":
                            break;
                        case "lower":
                            break;
                        case "right":
                            break;
                        case "left":
                            endmobile.x = e.layerX - beginmobile.x;
                            beginmobile.x = e.layerX;
                            beginmobile.y = e.layerY;
                            if(beginLine.x>endLine.x)endLine.x += endmobile.x;
                            else beginLine.x += endmobile.x;
                            that.canvasDemoCtx.clearRect(0,0,this.width,this.height);
                            that.ImageLayerNode.drawDemoLine.call(that, that.canvasDemoCtx, beginLine, endLine);
                            that.ImageLayerNode.dottedBox.call(that, beginLine.x, beginLine.y, endLine.x , endLine.y);
                            break;
                        default:
                            
                    }
                }
            }
        })
    }
}