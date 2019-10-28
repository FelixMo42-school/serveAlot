import socketio
import json
import random

class Player(socketio.ClientNamespace):
    def __init__(self, username, password):
        super().__init__("/2048")

        self.username = username
        self.password = password

        self.callbacks = {}

    def on_connect(self):
        if "gameStart" in self.callbacks:
            self.callbacks["gameStart"]()

    def on_turn(self, msg):
        data = json.loads(msg)

        self.emit("turn", json.dumps(
            self.callbacks["turn"](data)
        ))

    def on_end(self, msg):
        data = json.loads(msg)
        
        if "gameOver" in self.callbacks:
            self.callbacks["gameOver"](data)

        self.sio.disconnect()

    def on_disconnect(self):
        #print( self.sio.disconnected )
        #self.sio.
            #pass

        
        print("disconnect")

    def on(self, event):
        def decorator(func):
            self.callbacks[event] = func
            return func

        return decorator

    def startGame(self):
        if "turn" in self.callbacks:
            self.sio=socketio.Client()
            self.sio.register_namespace(self)

            self.sio.connect("http://localhost:1234", {
                "username": self.username,
                "password": self.password,
            })
            #self.sio.wait()
        else:
            print("Must have an onturn callback to play game.")

######################################################################

player = Player("admin", "123456")

@player.on("gameStart")
def start():
    print("game is starting")

@player.on("turn")
def turn(data):
    # print("board ", data["board"])
    # print("score ", data["score"])
    # print("successfulMove ", data["successfulMove"])

    return {
        "direction": random.choice([
            "left", "right", "up", "down"
        ])
    }

@player.on("gameOver")
def end(data):
    print("final score ", data["score"])

print(">")
player.startGame()
print("<")