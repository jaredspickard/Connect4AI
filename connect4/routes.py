from flask import render_template, request
from connect4 import app
import connect4.backend as server

@app.route('/')
@app.route('/index')
def index():
    return render_template('index.html')

@app.route('/leaderboard')
def leaderboard():
    return render_template('leaderboard.html')

@app.route('/makeMove', methods=['GET', 'POST'])
def makeMove():
    data = request.get_json(force=True)
    updatedData = server.makeMove(data)
    return updatedData