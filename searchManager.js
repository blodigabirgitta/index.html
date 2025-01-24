export class SearchManager {
  constructor(selector, data) {
    this.input = document.querySelector(selector);
    this.data = data;
    this.eventHandlers = new Map();
    
    this.setupEventListeners();
  }

  setupEventListeners() {
    this.input.addEventListener('input', this.handleSearch.bind(this));
  }

  handleSearch() {
    const query = this.input.value.trim();
    if (query.length > 2) {
      const results = this.data.search(query);
      this.emit('search', results);
    } else if (query.length === 0) {
      this.emit('search', this.data.nodes);
    }
  }

  on(event, handler) {
    this.eventHandlers.set(event, handler);
  }

  emit(event, data) {
    const handler = this.eventHandlers.get(event);
    if (handler) handler(data);
  }
}