<header class="header">    
  <div class="container header__container">
    <h2 id="greetingMessage"></h2>
    
    <!-- Логотип -->
    <a class="logo" href="./index.html">
      <img src="./images/logo.png" alt="BeHealth logo" width="160">
    </a>

    <!-- Список контактів -->
    <ul class="contacts">
      <li class="contacts__contact">
        <a class="contacts__contact-mail" href="mailto:info@behealth.com.ua">
          <svg class="contacts__contact-icon" width="20" height="20">
            <use href="./images/sprite.svg#icon-envelope"></use>
          </svg>info@behealth.com.ua
        </a>
      </li>
      <li class="contacts__contact">
        <a class="contacts__contact-phone" href="tel:+380675474099">
          <svg class="contacts__contact-icon" width="20" height="20">
            <use href="./images/sprite.svg#icon-phone"></use>
          </svg>+38 (067) 547-40-99
        </a>
      </li>
      <li class="contacts__contact">
        <a class="contacts__contact-phone" href="tel:+380445926862">
          <svg class="contacts__contact-icon" width="20" height="20">
            <use href="./images/sprite.svg#icon-phone"></use>
          </svg>+38 (044) 592-68-62
        </a>
      </li>
    </ul>

    <!-- Кнопки управління (Виправлено: кнопка та посилання рознесені) -->
    <div class="header__actions">
      <button type="button" class="btn" onclick="toggleDarkMode()">Тема</button>
      <a href="./ccal2.html" style="text-decoration: none; color: inherit;"><Button class="btn">Календар</Button></a>
    </div>
  </div>

  <!-- Кнопка мобільного меню -->
  <button class="mobile-menu-btn" type="button" data-menu-button aria-label="Перемикач меню">
    <svg class="mobile-menu-icon" width="24" height="16">
      <use class="mobile-menu-burger" href="./images/sprite.svg#24-menu"></use>
      <use class="mobile-menu-close" href="./images/sprite.svg#icon-X"></use>
    </svg>
  </button>

  <!-- Мобільне меню -->
  <div class="mobile-menu" data-menu>
    <ul class="mobile-menu-nav">
      <li class="mobile-menu-nav-item">
        <a class="link current" href="./index.html">Головна</a>
      </li>
      <li class="mobile-menu-nav-item">
        <a class="link" href="./portfolio.html">Курси</a>
      </li>
      <li class="mobile-menu-nav-item">
        <a class="link" href="./contacts.html">Контакти</a>
      </li>
    </ul>

    <ul class="mobile-menu-contacts">
      <li class="contacts__contact">
        <a class="contacts__contact-phone" href="tel:+380675474099">
          <svg class="contacts__contact-icon" width="20" height="20">
            <use href="./images/sprite.svg#icon-phone"></use>
          </svg>+38 (067) 547-40-99
        </a>
      </li>
      <li class="contacts__contact">
        <a class="contacts__contact-phone" href="tel:+380445926862">
          <svg class="contacts__contact-icon" width="20" height="20">
            <use href="./images/sprite.svg#icon-phone"></use>
          </svg>+38 (044) 592-68-62
        </a>
      </li>
      <li class="mobile-menu-contacts-item">
        <a class="link" href="mailto:info@behealth.com.ua">info@behealth.com.ua</a>
      </li>
    </ul>

    <ul class="mobile-menu-socials">
      <li class="mobile-menu-socials-item">
        <a class="mobile-menu-socials-link link" href="https://www.instagram.com/pharmascocom/" target="_blank" rel="noopener noreferrer">Instagram</a>
      </li>
      <li class="mobile-menu-socials-item">
        <a class="mobile-menu-socials-link link" href="https://www.youtube.com/@Pharmasco" target="_blank" rel="noopener noreferrer">Youtube</a>
      </li>
      <li class="mobile-menu-socials-item">
        <a class="mobile-menu-socials-link link" href="https://www.facebook.com/Pharmasco/" target="_blank" rel="noopener noreferrer">Facebook</a>
      </li>
    </ul>
  </div>
</header>