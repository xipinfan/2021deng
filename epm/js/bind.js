import * as images from './constants/image.js'
import * as videos from './constants/video.js'
import {$, _$, on, checkUrl,widthChange, displayChange, Get} from './constants/config.js'
import {Tools} from './index.js'

'use strict';

class Bind extends Tools{
  constructor(){
    super();
    this.baseButtonBind();    //初始按钮绑定
    this.animationBind();    //侧边栏动画绑定
    this.canvasVideoBindInit();    //基础画布操作绑定
    this.canvasDemoBindInit();    //操作画布操作绑定
    this.videoBindInit();    //视频操作绑定
  }
  baseButtonBind(){   //初始按键绑定
    const that = this;
    const [warning, inputUrl, saveToImage, saveToGif, speedProgress] = Array.from($('dialog'));    //获取初始绑定
    const panel = Array.from($('template'));    //template Dom绑定
    const mainnav = $('#main-nav>ul>li');    //侧边栏 Dom绑定
    const videoControl = $('#main-right>div');
    const imgs = $('#gridLayer>img');
    const ImageModel = _$('select[title=默认模板]');
    const imageModelindex = _$('#turnPages>div');
    
    imgs.forEach((img)=>{
      on(img, 'dragstart', function(e){
        console.log(e.offsetX, e.offsetY)
        e.dataTransfer.setData('url', e.target.src);
        e.dataTransfer.setData('offset',{ x:e.offsetX,y:e.offsetY });
      })
    })
    on(ImageModel, 'change', function(){
      if(this.value !== '无'){
        Get(`http://localhost:${that.nodeServerPort}/add?cate2=${this.value}`, function(){
          if(this.readyState === 4){
            imageModelindex.innerHTML = 1;
            that.searchImage = JSON.parse(this.responseText) || [];
            that.searchImage.map((e)=>{
              e.image_url = e.path;
              delete e.path;
            })
            _$('#turnPages>div').innerHTML = '1';
            imgAssignment(0);
          }
        })
      }
    })

    $('.model-header>span.close, .model-footer>button[value=cancel]').forEach((el)=>{
      on(el,'click',function(){    //去除dialog弹出框
        that.dialog.close();
      })
    });

    on(_$('#acceptURL'),'click',function(){    //URL打开
      const value = _$('#inputTextUrl1').value;
      if(!value){
        alert('请输入URL');
      }
      else{
        if(checkUrl(value)){
          images.imageinput.call(that,'',value);
          that.dialog.close();
        }
        else{
          alert('该URL不合法');
        }
      }
    })

    on(_$('#acceptWarning'), 'click', function(){    //将画布清除绑定
      widthChange.call(that);
      that.stateType = 'image';
      that.backstageVideo.src = '';
      that.dialog.close();
      setTimeout(()=>{
        images.whiteBoard.call(that,that.canvasVideoCtx);
      },50);
    })

    on(_$('#acceptImage'),'click',async function(){    //打开图片结束
      const name = _$('#imageName').value;
      await images.saveImag(that.saveImageData,name);
      that.dialog.close();
    })

    on(_$('input[name=ImageFile]'), 'input', function(e){    //导入图片
      images.imageinput.call(that,e);
    });

    on(_$('input[name=VideoFile]'), 'input', function(){    //导入视频
      
      that.haole = false;  //设定视频只能就绪一次
      that.stateType = 'video';  //设定当前播放方式
      that.height -= 40;    //修改高度，因为和图片不同需要有一个进度条，所以得修改高度

      _$('input[name=ImageFile]').value = '';  //清除选定的图片
      _$('#player').style.display = 'flex';   //拉起进度条
      _$('#content').style.height = that.height + 'px';  //修改画布容器的高度

      Array.from($('#contains>canvas')).forEach((index)=>{  //修改画布的高度
        index.height = that.height;
      }) 

      displayChange(videoControl[0],videoControl[2],videoControl[1]);  //修改右边栏布局

      videos.openCanvasVideo.call(that);  //将视频路径放到video标签上
      
      _$('#main-panel').className = 'mainPanelOutAnima';   //将左边栏下放
      that.progressobarWidth = $('#progressobar')[0].getBoundingClientRect().width;  //保存进度条的长度
    });

    $('#file>li').forEach((index)=>{  //文件操作绑定
      switch(index.id){
        case 'openImageFile':{  //打开图片文件
          on(index, 'click', function(){
            _$('input[name=ImageFile]').click();
          })
          break;
        }
        case 'openVideoFile':{  //打开视频文件
          on(index, 'click', function(){
            _$('input[name=VideoFile]').click();
          })
          break;
        }
        case 'openUrl':{  //从URL打开
          this.dialogBind(index, inputUrl);
          break;
        }
        case 'saveImage':{  //保存图片
          this.dialogBind(index, saveToImage);
          break;
        }
        case 'saveGIFImage':{  //保存GIF图
          this.dialogBind(index, saveToGif);
          break;
        }
      }
    });
    $('#shape>li').forEach((index)=>{  //形状操作绑定
      switch(index.id){
        case 'pencil':{ //铅笔
          on(index, 'click', function(){    //皆为打开侧边栏操作工具
            that.node = that.sidebarControl.call(mainnav[2],panel[2],that.node,'画笔',that);
          })
          break;
        }
        case 'line':{   //直线
          on(index, 'click',async function(){
            if(_$('#main-panel-title').innerHTML !== '形状工具'){
              that.node =that.sidebarControl.call(mainnav[7],panel[7],that.node,'形状工具',that);
            }
            $('#xzgj-panel>div')[0].click();
          })
          break;
        }
        case 'brush':{  //刷子
          on(index, 'click', function(){
            that.node = that.sidebarControl.call(mainnav[2],panel[2],that.node,'画笔',that);
          })
          break;
        }
        case 'round':{  //圆
          on(index, 'click',async function(){
            if(_$('#main-panel-title').innerHTML !== '形状工具'){
              that.node =that.sidebarControl.call(mainnav[7],panel[7],that.node,'形状工具',that);
            }
            
            $('#xzgj-panel>div')[1].click();
          })
          break;
        }
        case 'rectangle':{  //矩形
          on(index, 'click',async function(){
            if(_$('#main-panel-title').innerHTML !== '形状工具'){
              that.node =that.sidebarControl.call(mainnav[7],panel[7],that.node,'形状工具',that);
            }
            
            $('#xzgj-panel>div')[2].click();
          })
          break;
        }
        case 'rightTriangle':{  //直角三角形
          on(index, 'click',async function(){
            if(_$('#main-panel-title').innerHTML !== '形状工具'){
              that.node =that.sidebarControl.call(mainnav[7],panel[7],that.node,'形状工具',that);
            }
            
            $('#xzgj-panel>div')[3].click();
          })
          break;
        }
        case 'isosceles':{  //等腰三角形
          on(index, 'click',async function(){
            if(_$('#main-panel-title').innerHTML !== '形状工具'){
              that.node =that.sidebarControl.call(mainnav[7],panel[7],that.node,'形状工具',that);
            }
            
            $('#xzgj-panel>div')[4].click();
          })
          break;
        }
        case 'diamond':{  //菱形
          on(index, 'click',async function(){
            if(_$('#main-panel-title').innerHTML !== '形状工具'){
              that.node =that.sidebarControl.call(mainnav[7],panel[7],that.node,'形状工具',that);
            }
            
            $('#xzgj-panel>div')[5].click();
          })
          break;
        }
      }
    });
    $('#tool>li').forEach((index)=>{  //工具操作绑定
      switch(index.id){
        case 'eraser':{ //橡皮擦
          on(index, 'click', function(){
            that.node = that.sidebarControl.call(mainnav[5],panel[5],that.node,'橡皮擦',that);
          })
          break;
        }
        case 'bucket':{ //油漆桶
          on(index, 'click', function(){
            that.node = that.sidebarControl.call(mainnav[4],panel[4],that.node,'油漆桶',that);
          })
          break;
        }
        case 'text':{   //文本
          on(index, 'click', function(){
            that.node = that.sidebarControl.call(mainnav[6],panel[6],that.node,'文本工具',that);
          })
          break;
        }
        case 'shear':{  //剪切
          on(index, 'click', function(){
            that.node = that.sidebarControl.call(mainnav[1],panel[1],that.node,'剪切',that);
          })
          break;
        }
        case 'extract':{  //颜色提取器
          on(index, 'click', function(){
            that.node = that.sidebarControl.call(mainnav[3],panel[3],that.node,'拾色器',that);
          })
          break;
        }
      }
    })
    $('#image>li').forEach((index)=>{  //图像操作绑定
      switch(index.id){
        case 'white':{  //重置
          this.dialogBind(index, warning);
          break;
        }
      }
    });
    $('#video>li').forEach((index)=>{  //视频操作绑定
      switch(index.id){
        case 'addsubtitle':{  //添加字幕
          break;
        }
        case 'bulletchat':{   //添加弹幕
          break;
        }
        case 'intercept':{  //截取当前帧
          break;
        }
      }
    });
    $('.buttonLayer>input').forEach((index)=>{    //右边栏绑定
      if(index.type === 'text'){

      }
      else{
        switch(index.value){
          case '导入图片':{
            on(index, 'click', function(){
              _$('input[name=ImageFile]').click();
            })
            break;
          }
          case '导入视频':{
            on(index, 'click', function(){
              _$('input[name=VideoFile]').click();
            })
            break;
          }
          case '搜索素材':{
            break;
          }
        }  
      }
      
    })
    $('#toggle>ul>li').forEach(index=>{    //右边图标栏绑定
      switch(index.title){
        case '顺时针旋转':{
          that.rotate(index, '顺时针旋转');
          break;
        }
        case '逆时针旋转':{
          that.rotate(index, '逆时针旋转');
          break;
        }
        case '旋转180°':{
          that.rotate(index, '旋转180°');
          break;
        }
        case '工具初始化':{
          on(index, 'click', function(){
            that.toolInitTo();
          })
          break;
        }
        case '撤销':{
          on(index, 'click', ()=>{
            if(this.stateType === 'image'){
              images.updownImage.call(this, this.ImageData, this.forwardData);
            }
            else if(this.stateType === 'video'){
              this.barrForwardData = videos.updownBarrage(this.barrageData, this.barrForwardData);
              videos.pictureLoad.call(this);   //刷新画布
            }
          })
          break;
        }
        case '下一步':{
          on(index, 'click', ()=>{
            if(this.stateType === 'image'){
              images.updownImage.call(this, this.forwardData, this.ImageData);
            }
            else if(this.stateType === 'video'){
              this.barrageData = videos.updownBarrage(this.barrForwardData, this.barrageData);
              videos.pictureLoad.call(this);   //刷新画布
            }
          })
          break;
        }
        case '保存':{
          on(index, 'click', ()=>{
            this.canvasVideoCtx.fillRect(50,20,100,50);
            this.canvasVideoCtx.save();
            this.canvasVideoCtx.translate(this.canvasVideo.width/2, this.canvasVideo.height/2);
            this.canvasVideoCtx.rotate(20*Math.PI/180);
            this.canvasVideoCtx.fillStyle = '#000';
            this.canvasVideoCtx.fillRect(50,20,100,50);
            this.canvasVideoCtx.restore();  
          })
          //this.dialogBind(index, saveToImage);
          
          break;
        }
      }
    });
    mainnav.forEach((index,i)=>{    //左边栏图标操作绑定
      on(index, 'click', function(){
        if(that.stateType === 'video')return;
        that.node = that.sidebarControl.call(this,panel[i],that.node,this.title,that);
      })
    });
    let spanXY = Array.from($('footer>div>span'));
    on(_$('#content'), 'mousemove', function(el){
      spanXY.forEach(function(e, index){    //下边栏当前位置绑定
        if(index === 0){
          e.innerHTML = el.layerX;
        }
        else{
          e.innerHTML = el.layerY;
        }
      })
    })

    on(_$('input[value=搜索素材]'), 'click', ()=>{
      const value = _$('#searchImage').value;
      if(!value){
        alert('请输入要搜索的关键字');
        return;
      }
      ImageModel.value = '无';
      Get( `http://localhost:${that.nodeServerPort}/item?keyword=${value}`, function(){
        if(this.readyState === 4){
          imageModelindex.innerHTML = 1;
          that.searchImage = JSON.parse(this.responseText).data.list || [];
          _$('#turnPages>div').innerHTML = '1';
          while(that.searchImage.length && that.searchImage[0].width != undefined){
            that.searchImage.shift();
          }
          imgAssignment(0);
        }
      })
    })

    on(_$('#turnPages'), 'click', (e)=>{

      switch(e.target.name){
        case 'homepage':{
          this.imgIndex = 1;
          imgAssignment((this.imgIndex - 1)*8);
          break;
        }
        case 'previouspage':{
          if(this.imgIndex > 1 ){
            this.imgIndex -= 1;
            imgAssignment((this.imgIndex - 1)*8);
          }
          break;
        }
        case 'nextpage':{
          if(this.searchImage.length >= this.imgIndex*8){
            this.imgIndex += 1;
            imgAssignment((this.imgIndex - 1)*8);
          }
          break;
        }
        case 'lastpage':{
          while(this.searchImage.length >= this.imgIndex*8){
            this.imgIndex += 1;
          }
          imgAssignment((this.imgIndex - 1)*8);
          break;
        }
      }
      
      imageModelindex.innerHTML = this.imgIndex;
    })

    function imgAssignment(ad){
      imgs.forEach((e,index)=>{
        try{
          e.style.opacity = 1;
          e.src = that.searchImage[index + ad].image_url;
        }
        catch{
          e.style.opacity = 0;
        }
      })
    }
  }
  videoBindInit(){
    let nodeState = false,  //当前是否按下鼠标
      videoTextType = '字幕',
      recordStatus = false,
      begin = -1, end = -1,     //字幕弹幕开始结束点
      playStatus = false;
    const that = this,
      progressobar = _$("#progressrange");   //进度条范围，用来控制拖动
    const videoControl = $('#main-right>div');

    //当前的想法为将video放在最上层显示，不用requestAnimationFrame与canvas来对视频进行映射，requestAnimationFrame用来修改进度条
    on(this.backstageVideo, 'loadedmetadata', function(){        //准备就绪视频时调用，开启canvas打印video图像
      const node = images.contrast.call(that,this.videoWidth,this.videoHeight);    //获取video需要转换的高度与宽度
      const x = that.width/2 - node.a/2, y = that.height/2 - node.b/2;    //获取video需要移动到的位置
      
      if(that.haole)return;    //判断当前视频是否是第一次加载
      that.haole = true;    //标记
      that.videoTimedisplay[1].innerHTML = videos.timeChange(this.duration);     //将视频总时长转换后显示
      
      that.backstageVideo.style.zIndex = 1001;    //将video设置在最上层
      that.canvasTextMapping.style.zIndex = 1002; 
      that.canvasDemo.style.zIndex = 1003; 
      that.backstageVideo.style.left = x + 'px';    //修改位置
      that.backstageVideo.style.top = y + 'px'; 
      that.backstageVideo.width = node.a;    //修改宽高
      that.backstageVideo.height = node.b;
      [that.videoData.w, that.videoData.h] = [node.a, node.b];     //保存视频修改尺寸信息
      [that.videoInitial.width, that.videoInitial.height] = [this.videoWidth,this.videoHeight];      //保存视频基础尺寸信息

      that.canvasVideoTape.width = this.videoWidth;    //设置录制画布的宽高为原始视频的宽高
      that.canvasVideoTape.height = this.videoHeight;

      that.canvasSubtitle.width = this.videoWidth;    //设置录制画布的宽高为原始视频的宽高
      that.canvasSubtitle.height = this.videoHeight;

      that.backstageVideo.play();    //视频播放
      videos.onloadOpenVideo.call(that,this);    //进度条开启使用
      images.whiteBoard.call(that,that.canvasBackgroundCxt);   //初始化画布
      _$('#toggle>ul>li[title=工具初始化]').click();
    });

    on(_$('#acceptGIF'), 'click', ()=>{
      that.dialog.close();
      if(that.videoIndex === 'canvas'){
        videos.Recording.call(this);
      }
    })

    Array.from($('#player>svg')).forEach((e,index)=>{    //获取暂停和播放的图标
      on(e, 'click', function(){
        this.style.display = 'none';    //当前图标消失
        $('#player>svg')[Math.abs(index - 1)].style.display = 'inline';    //另一个图标出现
          if(that.backstageVideo.readyState === 4){    //视频准备就绪
          if(!index){    //判断当前为暂停键还是播放键，第一个为暂停键，index=0的非为true
            that.backstageVideo.pause();    //暂停
            window.cancelAnimationFrame(that.ed);    //关闭
          }
          else{
            if(that.videoIndex === 'video'){
              that.backstageVideo.play();     //播放视频
              videos.onloadOpenVideo.call(that,that.videoData.w,that.videoData.h);    //开启
            }
            else{
              if(that.backstageVideo.currentTime < that.videoTimedate.end){
                that.backstageVideo.play();     //播放视频
                videos.recordPlay.call(that);  
              }
            }
          }
        }
      })
    })

    on(progressobar, 'mousedown', function(e){    //点击进度条时
      if(recordStatus)return;    //判断当前是否是录制状态，录制状态下不允许修改视频进度
      let percent = (e.pageX - progressobar.offsetLeft) / that.progressobarWidth;   //获取当前点与屏幕边缘的距离，从而计算按下点的百分比
      nodeState = true;   //切换鼠标状态
      if(that.backstageVideo.paused === false){    //当前如果是播放状态
        playStatus = true;  //判断当前视频是否在播放
        window.cancelAnimationFrame(that.ed);    
      }
      that.backstageVideo.pause();    //先暂停播放，等到拖动结束或者点击结束后再进行播放
      if(that.videoIndex === "video"){
        videos.progressbarVideo.call(that,percent, e);   //修改视频进度与进度条进度
      }
      else if(that.videoIndex === "canvas"){
        videos.progressbarCanvas.call(that,percent, e);   
      }
    })

    on(progressobar, 'mousemove', function(e){    //模拟进度条拖动
      if(recordStatus)return;
      if(nodeState){
        let percent = (e.pageX - progressobar.offsetLeft) / that.progressobarWidth;   //获取当前点与屏幕边缘的距离，从而计算按下点的百分比
        if(that.videoIndex === "video"){
          videos.progressbarVideo.call(that,percent, e);    //修改进度 
        }
        else if(that.videoIndex === "canvas"){
          videos.progressbarCanvas.call(that,percent, e); 
        } 
      }
    })

    let drawEndBind = ['mouseup','mouseleave'];   //当鼠标松开或者移除进度条区域时暂停
    drawEndBind.forEach(function(item){
      on(progressobar, item, function(e){
        if(recordStatus)return;
        if(nodeState&&playStatus){
          that.backstageVideo.play();
          if(that.videoIndex === "video"){
            videos.onloadOpenVideo.call(that,that.videoData.w,that.videoData.h);    
          }
          else if(that.videoIndex === "canvas"){
            videos.recordPlay.call(that); 
          }
          //videoState = true;
        }
        nodeState = false;
        playStatus = false;
      })
    })

    Array.from($('#main-right>div>input')).forEach((e,index)=>{
      switch(e.value){
        case '开启录制':{   //开启录制
          on(e, 'click', function(){
            if(that.backstageVideo.readyState === 4){
              this.style.display = 'none';    //切换录制状态
              recordStatus = true;   //设定为录制模式，在取消录制和截取当前帧，导出结果之前都无法对进度条进行操作
              that.videoTimedate.begin = that.backstageVideo.currentTime;   //记录录制开始时间点
              _$('.buttonLayer>input[value="暂停录制"]').style.display = 'inline-block'   //切换为暂停录制按钮
              videos.saveBase64.call(that);   //录制状态设定
              videos.playPause.call(that);   //暂停开始按钮修改
            }
          })
          break;
        }
        case '暂停录制':{
          on(e, 'click', function(){
            if(that.backstageVideo.readyState === 4){
              this.style.display = 'none';
              recordStatus = true;
              that.videoTimedate.end = that.backstageVideo.currentTime;   //记录录制结束时间点
              _$('.buttonLayer>input[value="开启录制"]').style.display = 'inline-block'
              videos.saveBase64.call(that);    //暂停状态设定
              videos.playPause.call(that); 
            }
          })
          break;
        }
        case '取消录制':{
          on(e, 'click', function(){
            recordStatus = false;   //退出录制模式
            _$('.buttonLayer>input[value="暂停录制"]').style.display = 'none';
            _$('.buttonLayer>input[value="开启录制"]').style.display = 'inline-block';   //变为初始状态
            that.base = false; 
            that.videoTimedate = {};   //将录制的初始和结束事件点清除
          })
          break;
        }
        case '截取当前帧':{
          on(e, 'click',function(){

            [that.width, that.height] = [that.imagedatasave.w, that.imagedatasave.h];   //修改保存的宽高

            _$('.buttonLayer>input[value="取消录制"]').click();   //点击取消录制，清除录制状态
            _$('input[name=VideoFile]').value = '';   //input清除
            _$('#player').style.display = 'none';   //清除进度条
            _$('#content').style.height = that.height + 'px';   //修改canvas容器的高度
            Array.from($('#contains>canvas')).forEach((index)=>{   //修改画布的高度
              index.height = that.height;
            })

            that.backstageVideo.pause();
            that.backstageVideo.style.display = 'none';
            that.stateType = 'image';
            
            images.whiteBoard.call(that,that.canvasBackgroundCxt);   //初始化画布
            images.whiteBoard.call(that,that.canvasVideoCtx);

            displayChange(videoControl[1],videoControl[2],videoControl[0]);  //修改右边栏的按钮

            //将视频当前帧按照比例映射到画布上
            {
              const node = images.contrast.call(that,that.videoInitial.width,that.videoInitial.height);
              const x = that.width/2-node.a/2, y = that.height/2-node.b/2;
              that.canvasVideoCtx.clearRect(0, 0, that.canvasVideo.width, that.canvasVideo.height); 
              that.canvasVideoCtx.drawImage(that.backstageVideo, 0, 0, 
                that.videoInitial.width, that.videoInitial.height, x, y,node.a, node.b);  //设定录制canvas
              that.backstageVideo.src = ''; //去除视频的src  
            }
          })
          break;
        }
        case '导出结果':{
          on(e, 'click',async function(){
            //调用worker
            that.worker = new Worker('./js/worker/videoworker.js');

            recordStatus = false;   //退出录制模式
            window.cancelAnimationFrame(that.ed);   //关闭cancelAnimationFrame
            that.backstageVideo.pause();   //暂停视频
            that.backstageVideo.style.display = 'none';
            that.backstageVideo.currentTime = that.videoTimedate.begin;   //修改视频的进度

            //通过promis和定时器切断来对视频进行分段截取图片，截取后的图片保存为图片数组进行修改
            // await (async ()=>{
            //   for(let j = that.videoTimedate.begin ; j <= that.videoTimedate.end; j += 1/that.fps){
            //     await new Promise((resolve)=>{
            //       that.backstageVideo.currentTime = j;
            //       setTimeout(()=>{
            //         Promise.all([
            //           createImageBitmap(that.backstageVideo, 0, 0, that.videoInitial.width, that.videoInitial.height)
            //         ]).then(function(sprites){
            //           that.saveto.push(sprites[0]);
            //           resolve();
            //         })
            //         resolve();
            //       },0); 
            //     })
            //   }  
            // })();
            // that.saveto.push(that.saveto.unshift());

            that.backstageVideo.style.display = '';
            that.videoIndex = "canvas";
            videos.canvasGIF.call(that);
            videos.pictureLoad.call(that);
            displayChange(videoControl[0],videoControl[1],videoControl[2]);
          })
          break;
        }
      }
    })

    Array.from($('#mainControl>button')).forEach((e,index)=>{
      on(e, 'click', function(event){
        Array.from($('#mainControl>button')).forEach((el)=>{ el.className = '' });
        _$('#captionControl').style.display = 'none';
        _$('#bottomDistance').style.display = 'none';
        _$('#textSpeed1').style.display='none';
        this.className = 'mainControlBackground';
        switch(e.value){
          case '添加字幕':{
            videoTextType = '字幕';
            _$('#bottomDistance').style.display = 'inline-block';
            if(that.videoIndex === 'canvas'){
              that.barrage = null;
            }
            break;
          }
          case '添加弹幕':{
            videoTextType = '弹幕';
            _$('#captionControl').style.display = 'flex';
            _$('#textSpeed1').style.display='inline-block';
            break;
          }
          case '添加文字':{
            videoTextType = '文字';
            break;
          }
        }  
      })
    })
    let caption1 = $('#captionControl>button');
    caption1.forEach((e,index)=>{
      on(e, 'click', function(event){
        this.className = 'mainControlBackground';
        caption1[Math.abs(index - 1)].className = '';
        switch(this.value){
          case '顺轴滚动弹幕':{
            that.barrageType = '顺轴滚动弹幕';
            break;
          }
          case '逆轴滚动弹幕':{
            that.barrageType = '逆轴滚动弹幕';
            break;
          }
        }
      })
    })

    $('#selectFrameButton>button').forEach((e)=>{
      switch(e.value){
        case 'begin':{
          on(e, 'click', function(){
            if(that.backstageVideo.readyState !== 4)return;
            that.backstageVideo.pause();
            begin = that.backstageVideo.currentTime;
            $('#selectFrame>span')[0].innerHTML =
              videos.timeChangeFrame(that.backstageVideo.currentTime - that.videoTimedate.begin);
          })
          break;
        }
        case 'end':{
          on(e, 'click', function(){
            if(that.backstageVideo.readyState !== 4)return;
            that.backstageVideo.pause();
            end = that.backstageVideo.currentTime;
            $('#selectFrame>span')[1].innerHTML =
              videos.timeChangeFrame(that.backstageVideo.currentTime - that.videoTimedate.begin);
          })
          break;
        }
      }
    })
    Array.from($('.gifModify>input[type=button]')).forEach((e)=>{
      on(e, 'click', function(){
        switch(e.value){
          case '重新选择':{
            that.barrageData.pop();
            for(let i in that.centralPoint){
              i = -1;
            }
            that.toolCurrent = 'init';
            that.state = false;
            that.canvasDemoCtx.clearRect(0,0,that.width,that.height);    //清除虚拟画布
            videos.pictureLoad.call(that);   //刷新画布
            that.canvasDemo.click();
            break;
          }
          case '重新录制':{
            let remake = confirm("按下确认键重新录制视频");
            if(remake === true){
              displayChange(videoControl[0],videoControl[2],videoControl[1]);  //修改右边栏布局
              that.videoIndex = "video";
              that.videoTimedisplay[1].innerHTML = videos.timeChange(that.backstageVideo.duration);
              that.videoTimedisplay[0].innerHTML = videos.timeChange(0);
              that.backstageVideo.currentTime = 0;
              that.barrageData.splice(0);
              console.log(that.barrageData);
              window.requestAnimationFrame(that.ed);
              videos.onloadOpenVideo.call(that, this.backstageVideo);  
            }
            break;
          }
          case '导出GIF文件':{
            that.dialog = _$('#saveToGif');
            that.dialog.showModal();
            that.saveGifBind();
            break;
          }
        }  
        
        if(e.id === 'addFrame'){
          if(that.barrageData.length !== 0&&that.barrageData[that.barrageData.length - 1].type === undefined){
            alert('请先完成当前弹幕操作');
            return;
          }
          that.barrageValue = _$('.gifModify>input[type=text]').value;
          if(that.barrageValue.length === 0){
            alert('请输入需要添加的内容');
            return;
          }
          if(begin === -1){
            alert('请先选择初始帧');
            return;
          }
          if(end === -1){
            alert('请先选择结束帧');
            return;
          }
          if(begin > end){
            alert('初始帧不能大于结束帧');
            return;
          }
          const barrage = {
            begin:begin,
            end:end,
            value:that.barrageValue,
            fontWeight:that.fontWeight,
            fontSize:that.fontSize,
            fontFamily:that.fontFamily
          }
          switch(videoTextType){
            case '字幕':{
              Object.assign(barrage, {
                type:'subtitle',
                bottomDistance:that.bottomDistance
              })
              that.barrageData.push(barrage);
              videos.pictureLoad.call(that);   //刷新画布
              break;
            }
            case '弹幕':{
              Textposition('bulletChat');
              break;
            }
            case '文字':{
              Textposition('barrageText')
              break;
            }
          }

          function Textposition( type ){
            that.toolCurrent = type;
            that.state = true;
            [that.videoBarragePlot.x, that.videoBarragePlot.y] =
              [ that.videoInitial.width/2, that.videoInitial.height/2 + parseInt(that.fontSize)]
              
            that.clinetChange();
            that.barrageData.push(barrage);
          }
        }
      })
    })
    Array.from($('#wz-style>div>input')).forEach((e)=>{ //文字各种设置
      switch(e.id){
        case 'wz-size':{
          on(e, 'change', function(){
            that.fontSize = this.value;
            _$('#textSize1').title = this.value + 'px';
          })
          break;
        }
        case 'wz-speed':{
          on(e, 'change', function(){
            that.barrageSpeed = this.value;
            _$('#textSpeed1').title = this.value;
          })
          break;
        }
        case 'wz-color':{
          on(e, 'change', function(){
            that.colorAssignment(this.value);
            _$('#textColor1').title = this.value;
          })
          break;
        }
        case 'wz-distance':{
          on(e, 'change',function(){
            that.bottomDistance = this.value;
            _$('#bottomDistance').title = this.value;
          })
          break;
        }
      }
    })
  }
  animationBind(){  //侧边栏动画绑定
    let control = '';
    const that = this;
    const mainPanelcontent = _$('#main-panel-content');    //左侧边栏容器
    const PanelOut = _$('#main-panel>span');    //取消按钮
    const headerlogo = _$('#header-logo');
    const mainright = _$('#main-right');    //右边栏
    const mainPanel = _$('#main-panel');    //左侧边弹出容器
    const content = _$('#content');    //画布容器
    $('.toggle-control').forEach((e)=>{    //右边栏显示控制
      if(e.title === '展开')control = e;    //记录当前状态的反状态
      e.addEventListener('click',function(){
          if(this.title === '缩小'){    //右边栏回退动画绑定
              mainright.className = 'mainRightOutAnima';
              headerlogo.className = 'mainRightOutAnima';
          }
          else{    //右边栏显示动画绑定
              headerlogo.style.display = 'block';
              mainright.style.display = 'block';
              mainright.className = 'mainRightUpAnima';
              headerlogo.className = 'mainRightUpAnima';
          }
          this.style.display = 'none';    //当前控制图标消失
          control.style.display = 'block';    //另一个图标进行显示
          control = this;
      });
    });

    on(PanelOut, 'click', function(){    //左边栏回退动画绑定
      mainPanel.className = 'mainPanelOutAnima';
    });

    mainPanel.addEventListener('webkitAnimationEnd',function(){    //左边栏回退动画结束后操作

      if(this.className == 'mainPanelOutAnima'){    //当前为不显示状态
        if(that.reduceWidth === 2){    //当前左右边都显示时
          let width1 =  parseInt(content.style.width);
          content.style.width = width1 + 260 + 'px';    //将画布容器扩大，因为画布的自适应导致画布与拖动条出现适配问题
        }
        that.reduceWidth -= 1;    //回退标记
        this.style.display = 'none';
        mainPanelcontent.innerHTML = '';    //清除模板内容
        if(that.stateType === 'video'){    //当前为视频状态时
          that.toolInitTo();    //工具初始化
        }
      }
      else{    //展开
        that.reduceWidth += 1;    //展开标记
        if(that.reduceWidth === 2){    //两个都展开的时候需要对画布容器进行缩小
          let width1 =  parseInt(content.style.width);
          content.style.width = width1 - 260 + 'px';
        }
      }
    });
    mainright.addEventListener('webkitAnimationEnd',function(){    //右边栏回退
      if(mainright.className == 'mainRightOutAnima'){    //缩小
        if(that.reduceWidth === 2){
          let width1 =  parseInt(content.style.width);
          content.style.width = width1 + 260 + 'px';
        }
        that.reduceWidth -= 1;
        mainright.style.display = 'none';    //将右边栏所有的容器隐藏
        headerlogo.style.display = 'none';
      }
      else{    //展开
        that.reduceWidth += 1;
        if(that.reduceWidth === 2){
          let width1 =  parseInt(content.style.width);
          content.style.width = width1 - 260 + 'px';
        }
      }
    });
  }

  canvasVideoBindInit(){
    const that = this, lastCoordinate = { x: 1, y: 1 };    //记录开始点

    on(this.canvasVideo, 'mousedown', function(e){
      if(!that.state)return;    //判断是否操作
      that.penstate = true;    //判定按下按钮
      if(that.toolCurrent !== "bucket"){    //在不为油漆桶状态时，保存当前画布的数据
        that.ImageData.push(that.canvasVideo.toDataURL('image/png', 1));    //记录canvas画布数据
      }
      switch(that.toolCurrent){
        case 'pen':{    //画笔是通过点击之后的点进行画圆，圆形的中点是两个点的中心
          lastCoordinate.x = e.layerX;    //保存按下的点
          lastCoordinate.y = e.layerY;
          images.drawLine.call(that, lastCoordinate.x, lastCoordinate.y, e.layerX, e.layerY);    //绘制
          break;
        }
        case 'pickup':{    //拾色器
          let RGB = images.extractPixels(that.canvasVideoCtx, e.layerX, e.layerY).colorHex().toLowerCase();    //通过点的位置获取当前点颜色
          _$('#ssq-color').value = RGB;    //将input的颜色改为选取的颜色
          that.colorAssignment(RGB);    //将颜色保存后设定到图层
          _$('#ssq-posX').value = e.layerX;    //显示获取到颜色的位置
          _$('#ssq-posY').value = e.layerY;
          break;
        }
        case 'bucket':{    //油漆桶
          let color = _$('#yqt-color').value;    //获取选择的颜色
          let intensity = _$('#yqt-power').value;    //获取力度
          let ImageDate = that.canvasVideoCtx.getImageData(0,0,that.width,that.height);
          that.ImageData.push(that.canvasVideo.toDataURL('image/png', 1));
          images.paintBucket(ImageDate, e.layerX, e.layerY, color, intensity);
          that.canvasVideoCtx.putImageData(ImageDate, 0, 0);
          break;
        }
        case 'eraser':{
          images.eliminate.call(that, e);    //橡皮擦函数，区域清空
          break;
        }
      }
      
    })
    let drawEndBind = ['mouseup','mouseleave'];
    drawEndBind.forEach(function(item){
      on(that.canvasVideo, item, function(e){
        that.penstate = false;    //鼠标松开
      })
    })
    on(this.canvasVideo, 'mousemove', function(e){
      if(!that.state || !that.penstate)return;    //当处于操作状态且鼠标按下时
      switch(that.toolCurrent){
        case 'pen':{    //画笔在移动的时候，通过计算初始点和结束点的距离，在路径上的每个点进行画圆
          let xfu = 1, yfu = 1;
          let xplot = e.layerX - lastCoordinate.x, yplot = e.layerY - lastCoordinate.y;    //差值
          if(xplot < 0){    //方向判断
            xfu = -1;
            xplot = -xplot;
          }
          if(yplot < 0){
            yfu = -1;
            yplot = -yplot;
          }
          let max1 = Math.max(xplot,yplot);
          for( let i = 1 ; i <= max1 ; i +=1 ){
            images.drawLine.call(that, lastCoordinate.x, lastCoordinate.y, 
              lastCoordinate.x + (xplot/max1)*xfu, lastCoordinate.y + (yplot/max1)*yfu);    //等比例进行绘制
            lastCoordinate.x += (xplot/max1)*xfu;
            lastCoordinate.y += (yplot/max1)*yfu;
          }
          [lastCoordinate.x,lastCoordinate.y] = [e.layerX,e.layerY];
          break;
        }
        case 'eraser':{
          images.eliminate.call(that, e);    //橡皮擦
          break;
        }
      }
    })
  }

  canvasDemoBindInit(){
    const that = this;
    const firstplot = { x :1, y :1 },   //图形起使点和结束点
          endplot = { x :1, y: 1},
          beginLine = { x : 1,y : 1},    //直线的起始点和结束点
          endLine = { x : 1,y : 1},
          beginmobile = { x :1, y: 1 },    //差值起使点和差值
          endmobile = { x :1, y: 1 },
          shearplot = { x1 :-1 , x2 : -1 , y1 : -1, y2 : -1  };
    let controlnode = true, operation = false, stay;   //判断当前状态,controlnode为判断当前为绘制状态还是操作状态，
    //operation记录当前按下的点是否在操作区域内
    that.textareaInputBind(endplot);  //绑定textarea事件

    on(_$('#content'),'dragover', function(e){
      e.preventDefault();
    })
    
    on(_$('#content'), 'drop', function(e){
      e.preventDefault();
      console.log(e.dataTransfer.getData('url'));
      console.log(e.dataTransfer.getData('offset'));
      console.log(e.layerX);
      that.initialImg.src = e.dataTransfer.getData('url');
      that.initialImg.onload = function(eve){
        that.canvasDemo.style.zIndex = 1003;
        console.log(this.height);
        console.log(this.width);
        [firstplot.x, firstplot.y, endplot.x, endplot.y] = 
          [];
        [that.imageRecord.w, that.imageRecord.h] = [this.width, this.height];
        that.canvasDemoCtx.clearRect(0,0,that.width,that.height);
        that.canvasDemoCtx.drawImage(that.initialImg,0,0,that.imageRecord.w,that.imageRecord.h,
          firstplot.x,firstplot.y,endplot.x - firstplot.x,endplot.y - firstplot.y);  
        
        images.dottedBox.call(that, firstplot.x, firstplot.y, endplot.x, endplot.y);    //虚线提示框
      }
    })

    on(this.canvasDemo, 'click', ()=>{
      if(this.toolCurrent === 'init'){    //整体初始化
        controlnode = true;
        [ firstplot.x, firstplot.y,endplot.x, endplot.y ] = [-1, -1, -1, -1];
        this.toolCurrent = '';
      }
    })

    on(_$('.intercept'), 'click', function(){   //截取绑定函数
      if(that.toolCurrent === 'shear'){
        that.canvasDemoCtx.clearRect(0,0,that.width,that.height);
        that.canvasVideoCtx.putImageData(that.againImageData, 0, 0);
        images.shear.call(that, firstplot, endplot, shearplot);    //将基础画布上的所需要区域的图像映射到操作画布上
        that.againImageData = '';
        that.canvasVideoCtx.clearRect(0,0,that.width, that.height);
        that.canvasVideoCtx.drawImage(that.canvasDemo,0,0);    //映射回去
        that.canvasDemoCtx.clearRect(0,0,that.width,that.height);
        that.ImageData.splice(0);    //之前的保存
        controlnode = !controlnode;    //转换状态
      }
    })
    on( this.canvasDemo, 'mousedown', function(e){
      if(!that.state)return;
      if(controlnode){
        beginLine.x = e.layerX;    //记录初始点
        beginLine.y = e.layerY;
        that.textDottedLine.beginLine = beginLine;    //文本坐标标记初始点
        that.textDottedLine.clinet = { x:e.layerX,y:e.layerY };
        that.penstate = true;    //按下鼠标的标记
      }
      else{
        if(that.toolCurrent === 'line'){    //划线状态特殊判断
          stay = images.spotLineDistance(beginLine, endLine, { x:e.layerX, y:e.layerY });
        }
        else{    //判断矩形框四边
          stay = images.boundary(that.canvasDemo, e, firstplot, endplot);
          if((that.toolCurrent === 'bulletChat'||that.toolCurrent === 'barrageText') && stay !== 'default'){
            stay = 'core';
            that.canvasDemo.style.cursor = 'move';
          }
        }
        if(stay != "default"){    //当前在范围内时
          beginmobile.x = e.layerX;    //保存初始移动的点
          beginmobile.y = e.layerY;
          operation = true;    //标记判断
          that.textarea.blur();    //取消焦点
        }
        else{
          clearInterval(that.timeto);    //关闭时间间隔
          that.ImageData.push(that.canvasVideo.toDataURL('image/png', 1));    //记录canvas画布数据
          that.canvasDemoCtx.clearRect(0,0,that.width,that.height);    //清除虚拟画布
          if(that.toolCurrent === 'image'){
            that.canvasVideoCtx.drawImage(that.initialImg,0,0,that.imageRecord.w,that.imageRecord.h,
              firstplot.x,firstplot.y,endplot.x - firstplot.x,endplot.y - firstplot.y);     //将图片按照移动好的位置进行映射
            that.toolCurrent = '';    //清除当前状态
            that.state = false;
            that.canvasDemo.style.zIndex = -1;    //将操作画布下放
            controlnode = true;
          }
          else if(that.toolCurrent === 'text'){
            images.textTool.call(that,that.textDottedLine, that.canvasVideoCtx, that.textValue, 0);    //绘制文字
            that.textValue = "";    //初始化
            that.textarea.value = "";
          }
          else if(that.toolCurrent === 'bulletChat'){    //弹幕保存
            const barrage = that.barrageData.pop();
            let currentTime = that.backstageVideo.currentTime;
            let barrSpeed = that.barrageSpeed;
            if(that.barrageType === '顺轴滚动弹幕'){
              barrSpeed = - barrSpeed;
            }
            Object.assign(barrage, {    //设定状态
              type:'bulletChat',
              plot:{
                x:that.videoBarragePlot.x + (barrSpeed * ( currentTime - barrage.begin )),
                y:that.videoBarragePlot.y
              },
              speed:barrSpeed
            })
            that.toolCurrent = '';
            that.state = false;
            that.barrageData.push(barrage);
            controlnode = true;
            videos.pictureLoad.call(that);   //刷新画布
          }
          else if(that.toolCurrent === 'barrageText'){
            const barrage = that.barrageData.pop();
            Object.assign(barrage, {    //设定状态
              type:'barrageText',
              plot:{
                x:that.videoBarragePlot.x,
                y:that.videoBarragePlot.y
              },
            })
            that.toolCurrent = '';
            that.state = false;
            that.barrageData.push(barrage);
            controlnode = true;
            videos.pictureLoad.call(that);   //刷新画布
          }
          else if(that.toolCurrent === 'shear'){    //剪切
            new Promise((resolve)=>{    //清除之前保存的状态
              that.canvasVideoCtx.putImageData(that.againImageData, 0, 0);
              that.againImageData = '';
              resolve();
            }).then(()=>{    //清除完成之后将操作画布映射上去
              images.shear.call(that, firstplot, endplot, shearplot);
              that.canvasVideoCtx.drawImage(that.canvasDemo,0,0);  
              that.canvasDemoCtx.clearRect(0,0,that.width,that.height);    //清除虚拟画布
            }) 
          } 
          else that.toolCurrentJudge(that.canvasVideoCtx, beginLine, endLine, firstplot, endplot);          
          //that.canvasDemoCtx.clearRect(0,0,that.width,that.height);    //清除虚拟画布
          that.directionIndex = 0;    //设定翻转和点初始化
          that.centralPoint = { x1:-1 , y1:-1 , x2:-1 , y2:-1 };
        }
      }
    })
    on( this.canvasDemo, 'mouseup', function(e){

      if(!that.state)return;
      if(that.penstate){
        endLine.x = e.layerX;
        endLine.y = e.layerY;
        if(that.toolCurrent === 'line'){
          images.lineBox.call(that, beginLine.x, beginLine.y, endLine.x , endLine.y); 
        }
        else{
          images.dottedBox.call(that, firstplot.x, firstplot.y, endplot.x, endplot.y); 
        }

        [firstplot.x,firstplot.y,endplot.x,endplot.y ] = [Math.min(beginLine.x,endLine.x), 
          Math.min(beginLine.y,endLine.y),Math.max(beginLine.x,endLine.x),Math.max(beginLine.y,endLine.y)];

        if(that.toolCurrent === "text"){    //保存文本框开始点和结束点并且修改textarea位置
          that.textOut(endLine, e);
        }
        if( that.toolCurrent === "shear" ){
          [shearplot.x1, shearplot.y1] = [ firstplot.x, firstplot.y ];
          [shearplot.x2, shearplot.y2] = [ endplot.x, endplot.y ];
          that.againImageData = that.canvasVideoCtx.getImageData(0,0,that.width, that.height );
          images.shear.call(that, firstplot, endplot, shearplot);
          [...that.jq] = [endplot.x - firstplot.x,endplot.y - firstplot.y,firstplot.x,firstplot.y]
          if(_$('#main-panel').style.display !== 'none' && _$('#main-panel-title').innerHTML === '剪切'){
            Array.from($('#jq-panel>div>input')).forEach((e,index)=>{
              e.value = that.jq[index];
            });
          }
        }
      }

      if(that.toolCurrent === 'line'){
        that.centralPoint = { x1:beginLine.x , y1:beginLine.y , x2:endLine.x , y2:endLine.y };
      }
      else{
        that.centralPoint = { x1:firstplot.x , y1:firstplot.y , x2:endplot.x , y2:endplot.y };
      }

      if(!operation){
        controlnode = !controlnode;
      }
      else{
        if(that.toolCurrent === 'text'){
          that.textarea.focus();    //获取焦点
        }
        if(that.toolCurrent !== 'isosceles' && that.toolCurrent !== 'rightTriangle'){
          [firstplot.x, firstplot.y, endplot.x, endplot.y] = [Math.min(firstplot.x,endplot.x), 
            Math.min(firstplot.y,endplot.y),Math.max(firstplot.x,endplot.x),Math.max(firstplot.y,endplot.y)];  
        }
      }
      that.penstate = false;
      operation = false;
    })
    on( this.canvasDemo, 'mousemove',function(e){

      if(!that.state)return;
      if(controlnode){
        if(that.toolCurrent === 'image'){    //图片处理特殊判断
          const node = images.contrast.call(that,that.imageRecord.w,that.imageRecord.h);
          const x = that.width/2-node.a/2, y = that.height/2-node.b/2;
          controlnode = false;
          [firstplot.x, firstplot.y, endplot.x, endplot.y] = 
            [ x, y, node.a + x, node.b + y];
        }
        if(that.toolCurrent === 'bulletChat'||that.toolCurrent === 'barrageText'){    //弹幕处理特殊判断
          controlnode = false;
          [ firstplot.x, firstplot.y,endplot.x, endplot.y ] = 
            [ that.textDottedLine.clinet.x, that.textDottedLine.clinet.y,
              that.textDottedLine.clinetTo.x, that.textDottedLine.clinetTo.y  ];
          
        }

        if(!that.penstate)return;
        endLine.x = e.layerX;
        endLine.y = e.layerY;
        if(that.toolCurrent !== 'line'){
          [firstplot.x,firstplot.y,endplot.x,endplot.y ] = [Math.min(beginLine.x,endLine.x), 
          Math.min(beginLine.y,endLine.y),Math.max(beginLine.x,endLine.x),Math.max(beginLine.y,endLine.y)];
        }
        that.toolCurrentJudge(that.canvasDemoCtx, beginLine, endLine, firstplot, endplot);
      }
      else{
        if(!operation && that.centralPoint.x1 !== -1 && that.rotateIF ){    //当图形翻转了之后修改其坐标
          that.rotateIF = true;
          [ beginLine.x, beginLine.y ] = [that.centralPoint.x1, that.centralPoint.y1];
          [ endLine.x, endLine.y ] = [that.centralPoint.x2, that.centralPoint.y2];
          [ firstplot.x, firstplot.y ] = [that.centralPoint.x1, that.centralPoint.y1];
          [ endplot.x, endplot.y ] = [that.centralPoint.x2, that.centralPoint.y2];
        }
        if(that.toolCurrent === 'line'){
          images.mousePointLine(e, beginLine, endLine, that.canvasDemo);
        }
        else{
          let d1 = images.boundary(that.canvasDemo, e, firstplot, endplot);
          if((that.toolCurrent === 'bulletChat'||that.toolCurrent === 'barrageText') && d1 !== 'default'){
            that.canvasDemo.style.cursor = 'move';
          }
        }
        if(operation){
          endmobile.x = e.layerX - beginmobile.x;
          endmobile.y = e.layerY - beginmobile.y;
          beginmobile.x = e.layerX;
          beginmobile.y = e.layerY;
          if(that.toolCurrent === 'line'){

            that.lineJudgment(stay,beginLine, endLine, endmobile);
            that.toolCurrentJudge(that.canvasDemoCtx, beginLine, endLine, firstplot, endplot);
            
            images.lineBox.call(that, beginLine.x, beginLine.y, endLine.x , endLine.y); 
          }
          else{
            if(that.toolCurrent !== 'bulletChat' && that.toolCurrent !== 'barrageText'){
              that.directionJudgment(stay, firstplot, endplot, endmobile );
            }
            else{
              if(stay === 'core'){
                firstplot.x += endmobile.x;
                firstplot.y += endmobile.y;
                endplot.x += endmobile.x;
                endplot.y += endmobile.y;

                that.videoBarragePlot.x += endmobile.x / that.proportion;
                that.videoBarragePlot.y += endmobile.y / that.proportion;
              }
            }

            that.centralPoint = { x1:firstplot.x , y1:firstplot.y , x2:endplot.x , y2:endplot.y };
            if(that.toolCurrent === 'text'){
              that.clinetTextChange(firstplot.x, firstplot.y, endplot.x, endplot.y, that.textValue)
            }
            else if(that.toolCurrent === 'bulletChat'||that.toolCurrent === 'barrageText'){
              that.canvasDemoCtx.clearRect(0,0,that.width,that.height);    //清除虚拟画布
              that.clinetChange();
            }
            else if(that.toolCurrent === 'shear'){
              that.canvasDemoCtx.clearRect(0,0,that.width,that.height);

              new Promise( (resolve, reject)=>{
                that.canvasVideoCtx.putImageData(that.againImageData, 0, 0);
                resolve();
              }).then((value)=>{
                images.shear.call(that, firstplot, endplot, shearplot);
              })

              images.dottedBox.call(that, firstplot.x, firstplot.y, endplot.x, endplot.y);    //虚线提示框
            }
            else if(that.toolCurrent === 'image'){
              that.canvasDemoCtx.clearRect(0,0,that.width,that.height);
              that.canvasDemoCtx.drawImage(that.initialImg,0,0,that.imageRecord.w,that.imageRecord.h,
                firstplot.x,firstplot.y,endplot.x - firstplot.x,endplot.y - firstplot.y);  
              
              images.dottedBox.call(that, firstplot.x, firstplot.y, endplot.x, endplot.y);    //虚线提示框
            }
            else{
              that.toolCurrentJudge(that.canvasDemoCtx, beginLine, endLine, firstplot, endplot);
              
              images.dottedBox.call(that, firstplot.x, firstplot.y, endplot.x, endplot.y);    //虚线提示框
            }
          }
        }
      }
    })
  }

  sidebarControl(template1, node, title,that){    //模板工具绑定
    const mainPaneltitle = _$('#main-panel-title');
    const mainPanelcontent = _$('#main-panel-content');
    const mainPanel = _$('#main-panel');
    const rotate = $('.rotate');
    mainPaneltitle.innerHTML = title;
    if( mainPanel.style.display === 'none' ){
      if(node && node.title !== this.title){
        node.className = '';
      }
      mainPanel.style.display = 'flex';
      mainPanel.className = 'mainPanelUpAnima';
      this.className = 'active';

      mainPanelcontent.appendChild(template1.content.cloneNode(true));

      xzgjBind();
    }
    else{
      mainPanelcontent.innerHTML = '';
      if(node.title == this.title){
        mainPanel.className = 'mainPanelOutAnima';
      }
      else{
        node.className = '';
        this.className = 'active';
        mainPanelcontent.appendChild(template1.content.cloneNode(true));
        xzgjBind();
      }
    }
    function xzgjBind(){
      that.canvasVideo.style.cursor = "default";
      if(title === '拾色器'){
        that.canvasVideo.style.cursor = "crosshair";
      }
      that.canvasDemo.style.zIndex = -1;
      if(title === '形状工具'){
        let stata = '';
        const xzgj1 = $('#xzgj-panel>div');
        _$('#xzgj-size').value = that.pensize;
        _$('#xzgj-color').value = that.strokeColor;
        const xzghStatus = _$('#xzghStatus>input[title='+that.imageStatus+']');
        xzghStatus.style.backgroundColor = 'rgb(53, 53, 53)';
        xzghStatus.style.color = 'white';
        on(_$('#xzgj-size'), 'change', function(){
          that.sizeAssignment(this.value);
          _$('#xzgjSize1').title = this.value;
        })
        on(_$('#xzgj-color'), 'change', function(){
          that.colorAssignment(this.value);
          _$('#xzgjSize1').title = this.value;
        })
        rotate.forEach((index)=>{
          index.className = 'rotate';
        })
        const xzghStatus1 = $('#xzghStatus>input');
        xzghStatus1.forEach((e, index)=>{
          on(e, 'click', function(){
            that.imageStatus = e.title;
            xzghStatus1[Math.abs(index - 1)].style.backgroundColor = '';
            xzghStatus1[Math.abs(index - 1)].style.color = '';
            e.style.backgroundColor = 'rgb(53, 53, 53)';
            e.style.color = 'white';
            switch(e.title){
              case 'stroke':{
                that.imageStatus = 'stroke';
                break;
              }
              case 'fill':{
                that.imageStatus = 'fill';
                break;
              }
            }  
          })
          
        })
        xzgj1.forEach(function(e,index){
          on(e,'click', function(){
            if(stata != this){
              if(stata)stata.style = '';
              this.style.backgroundColor = 'rgb(53, 53, 53)';
              this.style.color = 'white';
              stata = this;
              that.mainpanelState = index;
              that.canvasDemo.style.zIndex = 1001;
              switch(index){
                case 0:{    //直线
                  that.drawStraightLine('line');
                  break;
                }
                case 1:{
                  that.drawStraightLine('round');
                  break;
                }
                case 2:{
                  that.drawStraightLine('rectangle');
                  break;
                }
                case 3:{
                  that.drawStraightLine('rightTriangle');
                  break;
                }
                case 4:{
                  that.drawStraightLine('isosceles');
                  break;
                }
                case 5:{
                  that.drawStraightLine('diamond');
                  break;
                }
              }
            }
          })
        })
        if(xzgj1[that.mainpanelState]){
          xzgj1[that.mainpanelState].click();
        }
      }
      else{
        rotate.forEach((index)=>{
          index.className = 'nonec rotate';
        })
      }
      if(title === '图像属性'){
        that.imageTransformation();
      }
      if(title === '剪切'){
        Array.from($('#jq-panel>div>input')).forEach((e,index)=>{
          e.value = that.jq[index];
        });
        that.shear();
      }
      else{
        _$('.intercept').className = 'intercept nonec';
        that.jq = Array.from({length:4},x=>0);
      }
      if(title === '重置画板'){
        that.dialogBind(_$('#czhb-panel>div'), _$('#warning'));
      }
      if(title === '画笔'){
        that.paintBrush();
      }
      if(title === '拾色器'){
        that.colorPickup();
      }
      if(title === '油漆桶'){
        _$('#yqt-color').value = that.strokeColor;
        that.paintBucket();
      }
      if(title === '橡皮擦'){
        that.rubber();
      }
      if(title === '文本工具'){    
        that.textTool();
      }
    }
    node = this;
    return node;
  }
  dialogBind(index , event){
    on(index, 'click', ()=>{
      if(event.id === 'saveToGif' && (this.stateType === 'image' || this.videoIndex === 'video')){
        alert('当前无法保存');
        return;
      }
      this.dialog = event;
      this.dialog.showModal();
      if(event.id === 'saveToImage'){
        const canvasTemporarily = images.saveImagMapping.call(this);
        _$('input[id=save-w]').value = canvasTemporarily.width;
        _$('input[id=save-h]').value = canvasTemporarily.height;
        this.saveImageData = canvasTemporarily;
      }
      else if(event.id === 'saveToGif'){
        this.saveGifBind();
      }
    });
  }
  saveGifBind(){
    _$('#saveGIF-w').value = this.videoInitial.width;
    _$('#saveGIF-h').value = this.videoInitial.height;
  }
  paintBrush(){
    const that = this;
    this.toolCurrent = 'pen';
    this.state = true;
    _$('#hb-size').value = this.pensize111;
    _$('#hb-color').value = this.strokeColor;
    on(_$('#hb-size'),'change',function(){
      that.pensize111 = this.value;
    })
    on(_$('#hb-color'),'change',function(){
      that.colorAssignment(this.value);
    })
  }
  colorPickup(){
    this.state = true;
    this.toolCurrent = 'pickup';
    _$('#ssq-color').value = this.strokeColor;
  }
  paintBucket(){
    this.state = true;
    this.toolCurrent = 'bucket';
  }
  rubber(){
    const that = this;
    const xpcsize = _$('#xpc-size'),xpcpower = _$('#xpc-power');
    this.state = true;
    this.toolCurrent = 'eraser';
    xpcsize.value = this.eraserSize;
    xpcpower.value = this.eraserStrength;
    on(xpcsize, 'change', function(){
      that.eraserSize = this.value;
    })
    on(xpcpower, 'change', function(){
      that.eraserStrength = this.value;
    })
  }
  drawStraightLine(Current){
    this.state = true;
    this.toolCurrent = Current;
  }
  textTool(){
    const that = this;
    this.state = true;
    this.toolCurrent = 'text';
    that.canvasDemo.style.zIndex = 1001;

    _$('#wbgj-text-size').value = this.fontSize;
    _$('#wbgj-text-color').value = this.strokeColor;
    _$('#wbgj-font-family').value = this.fontFamily;
    _$('#wbgj-font-weight').value = this.fontWeight;
    _$('#wbgj-text-style').value = this.textStyle;

    on(_$('#wbgj-font-family'),'change', function(){
      that.fontFamily = this.value;
    })
    on(_$('#wbgj-font-weight'), 'change', function(){
      that.fontWeight = this.value;
    })
    on(_$('#wbgj-text-style'), 'change', function(){
      that.textStyle = this.value;
    })
    on(_$('#wbgj-text-size'),'change',function(){
      that.fontSize = this.value;
    })
    on(_$('#wbgj-text-color'),'change',function(){
      that.colorAssignment(this.value);
    })
  }
  imageTransformation(){
    const that = this;
    Array.from($('#txhb-panel>div>input')).forEach((e,index)=>{
      e.value = that.imageAttribute[index];
    })
  }
  shear(){
    const that = this;
    this.state = true;
    that.canvasDemo.style.zIndex = 1001;
    this.toolCurrent = 'shear';
    _$('.intercept').className = 'intercept';
  }
  toolInitTo(){    //工具初始化，取消工具选取使用
    if(this.node && _$('#main-panel').style.display === 'none'){
      this.state = false;    //操作结束
      this.node.className = '';    //当前选择的左侧边栏样式取消
      this.mainpanelState = '';
      this.canvasVideo.style.cursor = "default";
      this.jq = Array.from({length:4},x=>0);
      $('.rotate').forEach((index)=>{index.className = 'nonec rotate'});
      _$('.intercept').className = 'nonec intercept';
    }
  }

  lineJudgment(stay, beginLine, endLine, endmobile){
    switch(stay){
      case "core":{
        beginLine.x += endmobile.x;    //移动线段初始或者结束坐标
        beginLine.y += endmobile.y;
        endLine.x += endmobile.x;
        endLine.y += endmobile.y;
        break;
      }
      case "begin":
        beginLine.x += endmobile.x;
        beginLine.y += endmobile.y;
        break;
      case "end":
        endLine.x += endmobile.x;
        endLine.y += endmobile.y;
        break;
    }
  }
  directionJudgment(stay, firstplot, endplot, endmobile){
    switch(stay){
      case "core":
        firstplot.x += endmobile.x;
        firstplot.y += endmobile.y;
        endplot.x += endmobile.x;
        endplot.y += endmobile.y;
        break;
      case "top":
        if( Math.abs( firstplot.y + endmobile.y - endplot.y) <= 5  )return;
        firstplot.y += endmobile.y;
        break;
      case "lower":
        if( Math.abs( endplot.y + endmobile.y - firstplot.y) <= 5  )return;
        endplot.y += endmobile.y;
        break;
      case "right":
        if( Math.abs( endplot.x + endmobile.x - firstplot.x) <= 5  )return;
        endplot.x += endmobile.x;
        break;
      case "left":
        if( Math.abs( firstplot.x + endmobile.x - endplot.x) <= 5  )return;
        firstplot.x += endmobile.x;
        break;
    }
    switch(this.direction[this.directionIndex]){
        case "upper":{    //当图形正向时
          this.toTurnTo(stay, firstplot, endplot, endmobile );
          break;
        }
        case "right":{    //当图形右向时
          switch(stay){
            case "topleft":
              this.toTurnTo('topright', firstplot, endplot, endmobile );
              break;
            case "lowerleft":
              this.toTurnTo('lowerright', firstplot, endplot, endmobile );
              break;
            case "topright":
              this.toTurnTo('topleft', firstplot, endplot, endmobile );
              break;
            case "lowerright":
              this.toTurnTo('lowerleft', firstplot, endplot, endmobile );
              break;
          }
          break;  
        }
        case "lower":{    //当图形反向时
          switch(stay){
            case "topleft":
              this.toTurnTo('lowerright', firstplot, endplot, endmobile );
              break;
            case "lowerleft":
              this.toTurnTo('topright', firstplot, endplot, endmobile );
              break;
            case "topright":
              this.toTurnTo('lowerleft', firstplot, endplot, endmobile );
              break;
            case "lowerright":
              this.toTurnTo('topleft', firstplot, endplot, endmobile );
              break;
          }
          break;
        }
        case "left":{     //当图形右向时
          switch(stay){
            case "topleft":
              this.toTurnTo('lowerleft', firstplot, endplot, endmobile );
              break;
            case "lowerleft":
              this.toTurnTo('topleft', firstplot, endplot, endmobile );
              break;
            case "topright":
              this.toTurnTo('lowerright', firstplot, endplot, endmobile );
              break;
            case "lowerright":
              this.toTurnTo('topright', firstplot, endplot, endmobile );
              break;
          } 
          break;
        }
    }
  }
  toTurnTo(node, firstplot, endplot, endmobile){
    switch(node){
      case "topleft":
        if( Math.abs( firstplot.y + endmobile.y - endplot.y) <= 5  )return;
        if( Math.abs( firstplot.x + endmobile.x - endplot.x) <= 5  )return;
        firstplot.x += endmobile.x;
        firstplot.y += endmobile.y;
        break;
      case "lowerleft":
        if( Math.abs( endplot.y + endmobile.y - firstplot.y) <= 5  )return;
        if( Math.abs( firstplot.x + endmobile.x - endplot.x) <= 5  )return;
        firstplot.x += endmobile.x;
        endplot.y += endmobile.y;
        break;
      case "topright":
        if( Math.abs( firstplot.y + endmobile.y - endplot.y) <= 5  )return;
        if( Math.abs( endplot.x + endmobile.x - firstplot.x) <= 5  )return;
        endplot.x += endmobile.x;
        firstplot.y += endmobile.y;
        break;
      case "lowerright":
        if( Math.abs( endplot.y + endmobile.y - firstplot.y) <= 5  )return;
        if( Math.abs( endplot.x + endmobile.x - firstplot.x) <= 5  )return;
        endplot.x += endmobile.x;
        endplot.y += endmobile.y;
        break;
    }
  }

  toolCurrentJudge(canvas, beginLine, endLine, firstplot, endplot){
    this.canvasDemoCtx.clearRect(0,0,this.width,this.height);    //清除虚拟画布
    switch(this.toolCurrent){
      case "line":{
        images.drawDemoLine.call(this, canvas, beginLine, endLine);      //将直线数据记录在主canvas画布上
        break;
      }     
      case 'rectangle':{
        images.solidBox.call(this, canvas, firstplot.x, firstplot.y, endplot.x, endplot.y);    //矩形框
        break;
      }       
      case 'round':{
        let minbegin = {x:Math.min(firstplot.x,endplot.x),y:Math.min(firstplot.y,endplot.y)};
        let maxend = {x:Math.max(firstplot.x,endplot.x),y:Math.max(firstplot.y,endplot.y)};
        images.solidRound.call(this, canvas, minbegin, maxend);    //圆形
        break;
      }
      case 'rightTriangle':{
        images.solidTriangle.call(this, canvas, firstplot, endplot);    //直角三角形
        break;
      }
      case 'isosceles':{
        images.isoscelesTriangle.call(this, canvas, firstplot, endplot);    //等腰三角形
        break;
      }
      case 'diamond':{
        images.drawDiamond.call(this, canvas, firstplot, endplot);    //菱形
        break;
      }
      case 'text':{
        images.dottedBox.call(this, firstplot.x, firstplot.y, endplot.x, endplot.y);
        break;
      }
      case "shear":{
        images.dottedBox.call(this, firstplot.x, firstplot.y, endplot.x, endplot.y);     //虚线提示框
        break;  
      }
    }
  }
  textareaInputBind(endplot){
    const that = this;
    on(this.textarea, 'input', function(){
      clearInterval(that.timeto);
      if(that.textDottedLine.beginLine !== undefined){
        let dd = 0;
        const { clinet, clinetTo } = that.textDottedLine;
        that.textValue = this.value;
        that.timeto = setInterval(()=>{
          that.canvasDemoCtx.clearRect(0,0,that.width, that.height);
          const h = images.textTool.call(that,that.textDottedLine, that.canvasDemoCtx, this.value, dd);
          if(h > Math.abs(clinetTo.y - clinet.y)){
            clinetTo.y = clinet.y + h + 1;
            
            endplot.y = clinetTo.y;
          }
          dd ++;
          if(dd >= 20) dd -= 20;
          images.dottedBox.call(that, clinet.x, clinet.y, clinetTo.x, clinetTo.y);
        }, 40)
      }
    })
  }
  textOut(endLine, e){
    this.textDottedLine.endLine = endLine;
    let { x, y } = this.textDottedLine.clinet;
    this.textDottedLine.clinet = { x:Math.min(e.layerX, x), y:Math.min(e.layerY, y) };
    this.textDottedLine.clinetTo = { x:Math.max(e.layerX, x), y:Math.max(e.layerY, y) };
    this.textarea.style.marginLeft = this.textDottedLine.clinet.x + 'px';
    this.textarea.style.marginTop = this.textDottedLine.clinet.y + 'px';
    this.textarea.dispatchEvent(new Event('input', { bubbles: true }));    //触发input事件
    this.textarea.focus();    //获取焦点
  }

  rotate(index, tit){
    const that = this;
    on(index, 'click',function(){

      const middle = { x:(that.centralPoint.x1+that.centralPoint.x2)/2 , y:(that.centralPoint.y1+that.centralPoint.y2)/2 };    //中心点
      const x = (that.centralPoint.x2 - that.centralPoint.x1)/2, y = (that.centralPoint.y2 - that.centralPoint.y1)/2 ;    //距离
      if(that.centralPoint.x1 !== -1){
        switch(tit){
          case "顺时针旋转":    //顺时针90°
            that.directionIndex ++;
            console.log({x: middle.x + y , y: middle.y - x}, {x: middle.x - y , y: middle.y + x} )
            that.shapeFlip( {x: middle.x + y , y: middle.y - x}, {x: middle.x - y , y: middle.y + x} );
            break;
          case "逆时针旋转":    //逆时针90°
            that.directionIndex --;
            that.shapeFlip( {x: middle.x - y , y: middle.y + x}, {x: middle.x + y , y: middle.y - x} );
            break;
          case "旋转180°":    //180°
            that.directionIndex += 2;
            that.shapeFlip( {x: middle.x + x , y: middle.y + y}, {x: middle.x - x , y: middle.y - y} );
            break;
        }    
      }
      that.rotateIF = true;
    });
  }
  shapeFlip( beginLine, endLine ){
    if(this.directionIndex < 0)this.directionIndex += this.direction.length;
    if(this.directionIndex > 3)this.directionIndex -= this.direction.length;
    this.canvasDemoCtx.clearRect(0,0,this.width,this.height);    //清除画布
    const minbegin = {x:Math.min(beginLine.x,endLine.x),y:Math.min(beginLine.y,endLine.y)};
    const maxend = {x:Math.max(beginLine.x,endLine.x),y:Math.max(beginLine.y,endLine.y)};
    switch(this.toolCurrent){
      case "line":
        images.drawDemoLine.call(this, this.canvasDemoCtx, beginLine, endLine);    //重绘直线
        images.lineBox.call(this, beginLine.x, beginLine.y, endLine.x , endLine.y);    //直线框
        break
      case "rectangle":
        images.solidBox.call(this, this.canvasDemoCtx, beginLine.x, beginLine.y, endLine.x, endLine.y);    //矩形框
        break;
      case "round":
        images.solidRound.call(this, this.canvasDemoCtx, minbegin, maxend);    //圆形
        break;
      case "rightTriangle":
        images.solidTriangle.call(this, this.canvasDemoCtx, beginLine, endLine);    //直角三角形
        break;
      case "isosceles":
        images.isoscelesTriangle.call(this, this.canvasDemoCtx, beginLine, endLine);    //等腰三角形
        break;
      case "diamond":
        images.drawDiamond.call(this, this.canvasDemoCtx, minbegin, maxend);    //等腰三角形
        break;
      default:
        return;
    }
    if(this.toolCurrent !== "line"){
      images.dottedBox.call(this, beginLine.x, beginLine.y, endLine.x, endLine.y);    //虚线提示框
    }
    this.centralPoint = { x1:beginLine.x , y1:beginLine.y , x2:endLine.x , y2:endLine.y };    //改变坐标
  }

  clinetTextChange(x1, y1, x2, y2, value){
    this.textDottedLine.clinet.x = x1;    //替换点坐标，使得定时器内按照新坐标进行绘制
    this.textDottedLine.clinet.y = y1;
    this.textDottedLine.clinetTo.x = x2;
    this.textDottedLine.clinetTo.y = y2;
    this.canvasDemoCtx.clearRect(0,0,this.width,this.height);
    images.textTool.call(this, this.textDottedLine, this.canvasDemoCtx, value, 0);
    console.log(value);
  }

  clinetChange(){
    const node = images.contrast.call(this,this.videoInitial.width,this.videoInitial.height);
    const x1 = this.width/2 - node.a/2, y1 = this.height/2 - node.b/2;

    this.canvasSubtitleCtx.clearRect(0,0,this.videoInitial.width,this.videoInitial.height);
    this.canvasSubtitleCtx.save();
    this.canvasSubtitleCtx.font = this.fontWeight + ' ' + this.fontSize + 'px ' + this.fontFamily;
    
    this.canvasSubtitleCtx.fillText(this.barrageValue, this.videoBarragePlot.x,
      this.videoBarragePlot.y );
    this.canvasDemoCtx.drawImage(this.canvasSubtitle, 0, 0,
      this.videoInitial.width,this.videoInitial.height, x1, y1, node.a, node.b);
    
    this.textDottedLine.clinet.x = node.a /2 + x1;
    this.textDottedLine.clinet.y = node.b /2 + y1;
    this.textDottedLine.clinetTo.x = (this.canvasSubtitleCtx.measureText(this.barrageValue).width)
      * this.proportion + this.textDottedLine.clinet.x;
    this.textDottedLine.clinetTo.y = (parseInt(this.fontSize))*this.proportion + this.textDottedLine.clinet.y;

    this.canvasSubtitleCtx.restore();

  }

  colorAssignment(color){
    this.strokeColor = color;
    this.canvasVideoCtx.fillStyle = this.strokeColor;
    this.canvasDemoCtx.fillStyle = this.strokeColor;
    this.canvasVideoCtx.strokeStyle = this.strokeColor;
    this.canvasDemoCtx.strokeStyle = this.strokeColor;
  }
  sizeAssignment(size){
    this.pensize = size;
    this.canvasVideoCtx.lineWidth = this.pensize;
    this.canvasDemoCtx.lineWidth = this.pensize;
  }
  lineCapJoin(value){
    this.canvasVideoCtx.lineCap = value;   //设置线条末端样式。
    this.canvasDemoCtx.lineCap = value;   //设置线条末端样式。
    this.canvasVideoCtx.lineJoin = value;  //设定线条与线条间接合处的样式。
    this.canvasDemoCtx.lineJoin = value;  //设定线条与线条间接合处的样式。
  }
}

new Bind();