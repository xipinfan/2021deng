class ImageLayer{    //图像处理工具类
    whiteBoard(){    //重置绘画板
        this.canvasVideoCtx.fillStyle = "rgb(255,255,255)";
        this.canvasVideoCtx.fillRect(0,0,this.width,this.height);
    }
    //区域方型涂白,橡皮擦函数
    eliminate(e){
        this.canvasVideoCtx.fillStyle = "rgb(255,255,255)";
        this.canvasVideoCtx.fillRect(e.layerX,e.layerY,this.rubberIconSize,this.rubberIconSize);
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
    extractPixels(canvas ,x, y){    //提取颜色
        let pixel = canvas.getImageData(x, y, 1, 1);
        let data = pixel.data;
        return `RGB(${data[0]},${data[1]},${data[2]})`;
    }
    //刷子函数
    drawLine(x1, y1, x2, y2){     //连接路径
        this.canvasVideoCtx.beginPath();
        this.canvasVideoCtx.lineWidth = this.pensize;    //设置线条宽度。
        this.canvasVideoCtx.lineCap = 'round';   //设置线条末端样式。
        this.canvasVideoCtx.lineJoin = 'round';    //设定线条与线条间接合处的样式。
        this.canvasVideoCtx.moveTo(x1,y1);
        this.canvasVideoCtx.lineTo(x2,y2);
        this.canvasVideoCtx.stroke();
    }

    //直线函数
    drawDemoLine(canvas,beginLine,endLine){
    
        canvas.beginPath();

        canvas.moveTo(beginLine.x,beginLine.y);
        canvas.lineTo(endLine.x, endLine.y);
        canvas.lineCap = 'round';   //设置线条末端样式。
        canvas.lineWidth = this.pensize;    //设置线条宽度。
        canvas.strokStyle = this.strokeColor || '#000';
        
        canvas.stroke();
    }

    lineBox(x1, y1, x2, y2){
        this.canvasDemoCtx.save();    //先保存画布初始状态，为了使得之后的strokeStyle等操作不会改变canvas的基本属性
        let path = [{x:x1, y:y1},{x:x2,y:y2}];    //找到两个点
        this.canvasDemoCtx.strokeStyle = "rgba(0,0,0,0.3)";
        path.forEach((element)=>{
            this.canvasDemoCtx.beginPath();    //标记两个点
            this.canvasDemoCtx.arc(element.x, element.y, 5, 0, Math.PI*2, true);
            this.canvasDemoCtx.stroke();    
        }) 
        this.canvasDemoCtx.restore();   //还原初始状态
    }

    spotLineDistance(beginline, endline, node){    //由鼠标位置修改鼠标样式
        if(this.lineDistance(beginline, node)<=8){    //判断点是否在初始点附近
            return "begin";
        }
        else if(this.lineDistance(endline, node)<=8){    //判断点是否在结束点附近
            return "end";
        }
        else{
            let long =  this.pointToLine(beginline, endline, node);
            if(node.x<=Math.max(beginline.x, endline.x)+8&&node.x>=Math.min(beginline.x, endline.x-8)){     //判断x坐标是否在线段内
                if(node.y<=Math.max(beginline.y, endline.y)+8&&node.y>=Math.min(beginline.y, endline.y-8)){     //判断y坐标是否在线段内
                    if(long < 8){    //判断点到线距离
                        return "core";
                    }
                }
            } 
            return "default";
        }
    }

    mousePointLine(e, beginLine, endLine, canvasDemo){
        let node = this.spotLineDistance(beginLine, endLine, {x:e.layerX, y:e.layerY});
        switch(node){
            case "core":    //线附近
                canvasDemo.style.cursor = "move";
                break;
            case "begin":    //初始点附近
                canvasDemo.style.cursor = "n-resize";
                break;
            case "end":    //结束点附近
                canvasDemo.style.cursor = "n-resize";
                break;
            default:     //以外
                canvasDemo.style.cursor = "default";
        }
    }

    //矩形函数
    //待改
    solidBox(canvas, x1, y1, x2, y2){    //实线矩形框
        canvas.save();
        canvas.beginPath();
        let x = Math.min(x1, x2), y = Math.min(y1, y2), w = Math.abs(x1 - x2), h = Math.abs(y1 - y2);  
        canvas.strokeStyle = this.strokeColor;
        canvas.lineWidth = this.pensize;    //设置线条宽度。
        canvas.strokeRect(x, y, w, h);
        canvas.restore();
    }

    dottedBox(x1, y1, x2, y2){    //虚线提示框
        this.canvasDemoCtx.save();    //先保存画布初始状态
        this.canvasDemoCtx.beginPath();    
        let x = Math.min(x1, x2), y = Math.min(y1, y2), w = Math.abs(x1 - x2), h = Math.abs(y1 - y2);    
        this.canvasDemoCtx.setLineDash([5, 2]);
        this.canvasDemoCtx.lineDashOffset = -10;
        this.canvasDemoCtx.strokeStyle = "rgba(131,191,236)";
        this.canvasDemoCtx.lineWidth = 1;
        this.canvasDemoCtx.strokeRect(x, y, w, h);
        this.canvasDemoCtx.restore();

        this.canvasDemoCtx.save();
        let x3 = Math.abs(x1 - x2)/2+Math.min(x1,x2), y3 = Math.abs(y1 - y2)/2+Math.min(y1,y2);
        let path = [{x:x1, y:y1},{x:x2, y:y2},{x:x1, y:y2},{x:x2, y:y1},{x:x1, y:y3},{x:x2, y:y3},{x:x3, y:y1},{x:x3, y:y2}];
        //this.canvasDemoCtx.fillStyle = "#000";
        
        path.forEach((element, index)=>{   
            this.canvasDemoCtx.strokeStyle = "rgba(117,117,117)";
            this.canvasDemoCtx.strokeRect(element.x-1, element.y-1, 3, 3);
            this.canvasDemoCtx.fillStyle = "rgba(255,255,255)";
            this.canvasDemoCtx.fillRect(element.x, element.y, 2, 2);
        })
        this.canvasDemoCtx.restore();
    }

    boundary(canvas, e, firstplot, endplot, lineDistance, pointToLine){
        let node = {x:e.layerX, y:e.layerY};
        if(e.layerX >= firstplot.x - 8 && e.layerX <= endplot.x +8 && e.layerY >= firstplot.y - 8 && e.layerY <= endplot.y + 8 ){
            if(lineDistance(node, firstplot) <= 8){
                canvas.style.cursor = "nw-resize";
                return "topleft";
            }
            else if(lineDistance(node, endplot) <= 8){
                canvas.style.cursor = "se-resize";
                return "lowerright";
            }
            else if(lineDistance(node, {x:firstplot.x, y:endplot.y}) <= 8){
                canvas.style.cursor = "sw-resize";
                return "lowerleft";
            }
            else if(lineDistance(node, {x:endplot.x, y:firstplot.y}) <= 8){
                canvas.style.cursor = "ne-resize";
                return "topright";
            }
            else if(pointToLine(firstplot, {x:firstplot.x, y:endplot.y}, node) <= 8 ){
                canvas.style.cursor = "w-resize";
                return "left";
            } 
            else if(pointToLine(firstplot, {x:endplot.x, y:firstplot.y}, node) <= 8 ){
                canvas.style.cursor = "n-resize";
                return "top";
            }
            else if(pointToLine(endplot, {x:endplot.x, y:firstplot.y}, node) <= 8 ){
                canvas.style.cursor = "w-resize";
                return "right";
            }
            else if(pointToLine(endplot, {x:firstplot.x, y:endplot.y}, node) <= 8 ){
                canvas.style.cursor = "n-resize";
                return "lower"
            }
            else{
                canvas.style.cursor = "move";
                return "core";
            }
        }
        else{
            canvas.style.cursor = "default";
            return "default";
        }
    }

    //圆形函数
    solidRound(canvas, firstplot, endplot){
        canvas.beginPath();
        canvas.ellipse((firstplot.x+endplot.x)/2, (firstplot.y+endplot.y)/2, (endplot.x - firstplot.x)/2, (endplot.y - firstplot.y)/2, 0, 0, Math.PI * 2);
        canvas.lineWidth = this.pensize;
        canvas.stroke();
        canvas.closePath();
    }

    lineDistance(beginspot, endspot){    //点到点距离公式
        return Math.sqrt(Math.pow(beginspot.x-endspot.x, 2)+Math.pow(beginspot.y - endspot.y, 2));
    }

    pointToLine(beginline, endline, node){    //点到线距离函数
        if(beginline.x-endline.x !== 0){
            let k = (beginline.y-endline.y)/(beginline.x-endline.x);
            let b = beginline.y - k*beginline.x;
            return Math.abs( k*node.x - node.y + b )/Math.sqrt( Math.pow(k, 2)+1 );
        }
        else{
            return Math.abs( node.x - beginline.x );
        }
    }
}
