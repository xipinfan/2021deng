class ImageLayer{    //图像处理工具类
    whiteBoard(){    //重置绘画板
        this.canvasVideoCtx.beginPath();
        this.canvasVideoCtx.fillStyle = "rgb(255,255,255)";
        this.canvasVideoCtx.fillRect(0,0,this.width,this.height);
    }
    graffiti(x, y, pensize){    //绘制路径记录上一个点坐标，然后将下一个点坐标与上一个点相连接
        if(this.penstate){
            this.canvasVideoCtx.moveTo(this.ppx,this.ppy);    //开始的坐标
            this.canvasVideoCtx.lineTo(x,y);    //到达的坐标
            this.canvasVideoCtx.lineWidth = pensize;
            this.canvasVideoCtx.stroke();    //绘制直线
            this.ppx = x;    //记录坐标
            this.ppy = y;
        }
    }
    updownImage(x, y){    //保存图片的数据
        this.canvasVideoCtx.beginPath();
        if(x.length !== 0){
            let forwarddatenode = x.pop();
            y.push(this.canvasVideoCtx.getImageData(0,0,this.width,this.height));    //将当前的canvas数据保存在数组里
            this.canvasVideoCtx.putImageData(forwarddatenode, 0, 0);    //将当前canvas数据替换为数组中的canvas数据
        }
    }
}
