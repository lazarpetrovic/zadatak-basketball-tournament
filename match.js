class Match {
  constructor(teamA, teamB) {
    this.teamA = teamA; //team
    this.teamB = teamB; //opponent
    this.finalScore = "";
  }

  generateRandomScore = function () {
    const teamARanking = this.teamA.getFIBARanking();
    const teamAForm = this.teamA.form || 0;
    const opponentBRanking = this.teamB.getFIBARanking();
    const opponentBForm = this.teamB.form || 0;

    const averageScore = 90;

    const baseScoreTeamA = averageScore + Math.random() * 20 - 10;
    const baseScoreTeamB = averageScore + Math.random() * 20 - 10;

    //rezultat sa uticajem rangiranja
    const rankingDifference = opponentBRanking - teamARanking;
    const rankingAdjustmentTeamA = rankingDifference * 0.1; // Smanjeni uticaj
    const rankingAdjustmentTeamB = -rankingDifference * 0.1;

    //rezultat sa uticajem forme
    const formDifference = teamAForm - opponentBForm;
    const formAdjustmentTeamA = formDifference * 0.1; // Smanjeni uticaj
    const formAdjustmentTeamB = -formDifference * 0.1;

    let finalPointsTeamA = Math.round(
      baseScoreTeamA + rankingAdjustmentTeamA + formAdjustmentTeamA
    );
    let finalPointsTeamB = Math.round(
      baseScoreTeamB + rankingAdjustmentTeamB + formAdjustmentTeamB
    );

    //da ne ide rezultat ispod 50 a ne preko 120
    finalPointsTeamA = Math.max(50, Math.min(120, finalPointsTeamA));
    finalPointsTeamB = Math.max(50, Math.min(120, finalPointsTeamB));

    this.finalScore = finalPointsTeamA + "-" + finalPointsTeamB;

    return this.finalScore;
  };
}

module.exports = Match;
