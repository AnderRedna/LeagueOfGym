const container = document.querySelector('.container');
const search = document.querySelector('.search-box button');
const playerBox = document.querySelector('.player-infos');
const playerDetails = document.querySelector('.player-details');
const error404 = document.querySelector('.not-found');
const loadingBox = document.querySelector('.loading-box');



search.addEventListener('click', async () => {
	const summonerName = document.querySelector('.search-box input').value;
	if (summonerName === '') {
	  return;
	}

	loadingBox.style.display = 'block'; 
  
	try {
		const response = await fetch(`/summoner/${summonerName}`);
		const summonerInfo = await response.json();
		// const summonerMatch = await getSummonerMatchByPuuid(summonerInfo.puuid).then(matchInfo => console.logo(matchInfo));

		const image = document.querySelector('.player-infos img');
		const name = document.querySelector('.player-infos h1');
		const level = document.querySelector('.player-infos h2');


		name.innerHTML = summonerInfo.summonerData.name;
		level.innerHTML = summonerInfo.summonerData.summonerLevel;
		image.src = `http://ddragon.leagueoflegends.com/cdn/13.8.1/img/profileicon/${summonerInfo.summonerData.profileIconId}.png`;

		if(summonerInfo === 404){
			error404.style.display = 'block';
			error404.classList.add('fadeIn');
			playerBox.style.display = 'none';
			playerDetails.style.display = 'none';
			container.style.height = '300px';
		}

		error404.style.display = 'none';
		error404.classList.remove('fadeIn');
		
		const imageBox = document.querySelector('.player-box img');
		const status = document.querySelector('.player-box .status');

		var totalExercices = summonerInfo.matchesAndExercises[0] + summonerInfo.matchesAndExercises[1];
		if(totalExercices == 0){
			imageBox.src = 'assets/nada.png';
			status.innerHTML = "Parabéns";
		} else if (totalExercices >= 1 && totalExercices <= 40) {
			imageBox.src = 'assets/bom.png';
			status.innerHTML = "Boa!";
		} else if (totalExercices >= 41 && totalExercices <= 100) {
			imageBox.src = 'assets/ruim.png';
			status.innerHTML = "Poderia ser melhor...";
		} else if (totalExercices >= 101 && totalExercices <= 99999) {
			imageBox.src = 'assets/pessimo.png';
			status.innerHTML = "Putz..";
		} else {
			imageBox.src = 'assets/pessimo.png';
			status.innerHTML = "Nyan";
		}


		const playerBox = document.querySelector('.player-box');
		const pushUps = document.querySelector('.player-details .pushUps span');
		const sitUps = document.querySelector('.player-details .sitUps span');

		pushUps.innerHTML = summonerInfo.matchesAndExercises[0];
		sitUps.innerHTML = summonerInfo.matchesAndExercises[1];

		playerBox.style.display = '';
		playerDetails.style.display = '';
		playerBox.classList.add('fadeIn');
		playerDetails.classList.add('fadeIn');
		container.style.height = '590px';

	} catch (error) {
		console.log(error);
	  }finally {
		loadingBox.style.display = 'none';  // Adicione esta linha
	  }
	}
  );
