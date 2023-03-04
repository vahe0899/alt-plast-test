import BrowserDetector from 'https://cdn.jsdelivr.net/npm/browser-dtector/browser-dtector.esm.js';
const detector = new BrowserDetector(window.navigator.userAgent);
const browserInfo = detector.parseUserAgent(); // Объект с данными о браузере
let listArray = [];
let searchArray = [];
let serverArray = [];
const listSection = document.querySelector('.list-section');
const data = {
    position: ''
};

// Функция проверяет версию и вид браузера, потом строит либо страницу, либо модальное окно
function init() {
    if (
        (browserInfo.name === 'Google Chrome' && browserInfo.shortVersion >= 108) ||
        (browserInfo.name === 'Mozilla Firefox' && browserInfo.shortVersion >= 108)
    ) {
        getDataForInput();
    } else {
        openModalWindow();
    }
}

// Функция закрывает dropdown
function closeDropdown() {
    document.querySelectorAll('.dropdown-item').forEach((elem) => elem.remove());
}

// Функция удаляет кнопку сохранения
function removeSaveButtons() {
    document.querySelectorAll('.save-button').forEach((elem) => elem.remove());
}

// Функция удаляет все карточки с должностями
function removeItemsList() {
    document.querySelectorAll('.list-item').forEach((elem) => elem.remove());
}

/** Функиця создаёт строку для dropdown-а
 *@param "obj" - Объект с названием должности и её идентификатором
 */
function addDropdownItem(obj) {
    let dropdownItem = document.createElement(`div`);
    dropdownItem.className = 'dropdown-item';
    document.querySelector('.dropdown-menu').appendChild(dropdownItem);
    dropdownItem.setAttribute('id', `${obj.id}`);

    let position = document.createElement(`span`);
    position.className = 'dropdown-item-position';
    document.getElementById(obj.id).appendChild(position);
    position.innerHTML = obj.name;

    let button = document.createElement(`button`);
    button.className = 'dropdown-item-button';
    document.getElementById(obj.id).appendChild(button);
    button.addEventListener('click', () => addPositionToList(obj.id));
    button.innerHTML = 'Добавить';
}

/** Функиця создаёт dropdown
 *@param "arr" - Массив объектов с названием должности и её идентификатором
 */
function createDropdown(arr) {
    closeDropdown();
    for (let i = 0; i < arr.length; i++) {
        addDropdownItem(arr[i]);
    }
}

/** Функиця создаёт карточку должности в списке
 *@param "obj" - Объект с названием должности и её идентификатором
 */
function addListItem(obj) {
    let listItem = document.createElement(`div`);
    listItem.className = 'list-item';
    listSection.appendChild(listItem);

    let topRow = document.createElement(`div`);
    topRow.className = 'top-row';
    let items = document.querySelectorAll('.list-item');
    items[items.length - 1].appendChild(topRow);

    let position = document.createElement(`span`);
    position.className = 'list-item-position';
    document.querySelectorAll('.top-row')[items.length - 1].appendChild(position);
    position.innerHTML = obj.name;

    let button = document.createElement(`button`);
    button.className = 'list-item-button';
    document.querySelectorAll('.top-row')[items.length - 1].appendChild(button);
    button.innerHTML = 'Удалить';
    button.addEventListener('click', () => deleteItemFromList(obj.id));

    let bottomRow = document.createElement(`div`);
    bottomRow.className = 'bottom-row';
    items[items.length - 1].appendChild(bottomRow);

    let salaryText = document.createElement(`span`);
    salaryText.className = 'salary-text';
    document.querySelectorAll('.bottom-row')[items.length - 1].appendChild(salaryText);
    salaryText.innerHTML = 'Базовая заработная плата';

    let salaryInput = document.createElement(`input`);
    salaryInput.className = 'salary-input';
    document.querySelectorAll('.bottom-row')[items.length - 1].appendChild(salaryInput);
    salaryInput.setAttribute('type', 'number');
    salaryInput.setAttribute('id', `${obj.id}`);
}

/** Функиця проверяет есть ли уже карточка с этой должностюь, потом добавляет в массив должностей новую позицию
 *@param "id" - Идентификатор должности
 */
function addPositionToList(id) {
    removeItemsList();
    let newItem = data.position.find((item) => item.id === id);
    if (listArray.includes(newItem)) {
        alert('Данная должность уже добавлена');
    } else {
        listArray.push(newItem);
        closeDropdown();
        document.querySelector('.main-input').value = '';
    }
    createList(listArray);
}

/** Функиця создаёт список с карточками должностей
 *@param "arr" - Массив объектов с названием должности и её идентификатором
 */
function createList(arr) {
    arr.sort((a, b) => a.name.localeCompare(b.name));
    for (let i = 0; i < arr.length; i++) {
        addListItem(arr[i]);
    }

    removeSaveButtons();
    if (document.querySelectorAll('.list-item').length > 0) {
        createSaveButton();
    }
}

/** Функиця удаляет карточку с должностью
 *@param "id" - Идентификатор должности
 */
function deleteItemFromList(id) {
    removeItemsList();
    let currentItem = listArray.find((item) => item.id === id);
    listArray.splice(listArray.indexOf(currentItem), 1);
    createList(listArray);
}

/** Функиця производит поиск при введении каждой буквы в поле и строит новый dropdown
 *@param "event" - событие ввода данных
 */
function search(event) {
    searchArray.splice(0, searchArray.length);
    data.position.forEach((element) => {
        if (element.name.toLowerCase().includes(`${event.target.value.toLowerCase()}`)) {
            searchArray.push(element);
        }
    });
    createDropdown(searchArray);
}

// Функиця создаёт кнопку сохранения
function createSaveButton() {
    let button = document.createElement(`button`);
    button.className = 'save-button';
    listSection.appendChild(button);
    button.innerHTML = 'Сохранить изменения';
    button.addEventListener('click', () => createObjectForServer());
}

// Функция создаёт объект с данными для отправки на сервер
function createObjectForServer() {
    serverArray.splice(0, serverArray.length);
    let inputs = document.getElementsByClassName('salary-input');
    let inputsArray = Array.from(inputs);
    inputsValidation(inputsArray);
    if (inputsArray.find((item) => item.value === '')) {
        alert('Должности не настроены!');
    } else {
        for (let i = 0; i < inputs.length; i++) {
            let object = {
                rate_area_id: inputs[i].id,
                base_charge_value: inputs[i].value
            };
            serverArray.push(object);
        }
        acceptChanges();
    }
}

/** Функиця проверяет есть ли незаполненные поля и меняет их цвет
 *@param "arr" - Массив инпутов в карточках должностей
 */
function inputsValidation(arr) {
    arr.forEach((item) => {
        if (item.value === '') {
            item.style.borderColor = 'red';
            item.setAttribute('placeholder', ' Укажите заработную плату');
        } else {
            item.style.borderColor = 'white';
        }
    });
}

// Функция очищает массив для карточек, удаляет список справа и выводит в лог итоговый массив
function acceptChanges() {
    console.log(serverArray);
    alert('Сохранено!');
    removeItemsList();
    removeSaveButtons();
    listArray.splice(0, listArray.length);
}

// Функция асинхронно получает данные, а потом строит инпут
async function getDataForInput() {
    // Получаем данные
    let res = await fetch('https://raw.githubusercontent.com/aleksandrzhmak/test_task/main/json_file.json');
    let json = await res.json();
    data.position = json;

    createMainInput();

    // Вешаем слушатели событий
    const input = document.querySelector('.main-input');
    input.addEventListener('focus', () => {
        if (input.value === '') {
            createDropdown(data.position);
        } else {
            return;
        }
    });
    input.addEventListener('input', (event) => search(event));
    input.addEventListener('blur', (event) => {
        if (event.relatedTarget === null) {
            closeDropdown();
        }
    });
}

// Функция создаёт основной инпут
function createMainInput() {
    let input = document.createElement(`input`);
    input.className = 'main-input';
    document.querySelector('.input-section').appendChild(input);
    input.setAttribute('type', 'text');
    input.setAttribute('placeholder', ' Введите должность...');

    let menu = document.createElement(`div`);
    menu.className = 'dropdown-menu';
    document.querySelector('.input-section').appendChild(menu);
}

// Функция создаёт модальное окно
function openModalWindow() {
    let modalDiv = document.createElement(`div`);
    modalDiv.className = 'modal';
    document.querySelector('.container').appendChild(modalDiv);

    let modalDialogue = document.createElement(`div`);
    modalDialogue.className = 'dialogue';
    document.querySelector('.modal').appendChild(modalDialogue);

    let modalImg = document.createElement(`img`);
    modalImg.className = 'robot';
    document.querySelector('.dialogue').appendChild(modalImg);
    modalImg.setAttribute('src', './robot.png');

    let modalTxt = document.createElement(`span`);
    modalTxt.className = 'txt';
    document.querySelector('.dialogue').appendChild(modalTxt);
    modalTxt.innerHTML = 'Для работы сайта необходимы актуальные версии браузеров Google Chrome или Mozilla Firefox';

    let links = document.createElement(`div`);
    links.className = 'links';
    document.querySelector('.dialogue').appendChild(links);

    let chrome = document.createElement(`a`);
    chrome.className = 'link';
    document.querySelector('.links').appendChild(chrome);
    chrome.innerHTML = 'Скачать Google Chrome';
    chrome.setAttribute('href', 'https://www.google.ru/chrome/');

    let firefox = document.createElement(`a`);
    firefox.className = 'link';
    document.querySelector('.links').appendChild(firefox);
    firefox.innerHTML = 'Скачать Mozilla Firefox';
    firefox.setAttribute('href', 'https://www.mozilla.org/ru/firefox/new/');
}

init();
