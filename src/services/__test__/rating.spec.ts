// wave size, sweeper interval, wave height, wave period.

import { Beach, BeachPosition } from '@src/models/beach';
import { Rating } from '../rating';

describe('Rating service', () => {
	const defaultBeach: Beach = {
		lat: -33.792726,
		lng: 151.268066,
		name: 'Manly',
		position: BeachPosition.E,
		user: 'some-user',
	};

	const defaultRating = new Rating(defaultBeach);

	describe('Calculate rating for a give point', () => {
		// TODO:
	});

	describe('Get rating based on wind and wave position', () => {
		it('should get rating 1 for a beach with onshore winds', () => {
			const rating = defaultRating.getRatingBasedOnWindAndWavePosition(
				BeachPosition.E,
				BeachPosition.E,
			);

			expect(rating).toBe(1);
		});

		it('should get rating 3 for a beach with cross winds', () => {
			const rating = defaultRating.getRatingBasedOnWindAndWavePosition(
				BeachPosition.E,
				BeachPosition.S,
			);

			expect(rating).toBe(3);
		});

		it('should get rating 5 for a beach with offshore', () => {
			const rating = defaultRating.getRatingBasedOnWindAndWavePosition(
				BeachPosition.E,
				BeachPosition.W,
			);

			expect(rating).toBe(5);
		});
	});

	describe('Get rating based on swell period', () => {
		it('should get a rating of 1 for period of 5 seconds', () => {
			const rating = defaultRating.getRatingForSwellPeriod(5);
			expect(rating).toBe(1);
		});

		it('should get a rating of 2 for period of 9 seconds', () => {
			const rating = defaultRating.getRatingForSwellPeriod(9);
			expect(rating).toBe(2);
		});

		it('should get a rating of 4 for period of 12 seconds', () => {
			const rating = defaultRating.getRatingForSwellPeriod(12);
			expect(rating).toBe(4);
		});

		it('should get a rating of 5 for period of 16 seconds', () => {
			const rating = defaultRating.getRatingForSwellPeriod(16);
			expect(rating).toBe(5);
		});
	});
});
