import loader from './helpers/loader.js';
import parallaxMobile from './helpers/parallax_mobile.js';
import parallaxDesktop from './helpers/parallax_desktop.js';
import profileParallax from './helpers/profile_parallax.js';
import activeMenu from './helpers/selected_menu.js';
import updateDateYear from './helpers/date_updater.js';
import resetToHome from './helpers/reload_page.js';
import sendEmail from './helpers/send_form.js';
import switchLanguages from './helpers/switchLanguages.js';
import showScrollButtons from './helpers/scroll_buttons.js';

loader();

resetToHome();

activeMenu();

parallaxMobile();

parallaxDesktop();

profileParallax();

updateDateYear();

sendEmail();

switchLanguages();

showScrollButtons();
