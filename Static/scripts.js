var ticker = JSON.parse(localStorage.getItem('ticker')) || [];
var lastPrices = {};
var counter = 15;

function startUpdateCycle() {
    updatePrices();
    var counter = 15;
    setInterval(function () {
        counter--;
        document.getElementById('counter').textContent = counter;
        if (counter <= 0) {
            updatePrices();
            counter = 15;
        }
    }, 1000);
}

document.addEventListener('DOMContentLoaded', function () {
    ticker.forEach(function (ticker) {
        addTickerToGrid(ticker);
    });
    updatePrices();

    document.getElementById('add-ticker-form').addEventListener('submit', function (e) {
        e.preventDefault();
        var newTicker = document.getElementById('new-ticker').value.toUpperCase();

        if (!ticker.includes(newTicker)) {
            ticker.push(newTicker);
            localStorage.setItem('ticker', JSON.stringify(ticker));
            addTickerToGrid(newTicker);
        }

        document.getElementById('new-ticker').value = '';
        updatePrices();
    });

    document.getElementById('ticker-grid').addEventListener('click', function (event) {
        if (event.target.classList.contains('remove-btn')) {
            var tickerToRemove = event.target.dataset.ticker;
            ticker = ticker.filter(function (t) {
                return t !== tickerToRemove;
            });
            localStorage.setItem('ticker', JSON.stringify(ticker));
            document.getElementById(tickerToRemove).remove();
        }
    });

    startUpdateCycle();
});


function addTickerToGrid(ticker) {
    var tickerGrid = document.getElementById('ticker-grid');
    var div = document.createElement('div');
    div.id = ticker;
    div.classList.add('stock-box');
    div.innerHTML = `<h2>${ticker}</h2><p id="${ticker}-price"></p>Current Price <p id="${ticker}-pct"> Percentage Change</p><button class="remove-btn" data-ticker="${ticker}">Remove</button>`;
    tickerGrid.appendChild(div);
}
function updatePrices() {
    ticker.forEach(function (ticker) {
        fetch('/get_stock_data', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json; charset=utf-8'
            },
            body: JSON.stringify({ 'ticker': ticker })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch stock data. Status: ' + response.status);
            }
            return response.json();
        })
        .then(data => {
            var changePercent = ((data.currentPrice - data.openPrice) / data.openPrice) * 100;
            var colorClass;

            if (changePercent <= -2) {
                colorClass = 'dark-red';
            } else if (changePercent < 0) {
                colorClass = 'red';
            } else if (changePercent === 0) {
                colorClass = 'grey';
            } else if (changePercent <= 2) {
                colorClass = 'green';
            } else {
                colorClass = 'dark-green';
            }

            document.getElementById(`${ticker}-price`).textContent = `$${data.currentPrice.toFixed(2)}`;
            document.getElementById(`${ticker}-pct`).textContent = `${changePercent.toFixed(2)}%`;
            document.getElementById(`${ticker}-price`).className = `stock-box ${colorClass}`;
            document.getElementById(`${ticker}-pct`).className = `stock-box ${colorClass}`;

            var flashClass;
            if (lastPrices[ticker] > data.currentPrice) {
                flashClass = 'red-flash';
            } else if (lastPrices[ticker] < data.currentPrice) {
                flashClass = 'green-flash';
            } else {
                flashClass = 'grey-flash';
            }
            lastPrices[ticker] = data.currentPrice;

            document.getElementById(ticker).classList.add(flashClass);
            setTimeout(function () {
                document.getElementById(ticker).classList.remove(flashClass);
            }, 1000);
        })
        .catch(error => {
            console.error(error.message);
        });
    });
}




