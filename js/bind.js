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
        this.centralPoint = { x1:-1 , y1:-1 , x2:-1 , y2:-1 };
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
        let colorto = document.querySelector('#rgb');    //获取展示项
        let colorchoice = document.querySelector("input[type=color]");   //获取颜色选择器
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
                case 'extract':
                    let RGB = that.ImageLayerNode.extractPixels(that.canvasVideoCtx , e.layerX, e.layerY);    //提取颜色
                    colorto.innerHTML = RGB;
                    colorchoice.value = RGB.colorHex();
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
        let colorchoice = document.querySelector("input[type=color]");   //获取颜色选择器
        let colorto = document.querySelector('#rgb');    //获取展示项
        colorto.innerHTML = "RGB(0,0,0)";
        document.querySelectorAll("#flipButton>button").forEach((element,index)=>{
            element.addEventListener("click",function(e){
                let middle = { x:(that.centralPoint.x1+that.centralPoint.x2)/2 , y:(that.centralPoint.y1+that.centralPoint.y2)/2 };
                let x = (that.centralPoint.x2 - that.centralPoint.x1)/2, y = (that.centralPoint.y2 - that.centralPoint.y1)/2 ;
                if(that.centralPoint.x1 !== -1){
                    switch(element.id){
                        case "clockwise":
                            shapeFlip( {x: middle.x + y , y: middle.y - x}, {x: middle.x - y , y: middle.y + x} );
                            break;
                        case "anticlockwise":
                            shapeFlip( {x: middle.x - y , y: middle.y + x}, {x: middle.x + y , y: middle.y - x} );
                            break;
                        case "reversal":
                            shapeFlip( {x: middle.x - x , y: middle.y - y}, {x: middle.x + x , y: middle.y + y} );
                            break;
                        case "flip":
                            console.log("翻转图像导致的问题太多，以至于移动什么的都无法实现，只能取消");
                    }    
                }
            })
        })
        function shapeFlip( beginLine, endLine ){
            that.canvasDemoCtx.clearRect(0,0,that.width,that.height);    //清除画布
            let minbegin = {x:Math.min(beginLine.x,endLine.x),y:Math.min(beginLine.y,endLine.y)};
            let maxend = {x:Math.max(beginLine.x,endLine.x),y:Math.max(beginLine.y,endLine.y)};
            switch(that.toolCurrent){
                case "line":
                    that.ImageLayerNode.drawDemoLine.call(that, that.canvasDemoCtx, beginLine, endLine);    //重绘直线
                    that.ImageLayerNode.lineBox.call(that, beginLine.x, beginLine.y, endLine.x , endLine.y);    //直线框
                    break
                case "rectangle":
                    that.ImageLayerNode.solidBox.call(that, that.canvasDemoCtx, beginLine.x, beginLine.y, endLine.x, endLine.y);    //矩形框
                    that.ImageLayerNode.dottedBox.call(that, beginLine.x, beginLine.y, endLine.x, endLine.y);    //虚线提示框
                    break;
                case "round":
                    that.ImageLayerNode.solidRound.call(that, that.canvasDemoCtx, minbegin, maxend);    //圆形
                    that.ImageLayerNode.dottedBox.call(that, beginLine.x, beginLine.y, endLine.x, endLine.y);    //虚线提示框
                    break;
                
            }
            that.centralPoint = { x1:beginLine.x , y1:beginLine.y , x2:endLine.x , y2:endLine.y };
        }
        
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
                        if(that.toolCurrent === "line" || that.toolCurrent === "rectangle" || that.toolCurrent === "round"){    //判断按下的按钮是否为直线或者矩形按钮，需要特殊画布
                            that.canvasDemo.style.zIndex = 1001;
                        }
                        if(that.toolCurrent === "eraser"){    //当按下的为橡皮擦时改变鼠标样式
                            let str = '../fonts/rubber/'+that.rubberIconSize+'.png';
                            that.canvasVideo.style.cursor = "url("+ str +"),move";
                        }
                        if(that.toolCurrent === "bucket"){
                            that.canvasVideo.style.cursor = "url(../fonts/rubber/油漆桶.png),move";
                        }
                        if(that.toolCurrent === "extract"){
                            that.canvasVideo.style.cursor = "crosshair";
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
        colorchoice.addEventListener("input",function(e){
            colorto.innerHTML = this.value.toLowerCase().colorRgb();
            that.strokeColor = this.value.toLowerCase();
            that.canvasVideoCtx.fillStyle  = that.strokeColor;
            that.canvasVideoCtx.strokeStyle  = that.strokeColor;
            that.canvasDemoCtx.fillStyle  = that.strokeColor;
            that.canvasDemoCtx.strokeStyle  = that.strokeColor;
        })
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
                        stay = that.ImageLayerNode.boundary(that.canvasDemo, e, firstplot, endplot, that.ImageLayerNode.lineDistance, that.ImageLayerNode.pointToLine);;
                }  
                if(stay !== "default"){    
                    beginmobile.x = e.layerX;    //记录初始点
                    beginmobile.y = e.layerY;
                    operation = true;    //当前已经在区域中按下的标记
                }
                else{
                    that.canvasDemoCtx.clearRect(0,0,that.width,that.height);    //清除虚拟画布
                    that.ImageData.push(that.canvasVideoCtx.getImageData(0,0,that.width,that.height));    //记录canvas画布数据
                    switch(that.toolCurrent){
                        case "line":
                            that.ImageLayerNode.drawDemoLine.call(that, that.canvasVideoCtx, beginLine, endLine);      //将直线数据记录在主canvas画布上
                            break;
                        case "rectangle":
                            that.ImageLayerNode.solidBox.call(that, that.canvasVideoCtx, firstplot.x, firstplot.y, endplot.x, endplot.y);    //矩形框
                            break;
                        case "round":
                            that.ImageLayerNode.solidRound.call(that, that.canvasVideoCtx, firstplot, endplot);    //圆形
                            break;
                    }
                    that.centralPoint = { x1:-1 , y1:-1 , x2:-1 , y2:-1 };
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
                        that.centralPoint = { x1:beginLine.x , y1:beginLine.y , x2:endLine.x , y2:endLine.y };
                        that.ImageLayerNode.lineBox.call(that, beginLine.x, beginLine.y, endLine.x , endLine.y);    //直线提示框
                        break;
                    default:
                        that.centralPoint = { x1:firstplot.x , y1:firstplot.y , x2:endplot.x , y2:endplot.y };
                        that.ImageLayerNode.dottedBox.call(that, firstplot.x, firstplot.y, endplot.x, endplot.y);     //虚线提示框
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
                    that.canvasDemoCtx.clearRect(0,0,that.width,that.height);    //清除画布
                    firstplot = { x:Math.min(beginLine.x,endLine.x),y:Math.min(beginLine.y,endLine.y) };
                    endplot = { x:Math.max(beginLine.x,endLine.x),y:Math.max(beginLine.y,endLine.y) };
                    switch(that.toolCurrent){
                        case "line":
                            that.ImageLayerNode.drawDemoLine.call(that, that.canvasDemoCtx, beginLine, endLine);    //画线，之后可以用switch来分别画其他图形
                            break;
                        case "rectangle":
                            that.ImageLayerNode.solidBox.call(that, that.canvasDemoCtx, firstplot.x, firstplot.y, endplot.x, endplot.y);    //矩形框
                            break;
                        case "round":
                            that.ImageLayerNode.solidRound.call(that, that.canvasDemoCtx, firstplot, endplot);    //圆形
                            break;
                    }
                }
            }
            else{    //修改状态
                if(!operation && that.centralPoint !== -1){
                    beginLine = {x:that.centralPoint.x1, y:that.centralPoint.y1};
                    endLine = {x:that.centralPoint.x2, y:that.centralPoint.y2};
                    firstplot = { x:Math.min(that.centralPoint.x1,that.centralPoint.x2),y:Math.min(that.centralPoint.y1,that.centralPoint.y2) };
                    endplot = { x:Math.max(that.centralPoint.x1,that.centralPoint.x2),y:Math.max(that.centralPoint.y1,that.centralPoint.y2) };
                }
                switch(that.toolCurrent){    //判断图形类型
                    case "line":
                        that.ImageLayerNode.mousePointLine(e, beginLine, endLine, that.canvasDemo);
                        break;
                    default:
                        that.ImageLayerNode.boundary(that.canvasDemo, e, firstplot, endplot, that.ImageLayerNode.lineDistance, that.ImageLayerNode.pointToLine);
                }
                if(operation){    //按下区域为修改区域时
                    endmobile.x = e.layerX - beginmobile.x;    //点到点差值
                    endmobile.y = e.layerY - beginmobile.y;
                    beginmobile.x = e.layerX;     //初始化下一个点
                    beginmobile.y = e.layerY;
                    if(that.toolCurrent === "line"){     //直线特殊判断
                        let node = that.ImageLayerNode.spotLineDistance(beginLine, endLine, {x: e.layerX, y: e.layerY});    //判断当前区域类型
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
                        that.canvasDemoCtx.clearRect(0,0,that.width,that.height);    //清除画布
                        that.ImageLayerNode.drawDemoLine.call(that, that.canvasDemoCtx, beginLine, endLine);    //重绘直线
                        that.centralPoint = { x1:beginLine.x , y1:beginLine.y , x2:endLine.x , y2:endLine.y };
                        that.ImageLayerNode.lineBox.call(that, beginLine.x, beginLine.y, endLine.x , endLine.y);    //直线框
                    }
                    else{
                        let node = that.ImageLayerNode.boundary(that.canvasDemo, e, firstplot, endplot, that.ImageLayerNode.lineDistance, that.ImageLayerNode.pointToLine);
                        switch(node){
                            case "core":
                                firstplot.x += endmobile.x;
                                firstplot.y += endmobile.y;
                                endplot.x += endmobile.x;
                                endplot.y += endmobile.y;
                                break;
                            case "topleft":
                                firstplot.x += endmobile.x;
                                firstplot.y += endmobile.y;
                                break;
                            case "lowerleft":
                                firstplot.x += endmobile.x;
                                endplot.y += endmobile.y;
                                break;
                            case "topright":
                                endplot.x += endmobile.x;
                                firstplot.y += endmobile.y;
                                break;
                            case "lowerright":
                                endplot.x += endmobile.x;
                                endplot.y += endmobile.y;
                                break;
                            case "top":
                                firstplot.y += endmobile.y;
                                break;
                            case "lower":
                                endplot.y += endmobile.y;
                                break;
                            case "right":
                                endplot.x += endmobile.x;
                                break;
                            case "left":
                                firstplot.x += endmobile.x;
                                break;
                        }
                        that.canvasDemoCtx.clearRect(0,0,that.width,that.height);
                        that.centralPoint = { x1:firstplot.x , y1:firstplot.y , x2:endplot.x , y2:endplot.y };
                        switch(that.toolCurrent){
                            case "rectangle":
                                that.ImageLayerNode.solidBox.call(that, that.canvasDemoCtx, firstplot.x, firstplot.y, endplot.x, endplot.y);    //矩形框
                                break;
                            case "round":
                                that.ImageLayerNode.solidRound.call(that, that.canvasDemoCtx, firstplot, endplot);    //圆形
                                break;
                        }
                        that.ImageLayerNode.dottedBox.call(that, firstplot.x, firstplot.y, endplot.x, endplot.y);    //虚线提示框
                    }
                }
            }
        })
    }
}