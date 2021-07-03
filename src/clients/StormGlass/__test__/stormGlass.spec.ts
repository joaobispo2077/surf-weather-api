import { StormGlass } from '@src/clients/StormGlass';
import * as HTTPUtil from '@src/util/request';

import stormGlassWeather3HoursFixture from '@test/fixtures/stormglass_weather_3_hours.json';
import stormGlassNormalized3HoursFixture from '@test/fixtures/stormglass_normalized_response_3_hours.json';

jest.mock('@src/util/request');

describe('StormGlass Client', () => {
	const mockedRequestClass = HTTPUtil.Request as jest.Mocked<
		typeof HTTPUtil.Request
	>;
	const mockedRequest = new HTTPUtil.Request() as jest.Mocked<HTTPUtil.Request>;

	it('should return the normalized forecast from the StormGlass service', async () => {
		const lat = -33.7927554;
		const lng = 151.232545;

		mockedRequest.get.mockResolvedValue({
			data: stormGlassWeather3HoursFixture,
		} as HTTPUtil.Response);

		const stormGlass = new StormGlass(mockedRequest);

		const response = await stormGlass.fetchPoints(lat, lng);
		expect(response).toEqual(stormGlassNormalized3HoursFixture);
	});

	it('should exclude incomplete data points', async () => {
		const lat = -33.7927554;
		const lng = 151.232545;

		const incompleteResponse = {
			hours: [
				{
					windDirection: {
						nooa: 300,
					},
					time: '2020-04-26T00:00:00+00:00',
				},
			],
		};

		mockedRequest.get.mockResolvedValue({
			data: incompleteResponse,
		} as HTTPUtil.Response);

		const stormGlass = new StormGlass(mockedRequest);
		const response = await stormGlass.fetchPoints(lat, lng);

		expect(response).toEqual([]);
	});

	it('should get a generic error form StormGlass service when the request fail before reaching the service', async () => {
		const lat = -33.7927554;
		const lng = 151.232545;

		mockedRequest.get.mockRejectedValue({ message: 'Network Error' });

		const stormGlass = new StormGlass(mockedRequest);

		await expect(stormGlass.fetchPoints(lat, lng)).rejects.toThrow(
			'Unexpected error when trying to comunicate to StormGlass: Network Error',
		);
	});

	it('should get an StormGlassResponseError when the StormGlass service responds with error', async () => {
		const lat = -33.7927554;
		const lng = 151.232545;

		mockedRequestClass.isRequestError.mockReturnValue(true);
		mockedRequest.get.mockRejectedValue({
			response: {
				status: 429,
				data: { errors: ['Rate Limit reached'] },
			},
		});

		const stormGlass = new StormGlass(mockedRequest);

		await expect(stormGlass.fetchPoints(lat, lng)).rejects.toThrow(
			'Unexpected error when trying to comunicate to StormGlass: Error: {"errors":["Rate Limit reached"]} Code: 429',
		);
	});
});
