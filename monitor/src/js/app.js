let headers = new Headers();
headers.set('Authorization', '');

// let username = sessionStorage.getItem("username") || askUsername();
// let password = sessionStorage.getItem("password") || askPassword();
//
let username = "HService";
let password = "Ne5mi1vu";

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
  }
  catch (e) {
    sessionStorage.removeItem("username");
    sessionStorage.removeItem("password");
    window.alert("error in password, \n" + e);
  }
}

if (username && password) {
  setCredentials();
}

const table = document.createElement('div');
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

table.classList.add('table');

fetchData();

function fetchData() {
  fetch('https://cors-escape.herokuapp.com/https://1cweb.cloudzz.com/tehpostach/hs/monitor', {
    method: 'GET',
    headers: headers
  })
      .then((response) => response.json())
      .then((responseJson) => {
        table.innerText = '';
        document.body.appendChild(table);
        createTable(table, headerConfig, columnsConfig, responseJson);
        setTimeout(fetchData, 60000);
      })
      .catch((error) => {
        console.error(error);
        username = askUsername('You have entered an invalid username, enter valid one');
        password = askPassword('Now enter the correct password, please');
        setCredentials();
        fetchData();
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

function createStatusBar() {
  let statusBar = document.createElement('div'),
      clock = document.createElement('span'),
      paginatorBox = document.createElement('span');
  statusBar.className = 'status-bar';
  paginatorBox.className = 'paginator';

  statusBar.appendChild(clock);
  statusBar.appendChild(paginatorBox);

  function updateTime() {
    setInterval(() => {
      clock.innerText = returnTime();
    }, 1000);
  }

  // function paginator() {
  //   let numberOfPages = Math.ceil(docHeight / screenHeight);
  //   paginatorBox.innerText = numberOfPages;
  // }

  const paginatorObj = {
    getNumberOfPages: function() {
      return Math.ceil(docHeight / screenHeight);
    },
    getCurrentPage: function () {
      return Math.round(docHeight / window.pageYOffset);
    },
    setData: function (span) {
      span.innerText = `Page: ${this.getCurrentPage()}/${this.getNumberOfPages()}`;
    }
  };

  setInterval(paginatorObj.setData(paginatorBox), 1000);

  updateTime();
  return statusBar;
}

function createTable(table, headerConfig, columnsConfig, tableData) {
  const refsToSpan = generateEmptyRows({table, rowsCount: tableData.length, columnsConfig});
  table.insertBefore(createHeaderRow(headerConfig), table.firstChild);
  table.appendChild(createStatusBar());
  renderTable(refsToSpan, tableData, columnsConfig);
  return refsToSpan;
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
  return {row, cells};
}

function createHeaderRow(config) {
  const {row, cells} = createRow(config);
  row.classList.add('app-header');
  for (let i = 0; i < config.length; i++) {
    cells[i].innerText = config[i];
    cells[i].classList.add(`app-head`);
    cells[i].classList.add(`app-head-${config[i]}`);
  }
  return row;
}

function generateEmptyRows({table, rowsCount, columnsConfig}) {
  const rowsData = [];
  for (let i = 0; i < rowsCount; i++) {
    const {row, cells} = createRow(columnsConfig);
    table.appendChild(row);
    rowsData.push(cells);
  }
  return rowsData;
}

const docHeight = Math.max(
    document.body.scrollHeight, document.documentElement.scrollHeight,
    document.body.offsetHeight, document.documentElement.offsetHeight,
    document.body.clientHeight, document.documentElement.clientHeight),
    screenHeight = document.documentElement.clientHeight - document.documentElement.clientHeight / 10;

function scrollOneScreen() {
  window.scrollTo({
    top: window.pageYOffset + screenHeight,
    behavior: "smooth"
  });
}

function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

function scrolling() {
  let numberOfPages = Math.ceil(docHeight / screenHeight);

  setInterval(() => {
    console.log(numberOfPages);
    scrollOneScreen();
    numberOfPages--;

    if (numberOfPages < 0) {
      scrollToTop();
      numberOfPages = Math.ceil(docHeight / screenHeight);
    }
  }, 2000);
}

scrolling();