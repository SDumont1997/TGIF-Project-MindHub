let chamber = "";
if (document.URL.includes("senate")) {
  chamber = "senate";
}
if (document.URL.includes("house")) {
  chamber = "house";
}

let endpoint = `https://api.propublica.org/congress/v1/113/${chamber}/members.json`;
let init = {
  headers: {
    "X-API-Key": "D2aoW3zGtQgRZhQpjzSuDhoQIDZJammdHlFymlEA",
  },
};

let members = [];
let ajaxLoader = document.getElementsByClassName("ajax-loader")

fetch(endpoint, init)
  .then((res) => {
    return res.json();
  })
  .then((data) => {
    members = data.results[0].members;

    let statistics = {
      republicans: [],
      democrats: [],
      independents: [],
      averageVotesWithPartyRepublicans: 0,
      averageVotesWithPartyDemocrats: 0,
      averageVotesWithPartyIndependents: 0,
      averageMissedVotesRepublicans: 0,
      averageMissedVotesDemocrats: 0,
      averageMissedVotesIndependents: 0,
      mostLoyal: [],
      leastLoyal: [],
      mostEngaged: [],
      leastEngaged: [],
    };

    statistics.republicans = members.filter((member) => member.party === "R");
    statistics.democrats = members.filter((member) => member.party === "D");
    statistics.independents = members.filter((member) => member.party === "ID");

    function calculatePartyPct(party, criteria) {
      let totalPct = 0;
      party.forEach((member) => {
        totalPct += member[criteria];
      });
      totalPct /= party.length;
      return totalPct;
    }

    statistics.averageVotesWithPartyRepublicans = parseFloat(
      calculatePartyPct(statistics.republicans, "votes_with_party_pct").toFixed(2)
    );
    statistics.averageVotesWithPartyDemocrats = parseFloat(
      calculatePartyPct(statistics.democrats, "votes_with_party_pct").toFixed(2)
    );
    statistics.averageVotesWithPartyIndependents = parseFloat(
      calculatePartyPct(statistics.independents, "votes_with_party_pct").toFixed(2)
    );
    statistics.averageMissedVotesRepublicans = parseFloat(
      calculatePartyPct(statistics.republicans, "missed_votes_pct").toFixed(2)
    );
    statistics.averageMissedVotesDemocrats = parseFloat(
      calculatePartyPct(statistics.democrats, "missed_votes_pct").toFixed(2)
    );
    statistics.averageMissedVotesIndependents = parseFloat(
      calculatePartyPct(statistics.independents, "missed_votes_pct").toFixed(2)
    );

    function sortMembersBy(array, criteria, order) {
      let sortedMembers;
      if (order.toLowerCase() === "up") {
        sortedMembers = array.sort(function (memberA, memberB) {
          return memberA[criteria] - memberB[criteria];
        });
      } else if (order.toLowerCase() === "down") {
        sortedMembers = array.sort(function (memberA, memberB) {
          return memberB[criteria] - memberA[criteria];
        });
      } else {
        return "Orden Invalido";
      }
      sortedMembers = sortedMembers.filter(member => {
          if(member.total_votes !== 0){
              return member
          }
      })
      return sortedMembers;
    }

    let sortedMembersByLoyaltyUp = [
      ...sortMembersBy(members, "votes_with_party_pct", "up"),
    ];
    let sortedMembersByLoyaltyDown = [
      ...sortMembersBy(members, "votes_with_party_pct", "down"),
    ];
    let sortedMembersByMissedVotesUp = [
      ...sortMembersBy(members, "missed_votes_pct", "up"),
    ];
    let sortedMembersByMissedVotesDown = [
      ...sortMembersBy(members, "missed_votes_pct", "down"),
    ];

    function getTenPct(sortedArray, criteria) {
      let tenPct = [];
      tenPct.push(...sortedArray.slice(0, Math.ceil(sortedArray.length / 10)));
      while (
        tenPct[tenPct.length - 1][criteria] ===
        sortedArray[tenPct.length][criteria]
      ) {
        tenPct.push(sortedArray[tenPct.length]);
      }
      return tenPct;
    }

    statistics.mostLoyal = [
      ...getTenPct(sortedMembersByLoyaltyDown, "votes_with_party_pct"),
    ];
    statistics.leastLoyal = [
      ...getTenPct(sortedMembersByLoyaltyUp, "votes_with_party_pct"),
    ];
    statistics.mostEngaged = [
      ...getTenPct(sortedMembersByMissedVotesUp, "missed_votes_pct"),
    ];
    statistics.leastEngaged = [
      ...getTenPct(sortedMembersByMissedVotesDown, "missed_votes_pct"),
    ];

    if (document.URL.includes("attendance")) {
      let glanceTable = document.getElementById("glance");
      if (statistics.independents.length === 0) {
        glanceTable.innerHTML = `<tr><td>Republican</td><td>${
          statistics.republicans.length
        }</td><td>${
          statistics.averageMissedVotesRepublicans
        }%</td></tr><tr><td>Democratic</td><td>${
          statistics.democrats.length
        }</td><td>${
          statistics.averageMissedVotesDemocrats
        }%</td></tr><tr><td>Independents</td><td>${
          statistics.independents.length
        }</td><td>-</td></tr><tr><td>Total</td><td>${members.length}</td><td>${(
          (statistics.averageMissedVotesRepublicans +
            statistics.averageMissedVotesDemocrats) /
          2
        ).toFixed(2)}%</td></tr>`;
      } else {
        glanceTable.innerHTML = `<tr><td>Republican</td><td>${
          statistics.republicans.length
        }</td><td>${
          statistics.averageMissedVotesRepublicans
        }%</td></tr><tr><td>Democratic</td><td>${
          statistics.democrats.length
        }</td><td>${
          statistics.averageMissedVotesDemocrats
        }%</td></tr><tr><td>Independents</td><td>${
          statistics.independents.length
        }</td><td>${
          statistics.averageMissedVotesIndependents
        }%</td></tr><tr><td>Total</td><td>${members.length}</td><td>${(
          (statistics.averageMissedVotesRepublicans +
            statistics.averageMissedVotesDemocrats +
            statistics.averageMissedVotesIndependents) /
          3
        ).toFixed(2)}%</td></tr>`;
      }

      let leastTable = document.getElementById("bottom-ten");
      statistics.leastEngaged.forEach((member) => {
        if (member.middle_name === null) {
          member.middle_name = "";
        } else {
          member.middle_name = member.middle_name.charAt(0) + ".";
        }
        let row = document.createElement("tr");
        row.innerHTML = `<td><a href="${member.url}">${member.first_name} ${member.middle_name} ${member.last_name}</a></td><td>${member.missed_votes}</td><td>${member.missed_votes_pct}%</td>`;
        leastTable.appendChild(row);
      });

      let mostTable = document.getElementById("top-ten");
      statistics.mostEngaged.forEach((member) => {
        if (member.middle_name === null) {
          member.middle_name = "";
        } else {
          member.middle_name = member.middle_name.charAt(0) + ".";
        }
        let row = document.createElement("tr");
        row.innerHTML = `<td><a href="${member.url}">${member.first_name} ${member.middle_name} ${member.last_name}</a></td><td>${member.missed_votes}</td><td>${member.missed_votes_pct}%</td>`;
        mostTable.appendChild(row);
      });
    }

    if (document.URL.includes("party-loyalty")) {
      let glanceTable = document.getElementById("glance");
      if (statistics.independents.length === 0) {
        glanceTable.innerHTML = `<tr><td>Republican</td><td>${
          statistics.republicans.length
        }</td><td>${
          statistics.averageVotesWithPartyRepublicans
        }%</td></tr><tr><td>Democratic</td><td>${
          statistics.democrats.length
        }</td><td>${
          statistics.averageVotesWithPartyDemocrats
        }%</td></tr><tr><td>Independents</td><td>${
          statistics.independents.length
        }</td><td>-</td></tr><tr><td>Total</td><td>${members.length}</td><td>${(
          (statistics.averageVotesWithPartyRepublicans +
            statistics.averageVotesWithPartyDemocrats) /
          2
        ).toFixed(2)}%</td></tr>`;
      } else {
        glanceTable.innerHTML = `<tr><td>Republican</td><td>${
          statistics.republicans.length
        }</td><td>${
          statistics.averageVotesWithPartyRepublicans
        }%</td></tr><tr><td>Democratic</td><td>${
          statistics.democrats.length
        }</td><td>${
          statistics.averageVotesWithPartyDemocrats
        }%</td></tr><tr><td>Independents</td><td>${
          statistics.independents.length
        }</td><td>${
          statistics.averageVotesWithPartyIndependents
        }%</td></tr><tr><td>Total</td><td>${members.length}</td><td>${(
          (statistics.averageVotesWithPartyRepublicans +
            statistics.averageVotesWithPartyDemocrats +
            statistics.averageVotesWithPartyIndependents) /
          3
        ).toFixed(2)}%</td></tr>`;
      }

      let leastTable = document.getElementById("bottom-ten");
      statistics.leastLoyal.forEach((member) => {
        if (member.middle_name === null) {
          member.middle_name = "";
        } else {
          member.middle_name = member.middle_name.charAt(0) + ".";
        }
        let row = document.createElement("tr");
        row.innerHTML = `<td><a href="${member.url}">${member.first_name} ${
          member.middle_name
        } ${member.last_name}</a></td><td>${Math.floor(
          (member.total_votes * member.votes_with_party_pct) / 100
        )}</td><td>${member.votes_with_party_pct}%</td>`;
        leastTable.appendChild(row);
      });

      let mostTable = document.getElementById("top-ten");
      statistics.mostLoyal.forEach((member) => {
        if (member.middle_name === null) {
          member.middle_name = "";
        } else {
          member.middle_name = member.middle_name.charAt(0) + ".";
        }
        let row = document.createElement("tr");
        row.innerHTML = `<td><a href="${member.url}">${member.first_name} ${
          member.middle_name
        } ${member.last_name}</a></td><td>${Math.floor(
          (member.total_votes * member.votes_with_party_pct) / 100
        )}</td><td>${member.votes_with_party_pct}%</td>`;
        mostTable.appendChild(row);
      });
    }
    ajaxLoader = Array.from(ajaxLoader)
    ajaxLoader.forEach(image=>{
        image.hidden = true
    })
    
  })
  .catch((error) => {
    console.log(error.message);
  });
