const canvas: any = document.getElementById("stage")
const context: CanvasRenderingContext2D = canvas.getContext("2d")

export function GameArea(): void {
    this.canvas = canvas
    this.context = context
    this.context.fillStyle = 'blue'
    this.width = this.canvas.width
    this.height = this.canvas.height
    this.clear = function() {
        this.context.clearRect(0, 0, this.width, this.height)
    }
}

export function component(width: any, height: any, color: any, x: any, y: any, dir: number): void {
    this.width = width
    this.height = height
    this.direction = dir
    this.x = x
    this.y = y
    this.points = 0
    this.draw = function() {
        context.fillStyle = color
        context.fillRect(this.x, this.y, this.width, this.height)
    }
    this.reset = function() {
        this.x = x
        this.y = y
        this.direction = dir
        this.draw()
    }
}
