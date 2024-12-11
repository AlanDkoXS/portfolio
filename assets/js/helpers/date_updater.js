function updateDateYear() {
	const currentYear = new Date().getFullYear();

	const copyrightElement = document.querySelector('.footer__year');

	copyrightElement.textContent = `© ${currentYear},`;
}

export default updateDateYear;
