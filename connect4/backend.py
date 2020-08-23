import json, ast

def makeMove(data):
    """ General function to make a move on the connect 4 board 
        @param {object} data: json object with the following fields: board, player index, column number (move)
        @return {object} returns a dictionary containing the updated board, player index, and boolean representing whether the game was won"""
    # Unpack the data
    board = data["Board"]
    #Format the board properly
    board = board.replace("\"","").replace("[[","").replace("]]","").split("],[")
    board = [el.split(",") for el in board]
    print(board)
    playerIndex = data["Player"]
    colInd = data["ColumnNum"]
    # Call the appropriate helper function based on the move that was made (if move is null, have AI choose its own move)
    if colInd == None:
        makeAIMove(board, playerIndex)
    else:
        makeHumanMove(board, playerIndex, colInd)
    updatedData = {}
    updatedData["Board"] = board
    updatedData["Player"] = (int(playerIndex) + 1) % 2
    return updatedData

def makeHumanMove(board, playerIndex, colInd):
    """ Helper function to make the indicated move on the player's behalf.
        @param {object} board: the board before the move is made
        @param {int} playerIndex: 
        @param {int} colInd: the column the player wishes to place the piece in
        @return {int} """
    # Get the index of the first 'x' in the column of index move, if it DNE, return an error message
    print("Human Move")
    try:
        rowInd = board[colInd].index("x")
        # Update the board so that this move is made
        print(board)
        board[colInd][rowInd] = playerIndex
        print(board)
        print("Success")
    except ValueError:
        # This row is full, so return an error message?
        print("Error")