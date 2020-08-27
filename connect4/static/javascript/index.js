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
    } else if (style == 'danger') {
        document.getElementById("AIDifficulty").value = "Hard";
    } else {
        document.getElementById("AIDifficulty").value = "Impossible";
    }
}

/**
 * Function that initializes the modal for the game of connect 4
 */
function initializeGame() {
  console.log("Initializing Game.");
  // Set the title of the modal
  var difficulty = document.getElementById("AIDifficulty").value;
  document.getElementById("connect4ModalTitle").innerHTML = "Connect 4 - " + difficulty;
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
  updateBoard(board);
}

/**
 * Function that updates the ui to show the current state of the board.
 * @param {object} board: 7x6 board representing the current state of the board
 */
function updateBoard(board) {
    var htmlString = "<tr class='row-above'>";
    var pieceClass;
    for (var i = 0; i < 7; i++) {
        htmlString += "<td class='grid-position'><span class='c4-piece-above' onclick='makeMove("+i+")'></span></td>";
    }
    htmlString += "</tr>";
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
    document.getElementById("connect4Board").innerHTML = htmlString;
}

/**
 * Function to make a move on the user's behalf
 * @param {int} colNum 
 */
function makeMove(colNum) {
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
    // Update the board
    updateBoard(updatedBoard);
    // If the player index has changed, increment the move counter
    if (updatedPlayerIndex != document.getElementById("currentPlayer").value) {
        document.getElementById("moveCounter").value = (parseInt(document.getElementById("moveCounter").value, 10) + 1) + "";
    }
    console.log(document.getElementById("moveCounter").value);
    // Do some UI stuff if the game is over
    if (isWin) {
        alert(updatedPlayerIndex + " wins!");
        // Show a new game button and some other UI stuff
        return;
    }
    if (document.getElementById("moveCounter").value == "42") {
        alert("It's a tie!");
        // Show a new game button and some other UI stuff
        return;
    }
    document.getElementById("gameBoard").value = JSON.stringify(updatedBoard);
    // Update the player index
    document.getElementById("currentPlayer").value = updatedPlayerIndex;
    // If playing against an AI, call make move again
    if (document.getElementById("opponentType").value == "AI" && updatedPlayerIndex == 1) {
        console.log("About to make AI move")
        data = {};
        data["Board"] = JSON.stringify(updatedBoard);
        data["Player"] = updatedPlayerIndex;
        data["ColumnNum"] = -1;
        var AIDifficulty = document.getElementById("AIDifficulty").value;
        if (AIDifficulty == "Easy") {
            data["Depth"] = 3;
        } else if (AIDifficulty == "Medium") {
            data["Depth"] = 4;
        } else if (AIDifficulty == "Hard") {
            data["Depth"] = 5;
        } else {
            data["Depth"] = 6;
        }
        data = JSON.stringify(data);
        // call the server to add a tile of the current player to the current board
        $.post("makeMove", data, onSuccessMakeMove);
        //stop link from reloading page
        event.preventDefault();
    }
}