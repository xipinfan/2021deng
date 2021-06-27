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
            lastCoordinate = {};
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
                case 'brush':
                    lastCoordinate.x = e.layerX;
                    lastCoordinate.y = e.layerY;
                    break;
                case 'eraser':
                    that.ImageLayerNode.eliminate.call(that, e);    //所在区域方型涂白
                default:
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
                    case 'brush':
                        let curCoordinate = {
                            x:e.layerX,
                            y:e.layerY
                        };
                        that.ImageLayerNode.drawLine.call(that, lastCoordinate.x, lastCoordinate.y, curCoordinate.x, curCoordinate.y);
                        lastCoordinate = curCoordinate;
                        break;
                    case 'eraser':
                        that.ImageLayerNode.eliminate.call(that, e);   //所在区域方型涂白
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
                        that.canvasDemo.style.zIndex = 1;
                        that.canvasVideo.style.cursor = "default";
                        if(that.toolCurrent === "line" || that.toolCurrent === "rectangle"){    //判断按下的按钮是否为直线或者矩形按钮，需要特殊画布
                            that.canvasDemo.style.zIndex = 1001;
                        }
                        if(that.toolCurrent === "eraser"){    //当按下的为橡皮擦时改变鼠标样式
                            let str = '../fonts/rubber/'+that.rubberIconSize+'.png';
                            that.canvasVideo.style.cursor = "url("+ str +"),move";
                        }
                    })
            }
        })
        document.querySelectorAll('#sb1>input[type=button]').forEach(element => {
            element.addEventListener("click",function(e){
                switch(e.path[0].id){
                    case "addfontsize":    //画笔粗细控制
                        if(that.pensize<=12){
                            that.pensize += 2;
                        }
                        break;
                    case "reducefontsize":
                        if(that.pensize >= 4){
                            that.pensize -= 2;
                        }
                        break; 
                    case "eraserenlarge":    //橡皮粗细控制
                        if(that.rubberIconSize < 20){
                            that.rubberIconSize += 4;
                        }
                        break;
                    case "erasernarrow":
                        if(that.rubberIconSize > 4){
                            that.rubberIconSize -= 4;
                        }
                        break;
                }
                if(that.toolCurrent === "eraser"){
                    let str = '../fonts/rubber/'+that.rubberIconSize+'.png';
                    that.canvasVideo.style.cursor = "url("+ str +"),move";
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
    canvasDemoBindInit(){    //虚拟框画布函数
        let that = this, stay,  
            beginLine = {}, 
            endLine = {},
            nodeState = false, 
            controlnode = true, 
            operation = false, 
            beginmobile = {}, 
            endmobile = {},
            firstplot = {},
            endplot = {};
        //controlnode作为标记当前canvas状态的标记，true标识为划线状态，false为修改状态。nodeState为鼠标是否按下的标记，true为按下，false为未按下
        //operation作为按下鼠标之后是否在操作区域的标记，true为在，false不在
        this.canvasDemo.addEventListener("mousedown", function(e){
            if(controlnode){    //划线状态时
                beginLine.x = e.layerX;    //保存初始路径
                beginLine.y = e.layerY;
                nodeState = true;    //开始记录当前路径
            }
            else{
                switch(that.toolCurrent){       //判断当前是否处于区域中
                    case "line":
                        stay = that.ImageLayerNode.spotLineDistance(beginLine, endLine, {x:e.layerX,y:e.layerY});
                        break;
                    default:
                        stay = that.ImageLayerNode.boundary({x:e.layerX,y:e.layerY}, beginLine, endLine);
                }  
                if(stay !== "default"){    
                    beginmobile.x = e.layerX;    //记录初始点
                    beginmobile.y = e.layerY;
                    operation = true;    //当前已经在区域中按下的标记
                }
                else{
                    that.canvasDemoCtx.clearRect(0,0,this.width,this.height);    //清除虚拟画布
                    that.ImageData.push(that.canvasVideoCtx.getImageData(0,0,that.width,that.height));    //记录canvas画布数据
                    that.ImageLayerNode.drawDemoLine.call(that, that.canvasVideoCtx, beginLine, endLine);      //将直线数据记录在主canvas画布上
                }
            }
        });
        this.canvasDemo.addEventListener('mouseup', function(e){ 
            if(nodeState){    //当鼠标按下时
                endLine.x = e.layerX;    //划线状态下记录终点
                endLine.y = e.layerY;
                firstplot = { x:Math.min(beginLine.x,endLine.x),y:Math.min(beginLine.y,endLine.y) };
                endplot = { x:Math.max(beginLine.x,endLine.x),y:Math.max(beginLine.y,endLine.y) };
                switch(that.toolCurrent){    //判断虚拟框
                    case "line":
                        that.ImageLayerNode.lineBox.call(that, beginLine.x, beginLine.y, endLine.x , endLine.y);    //直线框
                        break;
                    default:
                        that.ImageLayerNode.dottedBox.call(that, firstplot.x, firstplot.y, endplot.x, endplot.y);    //矩形框
                }  
                nodeState = false;    //记录鼠标抬起
            }
            if(!operation){    //当鼠标不是按在此区域时或者为划线状态时，operation为false
                controlnode = !controlnode;    //转换形态    
            }
            operation = false;   //初始化标记的状态
        })
        this.canvasDemo.addEventListener("mousemove",function(e){
            if(controlnode){    //划线状态
                if(nodeState){
                    endLine.x = e.layerX;    //记录结束路径
                    endLine.y = e.layerY;
                    that.canvasDemoCtx.clearRect(0,0,this.width,this.height);    //清除画布
                    firstplot = { x:Math.min(beginLine.x,endLine.x),y:Math.min(beginLine.y,endLine.y) };
                    endplot = { x:Math.max(beginLine.x,endLine.x),y:Math.max(beginLine.y,endLine.y) };
                    switch(that.toolCurrent){
                        case "line":
                            that.ImageLayerNode.drawDemoLine.call(that, that.canvasDemoCtx, beginLine, endLine);    //画线，之后可以用switch来分别画其他图形
                            break;
                        default:
                            that.ImageLayerNode.solidBox.call(that, firstplot.x, firstplot.y, endplot.x, endplot.y);    //矩形框
                    }
                }
            }
            else{    //修改状态
                switch(that.toolCurrent){    //判断图形类型
                    case "line":
                        that.ImageLayerNode.mousePointLine(e, beginLine, endLine, that.canvasDemo);
                        break;
                    default:
                        that.ImageLayerNode.mousePointer.call(that, e, firstplot, endplot, that.ImageLayerNode.boundary, that.ImageLayerNode.lineDistance, that.ImageLayerNode.pointToLine);
                }
                if(operation){    //按下区域为修改区域时
                    if(that.toolCurrent === "line"){     //直线特殊判断
                        let node = that.ImageLayerNode.spotLineDistance(beginLine, endLine, {x: e.layerX, y: e.layerY});    //判断当前区域类型
                        endmobile.x = e.layerX - beginmobile.x;    //点到点差值
                        endmobile.y = e.layerY - beginmobile.y;
                        beginmobile.x = e.layerX;     //初始化下一个点
                        beginmobile.y = e.layerY;
                        switch(node){
                            case "core":
                                beginLine.x += endmobile.x;    //移动线段初始或者结束坐标
                                beginLine.y += endmobile.y;
                                endLine.x += endmobile.x;
                                endLine.y += endmobile.y;
                                break;
                            case "begin":
                                beginLine.x += endmobile.x;
                                beginLine.y += endmobile.y;
                                
                                break;
                            case "end":
                                endLine.x += endmobile.x;
                                endLine.y += endmobile.y;
                                break;
                        }
                        that.canvasDemoCtx.clearRect(0,0,this.width,this.height);    //清除画布
                        that.ImageLayerNode.drawDemoLine.call(that, that.canvasDemoCtx, beginLine, endLine);    //重绘直线
                        that.ImageLayerNode.lineBox.call(that, beginLine.x, beginLine.y, endLine.x , endLine.y);    //直线框
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
            }
        })
    }
}