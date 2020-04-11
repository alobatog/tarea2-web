import { interval, fromEvent, merge, Observable, Subscription } from 'rxjs'
import { map, scan, withLatestFrom, filter } from 'rxjs/operators'
import { component, GameArea } from './canvas'

/* CONSTANTS/GAME_PARAMETERS */

const SPEED: number = 0.5
const player1: any = new (component as any)(5, 5, "red", 10, 120, 2)
const player2: any = new (component as any)(5, 5, "blue", 470, 120, 4)
const players: Array<any> = new Array()
let coordinates: Set<any> = new Set()
let Area: any = new (GameArea as any)
let keep: boolean = true

/* Aux Functions */

const resetGame = function(): void {
    Area.clear()
    coordinates.clear()
    players.forEach((player) => {
        player.reset()
    })
    paddleSubscription.unsubscribe()
    paddleSubscription = paddle$.subscribe(paddleObserver)
}

const addCoordinate = (x: number, y: number): void => {
    coordinates.add(`${x.toString()},${y.toString()}`)
}

const checkCollision = (x: number, y: number): boolean => {
    const val: string = `${x.toString()},${y.toString()}`
    if (coordinates.has(val)) { return true }
    return false
}

const checkWalls = (x: number, y: number): boolean =>
    (x === Area.width || y === Area.height || x === 0 || y === 1)

const lost = (text: string, pointsP1: number, pointsP2: number): void => {
    document.getElementById("game_msg").textContent = text
    document.getElementById("score1").textContent = pointsP1.toString()
    document.getElementById("score2").textContent = pointsP2.toString()
}

const newDirection = (actual: number, move: number): number => {
    const direction = actual + move
    switch (direction) {
        case 5:
            return 1
        case 0:
            return 4
        default:
            return direction
    }
}

const registerPlayer = (player: any): void => {
    players.push(player)
}

const drawPlayers = (): void => {
    players.forEach((player) => {
        player.draw()
    })
}

const movePlayers = (): void => {
    players.forEach((player) => {
        switch (player.direction) {
            case 1:
                player.y -= SPEED
                break
            case 2:
                player.x += SPEED
                break
            case 3:
                player.y += SPEED
                break
            case 4:
                player.x -= SPEED
                break
            default:
                console.error('Wrong direction')
        }
    })
}

/* RXJS */

const input$: Observable<any> = merge(
    fromEvent(document, 'keydown').pipe(
        map((event: any): number => {
            switch (event.key) {
                case 'ArrowLeft':
                    return -2
                case 'ArrowRight':
                    return 2
                case 'd':
                    return 1
                case 'a':
                    return -1
                default:
                    return 0
            }
        })
    ),
    fromEvent(document, 'keyup').pipe(map(() => 0))
)

const paddleObserver = {
    next: function(x: any) {
        if (!keep) { return }

        /* Dibujo a los dos jugadores */
        drawPlayers()

        /* Compruebo el tiempo de los inputs */
        if (x.input === 1 || x.input === -1){
            x.input = x.ticks1 > 20 ? x.input : 0
            player1.direction = newDirection(player1.direction, x.input)
        }

        if (x.input === 2 || x.input === -2){
            x.input = x.ticks2 > 20 ? x.input : 0
            player2.direction = newDirection(player2.direction, x.input/2)
        }

        /* Jugadores se mueven */
        movePlayers()

        /* Chequeo colisiones */
        const p1Collision = checkCollision(player1.x, player1.y) //contra jugadores
        if (!p1Collision) { addCoordinate(player1.x, player1.y) }
        const p1WallCollision = checkWalls(player1.x, player1.y)  // contra paredes
        if (p1Collision || p1WallCollision) {
            player2.points += 1
            lost('Jugador 2 gana c:', player1.points, player2.points)
            resetGame()
        }

        const p2Collision = checkCollision(player2.x, player2.y) //contra jugadores
        if (!p2Collision) { addCoordinate(player2.x, player2.y) }
        const p2WallCollision = checkWalls(player2.x, player2.y)  // contra paredes
        if (p2Collision || p2WallCollision) {
            player1.points += 1
            lost('Jugador 1 gana c:', player1.points, player2.points)
            resetGame()
        }
    },
    error: function(err: any) {
        console.error(err)
    },
    complete: function() {}
}

const paddle$: Observable<any> = interval(10).pipe(
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

const pause$: Observable<any> = fromEvent(document, "keypress")
pause$.pipe(filter((event: any) => event.key == "p"))
    .subscribe(() => {
        keep = !keep
    })
let paddleSubscription: Subscription = paddle$.subscribe(paddleObserver)

registerPlayer(player1)
registerPlayer(player2)
drawPlayers()
