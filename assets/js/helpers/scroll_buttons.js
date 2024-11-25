const showScrollButtons = () => {
    const btnContainer = document.querySelector('.btn__cv');

    if (!btnContainer) return;

    window.addEventListener('scroll', () => {
        if (window.scrollY > 200) {
            btnContainer.classList.add('show-btns');
        } else {
            btnContainer.classList.remove('show-btns');
        }
    });
};


window.onload = () => {
    showScrollButtons();
};

export default showScrollButtons;
