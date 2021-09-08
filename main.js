let chamber = ""
if(document.URL.includes("senate")){
    chamber = "senate"
}
if(document.URL.includes("house")){
    chamber = "house"
}

let endpoint = `https://api.propublica.org/congress/v1/113/${chamber}/members.json`
let init = {
    headers: {
        "X-API-Key": "D2aoW3zGtQgRZhQpjzSuDhoQIDZJammdHlFymlEA"
    }
}

let members = []
let tableBody = document.getElementById("data-body")
let ajaxLoader = document.getElementsByClassName("ajax-loader")

fetch(endpoint, init)
    .then(res => {
        return res.json()
    })
    .then(data => {
        members = [...data.results[0].members]
        members.forEach(member => {
        if(member.middle_name === null){
        member.middle_name = ""
        }
        let row = document.createElement("tr")
        row.innerHTML = `<td><a href="${member.url}">${member.first_name} ${member.middle_name} ${member.last_name}</a></td><td>${member.party}</td><td>${member.state}</td><td>${member.seniority}</td><td>${member.votes_with_party_pct}%</td>`
        tableBody.appendChild(row)
        })
        ajaxLoader[0].hidden = true
    })
    .catch(error => {console.log(error.message)})



function paintTable(array){
    tableBody.innerHTML = ""
    array.forEach(member => {
        if(member.middle_name === null){
            member.middle_name = ""
        }
        let row = document.createElement("tr")
        row.innerHTML = `<td><a href="${member.url}">${member.first_name} ${member.middle_name} ${member.last_name}</a></td><td>${member.party}</td><td>${member.state}</td><td>${member.seniority}</td><td>${member.votes_with_party_pct}%</td>`
        tableBody.appendChild(row)
    })
    if(tableBody.innerHTML === ""){
        document.getElementById("data").style.display = "none"
        document.getElementById("empty_table_placeholder").style.display = "block"
    } else{
        document.getElementById("data").style.display = "table"
        document.getElementById("empty_table_placeholder").style.display = "none"
    }
}

let checkboxes = document.querySelectorAll("input[type='checkbox']")
let arrayCheckboxes = Array.from(checkboxes)
let activeParties = []
let activeState = ""

arrayCheckboxes.forEach(checkbox=> {
    checkbox.addEventListener("change", function(){
        let checkboxesChecked = arrayCheckboxes.filter(checkbox => checkbox.checked)
        let checkedParties = checkboxesChecked.map(checkbox => {
            return checkbox.value
        })
        activeParties = [...checkedParties]
        let filteredMembers =  members.filter(member => checkedParties.includes(member.party))
        if(checkboxesChecked.length === 0){
            if(activeState === ""){
                paintTable(members)
            }else{
            let membersByState = members.filter(member => activeState === member.state)
            paintTable(membersByState)
            }
        }else{
            if(activeState === ""){
                paintTable(filteredMembers)
            } else{
                let filteredMembersByState = filteredMembers.filter(member => activeState === member.state)
                paintTable(filteredMembersByState)
            }
        }
    })
})


let selector = document.querySelector("select[name='state']")
selector.addEventListener("change", function(event){
    let filteredMembers = members.filter(member => event.target.value === member.state)
    activeState = ""
    activeState = (event.target.value)
    if(event.target.value === ""){
        if(activeParties.length === 0){
            paintTable(members)
        } else {
            let membersByParty = members.filter(member => activeParties.find(party => party === member.party))
            paintTable(membersByParty)
        }
    }else{
        if(activeParties.length === 0){
            paintTable(filteredMembers)
        }else {
            let filteredMembersByParty = filteredMembers.filter(member => activeParties.find(party => party === member.party))
            paintTable(filteredMembersByParty)
        }
    }
})