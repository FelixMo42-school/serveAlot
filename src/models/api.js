const { sample } = require("lodash")
const Game       = require("./Game")

class Board {
    constructor() {
        this.board = []
        this.tiles = []
        this.merged = []
        this.score = 0
        this.turn = 0

        for (let x = 0; x < 4; x++) {
            this.board[x] = []
            for (let y = 0; y < 4; y++) {
                this.board[x][y] = 0
                this.tiles.push( [x, y] )
            }
        }

        for (let i = 0; i < 2; i++) {
            this.addRandomTile()
        }
    }

    getTile(x, y) {
        return this.board[x][y]
    }

    setTile(x, y, val) {
        this.board[x][y] = val
    }

    inRange(x, y) {
        return x >= 0 && y >= 0 && x < 4 && y < 4
    }

    moveTile(x, y, dx, dy) {
        if (this.getTile(x, y) == 0) {
            return false
        }

        let move = false

        while (true) {
            let [tx, ty] = [x + dx, y + dy]
            if (!this.inRange(tx, ty)) {
                break
            }

            if (this.merged.find(([x, y]) => x == tx && y == ty)) {
                break
            }

            let targetTileValue = this.getTile(tx, ty)
            let value = this.getTile(x, y)

            if (targetTileValue == 0 || targetTileValue == value) {
                this.setTile(x, y, 0)
                this.setTile(tx, ty, targetTileValue + value)

                move = true

                if (targetTileValue == value) {
                    this.score += targetTileValue + value
                    break
                }

                x = tx
                y = ty
            } else {
                break
            }
        }

        return move
    }

    move(direction) {
        let [dx, dy] = [0, 0]

        this.merged = []

        if (direction == "up")    { dy = 1 }
        if (direction == "down")  { dy = -1 }   
        if (direction == "right") { dx = 1 }
        if (direction == "left")  { dx = -1 }

        if (dx == 0 && dy == 0) return

        let traversals = {x: [], y: []}

        for (var pos = 0; pos < 4; pos++) {
            traversals.x.push(pos)
            traversals.y.push(pos)
        }

        if (dx == 1) { traversals.x = traversals.x.reverse() }
        if (dy == 1) { traversals.y = traversals.y.reverse() }

        let move = false

        traversals.x.forEach(x => {
            traversals.y.forEach(y => {
                if ( this.moveTile(x, y, dx, dy) ) {
                    move = true
                }
            })
        })

        if (move) {
            this.addRandomTile()
            this.turn += 1
        }

        return move
    }

    addRandomTile() {
        let value = Math.random() < 0.9 ? 2 : 4

        let [x, y] = sample( this.getOpenTiles() )
        
        this.setTile(x, y, value)
    }

    getOpenTiles() {
        return this.tiles.filter(([x, y]) => this.getTile(x, y) == 0)
    }

    gameOver() {
        let openTiles = this.getOpenTiles()
        if ( openTiles.length > 0 ) {
            return false
        }

        for (var x = 0; x < 4; x++) {
            for (var y = 0; y < 4; y++) {
                for (let [dx, dy] of [[0,1],[1,0],[0,-1],[-1,0]]) {
                    if (!this.inRange(x + dx, y + dy)) { continue }

                    if (this.getTile(x, y) == this.getTile(x + dx, y + dy)) {
                        return false
                    }
                }
            }
        }

        return true
    }

    getHighest() {
        let max = 0

        for (var x = 0; x < 4; x++) {
            for (var y = 0; y < 4; y++) {
                if ( this.getTile(x, y) > max ) {
                    max = this.getTile(x, y)
                }
            }
        }

        return max
    }
}

class Api {
    constructor(server, auth) {
        require('socket.io')(server)
            .of("/2048")
            .on('connection', (socket) => {
                let username = socket.handshake.headers.username
                let password = socket.handshake.headers.password
                let name     = socket.handshake.headers.name

                auth.getUser(username, password)
                    .then(user => {
                        let board = new Board()

                        socket.emit('turn', JSON.stringify({
                            score: board.score,
                            successfulMove: true,
                            board: board.board
                        }) )

                        socket.on('turn', (msg) => {
                            let {
                                direction
                            } = JSON.parse(msg)
        
                            let move = board.move(direction)
        
                            if ( board.gameOver() ) {
                                let game = new Game({
                                    user: user.id,
                                    name: name,
                                    turns: board.turn,
                                    highestTile: board.getHighest(),
                                    score: board.score
                                })
                                game.save()

                                socket.emit('end', JSON.stringify({
                                    score: board.score,
                                    board: board.board
                                }) )
                                socket.disconnect(true)
                            } else {
                                socket.emit('turn', JSON.stringify({
                                    successfulMove: move,
                                    score: board.score,
                                    board: board.board
                                }) )
                            }
                        })
                    })
                    .catch(err => {
                        socket.emit('login_failed', err)
                        socket.disconnect(true)
                    })
            })
    }
}

module.exports = Api