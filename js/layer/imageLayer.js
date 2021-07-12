class ImageLayer{    //图像处理工具类

    whiteBoard(){    //重置绘画板
        this.canvasVideoCtx.save();
        this.canvasVideoCtx.fillStyle = "rgb(255,255,255)";
        this.canvasVideoCtx.fillRect(0,0,this.width,this.height);
        this.canvasVideoCtx.restore();
    }
    
    Board(){    //重置绘画板
        //this.canvasPictureCtx.clearRect(0,0,this.width,this.height);
        this.canvasVideoCtx.clearRect(0,0,this.width,this.height);
    }

    saveImag(){    //图片保存函数
        let type = "png";
        let imgdata = this.canvasVideo.toDataURL(type);
        let fixtype = function(type){
            type = type.toLocaleLowerCase().replace(/jpg/i, 'jpeg');
            let r = type.match(/png|jpeg|bmp|gif/)[0];
            return 'image/' + r;
        }
        imgdata = imgdata.replace(fixtype(type), 'image/octet-stream');    //修改格式与后缀
        let saveFile = function(data, filename){
            let link = document.createElement('a');    //通过a标签进行下载
            link.href = data;
            link.download = filename;
            link.click();
        }
        let filename = new Date().toLocaleDateString() + '.' + type;    //保存的名称
        saveFile(imgdata, filename);
    }

    //区域方型涂白,橡皮擦函数
    eliminate(e){
        this.canvasVideoCtx.clearRect(e.layerX,e.layerY,this.rubberIconSize,this.rubberIconSize);
        //this.canvasVideoCtx.fillStyle = "rgba(255,255,255,0)";
        //this.canvasVideoCtx.fillRect(e.layerX,e.layerY,this.rubberIconSize,this.rubberIconSize);
    }

    //目前已废弃，因为路径的连接有问题，且绘制的点其实为直线，滑动速度快之后会形成一条一条的线
    graffiti(x, y){    //绘制路径记录上一个点坐标，然后将下一个点坐标与上一个点相连接
        if(this.penstate){
            //this.canvasVideoCtx.beginPath();
            this.canvasVideoCtx.moveTo(this.ppx,this.ppy);    //开始的坐标
            this.canvasVideoCtx.lineTo(x,y);    //到达的坐标
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

    extractPixels(canvas, x, y){    //提取颜色
        let pixel = canvas.getImageData(x, y, 1, 1);
        let data = pixel.data;
        return `RGB(${data[0]},${data[1]},${data[2]})`;
    }

    shear(firstplot, endplot, shearplot){    //剪切函数
        let w = endplot.x - firstplot.x, h = endplot.y - firstplot.y;    //获取需要剪切的，以及需要映射宽高
        let w1 = shearplot.x2 - shearplot.x1 , h1 = shearplot.y2 - shearplot.y1;
        this.canvasDemoCtx.drawImage(this.canvasVideo,shearplot.x1,shearplot.y1,w1,h1,firstplot.x,firstplot.y,w,h);    //剪切原图像
        this.canvasVideoCtx.clearRect(shearplot.x1,shearplot.y1,w1,h1);      //将原图像清空 
    }

    paintBucket(ImageDate, x, y, color){    //油漆桶
        let { width, height, data } = ImageDate;
        let [R, G, B] = color.substring(1).match(/[a-fA-F\d]{2}/g);
		R = Number.parseInt(R, 16);
		G = Number.parseInt(G, 16);
		B = Number.parseInt(B, 16);
        x = Math.floor(x);
        y = Math.floor(y);
        let index = (y*width + x) * 4;    //data数组排列为从左到右，从上到下，每一个像素点占三个空间，分别为RGB属性
        let grayColor = this.rgbToGray(data[index], data[index+1], data[index+2]);
        let vis = Array.from({ length: height }, x => Array.from({ length: width }, y => 0)); // 访问标记
        let move_dir = [[0, 1], [1, 0], [0, -1], [-1, 0]]; // 广搜方向
		let queue = [{ x, y }];
		vis[y][x] = 1;
        
        while(queue.length > 0){    //广搜搜索附近相识颜色 
            let pos = queue.shift();
            index = (pos.y * width + pos.x)*4;
            data[index] = R;
            data[index+1] = G;
            data[index+2] = B;
            for(let i of move_dir){
                let x1 = pos.x + i[0];
                let y1 = pos.y + i[1];
                index = (y1 * width + x1 ) * 4;
                let colorto = this.rgbToGray( data[index],data[index+1],data[index+2] );
                if(x1 >= 0 && y1 >=0 && x1 < width && y1 < height && !vis[y1][x1] && colorto - 50 <= grayColor && colorto + 50 >= grayColor ){    //通过灰度值判断
                    vis[y1][x1] = 1;
                    queue.push({ x:x1, y:y1 });
                }
            }
        }
    }

    rgbToGray(r, g, b) { // 计算灰度值
		return r * 0.299 + g * 0.587 + b * 0.114;
	}

    //刷子函数
    drawLine(x1, y1, x2, y2){     //连接路径
        this.canvasVideoCtx.beginPath();
        this.canvasVideoCtx.moveTo(x1,y1);
        this.canvasVideoCtx.lineTo(x2,y2);
        this.canvasVideoCtx.stroke();
    }

    //直线函数
    drawDemoLine(canvas,beginLine,endLine){
    
        canvas.beginPath();

        canvas.moveTo(beginLine.x,beginLine.y);
        canvas.lineTo(endLine.x, endLine.y);

        canvas.stroke();
    }
    //直线的操作框
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

    spotLineDistance(beginline, endline, node){    //直线由鼠标位置修改鼠标样式
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

    mousePointLine(e, beginLine, endLine, canvasDemo){    //直线鼠标指针所在地判断
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
    solidBox(canvas, x1, y1, x2, y2){    //实线矩形框
        canvas.save();
        canvas.beginPath();
        canvas.lineCap = 'butt';   //设置线条末端样式。
        let x = Math.min(x1, x2), y = Math.min(y1, y2), w = Math.abs(x1 - x2), h = Math.abs(y1 - y2);  
        canvas.strokeStyle = this.strokeColor;
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

    boundary(canvas, e, firstplot, endplot, lineDistance, pointToLine){    //其他的所在地判断，随便修改鼠标样式
        let node = {x:e.layerX, y:e.layerY};
        let minx = Math.min(firstplot.x, endplot.x), miny = Math.min(firstplot.y, endplot.y), 
            maxx = Math.max(firstplot.x, endplot.x), maxy = Math.max(firstplot.y, endplot.y);
        if(e.layerX >= minx - 8 && e.layerX <= maxx + 8 && e.layerY + 8 >= miny && e.layerY <= maxy + 8 ){    //是否在范围内
            if(lineDistance(node, {x:minx, y:miny}) <= 8){    //到四点距离
                canvas.style.cursor = "nw-resize";
                return "topleft";
            }
            else if(lineDistance(node, {x:maxx, y:maxy}) <= 8){
                canvas.style.cursor = "se-resize";
                return "lowerright";
            }
            else if(lineDistance(node, {x:minx, y:maxy}) <= 8){
                canvas.style.cursor = "sw-resize";
                return "lowerleft";
            }
            else if(lineDistance(node, {x:maxx, y:miny}) <= 8){
                canvas.style.cursor = "ne-resize";
                return "topright";
            }

            if(lineDistance(node, firstplot) <= 8){    //到四点距离
                //canvas.style.cursor = "nw-resize";
                return "topleft";
            }
            else if(lineDistance(node, endplot) <= 8){
                //canvas.style.cursor = "se-resize";
                return "lowerright";
            }
            else if(lineDistance(node, {x:firstplot.x, y:endplot.y}) <= 8){
                //canvas.style.cursor = "sw-resize";
                return "lowerleft";
            }
            else if(lineDistance(node, {x:endplot.x, y:firstplot.y}) <= 8){
                //canvas.style.cursor = "ne-resize";
                return "topright";
            }
            else if(pointToLine(firstplot, {x:firstplot.x, y:endplot.y}, node) <= 8 ){    //到四边距离
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
        canvas.ellipse((firstplot.x+endplot.x)/2, (firstplot.y+endplot.y)/2, (endplot.x - firstplot.x)/2, (endplot.y - firstplot.y)/2, 0, 0, Math.PI * 2);    //绘制椭圆函数
        canvas.stroke();
        canvas.closePath();
    }
    //直角三角形
    solidTriangle(canvas, firstplot, endplot){
        let right = { x:firstplot.x, y:endplot.y };
        canvas.beginPath();
        canvas.moveTo(firstplot.x,firstplot.y);    //连接三条边
        canvas.lineTo(right.x, right.y);
        canvas.lineTo(endplot.x, endplot.y);
        canvas.closePath();
        canvas.stroke();
    }
    //等腰三角形
    isoscelesTriangle(canvas, firstplot, endplot){
        let right = { x:firstplot.x, y:endplot.y };
        switch(this.direction[this.directionIndex]){    //判断当前旋转状态，不同状态需要不同判断，顶点计算有可能是x有可能是y，后面也是
            case "lower":
            case "upper":
                right = { x:firstplot.x, y:endplot.y };
                break;
            case "left":
            case "right":
                right = { x:endplot.x, y:firstplot.y };
                break;
        }
        canvas.beginPath();
        switch(this.direction[this.directionIndex]){
            case "lower":
            case "upper":
                canvas.moveTo((firstplot.x + endplot.x)/2,firstplot.y);
                break;
            case "left":
            case "right":
                canvas.moveTo( firstplot.x, (firstplot.y + endplot.y)/2);
                break;
        }
        canvas.lineTo(right.x, right.y);
        canvas.lineTo(endplot.x, endplot.y);
        canvas.closePath();
        canvas.stroke();
    }
    //菱形
    drawDiamond(canvas, firstplot, endplot){
        let mid = { x:(firstplot.x + endplot.x)/2, y:(firstplot.y + endplot.y)/2 } , x = (endplot.x - firstplot.x)/2, y = (endplot.y - firstplot.y)/2;    //四个顶点
        canvas.beginPath();
        canvas.moveTo( mid.x + x , mid.y );
        canvas.lineTo( mid.x  , mid.y - y );
        canvas.lineTo( mid.x - x , mid.y );
        canvas.lineTo( mid.x  , mid.y + y );
        canvas.closePath();
        canvas.stroke();
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
    //在canvas上绘制文本
    textFill( canvas, str, clinet, index){
        canvas.save();
        canvas.fillText(str, clinet.x, clinet.y + index);
        canvas.restore();
    }
    
    textTool(textDottedLine, canvas, value, dd){    //绘制文本初始化
        let textQueue = [];
        let textWidth = Math.abs(textDottedLine.clinetTo.x - textDottedLine.clinet.x);
        canvas.save();
        canvas.font = "50px serif";    //字体大小
        canvas.fillStyle = document.querySelector("input[type=color]").value;
        let index = 0;
        textQueue[index] = "";

        for( let i of value ){
            if(canvas.measureText(textQueue[index] + i).width > textWidth || i == "\n"){    //判断是否到达设定长度或有回车键
                index ++;
                textQueue[index] = "";
            }
            if(i != "\n")textQueue[index] += i;
        }
        
        for(let i = 0 ; i <= textQueue.length - 1 ; i++){
            if(i === textQueue.length - 1 && dd > 10){    //模拟光标闪烁
                this.textFill(canvas, textQueue[i]+'|', textDottedLine.clinet , 20*(i+1));
            }
            else{
                this.textFill(canvas, textQueue[i], textDottedLine.clinet , 20*(i+1));
            }
        }
        canvas.restore();
        return textQueue.length*20;    //判断是否需要伸长框体
    }
}
