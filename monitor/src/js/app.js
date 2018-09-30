let headers = new Headers();
headers.set('Authorization', '');

let username = sessionStorage.getItem("username") || askUsername();
let password = sessionStorage.getItem("password") || askPassword();

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

function createTable(table, headerConfig, columnsConfig, tableData) {
  const refsToSpan = generateEmptyRows({table, rowsCount: tableData.length, columnsConfig});
  table.insertBefore(createHeaderRow(headerConfig), table.firstChild);
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