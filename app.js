import { DCUniverseData } from './data.js';
import { TreeVisualizer } from './treeVisualizer.js';
import { DetailPanel } from './detailPanel.js';
import { SearchManager } from './searchManager.js';

class App {
  constructor() {
    try {
      this.initializeApp();
    } catch (error) {
      console.error('Error initializing app:', error);
    }
  }

  async initializeApp() {
    await this.waitForD3();
    this.data = new DCUniverseData();
    this.treeVisualizer = new TreeVisualizer('#treeContainer', this.data);
    this.detailPanel = new DetailPanel('#detailPanel');
    this.searchManager = new SearchManager('#search', this.data);
    
    this.init();
  }

  async waitForD3() {
    if (!window.d3) {
      return new Promise((resolve) => {
        const checkD3 = setInterval(() => {
          if (window.d3) {
            clearInterval(checkD3);
            resolve();
          }
        }, 100);
      });
    }
  }

  init() {
    this.setupEventListeners();
    this.treeVisualizer.render();
    
    // Add keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.detailPanel.hide();
      }
    });
  }

  setupEventListeners() {
    try {
      // Node click handling
      this.treeVisualizer.on('nodeClick', (node) => {
        this.detailPanel.show(node);
      });

      // Search handling
      this.searchManager.on('search', (results) => {
        this.treeVisualizer.highlightNodes(results);
      });

      // Filter handling
      document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const filter = btn.dataset.filter;
          this.treeVisualizer.applyFilter(filter);
        });
      });

      // Random node
      const randomBtn = document.getElementById('randomNode');
      if (randomBtn) {
        randomBtn.addEventListener('click', () => {
          const randomNode = this.data.getRandomNode();
          this.treeVisualizer.focusNode(randomNode);
          this.detailPanel.show(randomNode);
        });
      }
    } catch (error) {
      console.error('Error setting up event listeners:', error);
    }
  }
}

// Initialize the app when the DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
  });
} else {
  window.app = new App();
}