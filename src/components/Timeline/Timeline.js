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
    timerAudio.classList.add("content-timer");

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

    // ====== элементы видео записи ======
    const videoContainer = document.createElement("div");
    videoContainer.classList.add("video-container", 'hide');

    const videoButtonOk = document.createElement("i");
    videoButtonOk.classList.add('post-button', 'video-button-ok', 'fa', 'fa-check');
    videoButtonOk.addEventListener("click", () => {
      this.stopVideoRecording();
      createVideoPost(this.videoPlayer);
    });

    const videoButtonCancel = document.createElement("i");
    videoButtonCancel.classList.add('post-button', 'video-button-cancel', 'fa', 'fa-xmark');
    videoButtonCancel.addEventListener("click", () => {
      this.stopVideoRecording();
      this.videoPlayer.remove();
    });

    const timerVideo = document.createElement("div");
    timerVideo.classList.add("content-timer");

    // Добавляем элементы в контейнер аудио
    videoContainer.appendChild(videoButtonOk);
    videoContainer.appendChild(timerVideo);
    videoContainer.appendChild(videoButtonCancel);

    timelineContainer.appendChild(videoContainer);

    this.videoContainer = videoContainer;
    this.stream = null;
    this.videoRecorder = null; // mediaRecorder
    this.videoChunks = [];
    this.timerInterval = null;
    this.recordingTime = 0;
    this.videoUrl = null;
    this.videoPlayer = null;

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

  updateTimer(timerElement) {
    this.recordingTime++;
    const minutes = Math.floor(this.recordingTime / 60);
    const seconds = this.recordingTime % 60;
    const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    timerElement.textContent = `${formattedTime}`;
  }

  startAudioRecording() {
    this.showErrorMessage('Функция записи аудио еще не поддержана');
  }

  // Обработчик события для записи видео.
  async startVideoRecording() {
    // Проверяем доступ к видео устройству
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.log("Ваш браузер не поддерживает запись аудио/видео.");
      return;
    }

    // если уже идет запись, то игнорируем событие
    if (this.videoRecorder && this.videoRecorder.state === 'recording') {
      return;
    }

    // Запрашиваем доступ к видео устройству пользователя
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ video: true });
    } catch (err) {
      const errVideoMsg = 'Ошибка при получении доступа к микрофону.';
      console.error(errVideoMsg, err);
      this.showErrorMessage(errVideoMsg);
      return;
    }

    const timerVideo = this.videoContainer.querySelector(".content-timer");

    this.inputContainer.classList.add('hide');
    this.videoContainer.classList.remove('hide');

    this.videoRecorder = new MediaRecorder(this.stream);

    // Начинаем запись
    this.videoRecorder.start();

    this.videoRecorder.addEventListener("start", () => {
      console.log("video record is strted");
    });

    // Устанавливаем интервал для обновления таймера
    this.timerInterval = setInterval(() => this.updateTimer(timerVideo), 1000);

    this.videoRecorder.addEventListener('dataavailable', (event) => {
      if (event.data.size > 0) {
        this.videoChunks.push(event.data);
      }
    });

    // Слушаем событие stop
    this.videoRecorder.addEventListener('stop', () => {
      // Объединяем фрагменты аудио в один Blob
      const videoBlob = new Blob(this.videoChunks);

      // Создаем объект URL для аудио
      this.videoUrl = URL.createObjectURL(videoBlob);

      // Останавливаем таймер
      clearInterval(this.timerInterval);

      console.log(this.videoUrl);
      this.videoPlayer = document.createElement("video");
      this.videoPlayer.controls = true; // Добавляем элементы управления для проигрывания
      this.container.appendChild(this.videoPlayer);
      this.videoPlayer.src = this.videoUrl;
    });
  }

  stopVideoRecording() {
    console.log('stop rec video')
    if (this.videoRecorder && this.videoRecorder.state === 'recording') {
      this.videoRecorder.stop();
    }
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
    }
    this.inputContainer.classList.remove('hide');
    this.videoContainer.classList.add('hide');
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
          this.requestManualCoordinates();
        }
      );
    } else {
      // Geolocation не поддерживается браузером.
      this.requestManualCoordinates();
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

  requestManualCoordinates() {
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

      errMsg.textContent = 'Введите координаты в формате: xx.xxxxx, yy.yyyyy или [xx.xxxxx, yy.yyyyy]';
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

  createVideoPost(videoPlayer, coordinates) {
    const postElement = document.createElement("div");
    postElement.classList.add("post");

    // Создаем элемент для отображения аудио контента
    // const videoPlayer = document.createElement("video");
    // videoPlayer.controls = true; // Добавляем элементы управления для проигрывания
    // videoPlayer.src = videoURL;

    // Добавляем элементы к посту
    postElement.appendChild(videoPlayer);
    postElement.appendChild(this.createTimeElement());
    postElement.appendChild(this.createCoordinatesElement(coordinates));

    // Добавляем пост в начало ленты
    this.postsContainer.insertBefore(postElement, this.postsContainer.firstChild);
  }

  displayPosts() {
    // Отображение постов в контейнере, с учетом их формата.
  }
}
