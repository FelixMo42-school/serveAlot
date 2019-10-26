import socketio
import json
import random

class Player(socketio.ClientNamespace):
    def __init__(self, username, password):
        super().__init__("/2048")

        self.username = username
        self.password = password

    def on_connect(self):
        print("Joined game!")

        self.emit("auth", json.dumps({
            "username": self.username,
            "password": self.password
        }))

    def on_start(self, msg):
        print("Game starts!")

    def on_turn(self, msg):
        data = json.loads(msg)

        self.emit("turn", json.dumps({
            "direction": random.choice([
                "left", "right", "up", "down"
            ])
        }))

    def on_end(self, msg):
        print("game over")
        print(f"score: {json.loads(msg)['score']}")

        self.sio.disconnect()

    def on_disconnect(self):
        print("disconnect")
        
        self.sio.disconnect()

    def startGame(self):
        sio=socketio.Client()
        sio.register_namespace(self)

        self.sio = sio

        sio.connect("http://localhost:1234", {
            "username": self.username,
            "password": self.password,
        })

Player("admin", "12345").startGame()