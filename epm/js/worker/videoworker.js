
self.addEventListener('message',function(e){
  const data = e.data;
  console.log(data);
  switch(data.type){
    case 'video':{
      videoFrameSave(data);
      break;
    }
  }
})

function videoFrameSave(data){
  console.log(self);
  self.document.createElement('canvas');
  const canvasCtx = data.canvas.getContext('2d');
  const beginTime = data.videoTimedate.begin;
  const endTime = data.videoTimedate.end;

  data.canvas.width = data.videoInitial.width;
  data.canvas.height = data.videoInitial.height;

  data.video.src = data.videoSRC;
  data.video.addEventListener('loadedmetadata', ()=>{
    for(let i = beginTime ; i <= endTime ; i += 1/data.fps ){
      console.log(i);
    }
  })
}

