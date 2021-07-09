import AuthService from '@src/services/auth';
import { authMiddleware } from '../auth';

describe('Auth middleware', () => {
	it('should verify a JWT token and call the next middleware', async () => {
		const jwtToken = AuthService.generateToken({ data: 'fake-data' });

		const requestFake = {
			headers: {
				'x-access-token': jwtToken,
			},
		};

		const responseFake = {};

		const nextFake = jest.fn();

		authMiddleware(requestFake, responseFake, nextFake);

		expect(nextFake).toHaveBeenCalled();
	});
});
