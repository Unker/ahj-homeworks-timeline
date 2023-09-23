import './Timeline.css';

export default class TimelineApp {
  constructor(container) {
    this.container = container;

    this.posts = [];

    this.initializeUI();
    this.getUserLocation();
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
    this.inputContainer = inputContainer;
    this.postsContainer = postsContainer;

    // ====== элементы аудио записи ======
    const audioContainer = document.createElement("div");
    audioContainer.classList.add("audio-container", 'hide');

    const audioButtonOk = document.createElement("i");
    audioButtonOk.classList.add('post-button', 'audio-button-ok', 'fa', 'fa-check');
    audioButtonOk.addEventListener("click", () => {
      this.stopAudioRecording();
    });

    const audioButtonCancel = document.createElement("i");
    audioButtonCancel.classList.add('post-button', 'video-button-cancel', 'fa', 'fa-xmark');
    audioButtonCancel.addEventListener("click", () => {
      this.stopAudioRecording();
    });

    const timerAudio = document.createElement("div");
    timerAudio.classList.add("audio-timer");

    // Добавляем элементы в контейнер аудио
    audioContainer.appendChild(audioButtonOk);
    audioContainer.appendChild(timerAudio);
    audioContainer.appendChild(audioButtonCancel);

    timelineContainer.appendChild(audioContainer);

    this.audioContainer = audioContainer;
    this.stream = null;
    this.audioRecorder = null; // mediaRecorder
    this.audioChunks = [];
    this.timerInterval = null;
    this.recordingTime = 0;
    this.audioUrl = null;

  }

  showErrorMessage(message) {
    // Создаем элементы модального окна
    const modalContainer = document.createElement('div');
    modalContainer.classList.add('error-modal-container');

    const modalContent = document.createElement('div');
    modalContent.classList.add('error-modal-content');

    const errorMessage = document.createElement('p');
    errorMessage.textContent = message;

    const closeButton = document.createElement('button');
    closeButton.textContent = 'Закрыть';
    closeButton.addEventListener('click', () => {
      modalContainer.remove();
    });

    // Добавляем элементы к модальному окну
    modalContent.appendChild(errorMessage);
    modalContent.appendChild(closeButton);
    modalContainer.appendChild(modalContent);

    // Добавляем модальное окно к корневому элементу документа
    document.body.appendChild(modalContainer);

    // Закрытие модального окна при клике мимо него
    modalContainer.addEventListener('click', (event) => {
      if (event.target === modalContainer) {
        modalContainer.remove();
      }
    });
  }

  // Обработчик события для записи аудио.
  async startAudioRecording() {
    // Проверяем доступ к микрофону
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.log("Ваш браузер не поддерживает запись аудио.");
      return;
    }

    // Запрашиваем доступ к микрофону пользователя
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (err) {
      const errAudioMsg = 'Ошибка при получении доступа к микрофону.';
      console.error(errAudioMsg, err);
      this.showErrorMessage(errAudioMsg);
      return;
    }

    this.inputContainer.classList.add('hide');
    this.audioContainer.classList.remove('hide');

    this.audioRecorder = new MediaRecorder(stream);

    // Начинаем запись
    this.audioRecorder.start();

    this.audioRecorder.addEventListener("start", () => {
      console.log("audio record is strted");
    });

    // Устанавливаем интервал для обновления таймера
    this.timerInterval = setInterval(() => this.updateTimer(), 1000);

    this.audioRecorder.addEventListener('dataavailable', (event) => {
      if (event.data.size > 0) {
        this.audioChunks.push(event.data);
      }
    });

    // Слушаем событие stop
    this.audioRecorder.addEventListener('stop', () => {
      // Объединяем фрагменты аудио в один Blob
      const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });

      // Создаем объект URL для аудио
      this.audioUrl = URL.createObjectURL(audioBlob);

      // Останавливаем таймер
      clearInterval(this.timerInterval);

      // Скрывам  аудио контейнер
      // todo
    });
  }

  stopAudioRecording() {
    console.log('stop rec audio')
    if (this.audioRecorder && this.audioRecorder.state === 'recording') {
      this.audioRecorder.stop();
    }
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
    }
    this.inputContainer.classList.remove('hide');
    this.audioContainer.classList.add('hide');
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

  // Создаем элемент для отображения времени
  createTimeElement() {
    const timeElement = document.createElement("div");
    timeElement.classList.add("post-time");
    const currentTime = new Date();
    timeElement.textContent = currentTime.toLocaleString();
    return timeElement;
  }

  // Создаем элемент для отображения координат
  createCoordinatesElement(coordinates) {
    const coordinatesElement = document.createElement("div");
    coordinatesElement.classList.add("post-coordinates");
    coordinatesElement.textContent = `[${coordinates.latitude}, ${coordinates.longitude}]`;
    return coordinatesElement;
  }

  createTextPost(content, coordinates) {
    // Создаем элемент для текстового поста
    const postElement = document.createElement("div");
    postElement.classList.add("post");

    // Создаем элемент для отображения текста
    const textElement = document.createElement("p");
    textElement.classList.add("post-text");
    textElement.textContent = content;

    // Добавляем элементы к посту
    postElement.appendChild(textElement);
    postElement.appendChild(this.createTimeElement());
    postElement.appendChild(this.createCoordinatesElement(coordinates));

    // Добавляем пост в начало ленты
    this.postsContainer.insertBefore(postElement, this.postsContainer.firstChild);

    this.posts.push(postElement);
  }

  createAudioPost(audioBlob, coordinates) {
    // Создаем элемент для аудио поста
    const postElement = document.createElement("div");
    postElement.classList.add("post");

    // Создаем элемент для отображения аудио контента
    const audioElement = document.createElement("audio");
    audioElement.controls = true; // Добавляем элементы управления для проигрывания
    audioElement.src = audioContent;

    // Добавляем элементы к посту
    postElement.appendChild(audioElement);
    postElement.appendChild(this.createTimeElement());
    postElement.appendChild(this.createCoordinatesElement(coordinates));

    // Добавляем пост в начало ленты
    this.postsContainer.insertBefore(postElement, this.postsContainer.firstChild);
  }

  createVideoPost(videoBlob, coordinates) {
    // Создание видео поста и добавление его в Timeline.
    // Пост должен содержать видео, координаты и время создания.
  }

  displayPosts() {
    // Отображение постов в контейнере, с учетом их формата.
  }
}
