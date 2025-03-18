import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';

const app = express();
const REGION = 'europe';
const API_KEY = process.env.API_KEY;

app.use(cors());

// Маршрут для отримання PUUID за gameName та tagLine
app.get('/getPUUID', async (req, res) => {
  const { gameName, tagLine } = req.query;

  if (!gameName || !tagLine) {
    return res.status(400).json({ error: 'Missing gameName or tagLine' });
  }

  const url = `https://${REGION}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${gameName}/${tagLine}`;

  try {
    const response = await fetch(url, {
      headers: {
        'X-Riot-Token': API_KEY
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res
        .status(response.status)
        .json({ error: 'Помилка при отриманні PUUID', details: errorText });
    }

    const data = await response.json();
    if (!data || !data.puuid) {
      return res.status(404).json({ error: 'PUUID не знайдено', details: data });
    }
    res.json({ puuid: data.puuid });
  } catch (error) {
    console.error('Error in /getPUUID:', error);
    res.status(500).json({ error: 'Серверна помилка', details: error.message });
  }
});

// Функція для отримання історії матчів
async function getMatchHistory(puuid) {
  const url = `https://${REGION}.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?count=10`;
  try {
    const response = await fetch(url, {
      headers: { 'X-Riot-Token': API_KEY }
    });
    if (!response.ok) {
      console.error(`Failed to get match history for puuid ${puuid}: ${response.status}`);
      return null;
    }
    return await response.json();
  } catch (error) {
    console.error('Error in getMatchHistory:', error);
    return null;
  }
}

// Функція для отримання статистики конкретного матчу
async function getMatchStats(matchId, puuid) {
  const url = `https://${REGION}.api.riotgames.com/lol/match/v5/matches/${matchId}`;
  try {
    const response = await fetch(url, {
      headers: { 'X-Riot-Token': API_KEY }
    });
    if (!response.ok) {
      console.error(`Failed to get match stats for match ${matchId}: ${response.status}`);
      return null;
    }
    const matchData = await response.json();
    if (!matchData || !matchData.info || !Array.isArray(matchData.info.participants)) {
      console.error(`Invalid match data for match ${matchId}:`, matchData);
      return null;
    }
    // Знаходимо дані гравця за PUUID
    const playerData = matchData.info.participants.find(p => p.puuid === puuid);
    return playerData
      ? {
          champion: playerData.championName,
          kills: playerData.kills,
          deaths: playerData.deaths,
          assists: playerData.assists,
          win: playerData.win
        }
      : null;
  } catch (error) {
    console.error('Error in getMatchStats:', error);
    return null;
  }
}

// Функція для отримання інформації про суммонера (рівень тощо)
async function getSummonerLevel(puuid) {
  const url = `https://euw1.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}`;
  try {
    const response = await fetch(url, {
      headers: { 'X-Riot-Token': API_KEY }
    });
    if (!response.ok) {
      console.error(`Failed to get summoner info for puuid ${puuid}: ${response.status}`);
      return null;
    }
    return await response.json();
  } catch (error) {
    console.error('Error in getSummonerLevel:', error);
    return null;
  }
}

// Функція для отримання рангової статистики
async function getRankedStats(summonerId) {
  const url = `https://euw1.api.riotgames.com/lol/league/v4/entries/by-summoner/${summonerId}`;
  try {
    const response = await fetch(url, {
      headers: { 'X-Riot-Token': API_KEY }
    });
    if (!response.ok) {
      console.error(`Failed to get ranked stats for summonerId ${summonerId}: ${response.status}`);
      return null;
    }
    return await response.json();
  } catch (error) {
    console.error('Error in getRankedStats:', error);
    return null;
  }
}

// Маршрут для отримання статистики гравця
app.get('/playerStats', async (req, res) => {
  const { puuid } = req.query;
  if (!puuid) return res.status(400).json({ error: 'Missing PUUID' });

  try {
    const matchHistory = await getMatchHistory(puuid);
    if (!matchHistory) return res.status(500).json({ error: 'Failed to get match history' });

    const matchStatsPromises = matchHistory.map(matchId => getMatchStats(matchId, puuid));
    const matchStatsResults = await Promise.all(matchStatsPromises);
    // Фільтруємо результати, щоб видалити невдалий запит
    const matchStats = matchStatsResults.filter(m => m !== null);

    if (matchStats.length === 0) {
      return res.status(404).json({ error: 'No valid match stats found' });
    }

    const wins = matchStats.filter(m => m.win).length;
    const losses = matchStats.length - wins;
    const totalKills = matchStats.reduce((acc, m) => acc + m.kills, 0);
    const totalDeaths = matchStats.reduce((acc, m) => acc + m.deaths, 0);
    const totalAssists = matchStats.reduce((acc, m) => acc + m.assists, 0);
    const kda = (totalKills + totalAssists) / Math.max(1, totalDeaths);

    // Підрахунок ігор на кожному чемпіоні
    const championCounts = {};
    matchStats.forEach(m => {
      if (m.champion) {
        championCounts[m.champion] = (championCounts[m.champion] || 0) + 1;
      }
    });

    const topChampion = Object.keys(championCounts).reduce(
      (a, b) => (championCounts[a] > championCounts[b] ? a : b),
      null
    );

    const summonerInfo = await getSummonerLevel(puuid);
    if (!summonerInfo) return res.status(500).json({ error: 'Failed to get summoner info' });
    const rankedInfo = await getRankedStats(summonerInfo.id);

    res.json({
      kda: kda.toFixed(2),
      wins,
      losses,
      level: summonerInfo.summonerLevel,
      topChampion,
      rankedInfo
    });
  } catch (error) {
    console.error('Error in /playerStats:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// Якщо запущено локально, стартуємо сервер.
// На Vercel цей файл буде експортуватися як серверна функція.
if (process.env.NODE_ENV !== 'vercel') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`✅ Сервер працює на http://localhost:${PORT}`);
  });
}

export default app;
