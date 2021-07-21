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
        this.tool = [    //工具初始化
            "pencil","line","brush","eraser","rectangle","round","bucket","extract","rightTriangle","isosceles","diamond","text","shear"
        ];
        this.direction = [ "upper","right","lower","left" ];    //设定操作画布朝向
        this.directionIndex = 0;    //设定操作画布当前朝向
        this.toolCurrent = "brush";    //初始工具
        this.pensize = 2;    //初始化画笔大小
        this.strokeColor = '#000';        //初始化画笔颜色
        this.rubberIconSize = 8;    //橡皮图标显示

        this.textarea = document.createElement('textarea');    //隐藏输入文本框
        this.textarea.style.opacity = 0;    //透明度为0，直接就行隐藏
        this.textarea.style.zIndex = -999;    //藏在画布地下
        this.textarea.style.position = "absolute";    //绝对定位

        this.progressobarWidth = 1000;

        String.prototype.colorHex = function () {
        // RGB颜色值的正则
            let reg = /^(rgb|RGB)/;
            let color = this;
            if (reg.test(color)) {
                let strHex = "#";
                // 把RGB的3个数值变成数组
                let colorArr = color.replace(/(?:\(|\)|rgb|RGB)*/g, "").split(",");
                // 转成16进制
                for (let i = 0; i < colorArr.length; i++) {
                    let hex = Number(colorArr[i]).toString(16);
                    if (hex === "0") {
                        hex += hex;
                    }
                    if (hex.length === 1){
                        hex = "0" + hex;
                    }
                    strHex += hex;
                }
                return strHex;
            } 
            else {
                return String(color);
            }
        };
        String.prototype.colorRgb = function () {
            // 16进制颜色值的正则
            let reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/;
            // 把颜色值变成小写
            let color = this.toLowerCase();
            if (reg.test(color)) {
                // 如果只有三位的值，需变成六位，如：#fff => #ffffff
                if (color.length === 4) {
                    let colorNew = "#";
                    for (let i = 1; i < 4; i += 1) {
                        colorNew += color.slice(i, i + 1).concat(color.slice(i, i + 1));
                    }
                    color = colorNew;
                }
                // 处理六位的颜色值，转为RGB
                let colorChange = [];
                for (let i = 1; i < 7; i += 2) {
                    colorChange.push(parseInt("0x" + color.slice(i, i + 2)));
                }
                return "RGB(" + colorChange.join(",") + ")";
            } 
            else {
                return color;
            }
        };

        if (!CanvasRenderingContext2D.prototype.ellipse) {    //椭圆绘制函数
            CanvasRenderingContext2D.prototype.ellipse = function(x, y, radiusX, radiusY, rotation, startAngle, endAngle,
                anticlockwise) {
                let r = radiusX > radiusY ? radiusX : radiusY; //用打的数为半径
                let scaleX = radiusX / r; //计算缩放的x轴比例
                let scaleY = radiusY / r; //计算缩放的y轴比例
                this.save(); //保存副本                    
                this.translate(x, y); //移动到圆心位置
                this.rotate(rotation); //进行旋转
                this.scale(scaleX, scaleY); //进行缩放
                this.arc(0, 0, r, startAngle, endAngle, anticlockwise); //绘制圆形
                this.restore(); //还原副本
            }
        }
    }
    //初始化canvas画布
    canvasInit(){
        //设定canvas所在的盒模型大小
        let parentNode = document.querySelector("#canvasLayout");

        parentNode.appendChild(this.textarea);

        this.nodePlot = { x:615,y:332.5 };

        //设定图片canvas
        this.canvasVideo = document.createElement('canvas');
        this.canvasVideo.width = 1230;
        this.canvasVideo.height = 665;
        this.canvasVideo.style.position = "absolute";
        this.canvasVideo.style.zIndex = "1000";
        //this.canvasVideo.style.border = '2px'
        parentNode.appendChild(this.canvasVideo);

        //设定字幕canvas
        this.canvasSubtitle = document.createElement('canvas');
        this.canvasSubtitle.width = 1230;
        this.canvasSubtitle.height = 665;
        //this.canvasSubtitle.style.position = "absolute";
        //this.canvasSubtitle.style.zIndex = "-2";
        this.canvasSubtitleCtx = this.canvasSubtitle.getContext('2d');

        //arentNode.appendChild(this.canvasSubtitle);

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
        this.canvasVideoCtx.lineCap = 'round';   //设置线条末端样式。
        this.canvasDemoCtx.lineCap = 'round';   //设置线条末端样式。
        this.canvasVideoCtx.lineJoin = 'round';    //设定线条与线条间接合处的样式。
        this.canvasDemoCtx.lineJoin = 'round';    //设定线条与线条间接合处的样式。
        this.canvasVideoCtx.lineWidth = this.pensize;
        this.canvasDemoCtx.lineWidth = this.pensize;
    }
    //设置初始图片
    lableFound(){
        let that = this;
        this.backstageVideo = document.createElement('Video');
        //添加视频，正式使用不需要添加
        //document.querySelector('#inputLayout').appendChild(this.backstageVideo);
        this.initialImg = new Image();
        this.initialImg.src = './fonts/hkd.png';
        this.initialImg.onload = function(){
            let node = that.contrast(that.initialImg.width,that.initialImg.height);
            let x = that.width/2-node.a/2, y = that.height/2-node.b/2;
            that.canvasVideoCtx.drawImage(that.initialImg,0,0,that.initialImg.width,that.initialImg.height,x,y,node.a,node.b); 
            //document.getElementById('white').click();
        }
    }

}

