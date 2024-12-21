import DOMUtils from '../../src/content-scripts/dom-utils';

describe('DOMUtils', () => {
  describe('waitForElement', () => {
    beforeEach(() => {
      document.body.innerHTML = '';
    });

    test('resolves when element exists immediately', async () => {
      document.body.innerHTML = '<div id="test"></div>';
      const element = await DOMUtils.waitForElement('#test');
      expect(element).toBeTruthy();
      expect(element.id).toBe('test');
    });

    test('resolves when element appears after delay', async () => {
      setTimeout(() => {
        document.body.innerHTML = '<div id="delayed"></div>';
      }, 100);

      const element = await DOMUtils.waitForElement('#delayed');
      expect(element).toBeTruthy();
      expect(element.id).toBe('delayed');
    });

    test('rejects after timeout', async () => {
      await expect(DOMUtils.waitForElement('#nonexistent', 100))
        .rejects.toThrow('Element #nonexistent not found within 100ms');
    });

    test('aborts when signal is triggered', async () => {
      const controller = new AbortController();
      const promise = DOMUtils.waitForElement('#test', 1000, controller.signal);
      
      setTimeout(() => controller.abort(), 100);
      
      await expect(promise).rejects.toBe('cancelled');
    });
  });

  describe('findVisiblePosts', () => {
    beforeEach(() => {
      document.body.innerHTML = `
        <div data-testid="feedItem-by-1"></div>
        <div data-testid="feedItem-by-2" style="display: none"></div>
        <div data-testid="postThreadItem-by-3"></div>
      `;
      
      // Mock offsetParent for visible elements
      const visibleElements = document.querySelectorAll('[data-testid]');
      visibleElements.forEach(el => {
        Object.defineProperty(el, 'offsetParent', {
          get: () => el.style.display === 'none' ? null : document.body
        });
      });
    });

    test('finds only visible posts', () => {
      const posts = DOMUtils.findVisiblePosts();
      expect(posts).toHaveLength(2);
      expect(posts[0].getAttribute('data-testid')).toBe('feedItem-by-1');
      expect(posts[1].getAttribute('data-testid')).toBe('postThreadItem-by-3');
    });
  });

  describe('safelyScrollIntoView', () => {
    beforeEach(() => {
      document.body.innerHTML = `
        <div class="bsky-highlighted-post">Old highlight</div>
        <div id="target">New target</div>
      `;
      
      Element.prototype.scrollIntoView = jest.fn();
    });

    test('removes old highlights', () => {
      const target = document.getElementById('target');
      DOMUtils.safelyScrollIntoView(target);
      
      expect(document.querySelectorAll('.bsky-highlighted-post')).toHaveLength(1);
      expect(target.classList.contains('bsky-highlighted-post')).toBe(true);
    });

    test('adds highlight to new element', () => {
      const target = document.getElementById('target');
      DOMUtils.safelyScrollIntoView(target);
      
      expect(target.classList.contains('bsky-highlighted-post')).toBe(true);
    });

    test('calls scrollIntoView with correct options', () => {
      const target = document.getElementById('target');
      DOMUtils.safelyScrollIntoView(target);
      
      expect(target.scrollIntoView).toHaveBeenCalledWith({
        behavior: 'smooth',
        block: 'center',
        inline: 'nearest'
      });
    });
  });
});