//主类，用来初始化以及保存获取到的数据
class Tools{    
    constructor(){
        this.init();
    }
    //初始化 
    init(){
        this.canvasInit();
        this.labelInit();
        this.lableFound();
    }
    //初始化canvas画布
    canvasInit(){
        //设定canvas所在的盒模型大小
        let parentNode = document.querySelector("#canvasLayout");
        parentNode.style.height = "665.6px";
        parentNode.style.width = "900px";
        //设定图片canvas
        this.canvasVideo = document.createElement('canvas');
        console.log(parentNode.style.height);
        this.canvasVideo.style.width = parentNode.style.width;
        this.canvasVideo.style.height = parentNode.style.height;
        this.canvasVideo.style.position = "absolute";
        this.canvasVideo.style.zIndex = "1000";
        parentNode.appendChild(this.canvasVideo);
        // //设定背景图canvas
        this.canvasBackground = document.createElement('canvas');
        this.canvasBackground.className = "canvasStyle";
        this.canvasBackground.style.width = parentNode.style.width;
        this.canvasBackground.style.height = parentNode.style.height;
        this.canvasBackground.style.position = "absolute";
        this.canvasBackground.style.zIndex = "-1";
        let canvasBackgroundCxt = this.canvasBackground.getContext('2d');
        //设定背景图片的样式
        let bg = document.createElement("canvas");
        let bgcxt = bg.getContext("2d");
        bg.width = 20;
        bg.height = 20;
        bgcxt.fillStyle = "#2d2f34";
        bgcxt.beginPath();
        bgcxt.fillRect(0,0,10,10);
        bgcxt.beginPath();
        bgcxt.fillRect(10, 10, 20, 20);
        bgcxt.fillStyle = "#1d2023";
        bgcxt.beginPath();
        bgcxt.fillRect(10, 0, 20, 10);
        bgcxt.beginPath();
        bgcxt.fillRect(0, 10, 10, 20);
        //将样式图片填充放入背景图canvas
        canvasBackgroundCxt.fillStyle = canvasBackgroundCxt.createPattern(bg, "repeat");
        canvasBackgroundCxt.beginPath();
        canvasBackgroundCxt.fillRect(0,0,this.canvasBackground.width,this.canvasBackground.height);
        parentNode.appendChild(this.canvasBackground);
    }
    //设定画布放大缩小比
    setupCanvas(){
        //返回当前显示设备的物理像素分辨率与CSS像素分辨率之比
        let dpr = window.devicePixelRatio || 1;
        //获取相对于视窗的位置集合
        let rect = this.canvasVideo.getBoundingClientRect();
        this.canvasVideo.width = rect.width * dpr;   //乘以比例系数
        this.canvasVideo.height = rect.height * dpr;
        let ctx = this.canvasVideo.getContext('2d');
        ctx.scale(dpr, dpr);    //等比例放大缩小
        return ctx;
    }
    //canvasCtx初始化，获取其宽高
    labelInit(){
        //this.canvasVideoCtx = this.setupCanvas();
        this.canvasVideoCtx = this.canvasVideo.getContext('2d');
        this.width=this.canvasVideo.width;
        this.height=this.canvasVideo.height;
    }
    //设置初始图片
    lableFound(){
        let that = this;
        this.backstageVideo = document.createElement('Video');
        document.querySelector('#inputLayout').appendChild(this.backstageVideo);
        this.initialImg = new Image();
        this.initialImg.src = '../fonts/hkd.png';
        this.initialImg.onload = function(){
            that.canvasVideoCtx.drawImage(that.initialImg,0,0,that.initialImg.width,that.initialImg.height,0,0,1150,665); 
        }
    }
}
