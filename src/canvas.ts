
export const canvas:any = document.getElementById("stage");
const context = canvas.getContext("2d");
context.fillStyle = 'blue';



export function component(width:any, height:any, color:any, x:any, y:any, dir: number) {
    this.width = width;
    this.height = height;
    this.direction = dir;
    this.x = x;
    this.y = y;   
    this.draw = function(){
        context.fillStyle = color;
        context.fillRect(this.x, this.y, this.width, this.height);
      }
}

