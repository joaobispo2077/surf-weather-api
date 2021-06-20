import axios from 'axios';
import { StormGlass } from '@src/clients/StormGlass';

import stormGlassWeather3HoursFixture from '@test/fixtures/stormglass_weather_3_hours.json';
import stormGlassNormalized3HoursFixture from '@test/fixtures/stormglass_normalized_response_3_hours.json';
jest.mock('axios');

describe('StormGlass Client', () => {
  it('should return the normalized forecast from the StormGlass service', async () => {
    const lat = -33.7927554;
    const lng = 151.232545;

    axios.get = jest.fn().mockResolvedValue(stormGlassWeather3HoursFixture);

    const stormGlass = new StormGlass(axios);

    const response = await stormGlass.fetchPoints(lat, lng);
    expect(response).toEqual(stormGlassNormalized3HoursFixture);
  });
});
