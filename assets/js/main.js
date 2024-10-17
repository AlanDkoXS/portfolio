import parallax from './components/parallax.js';
import activeMenu from './components/selected_menu.js';
import updateDateYear from './helpers/date_updater.js';
import loader from './helpers/loader.js';
import resetToHome from './helpers/reload_page.js';
import sendEmail from './helpers/send_form.js';
import switchLanguages from './helpers/switchLanguages.js';

loader();

resetToHome();

activeMenu();

parallax();

updateDateYear();

sendEmail();

switchLanguages();


