const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const LeagueJS = require('./node_modules/leaguejs/lib/LeagueJS.js');
const leagueJs = new LeagueJS(process.env.serverKey || "RGAPI-1ed1c7d5-6c69-4630-90ce-b01cc112ef34", {PLATFORM_ID: 'BR1'})
process.env.LEAGUE_API_PLATFORM_ID = 'BR1';

const path = require('path');
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});


app.get('/summoner/:name', async (req, res) => {
  try {
    console.log("Executando...")
    const summonerData = await leagueJs.Summoner.gettingByName(req.params.name);
    const matchesAndExercises = await getMatchesAndExercises(summonerData.puuid);
    
    res.send({summonerData, matchesAndExercises});
    resetExercises();
  } catch (error) {
    console.error(error);
    res.status(500).send('An error occurred.');
  }
});

async function getSummonerMatchByPuuid(summonerPuuid) {
  // 7 days in milliseconds
  const oneWeekAgo = Math.floor((Date.now() - 7 * 24 * 60 * 60 * 1000) / 1000);  // Convert to seconds

  const now = Math.floor(Date.now() / 1000);  // Convert to seconds

  const options = {
    queue: 420,
    startTime: oneWeekAgo,
    endTime: now,
  };
  
  try {
    const matchInfo = await leagueJs.Match
      .gettingMatchIdsByPuuid(summonerPuuid, options);
      
    return matchInfo.slice(0, 10);
  } catch (err) {
    console.log(err);
  }
}

async function getMatchesAndExercises(puuid) {
  return await getSummonerMatchByPuuid(puuid)
    .then(matches => getExercises(matches, puuid))
    .then(exercises => {
      return exercises;
    });
}

function getMatchesInfoByMatchId(matchId) {
  return leagueJs.Match
    .gettingById(matchId)
    .then(matchInfo => matchInfo)
    .catch(console.log);
}

async function getUserMatchInfoUsingPuuid(summonerPuuid, matchData) {
  return matchData.info.participants
  .filter(participant => participant.puuid === summonerPuuid)
  .map(participant => participant);
}

function getEnemyMatchInfoUsingPuuid(enemyRole, summonerPuuid, matchData) {
  return matchData.info.participants
  .filter(participant => participant.puuid !== summonerPuuid && participant.individualPosition === enemyRole)
  .map(participant => participant);
}

totalPushUps = 0;
totalSquats = 0;
async function getExercises(matchess, puuid) {
  let exercises = [];
  for (let element of matchess) {
    try {
      let matchData = await getMatchesInfoByMatchId(element);
      let participantData = await getUserMatchInfoUsingPuuid(puuid, matchData);
      let enemyMatchInfo = getEnemyMatchInfoUsingPuuid(participantData[0].individualPosition, puuid, matchData);
      
      totalPushUps += (getPushUps(participantData[0]));
      totalSquats += (getSquat(participantData[0], enemyMatchInfo[0]));
      
      
    } catch (error) {
      console.error(error);
    }
  }
  exercises.push(totalPushUps);
  exercises.push(totalSquats);
  return exercises;
}

function resetExercises(){
  totalPushUps = 0;
  totalSquats = 0;
}

function getSquat(participantData, enemyData) {
  if(participantData.totalMinionsKilled < enemyData.totalMinionsKilled){
    return Math.round(enemyData.totalMinionsKilled - participantData.totalMinionsKilled);
  }else{
    return 0;
  }
}

function getPushUps(participantData) {
  return Math.round(participantData.deaths);
}


app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});