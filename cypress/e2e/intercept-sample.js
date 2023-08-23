//https://www.lambdatest.com/blog/cypress-intercept/
describe('intercept spec', () => {
	it('Intercept by Url', () => {
		cy.visit('https://reqres.in/');
		cy.intercept('https://reqres.in/api/users/').as('posts');
		cy.get('[data-id=users]').click();
		cy.wait('@posts').its('response.body.data').should('have.length', 6);
	});

	it('Intercept by Url1', () => {
		cy.visit('https://reqres.in/');
		cy.intercept('https://reqres.in/api/users/').as('posts');
		cy.get('[data-id=users]').click();
		cy.wait('@posts').then(res => {
			cy.log(res.response.body.data[2].first_name);
			res.response.body.data.forEach(data => {
				cy.log(data.first_name);
				cy.log(data.last_name);
				cy.log(data.email);
			});
		});
	});

	it('Intercept by use pattern-matching to match URLs', () => {
		cy.visit('https://reqres.in/');
		cy.intercept('/api/users/').as('posts');
		cy.get('[data-id=users]').click();
		cy.wait('@posts').its('response.body.data').should('have.length', 6);
	});

	it('Intercept by matching GET method', () => {
		cy.visit('https://reqres.in/');
		cy.intercept('GET', 'api/users?page=2').as('posts_on_page2');
		cy.get('[data-id=users]').click();
		cy.wait('@posts_on_page2')
			.its('response.body.data')
			.should('have.length', 6);
	});

	//req.reply() - stub out a response requiring no dependency on a real back-end
	//   // equivalent to `req.reply({ body })`
	// req.reply(body)
	// // equivalent to `req.reply({ body, headers })`
	// req.reply(body, headers)
	// // equivalent to `req.reply({ statusCode, body, headers})`
	// req.reply(statusCode, body, headers)
	// cy.intercept('METHOD', 'URL PATH', (intercepted-req) => {
	//   intercepted-req.reply((res) => {
	//     // Modify the response object as needed
	//     res.body = { key: 'modified data' };
	//   });
	// });
	// In this case, the response body is modified to { key: 'modified data' }.

	it('Intercept by modifying response using req.reply method', () => {
		cy.visit('https://reqres.in/');
		cy.intercept('POST', 'api/users', req => {
			req.reply({
				statusCode: 200,
				body: {
					data: [
						{
							name: 'John',
							job: 'QA Manager',
						},
						{
							name: 'Peter',
							job: 'QA Lead',
						},
					],
				},
			});
		}).as('updateuser');

		cy.get('[data-id=post]').click();

		//cy.wait('@updateuser').its('response.statusCode').should('eq', 200);
		//cy.wait('@updateuser').its('response.body.data').should('have.length', 2);
		cy.wait('@updateuser').then(res => {
			cy.log(res.response.body.data[0]);
		});
	});

	//req.reply() - stub out a response requiring no dependency on a real back-end
	// cy.intercept('GET', '/api/data', (req) => {
	//   req.reply((res) => {
	//     res.body = { key: 'modified data' }; // Modify the response body
	//     res.headers['Content-Type'] = 'application/json'; // Modify the response headers
	//     res.statusCode = 200; // Modify the response status code
	//   });
	// });
	it('Intercept by modifying response using req.reply method + fat arrow', () => {
		cy.visit('https://reqres.in/');
		cy.intercept('POST', 'api/users', req => {
			req.reply(res => {
				res.statusCode = 200;
				res.body = {
					data: [
						{
							name: 'Ria',
							job: 'SDET Manager',
						},
						{
							name: 'Arya',
							job: 'QA Lead',
						},
					],
				};
				res.headers = {
					HOST: 'Alagammai *****',
					'Cache-Control': 'Basic TOKEN !!!!!',
				};
			});
		}).as('updateuser');

		cy.get('[data-id=post]').click();

		cy.wait('@updateuser')
			.its('response.headers')
			.should('have.property', 'Cache-Control', 'Basic TOKEN !!!!!');

		//cy.wait('@updateuser').its('response.statusCode').should('eq', 200);
		//cy.wait('@updateuser').its('response.body.data').should('have.length', 2);
		// cy.wait('@updateuser').then(res => {
		// 	cy.log(res.response.body.data[0]);
		// });
	});

	// stub out a response body using a fixture

	it('Stubbing a response With Fixture file', () => {
		cy.visit('https://reqres.in/');
		cy.intercept('GET', 'https://reqres.in/api/users?page=2', {
			statusCode: 200, // default
			fixture: 'users.json',
		}).as('getUsers');
		cy.visit('https://reqres.in/');
		cy.wait('@getUsers').its('response.body.data').should('have.length', 6);
	});

	// stub out a response body using a fixture and req.reply method

	it('Stubbing a response With Fixture file + req.reply method', () => {
		cy.visit('https://reqres.in/');
		cy.intercept('GET', 'https://reqres.in/api/users?page=2', req => {
			req.reply({
				statusCode: 200, // default
				fixture: 'users.json',
			});
		}).as('getUsers');
		cy.visit('https://reqres.in/');
		cy.wait('@getUsers').its('response.body.data').should('have.length', 6);
	});

	it('Stubbing a response With string', () => {
		cy.visit('https://reqres.in/');
		cy.intercept('GET', 'https://reqres.in/api/users?page=2', {
			body: { data: ['success Alagammai!!!!'] },
		}).as('getUsers');

		cy.visit('https://reqres.in/');
		//cy.wait('@getUsers').its('response.body.data').should('have.length', 6);
		cy.wait('@getUsers').then(res => {
			cy.log(res.response.body.data);
		});
	});

	it('Stubbing a response With string 1', () => {
		cy.visit('https://reqres.in/');
		cy.intercept('https://reqres.in/api/users?page=2', [
			['success Alagammai!!!!'],
		]).as('getUsers');

		cy.visit('https://reqres.in/');
		//cy.wait('@getUsers').its('response.body.data').should('have.length', 6);
		cy.wait('@getUsers').then(res => {
			cy.log(res.response.body.data);
		});
	});

	it('Stubbing a response empty string', () => {
		cy.visit('https://reqres.in/');
		cy.intercept('GET', 'https://reqres.in/api/users?page=2', {
			body: { data: [''] },
		}).as('getUsers');

		cy.visit('https://reqres.in/');
		//cy.wait('@getUsers').its('response.body.data').should('have.length', 6);
		cy.wait('@getUsers').then(res => {
			cy.log(res.response.body.data);
		});
	});

	it('Stubbing a response empty string 1', () => {
		cy.visit('https://reqres.in/');
		cy.intercept('https://reqres.in/api/users?page=2', ['']).as('getUsers');

		cy.visit('https://reqres.in/');
		//cy.wait('@getUsers').its('response.body.data').should('have.length', 6);
		cy.wait('@getUsers').then(res => {
			cy.log(res.response.body.data);
		});
	});
	//req.continue() - modify or make assertions on the real response
	//req.continue() method, allows the intercepted request to proceed to the actual server without modifying the response.
	// pass the request through and make an assertion on
	// the real response
	it('make assertion on real response', () => {
		cy.intercept('GET', 'api/users', req => {
			req.body.data[0].first_name = 'ASDASDASDASD';

			req.body.data[6].first_name = 'ASDASDASDASD';
			req.body.data[7].first_name = 'ASDASDASDASD';

			req.continue();
			// req.continue(res => {
			// 	//expect(res.body).to.include('Peter Pan')
			// 	res.body.data.forEach(data => {
			// 		cy.log(data.first_name);
			// 		cy.log(data.last_name);
			// 		cy.log(data.email);
			// 	});
			// });
		}).as('getUsers2');
		cy.visit('https://reqres.in/');
	});
});
