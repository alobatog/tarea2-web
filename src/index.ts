import { interval, fromEvent, merge } from 'rxjs';
import { map, scan, withLatestFrom, filter } from 'rxjs/operators';
import { component, GameArea } from './canvas'

/* Functions */

const SPEED:number = 0.5
var coordinates = new Set();
var Area:any = new (GameArea as any);

const resetGame = function(player1:any, player2:any){
    Area.clear();
    coordinates.clear();
    player1.reset();
    player2.reset()
}

const addCoordinate = (x:number, y:number) => coordinates.add(x.toString() + y.toString())

const checkCollision = (x:number, y:number) => {
    var val = x.toString() + y.toString();
    if(coordinates.has(val)){ return true; }
    addCoordinate(x, y);
    return false;
}


const checkWalls = (x: number, y:number) => {
    return (x === Area.width || y === Area.height || x === 0 || y === 1) ? true : false;
}

const lost = (text:string, pointsP1:number, pointsP2:number) => {
    var msg = document.getElementById("game_msg")
    var score1 = document.getElementById("score1")
    var score2 = document.getElementById("score2")
    msg.textContent = text;
    score1.textContent = "Puntos Jugador 1: " + pointsP1.toString();
    score2.textContent = "Puntos Jugador 2: " + pointsP2.toString();
}

const newDirection = (actual:number, move:number) => {
    var direction = actual + move;
    switch (direction){
        case 5:
            return 1;
        case 0:
            return 4;
        default:
            return direction;
    }
}

/* RXJS */



const ticker$ = interval(20).pipe(
    map( () =>  ({
        time: Date.now(),
        delta: null
    })),
    scan((previous, current) => ({
        time: current.time,
        delta: (current.time - previous.time)
    }))
)

const input$ = merge(
    fromEvent(document, 'keydown').pipe(
        map( (event:any) => {
            switch (event.key){
                case 'ArrowLeft':
                    return -1
                case 'ArrowRight':
                    return 1
                case 'd':
                    return 2
                case 'a':
                    return -2
                default:
                    return 0
            } 
        })
    ),
    fromEvent(document, 'keyup').pipe(map(() => 0))
)

var keep:boolean = true;
var player1:any;
var player2:any;

player1 = new (component as any)(5, 5, "red", 10, 120, 2);
player1.draw();

player2 = new (component as any)(5, 5, "blue", 470, 120, 4);
player2.draw();


const paddleObserver = {
    next: function(x:any){
        if(!keep){return}
        /* Dibujo a los dos jugadores */
        player1.draw();
        player2.draw();

        /* Compruebo el tiempo de los inputs */
        if (x.input === 1 || x.input === -1){
            x.input = x.ticks1 > 20 ? x.input : 0;
            player1.direction = newDirection(player1.direction, x.input);
        }

        if (x.input === 2 || x.input === -2){
            x.input = x.ticks2 > 20 ? x.input : 0;
            player2.direction = newDirection(player2.direction, x.input/2);
        }

        /* Muevo los jugadores (QUE ALGUIEN HAGA MAS BONITO ESTO)*/
        if(player1.direction===3){ player1.y += SPEED }
        if(player1.direction===2){ player1.x += SPEED }
        if(player1.direction===4){ player1.x -= SPEED }
        if(player1.direction===1){ player1.y -= SPEED }

        if(player2.direction===3){ player2.y += SPEED }
        if(player2.direction===2){ player2.x += SPEED }
        if(player2.direction===4){ player2.x -= SPEED }
        if(player2.direction===1){ player2.y -= SPEED }

        /* Chekeo colisiones */
        var p1Collision = checkCollision(player1.x, player1.y); //contra jugadores
        var p1WallCollision = checkWalls(player1.x, player1.y);  // contra paredes
        if(p1Collision || p1WallCollision){ 
            player2.points += 1
            lost('Jugador 2 gana c:', player1.points, player2.points)
            resetGame(player1, player2); 
            paddleSubscription.unsubscribe();
            paddleSubscription = paddle$.subscribe(paddleObserver);
        }

        var p2Collision = checkCollision(player2.x, player2.y); //contra jugadores
        var p2WallCollision = checkWalls(player2.x, player2.y);  // contra paredes
        if(p2Collision || p2WallCollision){ 
            player1.points += 1
            lost('Jugador 1 gana c:', player1.points, player2.points)
            resetGame(player1, player2);   
            paddleSubscription.unsubscribe();
            paddleSubscription = paddle$.subscribe(paddleObserver);
        }
    },
    error: function(err:any){
        console.error(err);
    },
    complete: function(){
    }
}

const paddle$ = interval(10).pipe(
    withLatestFrom(input$),
    map( (x:any) => ({
        ticks1: 1,
        ticks2: 1,
        input: x[1]
    })),
    scan((previous, current) => ({
        ticks1: (previous.input === 1 || previous.input === -1) ? 0 : previous.ticks1 + 1,
        ticks2: (previous.input === 2 || previous.input === -2) ? 0 : previous.ticks2 + 1,
        input: current.input
    }))
)

var paddleSubscription = paddle$.subscribe(paddleObserver)

const pause$ = fromEvent(document, "keypress").pipe(
    filter((event:any) => event.key == "p")
).subscribe(
    (x:any) => {
        keep = !keep;
    }
)
