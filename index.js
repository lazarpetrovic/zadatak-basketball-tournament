const groups = require("./data/groups.json");
const exibitions = require("./data/exibitions.json");
const Team = require("./team");
const Match = require("./match");

//NAPOMENA: nazalost nisam stigao da pronadjem idealno resenje za ukrstanje parova da nisu igrali u istoj grupi.
//ukoliko kod izbaci gresku i ako pukne program, pokrenite ga jos jednom ili dva puta da bi se odigrale nove utakmice
//, sortiralo sve iznova itd, rankiralo

const teamsObj = {};

for (const groupName in groups) {
  const group = groups[groupName];
  createTeamObjects(group, groupName);
}

function calculateTeamForm(isoCode, exibitions) {
  const teamResults = exibitions[isoCode];

  if (!teamResults) return 0;

  let totalPoints = 0;

  for (const match of teamResults) {
    const [teamScore, opponentScore] = match.Result.split("-").map(Number);
    const pointDifference = teamScore - opponentScore;

    totalPoints += pointDifference;
  }

  return totalPoints / teamResults.length;
}

//pravljenje objekata TEAM
function createTeamObjects(group, groupName) {
  const groupProm = [];

  for (let i = 0; i < group.length; i++) {
    const teamCode = group[i].ISOCode;
    const form = calculateTeamForm(teamCode, exibitions);
    const team = new Team(
      group[i].Team,
      group[i].ISOCode,
      group[i].FIBARanking,
      groupName
    );

    team.form = form;

    groupProm.push(team);
  }
  teamsObj[groupName] = groupProm;

  playMatch(groupProm, groupName);

  return teamsObj;
}

//eliminaciona faza za timove po grupama gde svako u grupi sa svakim igra utakmicu
function playMatch(groupTeams) {
  const allMatchesObj = {};
  const matches = [];

  for (let i = 0; i < groupTeams.length; i++) {
    for (let j = i + 1; j < groupTeams.length; j++) {
      const match = new Match(groupTeams[i], groupTeams[j]);
      const [teamAResult, teamBResult] = match
        .generateRandomScore()
        .split("-")
        .map(Number);

      groupTeams[i].updateStatus(teamAResult, teamBResult);
      groupTeams[j].updateStatus(teamBResult, teamAResult);

      matches.push({
        teamA: groupTeams[i],
        teamB: groupTeams[j],
        scoreA: teamAResult,
        scoreB: teamBResult,
      });

      groupTeams[i].updateForm(teamAResult, teamBResult);
      groupTeams[j].updateForm(teamBResult, teamAResult);

      //matches.filter((match) => match.teamA.groupName === groupName);
    }
  }
  //allMatchesObj[groupName] = matches;
  return matches;
}

function sortTeams(teams) {
  return teams.sort((a, b) => {
    if (a.points !== b.points) {
      return b.points - a.points;
    }

    const pointDiffA = a.scoredPoitns - b.scoredPoints;
    const pointDiffB = b.scoredPoints - a.scoredPoints;

    if (a.pointDifference !== b.pointDifference)
      return b.pointDifference - a.pointDifference;

    return b.scoredPoints - a.scoredPoints;
  });
}

function rankTeams() {
  const firstPlaces = [];
  const secondPlaces = [];
  const thirdPlaces = [];
  const rankedTeams = [];

  Object.keys(groups).forEach((group) => {
    const teams = Object.values(teamsObj[group]);
    const sorted = sortTeams(teams);

    firstPlaces.push(teams[0]);
    secondPlaces.push(teams[1]);
    thirdPlaces.push(teams[2]);
  });

  sortTeams(firstPlaces);
  sortTeams(secondPlaces);
  sortTeams(thirdPlaces);

  rankedTeams.push(...firstPlaces, ...secondPlaces, ...thirdPlaces);

  console.log(
    "Prikaz 8 timova koji idu dalje i njihovih rezultata: bodovi/pobede/porazi/datiPoeni/primljeniPoeni/kosRazlika "
  );
  rankedTeams.forEach((element, index) => {
    index === 8
      ? console.log(
          `${index + 1}. Tim pod imenom ${
            element.name
          } nazalost ne prolazi dalje.`
        )
      : console.log(
          `${index + 1}. ${element.name} (Grupa: ${element.groupName})     ${
            element.points
          } / ${element.wins} / ${element.losses} / ${element.scoredPoints} / ${
            element.receivedPoints
          } / ${element.pointDifference}`
        );
  });

  return rankedTeams.slice(0, 8);
}

//random mesanje timova kako bi se smanjile sanse da budu timovi odabrani iz iste grupe
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function randomPair(hatA, hatB) {
  const pairs = [];
  const usedIndexesB = new Set(); //Pracenje koje smo indekse koristili za hatB

  shuffle(hatA);
  shuffle(hatB);

  for (const teamA of hatA) {
    let paired = false;
    for (let j = 0; j < hatB.length; j++) {
      const teamB = hatB[j];

      //provera da li smo nekoga vec iz hatB koristili i da li im se poklapaju grupe u kojima su igrali za eliminaciju
      if (!usedIndexesB.has(j) && teamA.groupName !== teamB.groupName) {
        pairs.push([teamA, teamB]);
        usedIndexesB.add(j); // Mark this teamB as used
        paired = true;
        break;
      }
    }

    if (!paired) {
      console.error(
        `Nije pronadjen odgovarajuci tim za tim ${teamA.name}. Pokusajte ponovo.`
      );
    }
  }

  return pairs;
}

//funkcija kojoj se prosledjuje niz u kojem su dva tima koja treba da igraju mec, za izlaz daje informacije o ta dva tima
//ko je pobedio i njihove rezultate zbog dalje obrade i prikaza podataka u konzoli
function matchToPlay(match) {
  const mec = new Match(match[0], match[1]);
  const [resultA, resultB] = mec.generateRandomScore().split("-").map(Number);

  const matchObj = {
    teamA: match[0],
    teamB: match[1],
    resultA: resultA,
    resultB: resultB,
    winner: resultA > resultB ? match[0] : match[1],
    losser: resultB > resultA ? match[0] : match[1],
  };

  return matchObj;
}

function zreb(teamsForZreb) {
  const hats = {
    D: teamsForZreb.slice(0, 2),
    E: teamsForZreb.slice(2, 4),
    F: teamsForZreb.slice(4, 6),
    G: teamsForZreb.slice(6, 8),
  };

  const quarterMatchesToPlay1 = randomPair(hats.D, hats.G);
  const quarterMatchesToPlay2 = randomPair(hats.E, hats.F);

  console.log(
    "\n-U cetvrt finalu su se igrale sledece utakmice, pobednici ovih utakmica ce se boriti za polu finale:"
  );

  const finals1 = forSemiFinals(quarterMatchesToPlay1);
  const finals2 = forSemiFinals(quarterMatchesToPlay2);

  const finalisti = [finals1, finals2];

  console.log(
    "\n -U polu finalu su se igrale sledece utakmice, pobednici ovih utakmica ce se boriti u finalu:"
  );

  const finalResult = semiFinalsAndFinals(finalisti);

  return finalResult;
}

//igranje meceva za prolazak u polu finale
function forSemiFinals(quarterMatches) {
  const teamsForSemiFinals = [];
  quarterMatches.forEach((match) => {
    const matchSemi = matchToPlay(match);

    console.log(
      `---${matchSemi.teamA.name} protiv ${matchSemi.teamB.name} (rez: ${matchSemi.resultA}-${matchSemi.resultB}) -> pobednik je ${matchSemi.winner.name} i oni se bore za polu finale.`
    );

    teamsForSemiFinals.push(matchSemi.winner);
  });
  return teamsForSemiFinals;
}

//igraju 4 tima, prvi parovi igraju za finale, gubitnici iz te dve utakmice igraju za 3. i 4. mesto
function semiFinalsAndFinals(finalisti) {
  const finalsMatch = [];
  const thirdPlaceMatch = [];

  finalisti.forEach((match) => {
    const matchPlaying = matchToPlay(match);

    console.log(
      `---${matchPlaying.teamA.name} protiv ${matchPlaying.teamB.name} (rez: ${matchPlaying.resultA}-${matchPlaying.resultB}) -> pobednik je ${matchPlaying.winner.name} i oni se bore u finalu.`
    );

    finalsMatch.push(matchPlaying.winner);
    thirdPlaceMatch.push(matchPlaying.losser);
  });

  let goldMedal;
  let silverMedal;
  let bronzeMedal;
  let fourthPlace;

  const bronzeMedalMatch = new Match(thirdPlaceMatch[0], thirdPlaceMatch[1]);
  const [resA, resB] = bronzeMedalMatch
    .generateRandomScore()
    .split("-")
    .map(Number);

  if (resA > resB) {
    bronzeMedal = thirdPlaceMatch[0];
  }

  const finaleMatch = matchToPlay(finalsMatch);

  goldMedal = finaleMatch.winner;
  silverMedal = finaleMatch.losser;

  console.log(
    `-Finalni mec se zavrsio: ${finaleMatch.teamA.name} protiv ${finaleMatch.teamB.name} rezultatom ${finaleMatch.resultA}-${finaleMatch.resultB} .`
  );

  console.log(`---*Zlatnu medalju osvaja*: ${goldMedal.name}`);
  console.log(`---**Srebrnu medalju osvaja**: ${silverMedal.name}`);
  console.log(`---***Bronzanu medalju osvaja***: ${bronzeMedal.name}`);
}

zreb(rankTeams());
