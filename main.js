import { logout } from "./js/login.js"
import "./js/chess.js"
import { profile } from "./js/profile.js"

let existingToken = localStorage.getItem("jwt")
if (existingToken) {
    profile()
}else{
    logout()
}

const bgSound = new Audio("./sound.mp4");
bgSound.loop = true;
bgSound.volume = 1;
bgSound.play()
