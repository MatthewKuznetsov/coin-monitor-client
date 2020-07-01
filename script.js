const BASE_URL = 'https://min-api.cryptocompare.com/data';
const MEDIA_BASE_URL = 'https://www.cryptocompare.com'
const API_KEY = 'f74eb92722da49c3983e99e191c991241ffc0c63546519a2476c4d8de3b0b5f0';
const CURRENCIES = ['USD', 'RUB', 'EUR'];
const TOP_LIMIT = '30';

class DataService {
  getTopList(currency = 'USD') {
    const url =
      `${BASE_URL}/top/mktcapfull?tsym=${currency}&limit=${TOP_LIMIT}&api_key=${API_KEY}`;
    return fetch(url)
      .then(res => res.json())
  }
}

class Main {
  _cachedData;
  
  constructor() {
    this._dataService = new DataService();
    this._renderer = new Renderer();
    
    this._presentTopList();
  }

  _fetchTopList() {
    this._dataService.getTopList()
    .then(data => {
      this._renderer.clearTopList();
      this._renderer.renderTopListItems(data.Data, this._cachedData ? this._cachedData.Data : null);
      this._cachedData = data;
    })
  }

  _presentTopList() {
    this._fetchTopList();
    setInterval(() => {
      this._fetchTopList();
    }, 120000)
  }
}

class HTMLParser {
  constructor() {
    this._parser = new DOMParser();
  }

  parse(HTMLString) {
    return this._parser.parseFromString(HTMLString, "text/html");
  }
}

class PopUp {

  constructor() {
    this._opened = false;
    this._popUpElement = document.getElementsByClassName('pop-up-wrapper')[0];
    this._popUpTitleElement = this._popUpElement.getElementsByClassName('pop-up-title')[0];
    this._popUpContentElement = this._popUpElement.getElementsByClassName('pop-up-content')[0];
    this._closeButtonElement = this._popUpElement.getElementsByClassName('pop-up-close')[0];
    this._closeButtonElement.addEventListener('click', () => {
      this.close();
    })
  }

  open(content) {
    if (this._opened) { return; }
    if (typeof content === 'string') {
      this._opened = true;
      this._popUpElement.classList.remove('hidden');
      console.log('String');
    } else if (content instanceof HTMLElement) {
      this._opened = true;
      this._popUpElement.classList.remove('hidden');
      console.log('Element');
    } else {
      throw new Error('Can not appty pop up content');
    }
  }

  close(clear = true) {
    if (!this._opened) { return; }
    if (clear) {
      this._popUpTitleElement.innerHTML = '';
      this._popUpContentElement.innerHTML = '';
    }
    this._popUpElement.classList.add('hidden');
  }
}

class Renderer {
  
  constructor() {
    this._HTMLParser = new HTMLParser();
    this._popUp = new PopUp();
    this._itemStringTemplate = `
      <div class="item-template hidden">
        <div class="left">
          <img class="icon">
          <span class="name"></span>
        </div>
        <span class="price"></span>
      </div>
    `;

    this._listElement = document.getElementsByClassName('top-list')[0];
    this._listItemTemplateElement = this._HTMLParser
      .parse(this._itemStringTemplate)
      .getElementsByClassName('item-template')[0];
  }

  clearTopList() {
    this._listElement.innerHTML = '';
  }

  redFlash(item) {
    item.getElementsByClassName('price')[0].classList.add('red-flash');
  }

  greenFlash(item) {
    item.getElementsByClassName('price')[0].classList.add('green-flash');
  }

  renderTopListItems(items, previous) {
    items.forEach(e => {
      const itemCopy = this._listItemTemplateElement.cloneNode(true);
      
      itemCopy.addEventListener('click', () => {
        this._popUp
      })

      const imgElement = itemCopy.getElementsByClassName('icon')[0];
      imgElement.src = `${MEDIA_BASE_URL}${e.CoinInfo.ImageUrl}`;
      imgElement.alt = e.CoinInfo.FullName;
      
      const nameElement = itemCopy.getElementsByClassName('name')[0];
      nameElement.textContent = e.CoinInfo.FullName;
      
      const priceElement = itemCopy.getElementsByClassName('price')[0];
      priceElement.textContent = e.DISPLAY.USD.PRICE;
      
      itemCopy.classList.remove('hidden');
      this._listElement.appendChild(itemCopy);
      
      if (previous) {
        const previousPrice = previous
          .find(i => e.CoinInfo.FullName === i.CoinInfo.FullName)
          .RAW.USD.PRICE;
        const currentPrice = e.RAW.USD.PRICE;
        if (currentPrice > previousPrice) {
          this.greenFlash(itemCopy);
        }
        if (currentPrice < previousPrice) {
          this.redFlash(itemCopy);
        }
      }
    })
  }
}

new Main();