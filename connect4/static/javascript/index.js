/**
 * Function to be called when the radio button is clicked to play against the AI.
 * Hides the Player 2 options and shows AI difficulty buttons
 */
function playAgainstAIRadioButton() {
    document.getElementById("playAgainstHumanOptions").style.display = "none";
    document.getElementById("playAgainstAIOptions").style.display = "block";
    document.getElementById("opponentType").value = "AI";
}

/**
 * Function to be called when the radio button is clicked to play against a friend.
 * Hides the AI options and shows Player 2 options
 */
function playAgainstFriendRadioButton() {
    document.getElementById("playAgainstAIOptions").style.display = "none";
    document.getElementById("playAgainstHumanOptions").style.display = "block";
    document.getElementById("opponentType").value = "Human";
}

/**
 * Function to be called when AI difficulty is changed.
 * Changes the style of the 'Begin Game' Button
 * 
 * @param {string} style: string representing the button style
 */
function changedAIDifficulty(style) {
    // Change the button style
    document.getElementById("beginGameButton").className = "btn btn-lg btn-icon btn-" + style;
    // Set a hidden tag for the difficulty selected
    if (style == 'success') {
        document.getElementById("AIDifficulty").value = "Easy";
    } else if (style == 'warning') {
        document.getElementById("AIDifficulty").value = "Medium";
    } else {
        document.getElementById("AIDifficulty").value = "Hard";
    }
}

/**
 * Function that initializes the modal for the game of connect 4
 */
function initializeGame() {
  console.log("Initializing Game.");
  // Hide new game and exit buttons
  document.getElementById("newGameButton").style.display = "none";
  document.getElementById("exitModalButton").style.display = "none";
  // Fix title size and color
  document.getElementById("player-title").className = "yellow-player-title";
  document.getElementById("player-title").style.fontSize = "1.75rem";
  // Set the hidden tags for player names
  document.getElementById("player0Name").value = document.getElementById("player0NameInput").value || "Player 1";
  document.getElementById("player1Name").value = document.getElementById("player1NameInput").value || "Player 2";
  // Reset the move counter
  document.getElementById("moveCounter").value = 0;
  // Set the title of the modal
  var difficulty = document.getElementById("AIDifficulty").value;
  document.getElementById("connect4ModalTitle").innerHTML = "Connect 4 - " + difficulty;
  // Show the turn title
  document.getElementById("player-title").innerHTML = document.getElementById("player0Name").value + "'s turn.";
  document.getElementById("player-title").className = "yellow-player-title";
  // Set the index of the currPlayer to be 0
  var currPlayer = 0;
  // Create a 7x6 array to represent the board
  var board = [];
  // Populate the board with 'x' chars to represent open spaces
  for (var c = 0; c < 7; c++) {
      board[c] = [];
      for (var r = 0; r < 6; r++) {
          board[c][r] = 'x';
      }
  }
  board = JSON.stringify(board);
  // Set the hidden tags to store these elements
  document.getElementById("gameBoard").value = board;
  document.getElementById("currentPlayer").value = currPlayer;
  // Set the board ui to match the current state (in this case it's empty)
  updateBoard(board, true);
}

/**
 * Function that updates the ui to show the current state of the board.
 * @param {object} board: 7x6 board representing the current state of the board
 * @param {boolean} makeMove: boolean representing whether or not we want the user to be able to make a move
 */
function updateBoard(board, makeMove) {
    var htmlString = "<tr class='row-above'>";
    var pieceClass;
    var color;
    if (document.getElementById("currentPlayer").value == 0) {
        color = "yellow";
    } else {
        color = "red";
    }
    if (makeMove) { // let user make move
        for (var i = 0; i < 7; i++) {
            htmlString += "<td class='grid-position'><span name='pieceAbove' class='c4-piece-above-"+color+"' onclick='makeMove("+i+")'></span></td>";
        }
    } else { // don't let user make move
        for (var i = 0; i < 7; i++) {
            htmlString += "<td class='grid-position'><span name='pieceAbove' class='c4-piece-above'></span></td>";
        }
    }
    htmlString += "</tr>";
    // Add a blank, yellow, or red piece depending on the state of the board
    for (var i = 5; i > -1; i--) {
        htmlString += "<tr class='c4-row'>";
        for (var j = 0; j < 7; j++) {
            if (board[j][i] == 0) { //
                pieceClass = "c4-piece-yellow";
            } else if (board[j][i] == 1) {
                pieceClass = "c4-piece-red";
            } else {
                pieceClass = "c4-piece-blank";
            }
            htmlString += "<td class='grid-position'><span class='"+pieceClass+"'></span></td>";
        }
        htmlString += "</tr>";
    }
    // Update the html
    document.getElementById("connect4Board").innerHTML = htmlString;
}

/**
 * Function to make a move on the user's behalf
 * @param {int} colNum 
 */
function makeMove(colNum) {
    colNum = parseInt(colNum);
    // Take away ability to make move
    takeAwayMakeMove();
    // Prepare the data to be sent to the server
    var data = {};
    data["Board"] = document.getElementById("gameBoard").value;
    data["Player"] = document.getElementById("currentPlayer").value;
    data["ColumnNum"] = colNum;
    data = JSON.stringify(data);
    console.log(data);
    // call the server to add a tile of the current player to the current board
    $.post("makeMove", data, onSuccessMakeMove);
    //stop link from reloading page
    event.preventDefault();
}

/**
 * onSuccess function to be called when the server successfully attempts to make a move
 * @param {object} retData: updated data returned by the server
 */
function onSuccessMakeMove(retData) {
    console.log(retData);
    // Unpack the data
    var updatedBoard = retData["Board"];
    var updatedPlayerIndex = retData["Player"];
    var isWin = retData["Win"];
    // If the player index has changed, increment the move counter
    if (updatedPlayerIndex != document.getElementById("currentPlayer").value) {
        document.getElementById("moveCounter").value = (parseInt(document.getElementById("moveCounter").value) + 1) + "";
    }
    console.log(document.getElementById("moveCounter").value);
    // Update the player index
    document.getElementById("currentPlayer").value = updatedPlayerIndex;
    // Update the board, but don't let the user make a move
    updateBoard(updatedBoard, false);
    // Update the player title and mouseover color
    document.getElementById("player-title").innerHTML = document.getElementById("player"+updatedPlayerIndex+"Name").value + "'s turn.";
    if (updatedPlayerIndex == 0) {
        document.getElementById("player-title").className = "yellow-player-title";
    } else {
        document.getElementById("player-title").className = "red-player-title";
    }
    // Do some UI stuff if the game is over
    if (isWin) {
        // Call the function that handles the conclusion of the game
        winGame(updatedPlayerIndex);
        return;
    }
    if (document.getElementById("moveCounter").value == "42") {
        // Call the function that handles the conclusion of the game
        winGame(-1);
        return;
    }
    document.getElementById("gameBoard").value = JSON.stringify(updatedBoard);
    // If playing against an AI, call make move again
    if (document.getElementById("opponentType").value == "AI" && updatedPlayerIndex == 1) {
        console.log("About to make AI move");
        // Repackage data
        data = {};
        data["Board"] = JSON.stringify(updatedBoard);
        data["Player"] = updatedPlayerIndex;
        data["ColumnNum"] = -1;
        // Set the appropriate AI difficulty
        var AIDifficulty = document.getElementById("AIDifficulty").value;
        if (AIDifficulty == "Easy") {
            data["Depth"] = 3;
        } else if (AIDifficulty == "Medium") {
            data["Depth"] = 4;
        } else {
            data["Depth"] = 5;
        } 
        data = JSON.stringify(data);
        // call the server to add a tile of the current player to the current board
        $.post("makeMove", data, onSuccessMakeMove);
        //stop link from reloading page
        event.preventDefault();
    } else {
        // Give back ability to make a move
        giveMakeMoveBack();
    }
}

/**
 * Function that takes away the player's ability to make a move
 */
function takeAwayMakeMove() {
    var elems = document.getElementsByName("pieceAbove");
    for (var i = 0; i < elems.length; i++) {
        // Remove hover
        elems[i].className = "c4-piece-above";
        // Remove onclick
        elems[i].onclick = function() {};
    }
}

/**
 * Function that gives the player the ability to make a move again
 */
function giveMakeMoveBack() {
    var elems = document.getElementsByName("pieceAbove");
    console.log(elems);
    for (let i = 0; i < elems.length; i++) {
        // Get piece color
        var color = "yellow";
        if(document.getElementById("currentPlayer").value == "1") {
            color = "red";
        }
        // Put back hover
        elems[i].className = "c4-piece-above-" + color;
        // Put back onclick
        elems[i].addEventListener("click", function() {
            makeMove(i);
        });
    }
}

/**
 * Function to be called once a game is completed
 * @param {int} playerIndex: the index of the winning player (-1 if its a tie)
 */
function winGame(playerIndex) {
    // Take away ability to make move
    takeAwayMakeMove();
    // Display winner name (or tie)
    if (playerIndex == -1) {
        document.getElementById("player-title").className = "";
        document.getElementById("player-title").style.color = "black";
        document.getElementById("player-title").innerHTML = "It's a tie!";
    } else {
        var name = document.getElementById("player"+playerIndex+"Name").value;
        document.getElementById("player-title").innerHTML = name + " wins!!!";
    }
    document.getElementById("player-title").style.fontSize = "5rem";
    // Show new game and exit buttons
    document.getElementById("newGameButton").style.display = "block";
    document.getElementById("exitModalButton").style.display = "block";
}