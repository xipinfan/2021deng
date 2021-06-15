class ImageLayer{    //图像处理工具类
    whiteBoard(){    //重置绘画板
        this.canvasVideoCtx.fillStyle = "rgb(255,255,255)";
        this.canvasVideoCtx.fillRect(0,0,this.width,this.height);
    }
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

    drawLine(x1, y1, x2, y2){     //连接路径
        this.canvasVideoCtx.beginPath();
        this.canvasVideoCtx.moveTo(x1,y1);
        this.canvasVideoCtx.lineTo(x2,y2);
        this.canvasVideoCtx.lineWidth = this.pensize;    //设置线条宽度。
        this.canvasVideoCtx.lineCap = 'round';   //设置线条末端样式。
        this.canvasVideoCtx.lineJoin = 'round';    //设定线条与线条间接合处的样式。
        this.canvasVideoCtx.strokStyle = this.strokeColor || '#000';

        this.canvasVideoCtx.stroke();
    }

    drawDemoLine(canvas,beginLine,endLine){
    
        canvas.beginPath();

        canvas.moveTo(beginLine.x,beginLine.y);
        canvas.lineTo(endLine.x, endLine.y);
        canvas.lineCap = 'round';   //设置线条末端样式。
        canvas.lineWidth = this.pensize;    //设置线条宽度。
        canvas.strokStyle = this.strokeColor || '#000';
        
        canvas.stroke();
    }

    dottedBox(x1, y1, x2, y2){    //虚线提示框
        this.canvasDemoCtx.save();
        this.canvasDemoCtx.beginPath();
        let x = Math.min(x1, x2), y = Math.min(y1, y2), w = Math.abs(x1 - x2), h = Math.abs(y1 - y2);
        this.canvasDemoCtx.setLineDash([10, 4]);
        this.canvasDemoCtx.lineDashOffset = -10;
        this.canvasDemoCtx.strokeStyle = "rgba(0,0,0,0.2)";
        this.canvasDemoCtx.strokeRect(x, y, w, h);
        this.canvasDemoCtx.restore();

        this.canvasDemoCtx.save();
        let x3 = Math.abs(x1 - x2)/2+Math.min(x1,x2), y3 = Math.abs(y1 - y2)/2+Math.min(y1,y2);
        let path = [{x:x1, y:y1},{x:x2, y:y2},{x:x1, y:y2},{x:x2, y:y1},{x:x1, y:y3},{x:x2, y:y3},{x:x3, y:y1},{x:x3, y:y2}];
        //this.canvasDemoCtx.fillStyle = "#000";
        this.canvasDemoCtx.strokeStyle = "rgba(0,0,0,0.2)";
        path.forEach((element, index)=>{
            this.canvasDemoCtx.beginPath();
            this.canvasDemoCtx.arc(element.x, element.y, 5, 0, Math.PI*2, true);
            this.canvasDemoCtx.stroke();    
        })
        this.canvasDemoCtx.restore();
    }

    lineBox(x1, y1, x2, y2){
        this.canvasDemoCtx.save();
        let path = [{x:x1, y:y1},{x:x2,y:y2}];
        this.canvasDemoCtx.strokeStyle = "rgba(0,0,0,0.3)";
        path.forEach((element)=>{
            this.canvasDemoCtx.beginPath();
            this.canvasDemoCtx.arc(element.x, element.y, 5, 0, Math.PI*2, true);
            this.canvasDemoCtx.stroke();    
        }) 
        this.canvasDemoCtx.restore();
    }

    spotLineDistance(beginline, endline, node){
        if(this.lineDistance(beginline, node)<=8){
            return "begin";
        }
        else if(this.lineDistance(endline, node)<=8){
            return "end";
        }
        else{
            let long =  this.pointToLine(beginline, endline, node);
            if(node.x<=Math.max(beginline.x, endline.x)+8&&node.x>=Math.min(beginline.x, endline.x-8)){
                if(node.y<=Math.max(beginline.y, endline.y)+8&&node.y>=Math.min(beginline.y, endline.y-8)){
                    if(long < 8){
                        return "core";
                    }
                }
            } 
            return "default";
        }
    }
    lineDistance(beginspot, endspot){    //点到点距离公式
        return Math.sqrt(Math.pow(beginspot.x-endspot.x, 2)+Math.pow(beginspot.y - endspot.y, 2));
    }

    pointToLine(beginline, endline, node){    //点到线距离函数
        let k = (beginline.y-endline.y)/(beginline.x-endline.x);
        let b = beginline.y - k*beginline.x;
        return Math.abs( k*node.x - node.y + b )/Math.sqrt( Math.pow(k, 2)+1 );
    }

    mousePointLine(e, beginLine, endLine, canvasDemo){
        let node = this.spotLineDistance(beginLine, endLine, {x:e.layerX, y:e.layerY});
        switch(node){
            case "core":
                canvasDemo.style.cursor = "move";
                break;
            case "begin":
                canvasDemo.style.cursor = "n-resize";
                break;
            case "end":
                canvasDemo.style.cursor = "n-resize";
                break;
            default:
                canvasDemo.style.cursor = "default";
        }
    }

    //lineFromSpot(e, )
    mousePointer(e, beginLine, endLine, boundary){
        let node = boundary(e, beginLine, endLine);
        switch(node){
            case "core":
                this.canvasDemo.style.cursor = "move";
                break;
            case "topleft":
                this.canvasDemo.style.cursor = "nw-resize";
                break;
            case "lowerleft":
                this.canvasDemo.style.cursor = "sw-resize";
                break;
            case "topright":
                this.canvasDemo.style.cursor = "ne-resize";
                break;
            case "lowerright":
                this.canvasDemo.style.cursor = "se-resize";
                break;
            case "top":
                this.canvasDemo.style.cursor = "n-resize";
                break;
            case "lower":
                this.canvasDemo.style.cursor = "n-resize";
                break;
            case "right":
                this.canvasDemo.style.cursor = "w-resize";
                break;
            case "left":
                this.canvasDemo.style.cursor = "w-resize";
                break;
            default:
                this.canvasDemo.style.cursor = "default";
        }
    }


    boundary(e, beginLine, endLine){
        if(e.layerX<=Math.max(beginLine.x, endLine.x)-5 &&e.layerX >= Math.min(beginLine.x,endLine.x)+5 &&e.layerY<=Math.max(beginLine.y, endLine.y)-5&& e.layerY>=Math.min(beginLine.y ,endLine.y)+5){
            return "core";
        }
        else if(e.layerX<=Math.min(beginLine.x, endLine.x)+5&&e.layerX >= Math.min(beginLine.x,endLine.x)-5&&e.layerY<=Math.min(beginLine.y, endLine.y)+5&& e.layerY>=Math.min(beginLine.y ,endLine.y)-5){
            return "topleft";
        }
        else if(e.layerX<=Math.min(beginLine.x, endLine.x)+5&&e.layerX >= Math.min(beginLine.x,endLine.x)-5&&e.layerY<=Math.max(beginLine.y, endLine.y)+5&& e.layerY>=Math.max(beginLine.y ,endLine.y)-5){
            return "lowerleft";
        }
        else if(e.layerX<=Math.max(beginLine.x, endLine.x)+5&&e.layerX >= Math.max(beginLine.x,endLine.x)-5&&e.layerY<=Math.min(beginLine.y, endLine.y)+5&& e.layerY>=Math.min(beginLine.y ,endLine.y)-5){
            return "topright";
        }
        else if(e.layerX<=Math.max(beginLine.x, endLine.x)+5&&e.layerX >= Math.max(beginLine.x,endLine.x)-5&&e.layerY<=Math.max(beginLine.y, endLine.y)+5&& e.layerY>=Math.max(beginLine.y ,endLine.y)-5){
            return "lowerright";
        }
        else if(e.layerX<=Math.max(beginLine.x, endLine.x)+5&&e.layerX >= Math.min(beginLine.x,endLine.x)-5&&e.layerY<=Math.min(beginLine.y, endLine.y)+5&& e.layerY>=Math.min(beginLine.y ,endLine.y)-5){
            return "top";
        }
        else if(e.layerX<=Math.max(beginLine.x, endLine.x)+5&&e.layerX >= Math.min(beginLine.x,endLine.x)-5&&e.layerY<=Math.max(beginLine.y, endLine.y)+5&& e.layerY>=Math.max(beginLine.y ,endLine.y)-5){
            return "lower"
        }
        else if(e.layerX<=Math.max(beginLine.x, endLine.x)+5&&e.layerX >= Math.max(beginLine.x,endLine.x)-5&&e.layerY<=Math.max(beginLine.y, endLine.y)+5&& e.layerY>=Math.min(beginLine.y ,endLine.y)-5){
            return "right";
        }
        else if(e.layerX<=Math.min(beginLine.x, endLine.x)+5&&e.layerX >= Math.min(beginLine.x,endLine.x)-5&&e.layerY<=Math.max(beginLine.y, endLine.y)+5&& e.layerY>=Math.min(beginLine.y ,endLine.y)-5){
            return "left";
        }
        else{
            return "default";
        }
    }
}
