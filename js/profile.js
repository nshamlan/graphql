import { graph1, graph2 } from "./graph.js"
import { logout } from "./login.js"
import { getGQL } from "./query.js"
import { renderErrorCard } from "./error.js"

export async function profile() {
    let existingToken = localStorage.getItem("jwt")
    if (!existingToken) {
        logout()
        return
    }
    document.body.classList.remove("overlay-open")
    let sidebar = document.getElementById("sidebar")
    if (!sidebar) {
        let sidebarToggle = document.createElement("input")
        sidebarToggle.id = "sidebar-toggle"
        sidebarToggle.className = "sidebar-toggle-input"
        sidebarToggle.type = "checkbox"

        sidebar = document.createElement("aside")
        sidebar.id = "sidebar"
        sidebar.setAttribute("aria-label", "Primary")
        sidebar.innerHTML = `
        <label class="sidebar-toggle" for="sidebar-toggle" aria-label="Toggle sidebar">♚</label>
        <div class="sidebar-top">
            <button type="button" id="profile-btn" class="sidebar-action">profile</button>
            <button type="button" id="projects-ratio-btn" class="sidebar-action">projects ratio</button>
            <button type="button" id="xp-graph-btn" class="sidebar-action">xp graph</button>
        </div>
        <div id="sidebar-bottom" class="sidebar-bottom"></div>
        `

        let chessRoot = document.getElementById("chess-root")
        if (chessRoot && chessRoot.parentNode) {
            chessRoot.parentNode.insertBefore(sidebarToggle, chessRoot.nextSibling)
            chessRoot.parentNode.insertBefore(sidebar, sidebarToggle.nextSibling)
        } else {
            document.body.prepend(sidebar)
            document.body.prepend(sidebarToggle)
        }
    }

    let sidebarBottom = document.getElementById("sidebar-bottom")
    let KickOut = document.createElement("button")
    KickOut.id = "logout"
    KickOut.textContent = "♛ logout"
    KickOut.addEventListener("click", logout)
    sidebarBottom.appendChild(KickOut)

    let info
    try {
        info = await getGQL()
    } catch (err) {
        console.log(err)
        renderErrorCard("Profile error", "We could not load your profile right now. Please try again.")
        return
    }
    let name = info?.data?.user?.[0]?.login
    let firstName = info?.data?.user?.[0]?.firstName
    let lastName = info?.data?.user?.[0]?.lastName
    let xp = info?.data?.user?.[0]?.xps?.reduce((toltal, vale) => toltal + vale.amount, 0)
    let xpc = "kB"
    let rato = info?.data?.user?.[0]?.auditRatio
    if (!name || xp === undefined || rato === undefined) {
        renderErrorCard("Profile error", "We could not load your profile right now. Please try again.")
        return
    }
    if (xp > 1000) {
        xp = xp / 1000
    }
    if (xp > 1000) {
        xp = xp / 1000
        xpc = "MB"
    }
    if (xpc == "kB") {
        xp = Number(xp.toFixed(1))
    } else {
        xp = Number(xp.toFixed(2))
    }
    rato = Number(rato.toFixed(1))
    console.log(name, xp, xpc, rato)
    let main = document.getElementById("main")
    main.innerHTML = ``

    let renderProfile = () => {
        document.body.classList.add("overlay-open")
        main.innerHTML = `
        <section class="profile-view" aria-label="Profile">
            <div class="profile-card">
                <button type="button" id="profile-back" class="pawn-back" aria-label="Back">♟</button>
                <div class="profile-header">
                    <img class="profile-avatar" src="./profile.png" alt="Profile picture" />
                    <div class="profile-title">
                        <h2>Profile</h2>
                        <div class="profile-name">${firstName} ${lastName}</div>
                    </div>
                </div>
                <div class="profile-row"><span class="label">Username</span><span class="value">${name}</span></div>
                <div class="profile-row"><span class="label">First name</span><span class="value">${firstName}</span></div>
                <div class="profile-row"><span class="label">Last name</span><span class="value">${lastName}</span></div>
                <div class="profile-row"><span class="label">XP</span><span class="value">${xp} ${xpc}</span></div>
                <div class="profile-row"><span class="label">Ratio</span><span class="value">${rato}</span></div>
            </div>
        </section>
        `
        let backBtn = document.getElementById("profile-back")
        if (backBtn) {
            backBtn.addEventListener("click", () => {
                main.innerHTML = ``
                document.body.classList.remove("overlay-open")
            })
        }
    }

    let profileBtn = document.getElementById("profile-btn")
    if (profileBtn) {
        profileBtn.onclick = renderProfile
    }

    let xpGraphBtn = document.getElementById("xp-graph-btn")
    if (xpGraphBtn) {
        xpGraphBtn.onclick = graph1
    }

    let ratioGraphBtn = document.getElementById("projects-ratio-btn")
    if (ratioGraphBtn) {
        ratioGraphBtn.onclick = graph2
    }

}
