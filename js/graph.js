import { getGQL } from "./query.js"

export async function graph1() {
    let existingToken = localStorage.getItem("jwt")
    if (!existingToken) {
        logout()
        return
    }
    let info = await getGQL(1)
    let xps = info?.data?.user?.[0]?.xps ?? []
    if (!xps.length) return

    let sorted = [...xps].sort(
        (a, b) => new Date(a.event.createdAt) - new Date(b.event.createdAt)
    )

    let total = 0
    let pointsRaw = sorted.map((entry) => {
        total += entry.amount
        return {
            date: new Date(entry.event.createdAt),
            value: total,
        }
    })

    if (pointsRaw.length > 60) {
        let step = Math.ceil(pointsRaw.length / 60)
        pointsRaw = pointsRaw.filter((_, index) => index % step === 0)
        let last = sorted[sorted.length - 1]
        let lastDate = new Date(last.event.createdAt)
        if (pointsRaw[pointsRaw.length - 1].date.getTime() !== lastDate.getTime()) {
            pointsRaw.push({
                date: lastDate,
                value: total,
            })
        }
    }

    let width = 420
    let height = 260
    let padding = { top: 20, right: 18, bottom: 34, left: 44 }
    let innerWidth = width - padding.left - padding.right
    let innerHeight = height - padding.top - padding.bottom
    let maxValue = Math.max(...pointsRaw.map((p) => p.value), 1)
    let minValue = 0
    let range = maxValue - minValue

    let points = pointsRaw.map((point, index) => {
        let denom = Math.max(pointsRaw.length - 1, 1)
        let x = padding.left + (innerWidth * index) / denom
        let y =
            padding.top +
            innerHeight -
            (innerHeight * (point.value - minValue)) / Math.max(range, 1)
        return {
            x: x.toFixed(2),
            y: y.toFixed(2),
            value: point.value,
            date: point.date,
        }
    })

    let linePath = ""
    for (let i = 0; i < points.length; i += 1) {
        linePath += `${i === 0 ? "M" : "L"}${points[i].x} ${points[i].y} `
    }
    linePath = linePath.trim()

    let areaPath = ""
    if (points.length) {
        let baseY = padding.top + innerHeight
        areaPath = `${linePath} L${points[points.length - 1].x} ${baseY} L${points[0].x} ${baseY} Z`
    }

    let yTicks = 4
    let yTickValues = Array.from({ length: yTicks + 1 }, (_, i) =>
        Math.round((maxValue / yTicks) * i)
    ).reverse()
    let yTickLabels = yTickValues.map((tick) => {
        let amount = tick / 1000
        let unit = "kB"
        if (amount >= 1000) {
            amount = amount / 1000
            unit = "MB"
        }
        let digits = unit === "MB" ? 2 : 1
        return `${amount.toFixed(digits)} ${unit}`
    })

    let totalLabel = total / 1000
    let totalUnit = "kB"
    if (totalLabel >= 1000) {
        totalLabel = totalLabel / 1000
        totalUnit = "MB"
    }
    let totalDigits = totalUnit === "MB" ? 2 : 1
    let totalText = `${totalLabel.toFixed(totalDigits)} ${totalUnit}`

    let firstDateText = points[0].date.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
    })
    let lastDateText = points[points.length - 1].date.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
    })

    let dots = points
        .filter(
            (_, index) => index % Math.ceil(points.length / 8) === 0 || index === points.length - 1
        )
        .map((point) => `<circle class="graph-dot" cx="${point.x}" cy="${point.y}" r="3" />`)
        .join("")

    let gridAndLabels = yTickValues
        .map((_, index) => {
            let y = padding.top + (innerHeight / yTicks) * index
            return `
                <line class="graph-grid" x1="${padding.left}" y1="${y}" x2="${width - padding.right}" y2="${y}" />
                <text class="graph-axis" x="${padding.left - 8}" y="${y + 4}">${yTickLabels[index]}</text>
            `
        })
        .join("")

    let main = document.getElementById("main")
    main.innerHTML = `
    <section class="graph-view" aria-label="XP progress">
        <div class="graph-card">
            <button type="button" id="graph-back" class="pawn-back" aria-label="Back">♟</button>
            <div class="graph-header">
                <h2>XP progress</h2>
                <div class="graph-subtitle">Cumulative XP earned over time</div>
                <div class="graph-total">${totalText} XP</div>
            </div>
            <svg class="graph-svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="XP earned over time">
                <defs>
                    <linearGradient id="xpArea" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stop-color="#151515" stop-opacity="0.35" />
                        <stop offset="100%" stop-color="#151515" stop-opacity="0.04" />
                    </linearGradient>
                    <linearGradient id="xpGlow" x1="0" x2="1" y1="0" y2="0">
                        <stop offset="0%" stop-color="#0b0b0b" stop-opacity="0.2" />
                        <stop offset="100%" stop-color="#0b0b0b" stop-opacity="0.7" />
                    </linearGradient>
                    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                        <feDropShadow dx="0" dy="6" stdDeviation="6" flood-color="#000" flood-opacity="0.2" />
                    </filter>
                </defs>
                <rect class="graph-frame" x="10" y="10" width="${width - 20}" height="${height - 20}" />
                ${gridAndLabels}
                <path class="graph-area" d="${areaPath}" fill="url(#xpArea)" />
                <path class="graph-line" d="${linePath}" stroke="url(#xpGlow)" filter="url(#shadow)" />
                ${dots}
                <text class="graph-axis" x="${padding.left}" y="${height - 12}">${firstDateText}</text>
                <text class="graph-axis" x="${width - padding.right}" y="${height - 12}" text-anchor="end">${lastDateText}</text>
            </svg>
        </div>
    </section>
    `

    let backBtn = document.getElementById("graph-back")
    if (backBtn) {
        backBtn.addEventListener("click", () => {
            main.innerHTML = ``
        })
    }
}


export async function graph2() {
    let existingToken = localStorage.getItem("jwt")
    if (!existingToken) {
        logout()
        return
    }
    let info = await getGQL(2)
    let fail = 0
    let failpro = []
    let pass = 0
    let passpro = []
    info.data.result.forEach(element => {
        if (element.grade == 1.2) {
            pass++
            passpro.push(element.object.name)
        } else {
            fail++
            failpro.push(element.object.name)
        }
    });
    let sum = pass + fail
    let failratio = (fail / sum) * 100
    let passratio = 100 - failratio
    let centerX = 180
    let centerY = 120
    let radius = 110
    let ringCirc = 2 * Math.PI * radius
    let passOffset = ringCirc - ((passratio / 100) * ringCirc)
    let failOffset = ringCirc - ((failratio / 100) * ringCirc)
    let segmentCount = 120
    let segmentGap = 2
    let segmentLen = (ringCirc / segmentCount) - segmentGap
    if (segmentLen < 1) {
        segmentLen = 1
        segmentGap = (ringCirc / segmentCount) - segmentLen
    }
    let segmentDash = `${segmentLen} ${segmentGap}`
    let ticks = []
    for (let i = 0; i < 24; i += 1) {
        let angle = (i / 24) * 360 - 90
        let rad = angle * Math.PI / 180
        let inner = radius + 16
        let outer = radius + (i % 6 === 0 ? 32 : 24)
        let x1 = centerX + inner * Math.cos(rad)
        let y1 = centerY + inner * Math.sin(rad)
        let x2 = centerX + outer * Math.cos(rad)
        let y2 = centerY + outer * Math.sin(rad)
        ticks.push(`<line class="ratio-tick${i % 6 === 0 ? " major" : ""}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" />`)
    }
    let listItems = []

    passpro.forEach(name => {
        listItems.push(`<li class="project-item pass"><span>${name}</span><span class="status">PASS</span></li>`)
    })
    failpro.forEach(name => {
        listItems.push(`<li class="project-item fail"><span>${name}</span><span class="status">FAIL</span></li>`)
    })

    let main = document.getElementById("main")
    main.innerHTML = `
    <section class="graph-view" aria-label="Projects ratio">
        <div class="graph-card">
            <button type="button" id="graph-back" class="pawn-back" aria-label="Back">♟</button>
            <div class="graph-header">
                <h2>Projects ratio</h2>
                <div class="graph-subtitle">Pass vs fail for your projects</div>
            </div>
            <div class="ratio-layout">
                <div class="graph-caption">
                    <span class="ratio-line pass"><span class="ratio-badge">PASS</span><span class="ratio-value">${passratio.toFixed(1)}%</span></span>
                    <span class="ratio-line fail"><span class="ratio-badge">FAIL</span><span class="ratio-value">${failratio.toFixed(1)}%</span></span>
                </div>
                <svg class="graph-svg ratio-layout" viewBox="0 0 360 260" role="img" aria-label="Projects ratio chart">
                <defs>
                    <linearGradient id="ratioTrack" x1="0" x2="1" y1="0" y2="1">
                        <stop offset="0%" stop-color="rgba(0,0,0,0.08)" />
                        <stop offset="100%" stop-color="rgba(0,0,0,0.16)" />
                    </linearGradient>
                    <linearGradient id="ratioSweep" x1="0" x2="1" y1="0" y2="0">
                        <stop offset="0%" stop-color="rgba(255,255,255,0)" />
                        <stop offset="50%" stop-color="rgba(255,255,255,0.65)" />
                        <stop offset="100%" stop-color="rgba(255,255,255,0)" />
                    </linearGradient>
                </defs>
                ${ticks.join("")}
                <circle class="ratio-ring-track" cx="${centerX}" cy="${centerY}" r="${radius}" stroke="url(#ratioTrack)"></circle>
                <circle class="ratio-ring-segments" cx="${centerX}" cy="${centerY}" r="${radius}" stroke="rgba(0,0,0,0.12)" stroke-dasharray="${segmentDash}"></circle>
                <circle class="ratio-ring-pass" cx="${centerX}" cy="${centerY}" r="${radius}"
                    stroke-dasharray="${ringCirc}"
                    stroke-dashoffset="${ringCirc}">
                    <animate attributeName="stroke-dashoffset" from="${ringCirc}" to="${passOffset}" dur="1.2s" fill="freeze" />
                </circle>
                <circle class="ratio-ring-fail" cx="${centerX}" cy="${centerY}" r="${radius}"
                    stroke-dasharray="${ringCirc}"
                    stroke-dashoffset="${ringCirc}">
                    <animate attributeName="stroke-dashoffset" from="${ringCirc}" to="${failOffset}" dur="1.2s" fill="freeze" />
                </circle>
                <circle class="ratio-ring-sweep" cx="${centerX}" cy="${centerY}" r="${radius}" stroke="url(#ratioSweep)" stroke-dasharray="${ringCirc * 0.12} ${ringCirc}">
                    <animateTransform attributeName="transform" attributeType="XML" type="rotate" from="0 ${centerX} ${centerY}" to="360 ${centerX} ${centerY}" dur="4s" repeatCount="indefinite" />
                </circle>
                <text class="ratio-center-label" x="${centerX}" y="${centerY - 12}" text-anchor="middle">PASS</text>
                <text class="ratio-center-value" x="${centerX}" y="${centerY + 18}" text-anchor="middle">${passratio.toFixed(0)}%</text>
                </svg>
            </div>
            <div class="project-list" aria-label="Projects list">
                <div class="project-list-title">Projects</div>
                <ul>
                    ${listItems.join("")}
                </ul>
            </div>
        </div>
    </section>
    `

    let backBtn = document.getElementById("graph-back")
    if (backBtn) {
        backBtn.addEventListener("click", () => {
            main.innerHTML = ``
        })
    }
}
