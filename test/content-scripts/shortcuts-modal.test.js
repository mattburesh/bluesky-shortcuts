// import ShortcutsModal from '../src/content-scripts/shortcuts-modal';
import ShortcutsModal from '../../src/content-scripts/shortcuts-modal';

describe('ShortcutsModal', () => {
  let modal;

  beforeEach(() => {
    document.body.innerHTML = '';
    modal = new ShortcutsModal();
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  describe('initialization', () => {
    test('creates modal elements', () => {
      expect(document.querySelector('.bsky-shortcuts-modal')).toBeTruthy();
      expect(document.querySelector('.bsky-shortcuts-content')).toBeTruthy();
      expect(document.querySelector('.bsky-shortcuts-header')).toBeTruthy();
    });

    test('initializes with modal hidden', () => {
      expect(modal.isVisible).toBe(false);
      expect(document.querySelector('.bsky-shortcuts-modal').style.display).toBe('none');
    });

    test('creates all shortcut items', () => {
      const items = document.querySelectorAll('.bsky-shortcut-item');
      expect(items.length).toBeGreaterThan(0);
      
      // Check specific shortcuts
      const descriptions = Array.from(document.querySelectorAll('.bsky-shortcut-description'))
        .map(el => el.textContent);
      expect(descriptions).toContain('Move to next post');
      expect(descriptions).toContain('Like post');
    });
  });

  describe('visibility toggling', () => {
    test('show() makes modal visible', () => {
      modal.show();
      expect(modal.isVisible).toBe(true);
      expect(document.querySelector('.bsky-shortcuts-modal').style.display).toBe('block');
    });

    test('hide() makes modal invisible', () => {
      modal.show();
      modal.hide();
      expect(modal.isVisible).toBe(false);
      expect(document.querySelector('.bsky-shortcuts-modal').style.display).toBe('none');
    });

    test('toggle() changes visibility state', () => {
      modal.toggle();
      expect(modal.isVisible).toBe(true);
      modal.toggle();
      expect(modal.isVisible).toBe(false);
    });
  });

  describe('event handling', () => {
    test('closes on overlay click', () => {
      modal.show();
      document.querySelector('.bsky-shortcuts-overlay').click();
      expect(modal.isVisible).toBe(false);
    });

    test('closes on escape key', () => {
      modal.show();
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
      expect(modal.isVisible).toBe(false);
    });

    test('closes on close button click', () => {
      modal.show();
      document.querySelector('.bsky-shortcuts-close').click();
      expect(modal.isVisible).toBe(false);
    });

    test('does not close when clicking modal content', () => {
      modal.show();
      document.querySelector('.bsky-shortcuts-content').click();
      expect(modal.isVisible).toBe(true);
    });
  });
});