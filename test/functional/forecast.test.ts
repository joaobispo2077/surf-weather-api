import { Beach, BeachPosition } from '@src/models/beach';
import stormGlassWeather3HoursFixture from '@test/fixtures/stormglass_weather_3_hours.json';
import apiForecastResponse1BeachFixture from '@test/fixtures/api_forecast_response_1_beach.json';
import nock from 'nock';

describe('Beach foreacst functional tests', () => {
	beforeAll(async () => {
		await Beach.deleteMany({});
		const defaultBeach = {
			lat: -33.792726,
			lng: 151.289824,
			name: 'Manly',
			position: BeachPosition.E,
		};

		const beach = new Beach(defaultBeach);
		await beach.save();
	});

	it('should return a forecast with just a few times', async () => {
		nock('https://api.stormglass.io:443', {
			encodedQueryParams: true,
			reqheaders: {
				Authorization: (): boolean => true,
			},
		})
			.defaultReplyHeaders({ 'Access-Control-Allow-Origin': '*' })
			.get('/v2/weather/point')
			.query({
				lat: '-33.792726',
				lng: '151.289824',
				params: /(.*)/,
				source: 'noaa',
			})
			.reply(200, stormGlassWeather3HoursFixture);

		const { body, status } = await global.testRequest.get('/forecast');
		expect(status).toBe(200);
		expect(body).toEqual(apiForecastResponse1BeachFixture);
	});
});
