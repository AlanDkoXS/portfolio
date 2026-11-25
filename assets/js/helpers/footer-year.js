function updateFooterYear() {
  const currentYear = new Date().getFullYear();

  const copyrightElement = document.querySelector('.footer__year');

  if (copyrightElement) copyrightElement.textContent = `© ${currentYear},`;
}

export { updateFooterYear };
