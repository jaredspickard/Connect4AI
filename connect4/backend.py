from copy import deepcopy

def isWin(board, colInd, rowInd):
    """ Function to check if the most recent move resulted in a win 
        @param {object} board: the board before the move is made
        @param {int} colInd: the column the player wishes to place the piece in 
        @param {int} rowInd: the row that the piece will land in
        @return {boolean} returns a boolean representing whether this was a winning move or not """
    middlePiece = board[colInd][rowInd]
    # Check for horizontal win
    startC = max(0,colInd-3)
    endC = min(colInd+4,7)
    inARow = 0
    for c in range(startC, endC):
        if board[c][rowInd] == middlePiece:
            inARow += 1
            if inARow == 4:
                return True
        else:
            inARow = 0
    # Check for vertical win
    startR = max(0,rowInd-3)
    endR = min(rowInd+1,6)
    if endR - startR > 2:
        inARow = 0
        for r in range(startR, endR):
            if board[colInd][r] == middlePiece:
                inARow += 1
                if inARow == 4:
                    return True
            else:
                break
    # Check diagonal (direction one)
    leftMax = min(colInd,5-rowInd)
    left = min(3,leftMax)
    rightMax = min(6-colInd,rowInd)
    right = min(3,rightMax) 
    inARow = 0
    if left + right > 2:
        for i in range(-1*left,right+1):
            c = colInd+i
            r = rowInd-i
            if board[c][r] == middlePiece:
                inARow += 1
                if inARow == 4:
                    return True
            else:
                inARow = 0
    # Check diagonal (direction two)
    leftMax = min(colInd,rowInd)
    left = min(3,leftMax)
    rightMax = min(6-colInd,5-rowInd)
    right = min(3,rightMax) 
    inARow = 0
    if left + right > 2:
        for i in range(-1*left,right+1):
            c = colInd+i
            r = rowInd+i
            if board[c][r] == middlePiece:
                inARow += 1
                if inARow == 4:
                    return True
            else:
                inARow = 0
    return False

def makeMove(data):
    """ General function to make a move on the connect 4 board 
        @param {object} data: json object with the following fields: board, player index, column number (move)
        @return {object} returns a dictionary containing the updated board, player index, and boolean representing whether the game was won"""
    # Unpack the data
    board = data["Board"]
    #Format the board properly
    board = board.replace("\"","").replace("[[","").replace("]]","").split("],[")
    board = [el.split(",") for el in board]
    playerIndex = data["Player"]
    colInd = data["ColumnNum"]
    # Call the appropriate helper function based on the move that was made (if move is null, have AI choose its own move)
    if colInd == -1:
        depth = data["Depth"]
        print("About to make AI move with depth: " + str(depth))
        win, errorMsg = makeAIMove(board, playerIndex, depth)
    else:
        win, errorMsg = makeHumanMove(board, playerIndex, colInd)
    # If the call to the make move helper returns an error message, return that error message to the client
    if errorMsg:
        return errorMsg
    # If there was not an error, then package the data and return it to the client
    updatedData = {}
    updatedData["Board"] = board
    # Only change the player index if it did not result in a win
    if win:
        updatedData["Player"] = playerIndex
    else:
        updatedData["Player"] = (int(playerIndex) + 1) % 2
    updatedData["Win"] = win
    return updatedData

def makeHumanMove(board, playerIndex, colInd):
    """ Helper function to make the indicated move on the player's behalf.
        @param {object} board: the board before the move is made
        @param {int} playerIndex: the index of the player
        @param {int} colInd: the column the player wishes to place the piece in
        @return {(boolean, string)} returns a tuple of a boolean representing if the move resulted in a win and a string with the error message"""
    # Get the index of the first 'x' in the column of index move, if it DNE, return an error message
    try:
        print(colInd)
        rowInd = board[colInd].index("x")
        # Update the board so that this move is made
        board[colInd][rowInd] = str(playerIndex)
        # check if this move resulted in a win, and if so return true and None for the error message
        return isWin(board, colInd, rowInd), None
    except ValueError:
        # This row is full, so return False (indicates it did not result in a win) and an error message
        return False, "Error Message"

def makeAIMove(board, playerIndex, depth):
    """ Helper function to make the indicated move on the player's behalf.
        @param {object} board: the board before the move is made
        @param {int} colInd: the column the player wishes to place the piece in
        @param {int} depth: the max depth of the agent
        @return {(boolean, string)} returns a tuple of a boolean representing if the move resulted in a win and a string with the error message"""
    # Get the list of valid moves
    bestScore = -1*float('inf')
    validMoves = getValidMoves(board)
    # Return False, None if there are no valid moves
    if not validMoves:
        print("No valid AI Moves")
        return False, None
    _, bestC, bestR = getNextState(board, validMoves[0], playerIndex)
    # evaluate each move using minimax to find the best move
    for move in validMoves:
        nextState, c, r = getNextState(board, move, playerIndex)
        #score = estimateStateValue(nextState, c, r, depth, (playerIndex+1)%2, False)
        score = minimax(nextState, depth-1, -1*float('inf'), float('inf'), (playerIndex+1)%2, False, c, r)
        if score > bestScore:
            bestC = c
            bestR = r
            bestScore = score
    # update the board
    board[bestC][bestR] = str(playerIndex)
    # check if this move resulted in a win, and if so return true and None for the error message
    return isWin(board, bestC, bestR), None

def getValidMoves(board):
    """ Function that returns a list of valid moves for a given board 
        @param {object} board: the current board
        @return {list} returns a list of valid moves"""
    valid = []
    for move in range(0,7):
        # try to find an x in each column, if an exception isnt thrown, add it to the valid list
        try:
            board[move].index("x")
            valid.append(move)
        except ValueError:
            continue
    return valid

def getNextState(board, colInd, playerIndex):
    """ Function that returns a copy of the board with the given move made 
        @param {object} board: the board in its current state
        @param {int} colInd: the index of the column that the piece is being placed
        @param {int} playerIndex: the index of the player whose turn it is
        @return {(object, int, int)} returns a tuple consisting of the updated board, the column of the last move, and the row """
    # Make a copy of the board
    boardCopy = deepcopy(board)
    # Get the index of where the piece would be dropped
    rowInd = board[colInd].index("x")
    # Update the board copy to have the piece
    boardCopy[colInd][rowInd] = str(playerIndex)
    return boardCopy, colInd, rowInd

def minimax(board, depth, alpha, beta, playerIndex, maximizingPlayer, colInd, rowInd):
    """ Function that uses the minimax algorithm to decide which move to make
        @param {object} board: the current board
        @param {int} depth: how many moves away from the max depth
        @param {int} alpha: the current alpha value (for alpha-beta pruning) 
        @param {int} beta: the current beta value
        @param {int} playerIndex: the index of the current player
        @param {boolean} maximizingPlayer: represents whether or not the current player is the maximizing player
        @param {int} colInd: the column index of the most recently made move 
        @param {int} rowInd: the row index of the most recently made move """
    # Check if the move resulted in a win
    if isWin(board, colInd, rowInd):
        if maximizingPlayer: # the current player is max, which means that the player that made the last move to win was min
            return -1*float('inf')
        else: # the current player is min, which means that the player that made the last move to win was max
            return float('inf')
    elif depth == 0: # if the max depth has been reached, use the heuristic function on the board
        return evaluateBoard(board, playerIndex, maximizingPlayer)
    elif maximizingPlayer: # if maximizing player, use max
        value = -1*float('inf')
        validMoves = getValidMoves(board)
        # for each valid move, get the next state and run minimax
        for move in validMoves:
            nextState, c, r = getNextState(board, move, playerIndex)
            value = max(value, minimax(nextState, depth-1, alpha, beta, (playerIndex+1)%2, False, c, r))
            alpha = max(alpha, value)
            if alpha >= beta:
                break
        return value
    else: # if minimizing player, use min
        value = float('inf')
        validMoves = getValidMoves(board)
        # for each valid move, get the next state and run minimax
        for move in validMoves:
            nextState, c, r = getNextState(board, move, playerIndex)
            value = min(value, minimax(nextState, depth-1, alpha, beta, (playerIndex+1)%2, True, c, r))
            beta = min(beta, value)
            if beta <= alpha:
                break
        return value

def evaluateBoard(board, playerIndex, maximizingPlayer):
    """ Heuristic function that evaluates a board for a given player index.
        @param {object} board: the current state of the board being examined
        @param {int} playerIndex: the current player index
        @param {boolean} maximizingPlayer: a boolean representing whether or not the current player is the maximizing agent
        @return {float} returns a value representing the score of the board based on whether moves would result in 4-in-a-row"""
    value = 0 # the value of the board
    # Get the valid moves
    validMoves = getValidMoves(board)
    # Get the index of the other player
    otherPlayerIndex = (playerIndex+1) % 2
    for move in validMoves:
        # see if this move would allow our player to win
        hypotheticalBoard, c, r = getNextState(board, move, playerIndex)
        if isWin(hypotheticalBoard, c, r):
            if maximizingPlayer:
                return float('inf')
            else:
                return -1*float('inf')
        # see if this move would allow the other player to win (don't return an infinity since it isn't their turn)
        hypotheticalBoard, c, r = getNextState(board, move, otherPlayerIndex)
        if isWin(hypotheticalBoard, c, r):
            value -= 1000
    return value