class Player {
  constructor(x, y, dir) {
    this.x = x;
    this.y = y;
    this.z = 0;
    this.zvel = 0;
    this.dir = dir;
    this.ydir = 0;
    this.speed = 1.5;
  }
  
  update(){
    inputs.shift ? this.speed = 2.6: this.speed = 1.3;
    
    if (inputs.jump && this.z === 0) this.zvel = 12;
    
    this.zvel -= 0.9;
    
    this.z += this.zvel;
    
    if (this.z < 0){
      this.z = 0;
      this.zvel = 0;
    }
    
    if (inputs.up) {
      this.x += Math.cos(this.dir) * this.speed;
      this.y += Math.sin(this.dir) * this.speed;
    }
    
    if (inputs.down) {
      this.x -= Math.cos(this.dir) * this.speed;
      this.y -= Math.sin(this.dir) * this.speed;
    }
    
    if (inputs.right) {
      this.x -= Math.sin(this.dir) * this.speed;
      this.y += Math.cos(this.dir) * this.speed;
    }
    
    if (inputs.left) {
      this.x += Math.sin(this.dir) * this.speed;
      this.y -= Math.cos(this.dir) * this.speed;
    }
    
    if (this.dir >= Math.PI * 2){
      this.dir -= Math.PI * 2;
    }
    
    if (this.dir < 0){
      this.dir += Math.PI * 2;
    }
    
    this.dir += inputs.deltaMouseX/120;
    this.ydir += inputs.deltaMouseY/300;
    
    if (this.ydir >  Math.PI/4) this.ydir =  Math.PI/4;
    if (this.ydir < -Math.PI/4) this.ydir = -Math.PI/4;
    
    this.draw();
    
  }
  
  draw(){
    let x = this.x;
    let y = this.y;
    
    let r = 5;
    
    ctx2d.fillStyle = "#00F";
    
    ctx2d.beginPath();
    ctx2d.arc(x, y, r, 0, 2 * Math.PI);
    ctx2d.fill();
    
    ctx2d.beginPath();
    ctx2d.strokeStyle = "#F00";
    ctx2d.moveTo(x, y);
    ctx2d.lineTo(x + Math.cos(this.dir) * 10, y + Math.sin(this.dir) * 10);
    ctx2d.stroke();
  }
  
  castRay(angle) {
    let x = this.x;
    let y = this.y;
    let dir = angle;
    
    if (dir > Math.PI*2) dir -= Math.PI*2;
    if (dir < 0) dir += Math.PI*2;
    
    let xdir = (dir < Math.PI/2 || dir > 3/2 * Math.PI) ? 1: -1;
    let ydir = (dir < Math.PI) ? 1: -1;
    
    let xm = 1-(this.x/16)%1;
    let ym = 1-(this.y/16)%1;
    
    if (xdir == -1) xm = (this.x/16)%1;
    if (ydir == -1) ym = (this.y/16)%1;
    
    let xDist = Infinity;
    let yDist = Infinity;
    
    let xTile = {
      x: 0,
      y: 0,
      id: 0,
    }
    
    let yTile = {
      x: 0,
      y: 0,
      id: 0,
    }
    
    for (let i = 0; i<30; i++){
      
      let xStep = 16 * xdir;
      let yStep = Math.abs(Math.tan(dir)) * 16 * ydir;
      
      let xIn = xStep * xm;
      let yIn = yStep * xm;
      
      if (yStep === undefined) break;
    
      let tileX = Math.floor((xStep*i + x + xIn)/16);
      let tileY = Math.floor((yStep*i + y + yIn)/16);
      
      xDist = Math.sqrt((xStep*i + xIn)**2 + (yStep * i + yIn)**2);
      
      if (xdir == -1) tileX--;
      
      if (map.getTile(tileX, tileY)){
        xTile = {
          x: (xStep*i + x + xIn),
          y: (yStep*i + y + yIn),
          id: map.getTile(tileX, tileY),
        };
        break;
      }
    }
    
    for (let i = 0; i<30; i++){
      
      let xStep = Math.abs(1/Math.tan(dir)) * 16 * xdir;
      let yStep = 16 * ydir;
      
      let xIn = xStep * ym;
      let yIn = yStep * ym;
      
      if (xStep === undefined) break;
    
      let tileX = Math.floor((xStep*i + x + xIn)/16);
      let tileY = Math.floor((yStep*i + y + yIn)/16);
      
      yDist = Math.sqrt((xStep * i + xIn)**2 + (yStep * i + yIn)**2);
      
      if (ydir == -1) tileY--;
      
      if (map.getTile(tileX, tileY)) {
        yTile = {
          x: (xStep*i + x + xIn),
          y: (yStep*i + y + yIn),
          id: map.getTile(tileX, tileY),
        };
        break;
      }
    }
    
    let output = {};
    
    let Dist = Infinity;
    
    if (xDist < yDist) {
      Dist = xDist;
      output.x = xTile.x;
      output.y = xTile.y;
      output.id = xTile.id;
      output.type = "x";
    }
    if (yDist < xDist) {
      Dist = yDist;
      output.x = yTile.x;
      output.y = yTile.y;
      output.id = yTile.id;
      output.type = "y";
    }
    
    output.dist = Dist;
    
    ctx2d.beginPath();
    ctx2d.strokeStyle = "#0F0";
    ctx2d.moveTo(x, y);
    ctx2d.lineTo(x + Math.cos(dir) * Dist, y + Math.sin(dir) * Dist);
    ctx2d.stroke();
    
    return output;
  }
}

class Map {
  constructor() {
    this.map = 
    [[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,4,4,4,4,4,4,4,4,4,4,4,4,4,2,4],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,0,4],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,4,4,0,4],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,4,0,4,0,4],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4],
    [1,0,0,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,0,4,4,4],
    [1,0,1,1,4,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,1,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,0,1,1,1,1,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,1],
    [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,1],
    [2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,3,3,3,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,3,0,0,2,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,1,1,1,1,1,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,1,1,1,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,1,1,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,2,0,0,0,0,0,0,0,1,1,1,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]];
  }
  
  draw() {
    ctx2d.fillStyle = "#000";
    
    for (var x = 0; x<this.map[0].length; x++) {
      for (var y = 0; y<this.map.length; y++) {
        if (this.map[y][x]) {
          
          let c = getColor(this.map[y][x]);
          
          ctx2d.fillStyle = rgb(c.r, c.g, c.b);
          
          
          
          ctx2d.fillRect(x*16, y*16, 16, 16);
        }
        
      }
    }
  }
  
  getTile(x, y){
    if (x < this.map[0].length && x >= 0 && y < this.map.length && y >= 0){
      
      return this.map[y][x];
    }
    
    return 0;
  }
}

class Scene3D {
  constructor() {
  }
  
  render(){
    let w = canvas3d.width;
    let h = canvas3d.height;
    
    ctx3d.fillStyle = "#ADF";
    ctx3d.fillRect(0, 0, w, h);
    ctx3d.fillStyle = "#7C1";
    ctx3d.fillRect(0, h/2  + Math.tan(player.ydir) * -h/1.5, w, h - Math.tan(player.ydir) * -h/2);
    
    for (let i = 0; i<w; i++){
      let fov = 2/2000;
      
      let angle = (-w/2 + i)*fov;
      
      let ray = player.castRay(player.dir + angle);
      
      ray.dist = ray.dist * Math.cos(angle);
      
      let height = 20*(h/ray.dist);
      
      let c = getColor(ray.id);
      

      
      if (height > 0){
        let d = 22-height/8;
        
        if (ray.type == "y") d-= 30;
        
        ctx3d.fillStyle = rgb(c.r + d,c.g + d,c.b + d);
        ctx3d.fillRect(i, h/2 - height/2 + player.z * height/160 + Math.tan(player.ydir) * -h/1.5, 1, height);
      }
    }
    
    ctx3d.drawImage(canvas2d, 20, 20, 100, 100);
    
    ctx3d.fillStyle="rgba(255, 255, 255, 0.8)"
    ctx3d.fillRect(w/2 - 6, h/2 - 1, 12, 2);
    ctx3d.fillRect(w/2 - 1, h/2 - 6, 2, 12);
  }
}

function getColor(id){
  switch (id){
    case 1:
      return {r: 255, g: 0, b: 0};
    case 2:
      return {r: 180, g: 180, b: 0};
    case 3:
      return {r: 40, g: 40, b: 40};
    case 4:
      return {r: 0, g: 0, b: 255};
      
  }
}

function rgb(r, g, b) {
  let rr = r;
  let gg = g;
  let bb = b;
  
  if (rr > 255) rr = 255;
  if (rr < 0)   rr = 0;
  if (gg > 255) gg = 255;
  if (gg < 0)   gg = 0;
  if (bb > 255) bb = 255;
  if (bb < 0)   bb = 0;
  
  return "rgb(" + rr + "," + gg + "," + bb + ")";
}

function main() {
  canvas2d = document.getElementById("2d");
  canvas3d = document.getElementById("3d");
  
  ctx2d = canvas2d.getContext("2d");
  ctx3d = canvas3d.getContext("2d");
  
  initInput();
  
  scene3d = new Scene3D();
  
  player = new Player(256, 256, 0);
  map = new Map();
  
  resize();
  window.addEventListener("resize", resize);
  
  document.addEventListener("click", function(){
    canvas3d.requestPointerLock = canvas3d.requestPointerLock ||
                                canvas3d.mozRequestPointerLock;
    canvas3d.requestPointerLock();
  })
  
  update();
  
  
}

function update(){
  ctx2d.clearRect(0, 0, canvas2d.width, canvas2d.height);
  ctx3d.clearRect(0, 0, canvas3d.width, canvas3d.height);
  
  map.draw();
  player.update();
  
  scene3d.render();
  
  inputs.deltaMouseX = 0;
  inputs.deltaMouseY = 0;
  
  requestAnimationFrame(update);
}

function resize(){
  canvas3d.height = window.innerHeight;
  canvas3d.width = window.innerWidth;
}
function initInput(){
  inputs = {
    up: false,
    down: false,
    left: false,
    right: false,
    shift: false,
    jump: false,
    deltaMouseX: 0,
    deltaMouseY: 0,
  };
  
  keybinds = {
    up: 87,
    down: 83,
    left: 65,
    right: 68,
    shift: 16,
    jump: 32,
  };
  
  document.addEventListener("keydown", function(e){
    if (e.keyCode == keybinds.up){
      inputs.up = true;
    }
    if (e.keyCode == keybinds.down){
      inputs.down = true;
    }
    if (e.keyCode == keybinds.left){
      inputs.left = true;
    }
    if (e.keyCode == keybinds.right){
      inputs.right = true;
    }
    if (e.keyCode == keybinds.shift){
      inputs.shift = true;
    }
    if (e.keyCode == keybinds.jump){
      inputs.jump = true;
    }
  });
  
  document.addEventListener("keyup", function(e){
    if (e.keyCode == keybinds.up){
      inputs.up = false;
    }
    if (e.keyCode == keybinds.down){
      inputs.down = false;
    }
    if (e.keyCode == keybinds.left){
      inputs.left = false;
    }
    if (e.keyCode == keybinds.right){
      inputs.right = false;
    }
    if (e.keyCode == keybinds.shift){
      inputs.shift = false;
    }
    if (e.keyCode == keybinds.jump){
      inputs.jump = false;
    }
  });
  
  document.addEventListener("mousemove", function(e){
      inputs.deltaMouseX += e.movementX;
      inputs.deltaMouseY += e.movementY;
    });
}
