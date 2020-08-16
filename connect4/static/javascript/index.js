function playAgainstAIRadioButton() {
    document.getElementById("playAgainstHumanOptions").style.display = "none";
    document.getElementById("playAgainstAIOptions").style.display = "block";
}

function playAgainstFriendRadioButton() {
    document.getElementById("playAgainstAIOptions").style.display = "none";
    document.getElementById("playAgainstHumanOptions").style.display = "block";
}

function changedAIDifficulty(style) {
    document.getElementById("beginGameButton").className = "btn btn-lg btn-icon btn-" + style;
}