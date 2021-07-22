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
        this.centralPoint = { x1:-1 , y1:-1 , x2:-1 , y2:-1 };    //图像翻转坐标记录
        this.textDottedLine = {};    //文本的坐标记录
        this.textValue = "";    //记录textarea输入框的输入内容
        this.timeto = setInterval(null,10);    //设定定时闪烁的提示
    }
    videoBindingInit(){    //视频初始
        let that = this;    //保存this作用域
        this.progressoafter = document.getElementById("progressoafter");
        this.videoTimedisplay = document.querySelectorAll("#progresswrap>span");
        this.backstageVideo.addEventListener('canplay',function(){        //准备就绪视频时调用，开启canvas打印video图像
            that.canvasVideoTape.width = this.videoWidth;
            that.canvasVideoTape.height = this.videoHeight;
            that.videoTimedisplay[1].innerHTML = that.CanvasNode.timeChange(this.duration);
            that.videoData = { w:this.videoWidth, h:this.videoHeight }
            that.CanvasNode.onloadOpenVideo.call(that,this.videoWidth,this.videoHeight);
        })
    }
    videoButtonBindInit(){    //视频指令绑定
        let that = this, 
            nodeState = false,
            start, end,
            typebullet = "top";    //保存this作用域
        let openicon = document.getElementById("openicon"),
            pauseicon = document.getElementById("pauseicon"),
            progressobar = document.getElementById("progressrange"),
            addsubtitle = document.getElementById("addsubtitle"),
            currentPX = document.getElementById("currentPX");
        
        this.videoIndex = "video";
        this.saveto = [];
        this.textVideoInput = false;
        this.canvasvideoData = {};
        this.barrage = null;
        pauseicon.style.display = "none";
        openicon.style.display = "inline";
        currentPX.style.fontSize = document.getElementById("current").innerText + "px";

        progressobar.addEventListener("mousedown",(e)=>{
            let percent = (e.pageX - progressobar.offsetLeft) / that.progressobarWidth;
            nodeState = true;
            if(that.videoIndex === "video"){
                that.CanvasNode.progressbarVideo.call(that,percent, e);   
            }
            else if(that.videoIndex === "canvas"){
                that.CanvasNode.progressbarCanvas.call(that,percent, e);   
            }
        })

        let drawEndBind = ['mouseup','mouseleave'];
        drawEndBind.forEach(function(item){
            progressobar.addEventListener(item,function(e){    //当鼠标在canvas松开时结束一次记录
                nodeState = false;
            })
        })

        progressobar.addEventListener("mousemove", (e)=>{
            if(nodeState){
                let percent = (e.pageX - progressobar.offsetLeft) / that.progressobarWidth;
                if(that.videoIndex === "video"){
                    that.CanvasNode.progressbarVideo.call(that,percent, e);   
                }
                else if(that.videoIndex === "canvas"){
                    that.CanvasNode.progressbarCanvas.call(that,percent, e); 
                } 
            }
        })

        document.querySelectorAll('#videoButton>button').forEach((element)=>{
            element.addEventListener("click",function(e){
                switch(element.id){
                    case "play1":{    //播放视频
                        that.backstageVideo.play(); 
                        that.CanvasNode.onloadOpenVideo.call(that,that.videoData.w,that.videoData.h);
                        break;
                    }  
                    case "pause":{    //停止播放视频
                        that.backstageVideo.pause();
                        if(that.ed){
                            window.cancelAnimationFrame(that.ed);
                        }
                        break;
                    }
                    case "recording":{    //开启视频录制
                        that.CanvasNode.recordingVideo.call(that);
                        break;
                    }
                    case "stop":{   //停止视频录制
                        that.CanvasNode.stopRecordingVideo.call(that);
                        if(that.ed){
                            window.cancelAnimationFrame(that.ed);
                        }
                        break;
                    }
                    case "intercept":{    //截取当前帧
                        that.backstageVideo.pause();
                        if(that.ed){
                            window.cancelAnimationFrame(that.ed);
                        }
                        break;
                    } 
                    case "addsubtitle":{
                        if(that.videoIndex === "canvas"){
                            let value = document.getElementById("subtitle").value;
                            let Text = document.getElementById("current").innerText;
                            if(value){
                                if(this.innerText === "添加字幕"){
                                    that.canvasDemoCtx.clearRect( 0, 0, that.canvasVideo.width, that.canvasVideo.height);
                                    that.canvasDemo.style.zIndex = 1001;
                                    that.canvasDemoCtx.save();
                                    that.canvasDemoCtx.font = Text + "px serif";    //字体大小

                                    let index = 0;
                                    let textQueue = [];
                                    textQueue[index] = "";

                                    for(let i of value){
                                        if(that.canvasDemoCtx.measureText(textQueue[index] + i).width > that.canvasvideoData.w){
                                            index++;
                                            textQueue[index] = "";
                                        }
                                        textQueue[index] += i;
                                    }
                                    console.log(textQueue)
                                    for(let i = 0 ; i < textQueue.length ; i++){
                                        let nP = { x:that.nodePlot.x-that.canvasDemoCtx.measureText(textQueue[i]).width/2,
                                                   y:that.nodePlot.y+that.canvasvideoData.h/2- (textQueue.length-1) * Text };
                                        that.ImageLayerNode.textFill(that.canvasDemoCtx, textQueue[i], nP, i * Text);
                                    }
                                    that.canvasDemoCtx.restore();

                                    this.innerText = "选择结束帧";
                                    document.getElementById("subtitlebegin").innerHTML = that.CanvasNode.timeChangeFrame(that.videoOnload);
                                    start = that.videoOnload;
                                    that.CanvasNode.pictureLoad.call(that);
                                }
                                else if(this.innerText === "选择结束帧"){
                                    end = that.videoOnload;
                                    document.getElementById("subtitleend").innerHTML = that.CanvasNode.timeChangeFrame(that.videoOnload);

                                    new Promise((resolve,reject)=>{
                                        for(let i = start ; i <= end ; i ++ ){
                                            let img = new Image();
                                            img.src = that.saveto[i];
                                            img.onload = function(){
                                                let node = that.contrast(this.width,this.height);
                                                let x = that.nodePlot.x - node.a/2, y = that.nodePlot.y - node.b/2;

                                                that.canvasSubtitleCtx.clearRect(0, 0,that.canvasVideo.width,that.canvasVideo.height);    //清空canvas
                                                that.canvasSubtitleCtx.drawImage(img, 0, 0, this.width, this.height, x, y, node.a, node.b);    
                                                that.canvasSubtitleCtx.save();
                                                that.canvasSubtitleCtx.font = Text + "px serif";    //字体大小
                                                
                                                let index = 0;
                                                let textQueue = [];
                                                textQueue[index] = "";

                                                for(let i of value){
                                                    if(that.canvasSubtitleCtx.measureText(textQueue[index] + i).width > that.canvasvideoData.w){
                                                        index++;
                                                        textQueue[index] = "";
                                                    }
                                                    textQueue[index] += i;
                                                }

                                                for(let i = 0 ; i < textQueue.length ; i++){
                                                    let nP = { x:that.nodePlot.x-that.canvasSubtitleCtx.measureText(textQueue[i]).width/2,
                                                            y:that.nodePlot.y+that.canvasvideoData.h/2- (textQueue.length-1) * Text };
                                                    that.ImageLayerNode.textFill(that.canvasSubtitleCtx, textQueue[i], nP, i * Text);
                                                }

                                                that.canvasSubtitleCtx.restore();
                                                that.saveto[i] = that.canvasSubtitle.toDataURL("image/png");

                                                if(i === end)resolve();
                                            }
                                        }
                                    }).then((e)=>{
                                        that.canvasDemoCtx.clearRect( 0, 0, that.canvasVideo.width, that.canvasVideo.height); 
                                        this.innerText = "添加字幕";    
                                        that.CanvasNode.pictureLoad.call(that);
                                    })
                                }
                            }    
                        }
                        
                        break;
                    }
                    case "againsubtitle":{
                        let value = document.getElementById("subtitle").value;
                        let Text = document.getElementById("current").innerText;
                        let time = 2;    //设定弹幕存在时间
                        let speed = parseInt(document.getElementById("speed").innerText);    //设定弹幕运动速度
                        that.canvasDemoCtx.clearRect( 0, 0, that.canvasVideo.width, that.canvasVideo.height); 
                        that.canvasDemo.style.zIndex = 1001;
                        that.canvasDemoCtx.save();
                        that.canvasDemoCtx.font = Text + "px serif";    //字体大小
                        if(document.getElementById("addsubtitle").innerText === "选择结束帧"){
                            let index = 0;
                            let textQueue = [];
                            textQueue[index] = "";

                            for(let i of value){
                                if(that.canvasDemoCtx.measureText(textQueue[index] + i).width > that.canvasvideoData.w){
                                    index++;
                                    textQueue[index] = "";
                                }
                                textQueue[index] += i;
                            }
                            
                            for(let i = 0 ; i < textQueue.length ; i++){
                                let nP = { x:that.nodePlot.x-that.canvasDemoCtx.measureText(textQueue[i]).width/2,
                                           y:that.nodePlot.y+that.canvasvideoData.h/2- (textQueue.length-1) * Text };
                                that.ImageLayerNode.textFill(that.canvasDemoCtx, textQueue[i], nP, i * Text);
                            }

                            that.canvasDemoCtx.restore();    
                        }
                        else if(document.getElementById("bulletchat").innerText === "确认添加"){
                            switch(typebullet){
                                case "top":{
                                    let nP = { x:that.nodePlot.x-that.canvasDemoCtx.measureText(value).width/2,
                                        y:that.nodePlot.y - that.canvasvideoData.h / 2 * Math.random()};

                                    that.ImageLayerNode.textFill(that.canvasDemoCtx, value, nP, 0);
                                    that.barrage = new Barrage(that.canvasDemoCtx, value, typebullet, nP, {begin: that.videoOnload, end:that.videoOnload+60*time}, 0, Text);
                                    break;
                                }
                                case "roll":{
                                    let nP = { x: that.nodePlot.x + that.canvasvideoData.w / 2,
                                               y: that.nodePlot.y - that.canvasvideoData.h / 2 + that.canvasvideoData.h * Math.random() };
                                    let Ti = that.videoOnload, x = nP.x;
                                    let length = that.canvasDemoCtx.measureText(value).width;
                                    console.log(that.nodePlot.x);
                                    console.log(that.canvasvideoData);

                                    that.ImageLayerNode.textFill(that.canvasDemoCtx, value, nP, 0);
                                    while(Ti != that.saveto.length){
                                        if(x + length < that.nodePlot.x - that.canvasvideoData.w / 2){
                                            break;
                                        }
                                        x -= speed;
                                        Ti ++;
                                    }
                                    
                                    that.barrage = new Barrage(that.canvasDemoCtx, value, typebullet, nP, {begin: that.videoOnload, end:Ti}, speed, Text);
                                    console.log(that.barrage);
                                    break;
                                }
                                case "bottom":{
                                    let nP = { x:that.nodePlot.x-that.canvasDemoCtx.measureText(value).width/2,
                                        y:that.nodePlot.y + that.canvasvideoData.h / 4 + that.canvasvideoData.h / 4 * Math.random()};
                                    
                                    that.ImageLayerNode.textFill(that.canvasDemoCtx, value, nP, 0);
                                    that.barrage = new Barrage(that.canvasDemoCtx, value, typebullet, nP, {begin: that.videoOnload, end:that.videoOnload+60*time}, 0, Text);
                                    break;
                                }
                            }
                            that.canvasDemoCtx.restore();
                        }
                        break;
                    }
                    case "bulletchat":{
                        let value = document.getElementById("subtitle").value;
                        let Text = document.getElementById("current").innerText;
                        let time = 2;    //设定弹幕存在时间
                        let speed = parseInt(document.getElementById("speed").innerText);    //设定弹幕运动速度
                        if(this.innerText === "添加弹幕"){
                            that.barrage = null;
                            that.canvasDemoCtx.clearRect( 0, 0, that.canvasVideo.width, that.canvasVideo.height); 
                            that.canvasDemo.style.zIndex = 1001;
                            that.canvasDemoCtx.save();
                            that.canvasDemoCtx.font = Text + "px serif";    //字体大小
                            switch(typebullet){
                                case "top":{
                                    let nP = { x:that.nodePlot.x-that.canvasDemoCtx.measureText(value).width/2,
                                        y:that.nodePlot.y - that.canvasvideoData.h / 2 * Math.random()};

                                    that.ImageLayerNode.textFill(that.canvasDemoCtx, value, nP, 0);
                                    that.barrage = new Barrage(that.canvasDemoCtx, value, typebullet, nP, {begin: that.videoOnload, end:that.videoOnload+60*time}, 0, Text);
                                    break;
                                }
                                case "roll":{
                                    let nP = { x: that.nodePlot.x + that.canvasvideoData.w / 2,
                                               y: that.nodePlot.y - that.canvasvideoData.h / 2 + that.canvasvideoData.h * Math.random() };
                                    let Ti = that.videoOnload, x = nP.x;
                                    let length = that.canvasDemoCtx.measureText(value).width;
                                    console.log(that.nodePlot.x);
                                    console.log(that.canvasvideoData);

                                    that.ImageLayerNode.textFill(that.canvasDemoCtx, value, nP, 0);
                                    while(Ti != that.saveto.length){
                                        if(x + length < that.nodePlot.x - that.canvasvideoData.w / 2){
                                            break;
                                        }
                                        x -= speed;
                                        Ti ++;
                                    }
                                    
                                    that.barrage = new Barrage(that.canvasDemoCtx, value, typebullet, nP, {begin: that.videoOnload, end:Ti}, speed, Text);
                                    console.log(that.barrage);
                                    break;
                                }
                                case "bottom":{
                                    let nP = { x:that.nodePlot.x-that.canvasDemoCtx.measureText(value).width/2,
                                        y:that.nodePlot.y + that.canvasvideoData.h / 4 + that.canvasvideoData.h / 4 * Math.random()};
                                    
                                    that.ImageLayerNode.textFill(that.canvasDemoCtx, value, nP, 0);
                                    that.barrage = new Barrage(that.canvasDemoCtx, value, typebullet, nP, {begin: that.videoOnload, end:that.videoOnload+60*time}, 0, Text);
                                    break;
                                }
                            }
                            that.canvasDemoCtx.restore();
                            this.innerText = "确认添加"
                        }
                        else{
                            new Promise((resolve,reject)=>{
                                if(that.barrage != null && !!that.barrage.value){
                                    for( let i = that.barrage.time.begin ; i <= Math.min(that.barrage.time.end, that.saveto.length - 1) ; i++ ){
                                        let img = new Image();
                                        img.src = that.saveto[i];
                                        img.onload = function(){
                                            let node = that.contrast(this.width,this.height);
                                            let x = that.nodePlot.x - node.a/2, y = that.nodePlot.y - node.b/2;
                                            
                                            that.canvasSubtitleCtx.clearRect(0, 0,that.canvasVideo.width,that.canvasVideo.height);
                                            that.canvasSubtitleCtx.drawImage(img, 0, 0, this.width, this.height, x, y, node.a, node.b);    
                                            that.canvasSubtitleCtx.save();
                                            that.barrage.ctx = that.canvasSubtitleCtx;
                                            switch(that.barrage.typebullet){
                                                case "bottom":
                                                case "top":{
                                                    that.barrage.drawFixed(i);
                                                    break;
                                                }
                                                case "roll":{
                                                    that.barrage.draw(i);
                                                }
                                            }    
                                            that.saveto[i] = that.canvasSubtitle.toDataURL("image/png");
                                            if(i === that.barrage.time.end || i === that.saveto.length - 1)resolve();
                                        }
                                    }
                                }
                                else{
                                    resolve();
                                }
                            }).then((e)=>{
                                that.canvasDemoCtx.clearRect( 0, 0, that.canvasVideo.width, that.canvasVideo.height);
                                that.CanvasNode.pictureLoad.call(that);
                                this.innerText = "添加弹幕";
                            })
                        }
                        break;
                    }
                    case "exportfile":{
                        if(document.getElementById("bulletchat").innerText === "添加弹幕" ){
                            if(document.getElementById("addsubtitle").innerText === "添加字幕"){
                                
                            }
                        }
                    }
                }
            })
        });

        function Barrage(ctx, value, typebullet, plot, time, speed, font) {
            this.ctx = ctx;
            this.color = "#000000";
            this.value = value;
            this.x = plot.x; //x坐标
            this.y = plot.y;
            this.speed = speed;
            this.fontSize = font;
            this.time = time;
            this.typebullet = typebullet;
        }
        Barrage.prototype.draw = function(time1) {
            if(this.time.begin <= time1 && this.time.end >= time1) {
                let d1 = time1 - this.time.begin;
                this.ctx.save();
                this.ctx.font = this.fontSize + 'px "microsoft yahei", sans-serif';
                this.ctx.fillStyle = this.color;
                this.ctx.fillText(this.value, this.x - this.speed * d1, this.y);
                this.ctx.restore();
                
            } else {
                return
            }
        }
        Barrage.prototype.drawFixed = function(time1) {
            if(this.time.begin <= time1 && this.time.end >= time1){
                this.ctx.save();
                this.ctx.font = this.fontSize + 'px "microsoft yahei", sans-serif';
                this.ctx.fillStyle = this.color;
                this.ctx.fillText(this.value, this.x, this.y);
                this.ctx.restore();
            }
            else{
                return;
            }
        }

        let speed = document.getElementById("speed");
        document.getElementById("speedSizeadd").addEventListener("click",(e)=>{
            speed.innerHTML = parseInt(speed.innerHTML) + 1;
        })
        document.getElementById("speedSizereduce").addEventListener("click",(e)=>{
            speed.innerHTML = parseInt(speed.innerHTML) - 1;
        })

        let cc = document.getElementById("current");
        document.getElementById("textSizeadd").addEventListener("click",(e)=>{
            cc.innerText = parseInt(cc.innerText)+1;
            currentPX.style.fontSize = cc.innerText + "px";
        })
        document.getElementById("textSizereduce").addEventListener("click",(e)=>{
            cc.innerText = parseInt(cc.innerText)-1;
            currentPX.style.fontSize = cc.innerText + "px";
        })

        document.querySelector("#inputVido").addEventListener("change",(e)=>{
            that.CanvasNode.openCanvasVideo.call(that);     //将绑定工具类的作用域
        });

        let send111 = document.querySelector("#sendbulletchat");
        send111.addEventListener("change",(e)=>{
            let index = send111.selectedIndex;
            typebullet = send111.options[index].value;
        })

        document.querySelector("#progressopen").addEventListener("click",(e)=>{
            if(that.videoIndex === "video"){
                if(that.backstageVideo.readyState === 4){
                    if(that.backstageVideo.paused === false){
                        that.backstageVideo.pause();
                        pauseicon.style.display = "inline";
                        openicon.style.display = "none";
                    }
                    else{
                        that.backstageVideo.play();
                        pauseicon.style.display = "none";
                        openicon.style.display = "inline";
                    } 
                    if(that.ed){
                        if(that.backstageVideo.paused){
                            window.cancelAnimationFrame(that.ed);
                        }
                        else{
                            that.CanvasNode.onloadOpenVideo.call(that,that.videoData.w,that.videoData.h);
                        }
                    }    
                }     
            }
            else if(that.videoIndex === "canvas"){
                if(that.playbackStatus === true){
                    window.cancelAnimationFrame(that.AnimationFrameVideo);
                    pauseicon.style.display = "none";
                    openicon.style.display = "inline";
                    that.playbackStatus = false;
                }
                else{
                    if(that.videoOnload === that.saveto.length - 1 ){
                        that.videoOnload = 0;
                    }
                    that.CanvasNode.recordPlay.call(that); 
                    
                    pauseicon.style.display = "inline";
                    openicon.style.display = "none";
                }
            }
        });
        document.getElementById("base64").addEventListener("click",(e)=>{
            if(that.backstageVideo.readyState === 4){
                that.CanvasNode.saveBase64.call(that);   
            }
        });
        document.getElementById("daochu").addEventListener("click",(e)=>{
            that.canvasvideoData = null;
            that.CanvasNode.canvasGIF.call(that);
            that.CanvasNode.pictureLoad.call(that);
        });

    }
    canvasButtonBindInit(){    //图像指令绑定
        let that = this;
        let colorchoice = document.querySelector("input[type=color]");   //获取颜色选择器
        let colorto = document.querySelector('#rgb');    //获取展示项
        that.base = false;
        colorto.innerText = "RGB(0,0,0)";
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
                        switch(that.toolCurrent){
                            case "rightTriangle":
                            case "isosceles":
                            case "rectangle":
                                that.canvasVideoCtx.lineJoin = 'miter';    //设定线条与线条间接合处的样式。
                                that.canvasDemoCtx.lineJoin = 'miter';
                                break;
                            default:
                                that.canvasVideoCtx.lineJoin = 'round';    //设定线条与线条间接合处的样式。
                                that.canvasDemoCtx.lineJoin = 'round';
                        }
                        switch(that.toolCurrent){
                            case "line":
                            case "rectangle":
                            case "rightTriangle":
                            case "isosceles":
                            case "diamond":
                            case "round":
                            case "shear":
                                that.canvasDemo.style.zIndex = 1001;    //判断按下的按钮是否为直线或者矩形按钮，需要特殊画布
                                break;
                            case "eraser":
                                let str = './fonts/rubber/'+that.rubberIconSize+'.png';
                                that.canvasVideo.style.cursor = "url("+ str +"),move";
                                break;
                            case "bucket":
                                that.canvasVideo.style.cursor = "url(./fonts/rubber/油漆桶.png),move";
                                break;
                            case "extract":
                                that.canvasVideo.style.cursor = "crosshair";
                                break;
                            case "text":
                                that.canvasDemo.style.zIndex = 1001;
                                break;
                        }
                    })
            }
        })
        this.textinput = this.textarea.addEventListener("input", function(e){
            clearInterval(that.timeto);
            if(that.textDottedLine.beginLine !== undefined){
                that.textValue = this.value;
                let {clinet, clinetTo} = that.textDottedLine, dd = 0;
                that.timeto =  setInterval(()=>{    //每隔800毫秒就行一次闪烁
                    that.canvasDemoCtx.clearRect(0,0,that.width,that.height);    //清除画布
                    let h = that.ImageLayerNode.textTool(that.textDottedLine, that.canvasDemoCtx, this.value, dd);    //获取当前框体长度
                    if(h > Math.abs(clinetTo.y - clinet.y)){    //判断是否够长
                        clinetTo.y = clinet.y + h + 3;    //不够长则延长
                    }
                    dd ++;
                    if(dd >= 20)dd -= 20;    //20次40毫秒
                    that.ImageLayerNode.dottedBox.call(that, clinet.x, clinet.y, clinetTo.x, clinetTo.y);     //虚线提示框
                }, 40)
            }
        })
        document.querySelector("#inputPicture").addEventListener("change",(e)=>{
            that.initialImg = new Image();
            that.initialImg.src = window.URL.createObjectURL(e.target.files[0]);
            that.initialImg.onload = ()=>{
                that.ImageLayerNode.Board.call(that);
                let node = that.contrast(that.initialImg.width,that.initialImg.height);
                let x = that.width/2-node.a/2, y = that.height/2-node.b/2;
                that.canvasVideoCtx.drawImage(that.initialImg,0,0,that.initialImg.width,that.initialImg.height,x,y,node.a,node.b);  
                that.ImageData.splice(0);
                that.ImageData.push(that.canvasVideoCtx.getImageData(0,0,that.width,that.height));
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
                that.canvasVideoCtx.lineWidth = that.pensize;    //修改字体大小
                that.canvasDemoCtx.lineWidth = that.pensize;
                if(that.toolCurrent === "eraser"){    //不同大小的橡皮擦鼠标样式
                    let str = '../fonts/rubber/'+that.rubberIconSize+'.png';
                    that.canvasVideo.style.cursor = "url("+ str +"),move";
                }
            })
        });
        colorchoice.addEventListener("input",function(e){    //修改画笔颜色
            colorto.innerText = this.value.toLowerCase().colorRgb();    //修改页面显示
            that.strokeColor = this.value.toLowerCase();
            that.canvasVideoCtx.fillStyle  = that.strokeColor;
            that.canvasVideoCtx.strokeStyle  = that.strokeColor;
            that.canvasDemoCtx.fillStyle  = that.strokeColor;
            that.canvasDemoCtx.strokeStyle  = that.strokeColor;
        })
        document.querySelectorAll("#flipButton>button").forEach((element,index)=>{    //设定翻转
            element.addEventListener("click",function(e){
                let middle = { x:(that.centralPoint.x1+that.centralPoint.x2)/2 , y:(that.centralPoint.y1+that.centralPoint.y2)/2 };    //中心点
                let x = (that.centralPoint.x2 - that.centralPoint.x1)/2, y = (that.centralPoint.y2 - that.centralPoint.y1)/2 ;    //距离
                if(that.centralPoint.x1 !== -1){
                    switch(element.id){
                        case "clockwise":    //顺时针90°
                            that.directionIndex ++;
                            shapeFlip( {x: middle.x + y , y: middle.y - x}, {x: middle.x - y , y: middle.y + x} );
                            break;
                        case "anticlockwise":    //逆时针90°
                            that.directionIndex --;
                            shapeFlip( {x: middle.x - y , y: middle.y + x}, {x: middle.x + y , y: middle.y - x} );
                            break;
                        case "reversal":    //180°
                            that.directionIndex += 2;
                            shapeFlip( {x: middle.x + x , y: middle.y + y}, {x: middle.x - x , y: middle.y - y} );
                            break;
                        case "flip":
                            console.log("翻转图像导致的问题太多，以至于移动什么的都无法实现，只能取消");
                            let d = that.canvasVideoCtx.getImageData(0,0,that.width,that.height);
                            break;  
                    }    
                    
                }
                switch(element.id){    //保存图片
                    case "save":{
                        that.ImageLayerNode.saveImag.call(that);
                        break;
                    }
                }
            })
        })
        function shapeFlip( beginLine, endLine ){
            if(that.directionIndex < 0)that.directionIndex += that.direction.length;
            if(that.directionIndex > 3)that.directionIndex -= that.direction.length;
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
                    break;
                case "round":
                    that.ImageLayerNode.solidRound.call(that, that.canvasDemoCtx, minbegin, maxend);    //圆形
                    break;
                case "rightTriangle":
                    that.ImageLayerNode.solidTriangle.call(that, that.canvasDemoCtx, beginLine, endLine);    //直角三角形
                    break;
                case "isosceles":
                    that.ImageLayerNode.isoscelesTriangle.call(that, that.canvasDemoCtx, beginLine, endLine);    //等腰三角形
                    break;
                case "diamond":
                    that.ImageLayerNode.drawDiamond.call(that, that.canvasDemoCtx, minbegin, maxend);    //等腰三角形
                    break;
                default:
                    return;
            }
            if(that.toolCurrent !== "line"){
                that.ImageLayerNode.dottedBox.call(that, beginLine.x, beginLine.y, endLine.x, endLine.y);    //虚线提示框
            }
            that.centralPoint = { x1:beginLine.x , y1:beginLine.y , x2:endLine.x , y2:endLine.y };    //改变坐标
        }
    }
    canvasBindInit(){    //基础画布函数
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
                    break;
                case 'extract':
                    let RGB = that.ImageLayerNode.extractPixels(that.canvasVideoCtx , e.layerX, e.layerY);    //提取颜色
                    console.log(RGB.colorHex());
                    colorto.innerText = RGB;
                    colorchoice.value = RGB.colorHex();
                    that.strokeColor = colorchoice.value.toLowerCase();
                    that.canvasVideoCtx.fillStyle  = that.strokeColor;
                    that.canvasVideoCtx.strokeStyle  = that.strokeColor;
                    that.canvasDemoCtx.fillStyle  = that.strokeColor;
                    that.canvasDemoCtx.strokeStyle  = that.strokeColor;
                    break;
                case "bucket":  //油漆桶
                    let ImageDate = that.canvasVideoCtx.getImageData(0,0,that.width,that.height);
                    that.ImageData.push(that.canvasVideoCtx.getImageData(0,0,that.width,that.height));    //记录canvas画布数据
                    that.ImageLayerNode.paintBucket(ImageDate, e.layerX, e.layerY, that.strokeColor);
                    that.canvasVideoCtx.putImageData(ImageDate, 0, 0);
                    break;
                default:
                    break;
            };
            if(that.toolCurrent !== "bucket"){
                that.ImageData.push(that.canvasVideoCtx.getImageData(0,0,that.width,that.height));    //记录canvas画布数据
            }
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
                        break;
                };
            }
            xbind.innerText = e.layerX;
            ybind.innerText = e.layerY;
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
            endplot = {},
            shearplot = {};
        //controlnode作为标记当前canvas状态的标记，true标识为划线状态，false为修改状态。nodeState为鼠标是否按下的标记，true为按下，false为未按下
        //operation作为按下鼠标之后是否在操作区域的标记，true为在，false不在。clinet保存初始点位置
        let addsubtitle = document.getElementById("addsubtitle");

        document.querySelector("#flipButton>button[id=tailoring]").addEventListener("click",(e)=>{    //裁剪，去除其他部分只留下选中部分
            if(that.toolCurrent === "shear"){    //当是剪切状态时
                that.canvasDemoCtx.clearRect(0,0,that.width,that.height);    //清除虚拟画布
                that.ImageLayerNode.updownImage.call(that, that.ImageData, that.forwardData);
                that.ImageLayerNode.shear.call(that, firstplot, endplot, shearplot);
                that.canvasVideoCtx.clearRect(0,0,that.width,that.height);
                that.canvasVideoCtx.drawImage(that.canvasDemo,0,0);  
                that.canvasDemoCtx.clearRect(0,0,that.width,that.height);    //清除虚拟画布
                that.ImageData.splice(0);
            }
        })

        this.canvasDemo.addEventListener("mousedown", function(e){
            if(controlnode){    //划线状态时
                beginLine.x = e.layerX;    //保存初始路径
                beginLine.y = e.layerY;
                that.textDottedLine.beginLine = beginLine;
                that.textDottedLine.clinet = { x:e.pageX,y:e.pageY };
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
                    that.textarea.blur();    //取消焦点
                }
                else{
                    clearInterval(that.timeto);
                    let minbegin = {x:Math.min(firstplot.x,endplot.x),y:Math.min(firstplot.y,endplot.y)};
                    let maxend = {x:Math.max(firstplot.x,endplot.x),y:Math.max(firstplot.y,endplot.y)};
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
                            that.ImageLayerNode.solidRound.call(that, that.canvasVideoCtx, minbegin, maxend);    //圆形
                            break;
                        case "rightTriangle":
                            that.ImageLayerNode.solidTriangle.call(that, that.canvasVideoCtx, firstplot, endplot);    //直角三角形
                            break;
                        case "isosceles":
                            that.ImageLayerNode.isoscelesTriangle.call(that, that.canvasVideoCtx, beginLine, endLine);    //等腰三角形
                            break;
                        case "diamond":
                            that.ImageLayerNode.drawDiamond.call(that, that.canvasVideoCtx, firstplot, endplot);    //等腰三角形
                            break;
                        case "text":{    //文本
                            that.ImageLayerNode.textTool(that.textDottedLine, that.canvasVideoCtx, that.textValue, 0);
                            that.textValue = "";
                            that.textarea.value = "";
                            break;
                        }    
                        case "shear":{
                            new Promise((resolve, reject)=>{
                                that.ImageLayerNode.updownImage.call(that, that.ImageData, that.forwardData);
                                that.ImageLayerNode.updownImage.call(that, that.ImageData, that.forwardData);
                                that.forwardData.pop();
                                that.forwardData.pop();
                                that.ImageData.push(that.canvasVideoCtx.getImageData(0,0,that.width,that.height));    //记录canvas画布数据
                                resolve();
                            }).then((value)=>{
                                that.ImageLayerNode.shear.call(that, firstplot, endplot, shearplot);
                                that.canvasVideoCtx.drawImage(that.canvasDemo,0,0);  
                                that.canvasDemoCtx.clearRect(0,0,that.width,that.height);    //清除虚拟画布
                            })  
                        }
                    }
                    that.directionIndex = 0;    //设定翻转和点初始化
                    that.centralPoint = { x1:-1 , y1:-1 , x2:-1 , y2:-1 };
                }
            }
        });       
        that.canvasDemo.addEventListener('mouseup', function(e){ 
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
                    if(that.toolCurrent === "text"){    //保存文本框开始点和结束点并且修改textarea位置
                        that.textDottedLine.endLine = endLine;
                        let { x, y } = that.textDottedLine.clinet;
                        that.textDottedLine.clinet = { x:Math.min(e.pageX, x), y:Math.min(e.pageY, y) };
                        that.textDottedLine.clinetTo = { x:Math.max(e.pageX, x), y:Math.max(e.pageY, y) };
                        that.textarea.style.marginLeft = that.textDottedLine.clinet.x + 'px';
                        that.textarea.style.marginTop = that.textDottedLine.clinet.y + 'px';
                        that.textarea.dispatchEvent(new Event('input', { bubbles: true }));    //触发input事件
                        that.textarea.focus();    //获取焦点
                    }
                    if( that.toolCurrent === "shear" ){
                        that.ImageData.push(that.canvasVideoCtx.getImageData(0,0,that.width,that.height));    //记录canvas画布数据
                        shearplot = {x1:firstplot.x, y1:firstplot.y, x2:endplot.x, y2:endplot.y};
                        that.ImageLayerNode.shear.call(that, firstplot, endplot, shearplot);
                    }
                    nodeState = false;    //记录鼠标抬起
                }
                if(!operation){    //当鼠标不是按在此区域时或者为划线状态时，operation为false
                    controlnode = !controlnode;    //转换形态   
                }
                else{
                    if(that.toolCurrent === "text"){
                        that.textarea.focus();    //获取焦点
                    }
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
                        case "rightTriangle":
                            that.ImageLayerNode.solidTriangle.call(that, that.canvasDemoCtx, firstplot, endplot);    //直角三角形
                            break;
                        case "isosceles":
                            that.ImageLayerNode.isoscelesTriangle.call(that, that.canvasDemoCtx, firstplot, endplot);    //等腰三角形
                            break;
                        case "diamond":
                            that.ImageLayerNode.drawDiamond.call(that, that.canvasDemoCtx, firstplot, endplot);    //等腰三角形
                            break;
                        case "text":
                            that.ImageLayerNode.dottedBox.call(that, firstplot.x, firstplot.y, endplot.x, endplot.y);     //虚线提示框
                            break;
                        case "shear":
                            that.ImageLayerNode.dottedBox.call(that, firstplot.x, firstplot.y, endplot.x, endplot.y);     //虚线提示框
                            break;
                    }
                }
            }
            else{    //修改状态
                if(!operation && that.centralPoint !== -1){    //当图形翻转了之后修改其坐标
                    beginLine = {x:that.centralPoint.x1, y:that.centralPoint.y1};
                    endLine = {x:that.centralPoint.x2, y:that.centralPoint.y2};
                    firstplot = {x:that.centralPoint.x1, y:that.centralPoint.y1};
                    endplot = {x:that.centralPoint.x2, y:that.centralPoint.y2};
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
                        switch(stay){
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
                        if(that.toolCurrent === "text"){    //文字开始结束点特殊判断
                            firstplot.x = that.textDottedLine.clinet.x;
                            firstplot.y = that.textDottedLine.clinet.y;
                            endplot.x = that.textDottedLine.clinetTo.x;
                            endplot.y = that.textDottedLine.clinetTo.y;
                        }
                        switch(stay){
                            case "core":
                                firstplot.x += endmobile.x;
                                firstplot.y += endmobile.y;
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
                        switch(that.direction[that.directionIndex]){
                            case "upper":{    //当图形正向时
                                switch(stay){
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
                                }
                                break;
                            }
                            case "right":{    //当图形右向时
                                switch(stay){
                                    case "topleft":
                                        endplot.x += endmobile.x;
                                        firstplot.y += endmobile.y; 
                                        break;
                                    case "lowerleft":
                                        endplot.x += endmobile.x;
                                        endplot.y += endmobile.y;                                
                                        break;
                                    case "topright":
                                        firstplot.x += endmobile.x;
                                        firstplot.y += endmobile.y; 
                                        break;
                                    case "lowerright":
                                        endplot.x += endmobile.x;
                                        firstplot.y += endmobile.y; 
                                        break;
                                }
                                break;  
                            }
                            case "lower":{    //当图形反向时
                                switch(stay){
                                    case "topleft":
                                        endplot.x += endmobile.x;
                                        endplot.y += endmobile.y; 
                                        break;
                                    case "lowerleft":
                                        endplot.x += endmobile.x;
                                        firstplot.y += endmobile.y;                                  
                                        break;
                                    case "topright":
                                        firstplot.x += endmobile.x;
                                        endplot.y += endmobile.y;
                                        break;
                                    case "lowerright":
                                        firstplot.x += endmobile.x;
                                        firstplot.y += endmobile.y;
                                        break;
                                }
                                break;
                            }
                            case "left":{     //当图形右向时
                                switch(stay){
                                    case "topleft":
                                        firstplot.x += endmobile.x;
                                        endplot.y += endmobile.y; 
                                        break;
                                    case "lowerleft":
                                        firstplot.x += endmobile.x;
                                        firstplot.y += endmobile.y;                                
                                        break;
                                    case "topright":
                                        endplot.x += endmobile.x;
                                        endplot.y += endmobile.y;     
                                        break;
                                    case "lowerright":
                                        endplot.x += endmobile.x;
                                        firstplot.y += endmobile.y; 
                                        break;
                                } 
                                break;   
                            }
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
                            case "rightTriangle":
                                that.ImageLayerNode.solidTriangle.call(that, that.canvasDemoCtx, firstplot, endplot);    //直角三角形
                                break;
                            case "isosceles":
                                that.ImageLayerNode.isoscelesTriangle.call(that, that.canvasDemoCtx, firstplot, endplot);    //等腰三角形
                                break;
                            case "diamond":
                                that.ImageLayerNode.drawDiamond.call(that, that.canvasDemoCtx, firstplot, endplot);    //等腰三角形
                                break;
                            case "text":{    //文本
                                that.textDottedLine.clinet.x = firstplot.x;    //替换点坐标，使得定时器内按照新坐标进行绘制
                                that.textDottedLine.clinet.y = firstplot.y;
                                that.textDottedLine.clinetTo.x = endplot.x;
                                that.textDottedLine.clinetTo.y = endplot.y;
                                that.ImageLayerNode.textTool(that.textDottedLine, that.canvasDemoCtx, that.textValue, 0);
                                break;
                            }
                            case "shear":
                                new Promise((resolve, reject)=>{
                                    that.ImageLayerNode.updownImage.call(that, that.ImageData, that.forwardData);
                                    that.ImageData.push(that.canvasVideoCtx.getImageData(0,0,that.width,that.height));    //记录canvas画布数据
                                    that.forwardData.pop();
                                    resolve();
                                }).then((value)=>{
                                    that.ImageLayerNode.shear.call(that, firstplot, endplot, shearplot);
                                })
                        }
                        that.ImageLayerNode.dottedBox.call(that, firstplot.x, firstplot.y, endplot.x, endplot.y);    //虚线提示框
                    }
                }
            }
        })
    }
}