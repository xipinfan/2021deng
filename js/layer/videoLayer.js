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

            that.canvasVideoTapeCtx.clearRect(0, 0,that.canvasVideo.width,that.canvasVideo.height); 
            that.canvasVideoTapeCtx.drawImage(that.backstageVideo, 0, 0, videoWidth, videoHeight);    //设定录制canvas

            if(that.base){    //导出开始录制
                document.getElementById("base64").style.backgroundColor = "red"; 
                that.saveto.push(that.canvasVideoTape.toDataURL("image/png"));
            }
            else{
                document.getElementById("base64").style.backgroundColor = "blue";
            }
        }
    }

    timeChange(time){    //修改时间

        let t = parseInt(time);
        let m = parseInt(t/60).toString();
        let s = (t - m*60).toString();

        if(m.length < 2)m = '0' + m;
        if(s.length < 2)s = '0' + s;
        return `${m}:${s}`;
    }

    timeChangeFrame(time){    //修改时间

        let t = parseInt(time/60);
        let m = parseInt(t/60).toString();
        let s = (t - m*60).toString();
        let f = time - s*60 - m*60*60;

        if(m.length < 2)m = '0' + m;
        if(s.length < 2)s = '0' + s;
        if(f.length < 2)f = '0' + f;

        return `${m}:${s}:${f}`;
    }

    recordPlay(){    //开始播放图片数组
        let that = this;
        let img = new Image();
        func();
        function func(){
            that.playbackStatus = true;
            that.AnimationFrameVideo = window.requestAnimationFrame(func);

            that.progressoafter.style.width = ((that.videoOnload + 1)/that.saveto.length) * that.progressobarWidth + "px";
            that.videoTimedisplay[0].innerHTML = that.CanvasNode.timeChange((that.videoOnload + 1)/60);    //将当前视频时间显示在屏幕上

            img.src = that.saveto[that.videoOnload];    //导入
            img.onload = function(){
                let node = that.contrast(that.canvasvideoData.w,that.canvasvideoData.h);
                let x = that.nodePlot.x - node.a/2, y = that.nodePlot.y - node.b/2;

                that.canvasVideoCtx.clearRect(0, 0,that.canvasVideo.width,that.canvasVideo.height);    //清空canvas
                that.canvasVideoCtx.drawImage(img, 0, 0, that.canvasvideoData.w, that.canvasvideoData.h, x, y, node.a, node.b);                 
            }

            if(that.barrage != null){
                switch(that.barrage.typebullet){
                    case "bottom":
                    case "top":{
                        that.canvasDemoCtx.clearRect( 0, 0, that.canvasVideo.width, that.canvasVideo.height); 
                        that.barrage.drawFixed(that.videoOnload);
                        break;
                    }
                    case "roll":{
                        that.canvasDemoCtx.clearRect( 0, 0, that.canvasVideo.width, that.canvasVideo.height); 
                        that.barrage.draw(that.videoOnload);
                        break;
                    }
                }
            }

            that.videoOnload = that.videoOnload + 1;
            if(that.videoOnload >= that.saveto.length ){    //当到达结尾时结束
                that.videoOnload --;
                document.querySelector("#progressopen").click();    //修改播放图标样式
            }
        }
    }

    Recording(){    //导出mp4视频函数
        let that = this;
        let onload1 = 0;
        let img = new Image();
        this.CanvasNode.recordingVideo.call(this);

        lz();
        function lz(){    //循环一遍图片数组并记录导出
            img.src = that.saveto[onload1];
            img.onload = function(){
                let node = that.contrast(that.canvasvideoData.w,that.canvasvideoData.h);
                let x = that.nodePlot.x - node.a/2, y = that.nodePlot.y - node.b/2;

                let onloadAnimation = window.requestAnimationFrame(lz);

                that.canvasVideoTapeCtx.clearRect(0, 0,that.canvasVideo.width,that.canvasVideo.height);    //清空canvas
                if(that.canvasvideoData.h === this.height && that.canvasvideoData.w === this.width){
                    that.canvasVideoTapeCtx.drawImage(img, 0, 0);    //设定图片距离
                }
                else{
                    that.canvasVideoTapeCtx.drawImage(img, x, y, node.a, node.b);
                }
                onload1 = onload1 + 1;

                if(onload1 >= that.saveto.length ){
                    window.cancelAnimationFrame(onloadAnimation);
                    that.CanvasNode.stopRecordingVideo.call(that);
                    alert("导出成功!!!!")
                }
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
            console.log(url);
        }
        this.recorder.start();    //开启录制
    }

    stopRecordingVideo(){    //暂停录制
        if(this.recorder){
            this.recorder.stop();
        }
    }

    pictureLoad(){    //重新导入页面
        let that = this;
        let img = new Image();
        img.src = this.saveto[this.videoOnload];
        img.onload = function(){
            let node = that.contrast(this.width,this.height);
            let x = that.nodePlot.x - node.a/2, y = that.nodePlot.y - node.b/2;
            that.videoTimedisplay[0].innerHTML = that.CanvasNode.timeChange((that.videoOnload + 1)/60);    //将当前视频时间显示在屏幕上

            if(!!!that.canvasvideoData){    //修改视频的初始数据
                
                that.canvasSubtitle.width = this.width;
                that.canvasSubtitle.height = this.height;
                that.canvasvideoData = { w:this.width,h:this.height };
                that.canvasvideoNode = { w:node.a, h:node.b };
                console.log(that.canvasvideoData);
            }
            that.canvasVideoCtx.clearRect(0, 0,that.canvasVideo.width,that.canvasVideo.height);    //清空canvas
            that.canvasVideoCtx.drawImage(img, 0, 0, this.width, this.height, x, y, node.a, node.b);    

            if(that.barrage != null){
                switch(that.barrage.typebullet){
                    case "bottom":
                    case "top":{
                        that.canvasDemoCtx.clearRect( 0, 0, that.canvasVideo.width, that.canvasVideo.height); 
                        that.barrage.drawFixed(that.videoOnload);
                        break;
                    }
                    case "roll":{
                        that.canvasDemoCtx.clearRect( 0, 0, that.canvasVideo.width, that.canvasVideo.height); 
                        that.barrage.draw(that.videoOnload);
                        break;
                    }
                }
            }

        }
    }

    canvasGIF(){    //导出图片数组之后的初始化
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

    saveBase64(){    //进行base64编码
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

    progressbarVideo(percent, e){    //映射视频时的进度条控制
        if(this.backstageVideo.readyState === 4){  
            this.progressoafter.style.width = (e.pageX - progressobar.offsetLeft) + "px";
            this.backstageVideo.currentTime = percent * this.backstageVideo.duration;
        }
    }

    progressbarCanvas(percent, e){    //映射图片数组的进度条控制
        this.progressoafter.style.width = (e.pageX - progressobar.offsetLeft) + "px";
        this.videoOnload = parseInt(percent * this.saveto.length);
        if(this.videoOnload < 0 )this.videoOnload = 0;
        if(this.videoOnload >= this.saveto.length) this.videoOnload = this.saveto.length - 1;
        this.CanvasNode.pictureLoad.call(this);
    }

    textQueueObtain(canvas, w, value){    //文本换行判断
        let index = 0;
        let textQueue = [];
        textQueue[index] = "";

        for(let i of value){
            if(canvas.measureText(textQueue[index] + i).width > w){
                index++;
                textQueue[index] = "";
            }
            textQueue[index] += i;
        }
        return textQueue;
    }

    addSubtitles(canvas, value, Text){    //字幕操作画布函数

        canvas.save();
        canvas.font = Text + "px serif";    //字体大小

        let textQueue = this.CanvasNode.textQueueObtain(canvas, this.canvasvideoData.w, value);

        for(let i = 0 ; i < textQueue.length ; i++){
            let nP = { x:this.nodePlot.x-canvas.measureText(textQueue[i]).width/2,
                        y:this.nodePlot.y+this.canvasvideoNode.h/2- (textQueue.length-1) * Text };
            this.ImageLayerNode.textFill(canvas, textQueue[i], nP, i * Text);
        }

        canvas.restore();
    }

    endFrame(img, value, Text, index){    //字幕完成添加函数

        this.canvasSubtitleCtx.clearRect(0, 0,this.canvasvideoData.w,this.canvasvideoData.h);
        this.canvasSubtitleCtx.drawImage(img, 0, 0);    
        this.canvasSubtitleCtx.save();
        this.canvasSubtitleCtx.font = Text + "px serif";    //字体大小
        
        let textQueue = this.CanvasNode.textQueueObtain(this.canvasSubtitleCtx, this.canvasvideoData.w, value);

        for(let i = 0 ; i < textQueue.length ; i++){
            let nP = { x:this.canvasvideoData.w/2 - this.canvasSubtitleCtx.measureText(textQueue[i]).width/2 ,
                    y:this.canvasvideoData.h- (textQueue.length-1) * Text } ;
                this.ImageLayerNode.textFill(this.canvasSubtitleCtx, textQueue[i], nP, i * Text);
        }

        this.canvasSubtitleCtx.restore();
        this.saveto[index] = this.canvasSubtitle.toDataURL("image/png");    //修改图片数组
    }

    speedCalculation(nP, canvas, value, speed){    //计算滚动弹幕时间

        let Ti = this.videoOnload, x = nP.x;
        let length = canvas.measureText(value).width;

        this.ImageLayerNode.textFill(canvas, value, nP, 0);
        while(Ti != this.saveto.length){    //计算从起使到结束点时间
            if(x + length < this.nodePlot.x - this.canvasvideoData.w / 2){
                break;
            }
            x -= speed;
            Ti ++;
        }

        return Ti;
    }

    barr(){
        function Barrage(ctx, value, typebullet, plot, time, speed, font) {    //弹幕功能工具函数
            this.ctx = ctx;
            this.color = "#000000";
            this.value = value;
            this.x = plot.x; //x坐标
            this.y = plot.y;
            this.speed = speed;
            this.fontSize = font;    //字体
            this.time = time;    //时间
            this.typebullet = typebullet;    //弹幕类型
        }
        Barrage.prototype.draw = function(time1) {    //滚动弹幕
            
            if(this.time.begin <= time1 && this.time.end >= time1) {
                let d1 = time1 - this.time.begin;
                this.ctx.save();
                this.ctx.font = this.fontSize + 'px "microsoft yahei", sans-serif';
                this.ctx.fillStyle = this.color;
                this.ctx.fillText(this.value, this.x - this.speed * d1, this.y);    //每次减少x值来进行移动
                this.ctx.restore();
                
            } else {
                return;
            }
        }
        Barrage.prototype.drawFixed = function(time1) {    //固定弹幕
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
        Barrage.prototype.changebulletchat = function(ctx, x1, y1){    //修改值
            this.ctx = ctx;
            this.x = x1;
            this.y = y1;
        }
        return Barrage;
    }

    bulletchatImageC(width, height, img, i){    //将图片与弹幕导入到新的画布上，然后保存当前画布的图片
        this.canvasSubtitleCtx.clearRect(0, 0,width,height);
        this.canvasSubtitleCtx.drawImage(img, 0, 0);    
        this.canvasSubtitleCtx.save();
        switch(this.barrage.typebullet){
            case "bottom":
            case "top":{
                this.barrage.drawFixed(i);
                break;
            }
            case "roll":{
                this.barrage.draw(i);
            }
        }    
        this.saveto[i] = this.canvasSubtitle.toDataURL("image/png");
    }
}