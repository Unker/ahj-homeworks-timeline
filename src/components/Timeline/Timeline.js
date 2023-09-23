import './Timeline.css';

export default class TimelineApp {
  constructor(container) {
    this.container = container;

    this.posts = [];

    this.initializeUI();
    this.getUserLocation();

    // this.openAddTicketModal = this.openAddTicketModal.bind(this);
    // this.confirmDeleteTicket = this.confirmDeleteTicket.bind(this);
    // this.closeModals = this.closeModals.bind(this);

    // this.addTicketButton.addEventListener('click', this.openAddTicketModal);
    // this.confirmButton.addEventListener('click', this.confirmDeleteTicket);
    // this.cancelButton.addEventListener('click', this.closeModals);

  }

  initializeUI() {
    // Создаем элементы интерфейса.
    const timelineContainer = document.createElement("div");
    timelineContainer.classList.add("timeline-container");

    const postsContainer = document.createElement("div");
    postsContainer.classList.add("posts-container");

    const inputContainer = document.createElement("div");
    inputContainer.classList.add("input-container");

    const inputField = document.createElement("textarea");
    inputField.placeholder = "Введите сообщение...";
    inputField.classList.add("post-input");

    const audioButton = document.createElement("i");
    audioButton.classList.add('post-button', 'audio-button', 'fa', 'fa-microphone');
    audioButton.addEventListener("click", () => {
      this.startAudioRecording();
    });

    const videoButton = document.createElement("i");
    videoButton.classList.add('post-button', 'video-button', 'fa', 'fa-video-camera');
    videoButton.addEventListener("click", () => {
      this.startVideoRecording();
    });

    // Добавляем элементы в контейнер ввода
    inputContainer.appendChild(inputField);
    inputContainer.appendChild(audioButton);
    inputContainer.appendChild(videoButton);

    timelineContainer.appendChild(postsContainer);
    timelineContainer.appendChild(inputContainer);

    // Добавляем контейнер в контейнер приложения
    this.container.appendChild(timelineContainer);

    this.inputField = inputField;
    this.postsContainer = postsContainer;
  }

  // Обработчик события для записи аудио.
  startAudioRecording() {
    // логика записи аудио здесь.
  }

  // Обработчик события для записи видео.
  startVideoRecording() {
    // логика записи видео здесь.
  }

  getUserLocation() {
    if ("geolocation" in navigator) {
      // Запрос координат пользователя через Geolocation API.
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log('position', position)
          this.userCoords = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          this.handleUserLocation(this.userCoords);
        },
        (error) => {
          // Обработка ошибки получения координат.
          this.showLocationError();
        }
      );
    } else {
      // Geolocation не поддерживается браузером.
      this.showLocationError();
    }
  }

  handleUserLocation(coords) {
    // Обработчик события для поля ввода для создания текстового поста.
    this.inputField.addEventListener("keydown", (event) => {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        const postContent = this.inputField.value.trim();

        if (postContent !== "") {
          // Создаем текстовый пост с указанными координатами.
          this.createTextPost(postContent, coords);

          // Очищаем поле ввода после создания поста.
          this.inputField.value = "";
        }
      }
    });
  }

  parseCoordinates(input) {
    // Регулярное выражение для поиска координат в формате "широта, долгота".
    const regex = /^([-+]?\d+\.\d+),\s*([-+]?\d+\.\d+)$/;

    // Регулярное выражение для поиска координат в формате "[широта, долгота]".
    const squareBracketsRegex = /^\[([-+]?\d+\.\d+),\s*([-+]?\d+\.\d+)\]$/;

    // Попытка сопоставления введенного текста с регулярными выражениями.
    const match = input.match(regex) || input.match(squareBracketsRegex);

    if (match) {
      // Если есть совпадение, извлекаем широту и долготу.
      const latitude = parseFloat(match[1]);
      const longitude = parseFloat(match[2]);

      if (!isNaN(latitude) && !isNaN(longitude)) {
        // Проверяем, что полученные значения чисел корректны.
        return { latitude, longitude };
      }
    }

    // Если формат не соответствует ожидаемому
    return null;
  }

  showLocationError() {
    // Создаем элемент модального окна.
    const modal = document.createElement("div");
    const patternCoordinates = String.raw`^\[?([-+]?\d+\.\d+),\s*([-+]?\d+\.\d+)\]?$`;
    const regexCoordinates = new RegExp(patternCoordinates);
    modal.classList.add("modal");
    modal.innerHTML = `
      <form novalidate class="form-modal-location">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Ошибка получения координат</h5>
              <button type="button" class="close" data-dismiss="modal" aria-label="Закрыть">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div class="modal-body">
              Координаты недоступны. Вы можете ввести координаты вручную:
              <input type="text" class="manual-coordinates" placeholder="Введите координаты" required pattern="^\[?([-+]?\d+\.\d+),\s*([-+]?\d+\.\d+)\]?$">
              <div class="modal-body-error-message"></div>  
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-close" data-dismiss="modal">Закрыть</button>
              <button type="submit" class="btn btn-submit" id="submit-manual-coordinates">Отправить</button>
            </div>
          </div>
        </div>
      </form>
    `;

    // Добавляем модальное окно в body документа.
    document.body.appendChild(modal);

    modal.classList.add("show");
    modal.style.display = "block";

    const form = document.querySelector('.form-modal-location');
    const closeBtn = form.querySelector('.btn-close');
    const close = form.querySelector('.close');
    const errMsg = form.querySelector(".modal-body-error-message");
    errMsg.textContent = '';

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      if (form.checkValidity()) {
        const manualCoordinatesInput = document.querySelector(".manual-coordinates");
        const match = manualCoordinatesInput.value.trim().match(regexCoordinates);
        console.log('valid');
        console.log('match', match);
        if (match) {
          // Если есть совпадение, извлекаем широту и долготу.
          const latitude = parseFloat(match[1]);
          const longitude = parseFloat(match[2]);
          this.handleUserLocation({ latitude, longitude });
          console.log({ latitude, longitude });
          modal.remove();
          return;
        }
        // if (!isNaN(latitude) && !isNaN(longitude)) {
        //   // Проверяем, что полученные значения чисел корректны.
        //   return { latitude, longitude };
        // }
      } else {
        console.log('invalid');
        // Отображаем сообщение об ошибке, если введены некорректные координаты.

      }

      errMsg.textContent = 'Введите координаты в формате: xx.xxxxx, yy.yyyyy   или  [xx.xxxxx, yy.yyyyy]';
      console.log('submit');
    });

    closeBtn.addEventListener('click', (e) => {
      e.preventDefault();
      modal.remove();
    });

    close.addEventListener('click', (e) => {
      e.preventDefault();
      modal.remove();
    });
  }

  createTextPost(content, coordinates) {
    // Создаем элемент для текстового поста
    const postElement = document.createElement("div");
    postElement.classList.add("post");

    // Создаем элемент для отображения текста
    const textElement = document.createElement("p");
    textElement.classList.add("post-text");
    textElement.textContent = content;

    // Создаем элемент для отображения времени
    const timeElement = document.createElement("div");
    timeElement.classList.add("post-time");
    const currentTime = new Date();
    timeElement.textContent = currentTime.toLocaleString();

    // Создаем элемент для отображения координат
    const coordinatesElement = document.createElement("div");
    coordinatesElement.classList.add("post-coordinates");
    coordinatesElement.textContent = `[${coordinates.latitude}, ${coordinates.longitude}]`;

    // Добавляем элементы к посту
    postElement.appendChild(textElement);
    postElement.appendChild(timeElement);
    postElement.appendChild(coordinatesElement);

    // Добавляем пост в начало ленты
    this.postsContainer.insertBefore(postElement, this.postsContainer.firstChild);

    this.posts.push(postElement);
  }

  createAudioPost(audioBlob, coordinates) {
    // Создание аудио поста и добавление его в Timeline.
    // Пост должен содержать аудио, координаты и время создания.
  }

  createVideoPost(videoBlob, coordinates) {
    // Создание видео поста и добавление его в Timeline.
    // Пост должен содержать видео, координаты и время создания.
  }

  displayPosts() {
    // Отображение постов в контейнере, с учетом их формата.
  }
}
