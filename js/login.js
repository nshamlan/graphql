import { profile } from "./profile.js"
export function login(e) {
    e.preventDefault()

    let user = document.getElementById('user').value
    let pass = document.getElementById('password').value
    let err = document.getElementById("error")
    fetch('https://learn.reboot01.com/api/auth/signin', {
        method: "POST",
        headers: {
            "Authorization": `Basic ${btoa(`${user}:${pass}`)}`,
            "Accept": "text/plain",
        },
        cache: "no-store",
    }
    ).then(async (res) => {
        if (!res.ok) {
            console.log(res.status)
            err.textContent = 'not authorized'
            return
        }
        let token = (await res.text()).trim();
        if ((token.startsWith('"') && token.endsWith('"')) || (token.startsWith("'") && token.endsWith("'"))) {
            token = token.slice(1, -1)
        }
        if (token.startsWith("Bearer ")) {
            token = token.slice(7)
        }
        if (!token) {
            localStorage.removeItem("jwt")
            err.textContent = "login failed"
            return
        }
        localStorage.setItem("jwt", token)
        profile()
    }).catch((error) => {
        console.log(error)
        err.textContent = 'network error'
    })
}

export function logout() {
    localStorage.removeItem("jwt")
    let logoutBtn = document.getElementById("logout")
    if (logoutBtn) {
        logoutBtn.remove()
    }
    let sidebar = document.getElementById("sidebar")
    if (sidebar) {
        sidebar.remove()
    }
    let sidebarToggle = document.getElementById("sidebar-toggle")
    if (sidebarToggle) {
        sidebarToggle.remove()
    }
    let main = document.getElementById("main")
    main.innerHTML = `
    <form id="loginForm">
        <div id="robot" aria-hidden="true">
            <div class="antenna"></div>
            <div class="head">
                <div class="eye left"><span class="pupil"></span></div>
                <div class="eye right"><span class="pupil"></span></div>
                <div class="mouth"></div>
            </div>
        </div>

        <h2>Login</h2>

        <input id="user" type="text" placeholder="Username or Email" required />
        <input id="password" type="password" placeholder="Password" required />

        <button type="submit">Sign in</button>
        <p id="error"></p>
    </form>
    `

    document.getElementById("loginForm").addEventListener("submit", login)
}
