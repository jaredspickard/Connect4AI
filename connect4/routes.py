from flask import render_template
from connect4 import app

@app.route('/')
@app.route('/index')
def index():
    return render_template('index.html')

@app.route('/leaderboard')
def leaderboard():
    return render_template('leaderboard.html')

@app.route('/development')
def development():
    return render_template('development.html')