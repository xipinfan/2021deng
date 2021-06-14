//主类，用来初始化以及保存获取到的数据
class Tools{    
    constructor(){
        this.init();
    }
    contrast(a, b){    //等比例缩放图片
        let node = {};
        if(a <= this.width && b <= this.height){
            node.a = a;
            node.b = b;
        }
        else if(a > this.width && b <= this.height){
            node.a = this.width;
            node.b = b*(this.width/a);
        }
        else if(a <= this.width && b > this.height){
            node.a = a*(this.height/b);
            node.b = this.height;
        }
        else if(a > this.width && b > this.height){
            let aw = a - this.width;
            let bh = b - this.height;
            if(aw >= bh){
                node.a = this.width;
                node.b = b*(this.width/a);
            }
            else{
                node.a = a*(this.height/b);
                node.b = this.height;
            }
        }
        return node;
    }
    //初始化 
    init(){
        this.dataInit();
        this.canvasInit();
        this.labelInit();
        this.lableFound();
    }
    dataInit(){
        this.tool = [
            "pencil","line","brush","eraser"
        ];
        this.toolCurrent = "brush";
        this.pensize = 2;
        this.strokeColor = '#000';
    }
    //初始化canvas画布
    canvasInit(){
        //设定canvas所在的盒模型大小
        let parentNode = document.querySelector("#canvasLayout");

        //设定图片canvas
        this.canvasVideo = document.createElement('canvas');
        this.canvasVideo.width = 1230;
        this.canvasVideo.height = 665;
        this.canvasVideo.style.position = "absolute";
        this.canvasVideo.style.zIndex = "1000";
        //this.canvasVideo.style.border = '2px'
        parentNode.appendChild(this.canvasVideo);

        // //设定背景图canvas
        this.canvasBackground = document.createElement('canvas');
        this.canvasBackground.className = "canvasStyle";
        this.canvasBackground.width = 1230;
        this.canvasBackground.height = 665;
        this.canvasBackground.style.position = "absolute";
        this.canvasBackground.style.zIndex = "-1";
        this.canvasBackground.style.border = '2px solid #f1f1f1'
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

        //设置录像canvas.
        this.canvasVideoTape = document.createElement("canvas");
        this.canvasVideoTapeCtx = this.canvasVideoTape.getContext('2d');

        //设置模拟图像(有一说一我不知道这怎么形容)
        this.canvasDemo = document.createElement("canvas");
        this.canvasDemo.className = "canvasStyle";
        this.canvasDemo.width = 1230;
        this.canvasDemo.height = 665;
        this.canvasDemo.style.position = "absolute";
        this.canvasDemo.style.zIndex = "1";
        this.canvasDemoCtx = this.canvasDemo.getContext("2d");
        parentNode.appendChild(this.canvasDemo);
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
        //添加视频，正式使用不需要添加
        //document.querySelector('#inputLayout').appendChild(this.backstageVideo);
        this.initialImg = new Image();
        this.initialImg.src = '../fonts/hkd.png';
        this.initialImg.onload = function(){
            let node = that.contrast(that.initialImg.width,that.initialImg.height)
            that.canvasVideoCtx.drawImage(that.initialImg,0,0,that.initialImg.width,that.initialImg.height,0,0,node.a,node.b); 
            document.getElementById('white').click();
        }
    }
}
