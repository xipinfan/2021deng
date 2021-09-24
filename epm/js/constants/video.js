import {contrast,textFill} from './image.js'
import { $,_$ } from './config.js'
 
'use strict';

export function playPause(){   //修改进度条的暂停开始按钮
  const player = Array.from($('#player>svg'));
  if(this.backstageVideo.paused){
    player[0].style.display = 'none';
    player[1].style.display = 'inline';
  }
  else{
    player[0].style.display = 'inline';
    player[1].style.display = 'none';
  }
}

//将视频投射到画布上
export function openCanvasVideo(){
  const inputVideo = _$('input[name=VideoFile]');   //获取视频导入
  //_$('video').prop('src', window.URL.createObjectURL(inputVideo.files[0]));
  this.backstageVideo.src = window.URL.createObjectURL(inputVideo.files[0]);  //获取视频所在路径并播放
}
export function onloadOpenVideo(){
  const that = this;
  window.cancelAnimationFrame(that.ed);    //防止多次开启函数
  render();
  function render(){  //将视频投放到canvas上
    let currentTime = that.backstageVideo.currentTime;

    that.ed = window.requestAnimationFrame(render);  //每秒触发60次这个函数
    that.videoTimedisplay[0].innerHTML = timeChange(currentTime);  //将当前视频时间显示在屏幕上
    that.progressoafter.style.width = (currentTime/that.backstageVideo.duration) * that.progressobarWidth + 'px';    //修改进度条长度
    

    that.canvasDemoCtx.clearRect(0, 0, that.canvasVideo.width, that.canvasVideo.height); 
  }
}

export function timeChange(time){  //修改时间

  const t = parseInt(time);    //获取分秒
  let m = parseInt(t/60).toString();
  let s = (t - m*60).toString();

  if(m.length < 2)m = '0' + m;
  if(s.length < 2)s = '0' + s;
  return `${m}:${s}`;
}

export function timeChangeFrame(time){  //修改时间

  console.log(time);
  let t = parseInt(time/60);
  let m = (parseInt(t/60)).toString();
  let s = (t - m*60).toString();
  let f = Math.floor((time - s*60 - m*60*60)*100).toString();

  if(m.length < 2)m = '0' + m;
  if(s.length < 2)s = '0' + s;
  if(f.length < 2)f = '0' + f;

  return `${m}:${s}:${f}`;
}

export function Recording(){  //导出GIF视频函数
  const that = this;
  
  recordingVideo.call(this);
  const gif = new GIF({
    worker: 4,
    quality: 10,
    workerScript: './js/layer/gif.worker.js'
  })

  for( let i = 0 ; i < that.saveto.length ; i+=5 ){
    const img = new Image();
    img.src = that.saveto[i];
    img.onload = function(){
      const node = contrast.call(that,that.videoInitial.width,that.videoInitial.height);
      const x = that.nodePlot.x - node.a/2, y = that.nodePlot.y - node.b/2;
      that.canvasVideoTapeCtx.clearRect(0, 0,that.canvasVideo.width,that.canvasVideo.height);  //清空canvas
      if(that.videoInitial.height === this.height && that.videoInitial.width === this.width){
        that.canvasVideoTapeCtx.drawImage(img, 0, 0);  //设定图片距离
      }
      else{
        that.canvasVideoTapeCtx.drawImage(img, x, y, node.a, node.b);
      }
      gif.addFrame(that.canvasVideoTape, {copy:true, delay:120});
      if( i + 5 >= that.saveto.length - 1 ){
        gif.render();
      }
    }
  }

  gif.on('finished', function(blob){
    alert('导出成功!!!!');
    let url = URL.createObjectURL(blob);
    let el = document.createElement('a');
    el.href = url;
    el.download = 'demo-name';
    el.click();
  })
  
}

//视频录制函数
export function recordingVideo(){
  const stream = this.canvasVideoTape.captureStream();  //返回一个实时视频捕获画布
  this.recorder = new MediaRecorder(stream, {mimeType: 'video/webm'});  //设置一个队stream就行录制的对象
  let data = [];
  this.recorder.ondataavailable = function(event){
    if(event.data && event.data.size){  //将捕获到的媒体数据传入data里
      data.push(event.data);
    }
  }
  this.recorder.onstop = () =>{  //当结束录制时导出视频
    const url = URL.createObjectURL(
      new Blob(data, {type:'video/webm'})
    );
    this.backstageVideo.src = url;
  }
  this.recorder.start();  //开启录制
}

export function stopRecordingVideo(){  //暂停录制
  if(this.recorder){
    this.recorder.stop();
  }
}

function addBarrage(Time, barrage, canvas){
  console.log(barrage);
  const node = contrast.call(this,this.videoInitial.width,this.videoInitial.height);
  const x1 = this.width/2 - node.a/2, y1 = this.height/2 - node.b/2;

  this.canvasSubtitleCtx.clearRect(0, 0,this.videoInitial.width,this.videoInitial.height);
  if(Time >= barrage.begin && Time <= barrage.end){
    switch(barrage.type){
      case 'subtitle':{
        addSubtitles.call(this, this.canvasSubtitleCtx, barrage.value);
        break;
      }
      case 'bulletChat':{
        draw.call(this, barrage, Time, this.canvasSubtitleCtx);
        break;
      }
    }
  }
  this.canvasDemoCtx.drawImage(this.canvasSubtitle, 0, 0,
    this.videoInitial.width,this.videoInitial.height, x1, y1, node.a, node.b);
}

export function recordPlay(){  //开始剪切视频
  const that = this;
  const img = new Image();
  const node = contrast.call(this,that.videoInitial.width,that.videoInitial.height);
  const x = that.nodePlot.x - node.a/2, y = that.nodePlot.y - node.b/2;
  const len = that.videoTimedate.end - that.videoTimedate.begin;

  logic();
  function logic(){

    let currentTime = that.backstageVideo.currentTime;

    if(currentTime >= that.videoTimedate.end ){  //当到达结尾时结束
      console.log(currentTime)
      const playerSvg = $('#player>svg');
      playerSvg[0].style.display = 'none';
      playerSvg[1].style.display = 'inline';
      that.backstageVideo.pause();
      window.cancelAnimationFrame(that.ed);
      return;
    }

    that.playbackStatus = true;
    that.ed = window.requestAnimationFrame(logic);  //每秒触发60次这个函数
    that.progressoafter.style.width = ((currentTime - that.videoTimedate.begin)/len) * that.progressobarWidth + 'px';
    that.videoTimedisplay[0].innerHTML = timeChange(currentTime - that.videoTimedate.begin);  //将当前视频时间显示在屏幕上


    for(let barrage of that.barrageData){
      addBarrage.call(that, currentTime, barrage, that.canvasDemoCtx);
    }

  }
}
export function pictureLoad(){  //重新导入页面

  const currentTime = this.backstageVideo.currentTime;
  this.videoTimedisplay[0].innerHTML = timeChange(currentTime - this.videoTimedate.begin);  //将当前视频时间显示在屏幕上
  this.canvasDemoCtx.clearRect(0, 0, this.canvasVideo.width, this.canvasVideo.height); 

  for(let barrage of this.barrageData){
    addBarrage.call(this, currentTime, barrage, this.canvasDemoCtx);
  }
}

export function textQueueObtain(canvas, w, value){  //文本换行判断
  let index = 0;
  let textQueue = [];
  textQueue[index] = '';

  for(let i of value){
    if(canvas.measureText(textQueue[index] + i).width > w){
      index++;
      textQueue[index] = '';
    }
    textQueue[index] += i;
  }
  return textQueue;
}

export function addSubtitles(canvas, value){  //字幕操作画布函数

  canvas.save();
  canvas.font = this.fontWeight + ' ' + this.fontSize + 'px ' + this.fontFamily;

  const textQueue = textQueueObtain(canvas, this.videoInitial.width, value);

  for(let i = 0 ; i < textQueue.length ; i++){
    let w = { x:this.videoInitial.width/2 - canvas.measureText(textQueue[i]).width/2,
          y:this.videoInitial.height - (textQueue.length - 1 ) * this.fontSize - 2 };
    
    textFill(canvas, textQueue[i], w, i * this.fontSize - this.bottomDistance);
  }
  canvas.restore();
}

export function canvasGIF(){  //导出图片数组之后的初始化
  this.backstageVideo.currentTime = this.videoTimedate.begin;  //视频播放进度清零
  _$("input[name=VideoFile]").value = '';    //清除选定的视频
  this.videoTimedisplay[0].innerHTML = '00:00';    //初始化进度条时间
  this.videoTimedisplay[1].innerHTML = timeChange(this.videoTimedate.end - this.videoTimedate.begin);    //初始化结束时间
  this.progressoafter.style.width = '0px';    //初始化
  this.videoIndex = 'canvas';    //切换模式
}

export function saveBase64(){
  if(!this.base){   //在录制开始时视频需要进行播放
    this.base = true;   //切换录制状态
    this.backstageVideo.play(); 
    onloadOpenVideo.call(this,this.videoData.w,this.videoData.h);  
  }
  else{   //在录制暂停时视频也需要暂停
    this.base = false;
    this.backstageVideo.pause();
    window.cancelAnimationFrame(this.ed);
  }
}

export function progressbarVideo(percent, e){  //映射视频时的进度条控制
  if(this.backstageVideo.readyState === 4){  
    this.progressoafter.style.width = (e.pageX - progressobar.offsetLeft) + 'px';   //修改进度的长度
    this.backstageVideo.currentTime = percent * this.backstageVideo.duration;   //修改时间
    this.videoTimedisplay[0].innerHTML = timeChange(this.backstageVideo.currentTime);   //修改进度条显示的时间
  }
}

export function progressbarCanvas(percent, e){  //映射图片数组的进度条控制

  this.progressoafter.style.width = (e.pageX - progressobar.offsetLeft) + 'px';
  this.backstageVideo.currentTime = this.videoTimedate.begin + (this.videoTimedate.end - this.videoTimedate.begin) * percent;

  pictureLoad.call(this);
}

export function endFrame(img, value, Text, index){  //字幕完成添加函数

  this.canvasSubtitleCtx.clearRect(0, 0,this.videoInitial.width,this.videoInitial.height);
  this.canvasSubtitleCtx.drawImage(img, 0, 0);  
  this.canvasSubtitleCtx.save();
  this.canvasSubtitleCtx.font = Text + 'px serif';  //字体大小
  
  const textQueue = textQueueObtain(this.canvasSubtitleCtx, this.videoInitial.width, value);

  for(let i = 0 ; i < textQueue.length ; i++){
    const nP = { x:this.videoInitial.width/2 - this.canvasSubtitleCtx.measureText(textQueue[i]).width/2 ,
        y:this.videoInitial.height- (textQueue.length-1) * Text } ;
    textFill(this.canvasSubtitleCtx, textQueue[i], nP, i * Text);
  }

  this.canvasSubtitleCtx.restore();
  this.saveto[index] = this.canvasSubtitle.toDataURL('image/png');  //修改图片数组
}

export function speedCalculation(nP, value, speed){  //计算滚动弹幕时间

  const node = contrast.call(this,this.videoData.w,this.videoData.h);
  const x1 = this.nodePlot.x - node.a/2, y1 = this.nodePlot.y - node.b/2;
  const length = this.canvasSubtitleCtx.measureText(value).width;
  let Ti = this.videoOnload, x = nP.x;

  this.canvasSubtitleCtx.clearRect(0, 0, this.videoInitial.width, this.videoInitial.height);
  textFill(this.canvasSubtitleCtx, value, nP, 0);
  this.canvasDemoCtx.drawImage(this.canvasSubtitle, 0, 0,this.videoData.w,this.videoData.h, x1, y1, node.a, node.b);

  while(Ti != this.saveto.length){  //计算从起使到结束点时间
    if(x + length < 0){
      break;
    }
    x -= speed;
    Ti ++;
  }

  return Ti;
}

export function drawFixed(barrage, canvas){

  canvas.save();
  canvas.font = this.fontWeight + ' ' + this.fontSize + 'px ' + this.fontFamily;
  // canvas.fillStyle = this.color;
  canvas.fillText(barrage.value, barrage.plot.x, barrage.plot.y);
  canvas.restore();

}

export function draw(barrage, time1, canvas){
  let d1 = time1 - barrage.begin;

  canvas.save();
  canvas.font = this.fontWeight + ' ' + this.fontSize + 'px ' + this.fontFamily;
  // this.ctx.fillStyle = this.color;
  canvas.fillText(barrage.value, barrage.plot.x - this.barrageSpeed * d1, barrage.plot.y);  //每次减少x值来进行移动
  console.log(barrage.value, barrage.plot.x - this.barrageSpeed * d1, barrage.plot.y)
  canvas.restore();

}


export function bulletchatImageC(width, height, img, i){  //将图片与弹幕导入到新的画布上，然后保存当前画布的图片
  this.canvasSubtitleCtx.clearRect(0, 0,width,height);
  this.canvasSubtitleCtx.drawImage(img, 0, 0);  
  this.canvasSubtitleCtx.save();
  switch(this.barrage.typebullet){
    case 'bottom':
    case 'top':{
      this.barrage.drawFixed(i);
      break;
    }
    case 'roll':{
      this.barrage.draw(i);
    }
  }  
  this.saveto[i] = this.canvasSubtitle.toDataURL('image/png');
}

export function bulletchatChange(typebullet, value, random){
  let xx, yy;

  switch(typebullet){  //因为图片的分辨率与画布大小不一样，需要转换
    case 'top':
      xx = this.videoInitial.width / 2 - this.canvasSubtitleCtx.measureText(value).width/2;
      yy = this.videoInitial.height / 2 - this.videoInitial.height / 2 * random;
      break;
    case 'roll':
      xx = this.videoInitial.width;
      yy = this.videoInitial.h * random;
      break;
    case 'bottom':
      xx = this.videoInitial.width / 2 - this.canvasSubtitleCtx.measureText(value).width/2;
      yy = this.videoInitial.height / 4 * random + this.videoInitial.height / 4 * 3;
      break;
  }

  return { xx, yy };
}