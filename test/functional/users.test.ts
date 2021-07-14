import { User } from '@src/models/user';
import AuthService from '@src/services/auth';

describe('Users functional tests', () => {
	beforeAll(async () => await User.deleteMany({}));
	describe('When creating a new user', () => {
		it('should create successfully create a new user with encrypted password', async () => {
			const newUser = {
				name: 'John Doe',
				email: 'john@mail.com',
				password: '1234',
			};

			const response = await global.testRequest.post('/users').send(newUser);

			expect(response.status).toBe(201);
			await expect(
				AuthService.comparePasswords(newUser.password, response.body.password),
			).resolves.toBeTruthy();
			expect(response.body).toEqual(
				expect.objectContaining(
					Object.assign({}, newUser, { password: expect.any(String) }),
				),
			);
		});

		it('should return 422 when there is a validation error', async () => {
			const newUser = {
				email: 'john2@mail.com',
				password: '1234',
			};

			const response = await global.testRequest.post('/users').send(newUser);

			expect(response.status).toBe(422);
			expect(response.body).toEqual({
				code: 422,
				error: 'Unprocessable Entity',
				message: 'User validation failed: name: Path `name` is required.',
			});
		});

		it('should return 409 when the email already exists', async () => {
			const newUser = {
				name: 'John Doe',
				email: 'john3@mail.com',
				password: '1234',
			};

			await global.testRequest.post('/users').send(newUser);
			const response = await global.testRequest.post('/users').send(newUser);

			expect(response.status).toBe(409);
			expect(response.body).toEqual({
				code: 409,
				error: 'Conflict',
				message:
					'User validation failed: email: already exists in the database.',
			});
		});
	});

	describe('when authenticating a user', () => {
		it('should generate a token for a valid user', async () => {
			const newUser = {
				name: 'John Doe',
				email: 'john4@mail.com',
				password: '1234',
			};

			await new User(newUser).save();

			const response = await global.testRequest
				.post('/users/authenticate')
				.send({ email: newUser.email, password: newUser.password });

			expect(response.body).toEqual(
				expect.objectContaining({ token: expect.any(String) }),
			);
		});

		it('should return status UNAUTHORIZED if the user with the given email is not found', async () => {
			const newUser = {
				name: 'John Doe',
				email: 'john40@mail.com',
				password: '1234',
			};

			const response = await global.testRequest
				.post('/users/authenticate')
				.send({ email: newUser.email, password: newUser.password });

			expect(response.status).toBe(401);
			expect(response.body).toEqual({
				code: 401,
				error: 'Unauthorized',
				message: 'User not found!',
			});
		});

		it('should return UNAUTHORIZED if the user is found but password does not match', async () => {
			const newUser = {
				name: 'John Doe',
				email: 'john5@mail.com',
				password: '1234',
			};

			await new User(newUser).save();

			const response = await global.testRequest
				.post('/users/authenticate')
				.send({ email: newUser.email, password: 'test-unmatch-password' });

			expect(response.status).toBe(401);
			expect(response.body).toEqual({
				code: 401,
				error: 'Unauthorized',
				message: 'Password does not match!',
			});
		});
	});
});
