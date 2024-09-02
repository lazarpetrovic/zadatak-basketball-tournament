class Team {
  constructor(name, isoCode, fibaRanking, groupName) {
    this.name = name;
    this.isoCode = isoCode;
    this.fibaRanking = fibaRanking;
    this.groupName = groupName;
    this.points = 0;
    this.wins = 0;
    this.losses = 0;
    this.scoredPoints = 0;
    this.receivedPoints = 0;
    this.pointDifference = 0;
    this.form = 0;
  }

  getName() {
    return this.name;
  }

  getISOCode() {
    return this.isoCode;
  }

  getFIBARanking() {
    return this.fibaRanking;
  }

  getPoints() {
    return this.points;
  }

  updateStatus(scoredPoints, receivedPoints) {
    this.scoredPoints += scoredPoints;
    this.receivedPoints += receivedPoints;
    this.pointDifference += scoredPoints - receivedPoints;

    if (scoredPoints > receivedPoints) {
      this.points += 2;
      this.wins += 1;
    } else if (scoredPoints < receivedPoints) {
      this.points += 1;
      this.losses += 1;
    }
  }

  updateForm(teamAResult, teamBResult) {
    const pointDifference = teamAResult - teamBResult;
    const opponentStrength = this.getOpponentStrength();

    this.form += pointDifference + opponentStrength / 100;

    return this.form;
  }
}

module.exports = Team;
