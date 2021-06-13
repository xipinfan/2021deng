class ImageLayer{    //图像处理工具类
    whiteBoard(){    //重置绘画板
        this.canvasVideoCtx.fillStyle = "rgb(255,255,255)";
        this.canvasVideoCtx.fillRect(0,0,this.width,this.height);
    }
    //目前已废弃，因为路径的连接有问题，且绘制的点其实为直线，滑动速度快之后会形成一条一条的线
    graffiti(x, y){    //绘制路径记录上一个点坐标，然后将下一个点坐标与上一个点相连接
        
        if(this.penstate){
            //this.canvasVideoCtx.beginPath();
            this.canvasVideoCtx.moveTo(this.ppx,this.ppy);    //开始的坐标
            this.canvasVideoCtx.lineTo(x,y);    //到达的坐标
            this.canvasVideoCtx.lineWidth = this.pensize;
            this.canvasVideoCtx.stroke();    //绘制直线
            this.ppx = x;    //记录坐标
            this.ppy = y;
        }
    }

    updownImage(x, y){    //保存图片的数据
        if(x.length !== 0){
            let forwarddatenode = x.pop();
            y.push(this.canvasVideoCtx.getImageData(0,0,this.width,this.height));    //将当前的canvas数据保存在数组里
            this.canvasVideoCtx.putImageData(forwarddatenode, 0, 0);    //将当前canvas数据替换为数组中的canvas数据
        }
    }

    caleLineWidth(s, t){    //根据不同速度计算路线的宽度函数
        let v = s/t;
        let maxVelocity = 10,
            minVelocity = 0.1,
            maxLinWidth = Math.min(30, this.width / this.brushWidth),
            minLinwidth = 1,
            resultLineWidth;
        if (v <= minVelocity) {
            resultLineWidth = maxLinWidth;
        }else if (v >= maxVelocity){
            resultLineWidth = minLinwidth;
        }else {
            resultLineWidth = maxLinWidth - (v - minVelocity) / (maxVelocity - minVelocity) * (maxLinWidth - minLinwidth);
        }
        if (this.lastLineWidth){
            return resultLineWidth;
        }else {
            return resultLineWidth * 2 / 3 + lastLineWidth * 1 / 3;
        }
    }

    calcDistance(lastCoordinate, curCoordinate){
        let distance = Math.sqrt(Math.pow(curCoordinate.x - lastCoordinate.x, 2) + Math.pow(curCoordinate.y - lastCoordinate.y, 2));
        return distance;
    }

    drawLine(x1, y1, x2, y2, lineWidth, strokeColor){
        this.canvasVideoCtx.beginPath();
        this.canvasVideoCtx.moveTo(x1,y1);
        this.canvasVideoCtx.lineTo(x2,y2);

        this.canvasVideoCtx.lineWidth = lineWidth;
        this.canvasVideoCtx.lineCap = 'round';
        this.canvasVideoCtx.lineJoin = 'round';
        this.canvasVideoCtx.strokStyle = strokeColor || '#000';

        this.canvasVideoCtx.stroke();
    }
}
