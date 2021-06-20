import { StormGlass } from '@src/clients/StormGlass';

describe('StormGlass Client', () => {
  it('should return the normalized forecast from the StormGlass service', async () => {
    const lat = -33.7927554;
    const lng = 151.232545;

    const stormGlass = new StormGlass();
    const response = await stormGlass.fetchPoints(lat, lng);
    expect(response).toEqual({});
  });
});
