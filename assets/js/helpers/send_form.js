const formDOM = document.querySelector('#form');
const modalDOM = document.querySelector('#modal');
const closeButton = document.querySelector('#btn_close-modal');

function openModal() {
	modalDOM.open = true;
}

function closeModal() {
	modalDOM.open = false;
}

function sendEmail() {
	formDOM.addEventListener('submit', (e) => {
		e.preventDefault();
		const params = {
			name: document.getElementById('name').value,
			email: document.getElementById('email').value,
			subject: document.getElementById('subject').value,
			message: document.getElementById('message').value,
		};

		if (params.name && params.email && params.subject && params.message) {
			emailjs
				.send('service_i78o8xe', 'template_bzic089', params)
				.then(openModal());
		}
	});
}

closeButton.addEventListener('click', closeModal);

export default sendEmail;
