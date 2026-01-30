let profile = `query {
  user {
    login
    auditRatio
    lastName
	firstName
    xps(
      where: {
        _or: [
          { originEventId: { _eq: 763 } }
          {
            path: {
              _like: "/bahrain/bh-module/piscine-%"
              _nlike: "/bahrain/bh-module/piscine-%/%"
            }
          }
        ]
      }
    ) {
      amount
    }
  }
}
`

let graph1 = `query {
user {
    xps(
      where: {_or: [{originEventId: {_eq: 763}}, {path: {_like: "/bahrain/bh-module/piscine-%", _nlike: "/bahrain/bh-module/piscine-%/%"}}]}
    ) {
      amount
      event {
        createdAt
      }
    }
  }
}`

let graph2 = `query {
  result(
    where: { object: { type: { _eq: "project" } } }
  ) {
    grade
    object {
      name
    }
  }
}
`

export function getGQL(q = 0) {
    let Query = profile 
    if (q === 1) {
        Query = graph1
    } else if (q === 2) {
        Query = graph2
    }
    let token = localStorage.getItem("jwt")
    if (!token) {
        window.location.href = "index.html"
        return
    }
    token = token.trim().replace(/^"|"$/g, "")
    return fetch(`https://learn.reboot01.com/api/graphql-engine/v1/graphql`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
            query: Query
        })
    }).then(data => {
        return data.json();
    }).catch((err) => {
        console.log(err)
    })
}
