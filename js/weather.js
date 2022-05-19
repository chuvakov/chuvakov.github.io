$(function () {
	document.querySelectorAll('.form-outline').forEach((formOutline) => {
		new mdb.Input(formOutline).init();
	});

	let wetherNames = new Map([
		['Thunderstorm', 'Гроза'],
		['Drizzle', 'Моросит'],
		['Rain', 'Дождь'],
		['Snow', 'Снег'],
		['Mist', 'Туман'],
		['Smoke', 'Дым'],
		['Haze', 'Туман'],
		['Dust', 'Пыль'],
		['Fog', 'Туманость'],
		['Clear', 'Ясно'],
		['Clouds', 'Облачно'],
	]);

	var url = 'https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/address';
	var token = '722f97d320f6b6271757ee22f84394b046f739b5';

	var options = {
		headers: {
			'Content-Type': 'application/json',
			Accept: 'application/json',
			Authorization: 'Token ' + token,
		},
	};

	// initWeather({
	// 	text: 'Москва',
	// 	lat: 55.7483,
	// 	lon: 37.6171,
	// });

	function getTime(unixTime) {
		// Create a new JavaScript Date object based on the timestamp
		// multiplied by 1000 so that the argument is in milliseconds, not seconds.
		var date = new Date(unixTime * 1000);
		// Hours part from the timestamp
		var hours = date.getHours();
		// Minutes part from the timestamp
		var minutes = '0' + date.getMinutes();

		// Will display time in 10:30:23 format
		var formattedTime = hours + ':' + minutes.substr(-2);

		return formattedTime;
	}

	let addressSelect = $('#select-address')
		.select2({
			width: '100%',
			placeholder: 'Адресс',
			allowClear: true,
			ajax: {
				transport: (data, success, failure) => {
					let params = data.data;
					let maxResultCount = 30;

					params.page = params.page || 1;

					let filter = {};
					filter.skipCount = (params.page - 1) * maxResultCount;

					axios
						.post(url, { query: params.term, count: maxResultCount }, options)
						.then(function (response) {
							// обработка успешного запроса
							let data = response.data;
							console.log(response);
							success({
								results: data.suggestions.map((item) => {
									return {
										id: item.value,
										text: item.value,
										lat: item.data.geo_lat,
										lon: item.data.geo_lon,
									};
								}),
								pagination: {
									more: params.page * maxResultCount < maxResultCount,
								},
							});
						})
						.catch(function (error) {
							// обработка ошибки
							console.log(error);
						})
						.then(function () {
							// выполняется всегда
						});
				},
				cache: true,
			},
			templateResult: (data) => data.text,
			templateSelection: (data) => data.text,
		})
		.on('select2:select', function (e) {
			let data = e.params.data;
			initWeather(data);

			//Добавление в куки выбранного адреса!!!
			let currentLocation = $('#select-address').text();
			$.cookie('nameCity', currentLocation);
		});

	function initWeather(geo) {
		$('#weather-city').text(geo.text);

		axios
			.get('https://api.openweathermap.org/data/2.5/weather', {
				params: {
					lat: geo.lat,
					lon: geo.lon,
					appid: '2f314e0a2465820a76202a9ed015f4de',
					units: 'metric',
				},
			})
			.then(function (response) {
				// обработка успешного запроса
				let data = response.data;
				$('#weather-img').attr('src', `http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`);
				console.log(data);
				$('#weather-name').text(wetherNames.get(data.weather[0].main));
				$('#weather-temp').text(data.main.temp);
				$('#weather-wind').text(data.wind.speed);
				$('#weather-time').text(getTime(data.dt));
				$('#weather-water').text(data.main.humidity);

				// добавляю в куки координаты выбранной локации!!!
				$.cookie('lat', data.coord.lat);
				$.cookie('lon', data.coord.lon);
			})
			.catch(function (error) {
				// обработка ошибки
				console.log(error);
			})
			.then(function () {
				// выполняется всегда
			});
	}

	//Инициализация куки с координатами сохраненной локации и наименованием!!!
	initWeather({
		//text: $.cookie('nameCity'),
		lat: $.cookie('lat'),
		lon: $.cookie('lon'),
		text: $.cookie('nameCity'),
	});
});
