let headers = new Headers();
headers.set('Authorization', '');

let username = sessionStorage.getItem("username") || askUsername();
let password = sessionStorage.getItem("password") || askPassword();

const MS_IN_A_TICK = 1000;
const NUMBER_OF_TICKS_SCROLL = 6;
const NUMBER_OF_SEC_TO_FETCH = 60;

function askUsername(message) {
  return prompt(message || 'Please, enter your username');
}

function askPassword(message) {
  return prompt(message || 'Please, enter your password');
}

function setCredentials() {
  sessionStorage.setItem("username", username);
  sessionStorage.setItem("password", password);

  try {
    headers.set('Authorization', 'Basic ' + btoa(username + ":" + password));
  } catch (e) {
    sessionStorage.removeItem("username");
    sessionStorage.removeItem("password");
    window.alert("error in password, \n" + e);
  }
}

if (username && password) {
  setCredentials();
}

let fetchTime, statusTime, currentTick = 0;
const headerConfig = [
  "model",
  "order",
  "q-ty",
  "producer",
  "status",
  "deadline"
];
const columnsConfig = [
  "MODEL",
  "ORDER",
  "QUANTITY",
  "PRODUCER",
  "STATUS",
  "DEADLINE"
];
const table = document.createElement('div');
const dataRows = document.createElement('div');

function initTable() {
  table.classList.add('table');
  document.body.appendChild(table);
  dataRows.classList.add('app-data-rows');
  table.appendChild(dataRows);
  createTable(table, headerConfig);
}

initTable();

const docHeight = () =>
        Math.max(
            document.body.scrollHeight, document.documentElement.scrollHeight,
            document.body.offsetHeight, document.documentElement.offsetHeight,
            document.body.clientHeight, document.documentElement.clientHeight
        ),
    screenHeight = () => document.documentElement.clientHeight - document.documentElement.clientHeight / 10;

function fetchData() {
  fetch('https://cors-escape.herokuapp.com/https://1cweb.cloudzz.com/tehpostach/hs/monitor', {
    method: 'GET',
    headers: headers
  })
      .then((response) => {
        if(response.status === 200) {
          return response.json();
        } else {
          throw response;
        }
      })
      .then((responseJson) => {
        fillDataRows(dataRows, columnsConfig, responseJson);
        resetPage();

        fetchTime && clearTimeout(fetchTime);
        fetchTime = setTimeout(fetchData, NUMBER_OF_SEC_TO_FETCH * 1000);
      })
      .catch((error) => {
        if(error && error.status && (error.status >= 400 && error.status < 500) ) {
          username = askUsername('You have entered an invalid username, enter valid one');
          password = askPassword('Now enter the correct password, please');
          if(username && password) {
            setCredentials();
            fetchData();
          }
        } else {
          console.error(error);
        }
      });
}

function returnTime() {
  const options = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
    timezone: 'UTC',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric'
  };
  return new Date().toLocaleString('uk', options);
}

const paginatorObj = {
  getNumberOfPages: function() {
    return Math.ceil(docHeight() / screenHeight());
  },
  getCurrentPage: function() {
    return Math.ceil(window.pageYOffset / screenHeight()) + 1;
  },
  setData: function(span) {
    span.innerText = `Page: ${this.getCurrentPage()}/${this.getNumberOfPages()}`;
  },
  updatePage: function(paginatorBox, clock) {
    this.setData(paginatorBox);
    clock.innerText = returnTime();
  }
};

function tickAClock(paginatorBox, clock) {
  statusTime && clearTimeout(statusTime);
  statusTime = setTimeout(() => {
    currentTick = (currentTick + 1) % NUMBER_OF_TICKS_SCROLL;
    currentTick || scrolling();
    paginatorObj.updatePage(paginatorBox, clock);
    tickAClock(paginatorBox, clock);
  }, MS_IN_A_TICK);
}

function createStatusBar() {
  let statusBar = document.createElement('div'),
      clock = document.createElement('span'),
      paginatorBox = document.createElement('span');

  statusBar.className = 'status-bar';
  clock.className = 'clock';
  paginatorBox.className = 'paginator';

  statusBar.appendChild(clock);
  statusBar.appendChild(paginatorBox);

  tickAClock(paginatorBox, clock);

  return statusBar;
}

function createTable(table, headerConfig) {
  table.insertBefore(createHeaderRow(headerConfig), table.firstChild);
  table.appendChild(createStatusBar());
}

function fillDataRows(dataRows, columnsConfig, tableData) {
  dataRows.innerText = '';
  const refsToSpan = generateEmptyRows({ dataRows, rowsCount: tableData.length, columnsConfig });
  renderTable(refsToSpan, tableData, columnsConfig);
}

function renderTable(refsToSpan, data, columnConfig) {
  for (let i = 0; i < refsToSpan.length; i++) {
    const cell = refsToSpan[i];
    for (let j = 0; j < columnConfig.length; j++) {
      if (data[i][columnConfig[j]] === "Заплановано") {
        cell[j].classList.add('planned');
      } else if (data[i][columnConfig[j]] === "Завершено") {
        cell[j].classList.add('finished');
      } else if (data[i][columnConfig[j]] === "У виробництві") {
        cell[j].classList.add('processing');
      } else if (columnsConfig[j] === "DEADLINE" && data[i]['REDCOLOUR'] === 1) {
        cell[j].classList.add('deadline-lost');
      }
      cell[j].innerHTML = data[i][columnConfig[j]];
    }
  }
}

function createRow(columns) {
  const row = document.createElement('div');
  row.classList.add('app-row');
  const cells = [];
  for (let column of columns) {
    const cell = document.createElement('span');
    cell.classList.add(`app-cell-${column}`);
    cells.push(cell);
    row.appendChild(cell);
  }
  return {
    row,
    cells
  };
}

function createHeaderRow(config) {
  const {
    row,
    cells
  } = createRow(config);
  row.classList.add('app-header');
  for (let i = 0; i < config.length; i++) {
    cells[i].innerText = config[i];
    cells[i].classList.add(`app-head`);
    cells[i].classList.add(`app-head-${config[i]}`);
  }
  return row;
}

function generateEmptyRows({dataRows, rowsCount, columnsConfig}) {
  const rowsData = [];
  for (let i = 0; i < rowsCount; i++) {
    const { row, cells } = createRow(columnsConfig);
    dataRows.appendChild(row);
    rowsData.push(cells);
  }
  return rowsData;
}

function scrollToSmooth(goto) {
  window.scrollTo({
    top: (typeof goto !== 'number') ? 0 : goto,
    behavior: "smooth"
  });
}
function resetPage() {
  scrollToSmooth();
  currentTick = 0;
}

function scrolling() {
  scrollToSmooth(window.innerHeight + window.pageYOffset >= docHeight() ? 0 : window.pageYOffset + screenHeight());
}

fetchData();
scrolling();