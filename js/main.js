class Player {
  constructor(x, y, dir) {
    this.x = x;
    this.xvel = 0;
    this.y = y;
    this.yvel = 0;
    this.z = 0;
    this.zvel = 0;
    this.dir = dir;
    this.ydir = 0;
    this.speed = 1.6;
    this.friction = 1;
    
    this.width = 6;
    this.height = 6;
    
    this.xMaxSpeed = 0;
    this.yMaxSpeed = 0;
    
    this.facing = {};
    
    // Camera x and y.
    this.cx = x;
    this.cy = y;
  }
  
  update(){
    inputs.shift ? this.speed = 2.1: this.speed = 1.2;
    
    if (inputs.jump && this.z === 0) this.zvel = 0.81;
    
    this.friction = 0.94;
    if (this.z > 0) this.friction = 0.21;
    
    this.xMaxSpeed = Math.abs(Math.cos(this.dir) * 2);
    this.yMaxSpeed = Math.abs(Math.sin(this.dir) * 2);
    
    this.zvel -= 0.1;
    
    if (inputs.up) {
      this.xvel += Math.cos(this.dir) * this.speed;
      this.yvel += Math.sin(this.dir) * this.speed;
    }
    
    if (inputs.down) {
      this.xvel -= Math.cos(this.dir) * this.speed;
      this.yvel -= Math.sin(this.dir) * this.speed;
    }
    
    if (inputs.right) {
      this.xvel -= Math.sin(this.dir) * this.speed;
      this.yvel += Math.cos(this.dir) * this.speed;
    }
    
    if (inputs.left) {
      this.xvel += Math.sin(this.dir) * this.speed;
      this.yvel -= Math.cos(this.dir) * this.speed;
    }
    
    if (this.dir >= Math.PI * 2){
      this.dir -= Math.PI * 2;
    }
    
    if (this.dir < 0){
      this.dir += Math.PI * 2;
    }
    
    this.x += this.xvel;
    if (this.colliding()){
      let step = 0.01 * this.xvel;
      this.xvel = 0;
      while (this.colliding()){
        this.x -= step;
      }

    }
    
    this.y += this.yvel;
    if (this.colliding()){
      let step = 0.01 * this.yvel;
      this.yvel = 0;
      while (this.colliding()){
        this.y -= step;
      }
    }
    
    if (this.xvel > 0) {
      this.xvel -= this.friction * this.xMaxSpeed/4;
      
      if (this.xvel < 0) this.xvel = 0;
    }
    if (this.xvel < 0) {
      this.xvel += this.friction * this.xMaxSpeed/4;
      
      if (this.xvel > 0) this.xvel = 0;
    }
    if (this.yvel > 0) {
      this.yvel -= this.friction * this.yMaxSpeed/4;
      
      if (this.yvel < 0) this.yvel = 0;
    }
    if (this.yvel < 0) {
      this.yvel += this.friction * this.yMaxSpeed/4;
      
      if (this.yvel > 0) this.yvel = 0;
    }
    
    if (Math.abs(this.xvel) > this.xMaxSpeed) {
      this.xvel = this.xMaxSpeed * this.xvel/Math.abs(this.xvel);
    }
    
    if (Math.abs(this.yvel) > this.yMaxSpeed) {
      this.yvel = this.yMaxSpeed * this.yvel/Math.abs(this.yvel);
    }
    
    this.z += this.zvel;
    
    if (this.z < 0){
      this.z = 0;
      this.zvel = 0;
    }
    
    this.dir += inputs.deltaMouseX/160;
    this.ydir += inputs.deltaMouseY/300;
    
    if (this.ydir >  Math.PI/4) this.ydir =  Math.PI/4;
    if (this.ydir < -Math.PI/4) this.ydir = -Math.PI/4;
    
    this.cx = this.x - Math.cos(this.dir) * 2;
    this.cy = this.y - Math.sin(this.dir) * 2;
    
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
  
  colliding() {
    let x1 = this.x - this.width/2;
    let x2 = x1 + this.width;
    let y1 = this.y - this.height/2;
    let y2 = y1 + this.height;
    
    
          
    for (let x = 0; x<map.x; x++){
      for (let y = 0; y<map.y; y++){
        if (map.getTile(x,y)){
          let a1 = x * 16;
          let a2 = a1 + 16;
          let b1 = y * 16;
          let b2 = b1 + 16;
          
          if (x1 < a2 && x2 > a1 && y1 < b2 && y2 > b1){
            return true;
          }
        }
      }
    }
    
    return false;
    
  }
  
  castRay(x, y, angle) {
    let dir = angle;
    
    if (dir > Math.PI*2) dir -= Math.PI*2;
    if (dir < 0) dir += Math.PI*2;
    
    let xdir = (dir < Math.PI/2 || dir > 3/2 * Math.PI) ? 1: -1;
    let ydir = (dir < Math.PI) ? 1: -1;
    
    let xm = 1-(x/16)%1;
    let ym = 1-(y/16)%1;
    
    if (xdir == -1) xm = (x/16)%1;
    if (ydir == -1) ym = (y/16)%1;
    
    let xDist = Infinity;
    let yDist = Infinity;
    
    let xTile = {
      x: 0,
      y: 0,
      id: 0,
    };
    
    let yTile = {
      x: 0,
      y: 0,
      id: 0,
    };
    
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
    [[0,0,0,0,0,0,0,11,11,11,11,11,11,11,11,11,11,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,],[0,0,0,0,0,0,0,11,3,0,0,0,0,0,0,0,11,11,11,11,11,11,0,0,0,0,0,0,0,0,0,0,],[11,11,11,11,11,11,11,11,0,0,0,0,0,0,0,0,11,0,0,0,0,11,0,0,0,0,0,0,0,0,0,0,],[11,3,0,0,0,0,0,11,0,0,0,0,0,0,0,0,0,0,0,0,0,11,0,11,11,11,11,11,11,0,0,0,],[11,0,0,0,0,0,0,11,0,0,0,11,11,11,11,0,11,11,11,11,0,11,0,11,0,0,0,0,11,11,11,0,],[11,0,0,0,0,0,0,11,0,0,0,11,3,3,3,0,0,0,8,11,0,11,0,11,0,0,0,0,0,0,11,0,],[11,0,0,0,0,0,0,11,11,0,11,11,1,0,0,0,0,0,8,11,0,11,11,11,11,11,0,0,0,0,11,0,],[11,0,0,0,0,0,0,0,0,0,0,11,1,0,0,0,0,0,8,11,0,1,1,1,1,1,0,0,0,0,11,0,],[11,11,3,3,3,3,3,11,0,0,0,11,1,0,0,0,0,0,11,11,0,0,0,0,0,0,0,0,0,0,11,0,],[0,11,11,11,11,11,11,11,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,10,11,0,],[0,0,11,0,0,0,0,0,0,0,0,11,0,0,0,0,0,0,11,11,0,11,11,11,11,11,11,0,0,10,11,0,],[0,0,11,0,0,0,0,0,0,0,0,11,11,11,11,11,11,11,11,11,0,0,0,0,0,0,0,0,0,10,11,0,],[0,0,11,0,0,0,0,0,0,0,0,0,1,11,0,0,0,0,0,0,0,0,0,0,0,0,11,0,0,10,11,0,],[0,0,11,0,0,0,11,0,11,11,11,11,11,11,0,0,0,0,11,11,0,0,0,0,0,0,11,0,0,10,11,0,],[0,0,11,0,0,0,11,0,0,0,0,0,1,11,0,0,0,0,8,11,0,0,0,0,0,6,11,0,0,10,11,0,],[0,0,11,4,4,4,11,0,0,0,0,0,0,11,0,0,0,0,8,11,0,0,0,0,0,6,11,0,0,10,11,0,],[0,0,11,11,11,11,11,0,0,0,0,0,0,11,11,11,11,11,11,11,0,0,0,0,6,11,11,0,0,5,11,0,],[0,0,0,11,0,0,0,0,0,0,0,0,0,0,1,11,0,11,0,11,0,0,0,0,11,11,0,0,0,5,11,0,],[0,0,0,11,0,0,0,0,0,0,0,0,0,0,0,11,0,11,0,11,11,11,11,11,11,0,0,0,0,5,11,0,],[0,0,0,11,0,0,0,0,0,0,0,0,11,11,11,11,0,11,11,11,11,11,0,0,0,0,0,0,0,5,11,0,],[0,0,0,11,11,11,0,0,0,0,0,0,11,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,5,11,0,],[0,0,0,0,11,0,0,0,0,0,0,0,11,11,11,0,0,0,0,0,0,11,0,0,0,0,0,0,0,11,0,0,],[0,0,0,0,11,0,0,0,0,0,0,7,7,7,11,0,0,0,0,0,0,11,0,0,0,0,0,0,11,0,0,0,],[7,7,7,7,7,7,7,0,7,7,7,7,9,7,11,0,0,0,0,0,0,11,11,11,11,11,11,11,0,0,0,0,],[7,0,0,0,0,0,0,0,7,0,0,7,0,7,11,0,0,0,0,0,0,11,0,0,0,0,0,0,0,0,0,0,],[7,0,7,7,7,0,7,0,7,0,0,7,0,7,11,0,0,0,0,0,11,11,0,0,0,0,0,0,0,0,0,0,],[7,0,7,0,0,0,7,7,7,7,0,7,0,7,11,11,11,11,11,11,11,0,0,0,0,0,0,0,0,0,0,0,],[7,0,7,7,7,7,7,0,0,0,0,7,0,7,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,],[7,0,7,0,0,0,7,0,7,7,0,7,0,7,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,],[7,0,7,0,7,7,7,0,7,0,0,7,0,7,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,],[7,0,0,0,0,0,0,0,7,0,7,7,0,7,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,],[7,7,7,7,7,7,7,7,7,0,0,0,0,7,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,],];
    this.x = this.map[0].length;
    this.y = this.map.length;
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
    
    let yAngle = Math.tan(player.ydir) * -h/1.3;
    
    let fov = 2.31/2000;
    
    let q = 5; //Quality
    
    let sky = ctx3d.createLinearGradient(0, 0, 0, Math.floor(h + Math.tan(player.ydir) * -h/1.3));
    sky.addColorStop(0, "#36bfff");
    sky.addColorStop(1, "#d619f7");

    let grass = ctx3d.createLinearGradient(0, 0, 0, Math.floor(h + Math.tan(player.ydir) * -h/1.3));
    grass.addColorStop(0, "#33d62b");
    grass.addColorStop(1, "#97ed40");
    
    ctx3d.fillStyle = sky;
    ctx3d.fillRect(0, 0, w, h);
    ctx3d.fillStyle = grass;
    ctx3d.fillRect(0, h/2  + Math.tan(player.ydir) * -h/1.3, w, h - Math.tan(player.ydir) * -h/1.3);
    
    ctx3d.fillStyle = "#FFFF00";
    
    this.castFloor();
    
    
    
    for (let i = 0; i<w; i+=q){
      
      let angle = (-w/2 + i)*fov;
      
      let ray = player.castRay(player.cx, player.cy, player.dir + angle);
      
      ray.dist = ray.dist * Math.cos(angle);
      
      let height = 16*(h/ray.dist);
      
      let c = getColor(ray.id);
      
      if (i+q > Math.floor(w/2) && i < Math.floor(w/2)) player.facing = ray;

      
      if (ray.id !== 0){
        let d = 0;
      
        let isTexture = hasTexture(ray.id);
      
        if (ray.type == "x" && isTexture) var htex = Math.floor(ray.y*2 % 32);
        if (ray.type == "y" && isTexture) var htex = Math.floor(ray.x*2 % 32);
        
        
        
        
        if (ray.type == "y") d = -40;
        
        if (!isTexture) ctx3d.fillStyle = rgb(c.r + d,c.g + d,c.b + d);
        
        
        
        
        let x = i;
        let y = h/2 - height/2 + ((player.z + 1)* height/10) + yAngle;
        let wi = q;
        let he = height;
        
        if (isTexture) {
          for (let j = 0; j<32; j++){
            ctx3d.fillStyle = getPixel(htex, j, d);
            ctx3d.fillRect(x, Math.floor(y + j * he/32), wi, Math.ceil(he/32));
          }
        }
        
        else {
          ctx3d.fillRect(x, y, wi, he);
        }
      }
    }
    
    ctx3d.drawImage(canvas2d, w-120, 20, 100, 100);
    //ctx3d.drawImage(gun, w-600, h-400);
    
    ctx3d.fillStyle="rgba(255, 255, 255, 0.8)";
    ctx3d.fillRect(w/2 - 6, h/2 - 1, 12, 2);
    ctx3d.fillRect(w/2 - 1, h/2 - 6, 2, 12);
    
    ctx3d.drawImage(filter, 0, 0);
    
  }
  
  castFloor(){
    let w = canvas3d.width;
    let h = canvas3d.height;
    
    for (let y = 0; y < h; y++){
      let offset = (w/2)*2.3/2000;
      
      let rayDirX0 = player.dir - offset;
      //let = dirY - planeY;
      let rayDirX1 = player.dir + offset;
      //let = dirY + planeY;
      
      let p = y - h / 2;
      
      let posZ = 0 + player.z;
      
      let rowDistance = posZ / p;
      
      let floorStepX = rowDistance * (rayDirX1 - rayDirX0) / w;
      let floorStepY = rowDistance * (1 - 1) / 1;


    }
    
  }
}

function hasTexture(id){
  if (id == 11) return true;
  
  return false;
}

function getColor(id){
      switch (id){
        case 1:
          return {r: 255, g: 0, b: 0};
        case 2:
          return {r: 0, g: 255, b: 0};
        case 3:
          return {r: 0, g: 0, b: 255};
        case 4:
          return {r: 255, g: 255, b: 0};
        case 5:
          return {r: 255, g: 140, b: 0};
        case 6:
          return {r: 255, g: 20, b: 147};
        case 7:
          return {r: 255, g: 215, b: 0};
        case 8:
          return {r: 240, g: 230, b: 140};
        case 9:
          return {r: 128, g: 128, b: 0};
        case 10:
          return {r: 102, g: 205, b: 170};
        case 11:
          return {r: 210, g: 105, b: 30};
        case 12:
          return {r: 255, g: 255, b: 255};
        case 13:
          return {r: 0, g: 0, b: 0};
        default:
          return {r:0 , g: 0, b: 0};
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
  
  filter = document.getElementById("filter");
  ctxf = filter.getContext("2d");
  
  gun = document.getElementById("gun");
  
  initInput();
  
  scene3d = new Scene3D();
  
  player = new Player(256, 220, 0);
  map = new Map();
  
  framecount = 0;
  
  blocks = document.getElementById("blocks");
  block = document.getElementById("block");
  bctx = block.getContext("2d");

  bctx.drawImage(blocks, 0, 0);
  
  data = bctx.getImageData(0, 0, 32, 32).data;
  
  
  
  resize();
  window.addEventListener("resize", resize);
  
  document.addEventListener("click", function(){
    canvas3d.requestPointerLock = canvas3d.requestPointerLock ||
                                canvas3d.mozRequestPointerLock;
    canvas3d.requestPointerLock();
  });
  
  update();
  
  
}

function update(){
  window.scrollTo(0,0);
  ctx2d.clearRect(0, 0, canvas2d.width, canvas2d.height);
  ctx3d.clearRect(0, 0, canvas3d.width, canvas3d.height);
  
  map.draw();
  player.update();
  
  framecount++;
  
  
  
  scene3d.render();
  
  inputs.deltaMouseX = 0;
  inputs.deltaMouseY = 0;
  
  debug();
  
  requestAnimationFrame(update);
}

function getPixel(x,y,m){
  pixel = (x + y * 32);
  
  let output = [];
  
  for (let i = 0; i<4; i++){
    output[i] = data[pixel*4 + i];
  }
  
  let out = rgb(output[0] + m, output[1] + m, output[2] + m);
  
  return out;
}

function resize(){
  canvas3d.height = window.innerHeight;
  canvas3d.width = window.innerWidth;
  
  filter.height = window.innerHeight;
  filter.width = window.innerWidth;
  
  for (let i=0; i<filter.height/3; i++){
    ctxf.fillStyle = "rgba(0,0,0,0.4)";
    //ctxf.fillRect(0, i*3, filter.width, 2);
  }
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

function debug(){
  write("jimboraycaster v0.3.0-alpha", 6, 13, 13);
  write("x: " + player.x, 6, 26, 13);
  write("y: " + player.y, 6, 39, 13);
  write("z: " + player.z, 6, 52, 13);
  
  write("direction: " + (player.dir * (180 / Math.PI)).toFixed(2) + "°", 6, 78, 13);
  
  write("facing: {", 6, 104, 13 )
  write("x:" + (player.facing.x), 20, 117, 13)
  write("y:" + (player.facing.y), 20, 130, 13)
  write("id:" + (player.facing.id), 20, 143, 13)
  write("type:" + (player.facing.type), 20, 156, 13)
  write("}", 6, 169, 13)
  
  write("colliding: " + (player.colliding()), 6, 182, 13 )
}

function write(text, x, y, size){
  ctx3d.font = size + "px Work Sans"
  
  // Shadow
  ctx3d.fillStyle = "rgba(0, 0, 0, 0.5)";
  ctx3d.fillText(text, x+1, y+1);
  
  // Text
  ctx3d.fillStyle = "rgb(255, 255, 255)";
  ctx3d.fillText(text, x, y);
}
