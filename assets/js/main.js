import parallax from './helpers/parallax.js';
import profileParallax from './helpers/profile_parallax.js';
import activeMenu from './helpers/selected_menu.js';
import updateDateYear from './helpers/date_updater.js';
import loader from './helpers/loader.js';
import resetToHome from './helpers/reload_page.js';
import sendEmail from './helpers/send_form.js';
import switchLanguages from './helpers/switchLanguages.js';
import showScrollButtons from './helpers/scroll_buttons.js';

loader();

resetToHome();

activeMenu();

parallax();

profileParallax();

updateDateYear();

sendEmail();

switchLanguages();

showScrollButtons();
