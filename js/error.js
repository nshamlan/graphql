export function renderErrorCard(title, message) {
    document.body.classList.add("overlay-open")
    let main = document.getElementById("main")
    if (!main) return
    main.innerHTML = `
    <section class="error-view" aria-label="Error">
        <div class="error-card">
            <button type="button" id="error-back" class="pawn-back" aria-label="Back">♟</button>
            <h2>${title}</h2>
            <p>${message}</p>
        </div>
    </section>
    `
    let backBtn = document.getElementById("error-back")
    if (backBtn) {
        backBtn.addEventListener("click", () => {
            main.innerHTML = ``
            document.body.classList.remove("overlay-open")
        })
    }
}
