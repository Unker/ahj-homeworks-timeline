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
    modal.classList.add("modal");
    modal.innerHTML = `
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
            <input type="text" class="manual-coordinates" placeholder="Введите координаты">
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-dismiss="modal">Закрыть</button>
            <button type="button" class="btn btn-primary" id="submit-manual-coordinates">Отправить</button>
          </div>
        </div>
      </div>
    `;

    // Добавляем модальное окно в body документа.
    document.body.appendChild(modal);

    modal.classList.add("show");
    modal.style.display = "block";

    // Обработчик события для кнопки "Отправить" в модальном окне.
    const submitButton = document.getElementById("submit-manual-coordinates");
    submitButton.addEventListener("click", () => {
      const manualCoordinatesInput = document.querySelector(".manual-coordinates");
      const manualCoordinates = manualCoordinatesInput.value.trim();

      if (manualCoordinates !== "") {
        const parsedCoordinates = this.parseCoordinates(manualCoordinates);
        if (!parsedCoordinates) {
          alert(error.message); // Отображаем сообщение об ошибке, если введены некорректные координаты.

        } else {
          this.handleUserLocation(parsedCoordinates);
        }
      }
    });

    // Обработчик события для закрытия модального окна.
    modal.addEventListener("hidden.bs.modal", () => {
      // Удаляем модальное окно из DOM после закрытия.
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

  // =================================================


  // Функция для отображения тикетов в списке
  displayTickets() {
    this.ticketList.innerHTML = '';
    this.tickets.forEach((ticket, index) => {
      const ticketItem = document.createElement('div');
      ticketItem.classList.add('ticket-item');
      ticketItem.setAttribute('data-index', index);
      this.onClickTicket = this.onClickTicket.bind(this);
      ticketItem.addEventListener('click', this.onClickTicket);

      // поле для отображения основной информации
      const mainContainer = document.createElement('div');
      mainContainer.classList.add('main-container');

      // поле для отображения дополнительной информации
      const extreContainer = document.createElement('div');
      extreContainer.classList.add('extra-container');

      const statusCheckbox = document.createElement('input');
      statusCheckbox.type = 'checkbox';
      statusCheckbox.classList.add('status-checkbox');
      statusCheckbox.checked = ticket.status;
      mainContainer.appendChild(statusCheckbox);

      const nameSpan = document.createElement('span');
      nameSpan.textContent = ticket.name;
      mainContainer.appendChild(nameSpan);

      const dateSpan = document.createElement('span');
      dateSpan.classList.add('ticket-created');
      const date = new Date(ticket.created);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0'); // Месяцы начинаются с 0
      const year = String(date.getFullYear()).slice(-2); // Получаем последние две цифры года
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');

      dateSpan.textContent = `${day}.${month}.${year} ${hours}:${minutes}`;
      mainContainer.appendChild(dateSpan);

      const editButton = document.createElement('button');
      editButton.textContent = '✎';
      editButton.classList.add('edit-button');
      mainContainer.appendChild(editButton);

      const deleteButton = document.createElement('button');
      deleteButton.textContent = 'x';
      deleteButton.classList.add('delete-button');
      mainContainer.appendChild(deleteButton);

      if (ticket.description) {
        const descriptionSpan = document.createElement('pre');
        descriptionSpan.classList.add('ticket-description');
        descriptionSpan.textContent = ticket.description;
        extreContainer.appendChild(descriptionSpan);
      }

      ticketItem.appendChild(mainContainer);
      ticketItem.appendChild(extreContainer);
      this.ticketList.appendChild(ticketItem);
    });
  }

  openAddTicketModal() {
    const title = this.ticketModal.querySelector('.form-title');
    title.textContent = 'Добавить тикет';
    this.ticketModal.style.display = 'block';
    this.modalBackground.style.display = 'block';

    const nameElem = this.ticketModal.querySelector('.form-input-name');
    const descriptionElem = this.ticketModal.querySelector('.form-input-description');

    nameElem.value = '';
    descriptionElem.value = '';

    // форсируем изменение поля textarea по содержимому
    const event = new Event('input');
    descriptionElem.dispatchEvent(event);
  }

  closeModals() {
    this.deleteModal.style.display = 'none';
    this.ticketModal.style.display = 'none';
    this.modalBackground.style.display = 'none';
    this.indexSelectedTicket = undefined;

    this.ticketModal.removeAttribute('data-index');
  }

  #createFormTicket() {
    // Создаем элементы формы
    const form = document.createElement('form');
    form.classList.add('form-ticket');
    form.setAttribute('onsubmit', 'event.preventDefault()');

    const titleLabel = document.createElement('label');
    titleLabel.classList.add('form-title');
    titleLabel.textContent = '';

    const labelName = document.createElement('label');
    labelName.textContent = 'Краткое описание';

    const nameInput = document.createElement('input');
    nameInput.classList.add('form-input-name');

    const labelDescription = document.createElement('label');
    labelDescription.textContent = 'Подробное описание';

    const descriptionInput = document.createElement('textarea');
    descriptionInput.classList.add('form-input-description');
    function autoResizeTextArea() {
      this.style.height = 'auto';
      this.style.height = `${this.scrollHeight} px`;
    }
    descriptionInput.addEventListener('input', autoResizeTextArea, false);

    const buttonContainer = document.createElement('div');
    buttonContainer.classList.add('button-container');

    const cancelButton = document.createElement('button');
    cancelButton.classList.add('cancelButton');

    const okButton = document.createElement('button');
    okButton.classList.add('confirmButton');

    // Настройка элементов формы
    nameInput.type = 'text';
    nameInput.setAttribute('required', true);
    cancelButton.textContent = 'Отмена';
    okButton.textContent = 'Ок';

    // Добавляем элементы формы в контейнер
    form.appendChild(titleLabel);
    form.appendChild(labelName);
    form.appendChild(nameInput);
    form.appendChild(labelDescription);
    form.appendChild(descriptionInput);
    form.appendChild(buttonContainer);
    buttonContainer.appendChild(cancelButton);
    buttonContainer.appendChild(okButton);

    // Добавляем обработчики событий для кнопок
    cancelButton.addEventListener('click', () => {
      this.closeModals();
    });

    okButton.addEventListener('click', async (e) => {
      e.preventDefault();
      if (form.checkValidity()) {
        const formData = {
          name: nameInput.value,
          description: descriptionInput.value,
        };

        // определим по index это изменение или создание нового тикета
        let res;
        const index = this.ticketModal.getAttribute('data-index');
        if (index) {
          res = await this.patchTicket(formData, index);
        } else {
          res = await this.postTicket(formData);
        }

        // считаем и отобразим обновленные тикеты
        if (res) {
          this.loadTickets();
        }

        this.closeModals();
      }
    });

    // Добавляем форму в контейнер модального окна
    this.ticketModal.appendChild(form);
  }
}
