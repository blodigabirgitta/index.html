export class DetailPanel {
  constructor(selector) {
    this.panel = document.querySelector(selector);
    this.titleElement = this.panel.querySelector('#detailTitle');
    this.descriptionElement = this.panel.querySelector('#detailDescription');
    this.comedicLineElement = this.panel.querySelector('#comedicLine');
    this.connectionsElement = this.panel.querySelector('#connections');
    
    this.setupEventListeners();
  }

  setupEventListeners() {
    this.panel.querySelector('.close-btn').addEventListener('click', () => {
      this.hide();
    });
  }

  show(node) {
    this.titleElement.textContent = node.name;
    this.descriptionElement.textContent = node.description;
    this.comedicLineElement.textContent = node.comedicLine;
    this.renderConnections(node);
    
    this.panel.classList.add('visible');
  }

  hide() {
    this.panel.classList.remove('visible');
  }

  renderConnections(node) {
    this.connectionsElement.innerHTML = '';
    if (node.connections && node.connections.length) {
      const title = document.createElement('h3');
      title.textContent = 'Connections';
      this.connectionsElement.appendChild(title);

      const list = document.createElement('ul');
      node.connections.forEach(connection => {
        const item = document.createElement('li');
        item.textContent = connection;
        list.appendChild(item);
      });
      this.connectionsElement.appendChild(list);
    }
  }
}