import KeyboardShortcutManager from '../../src/content-scripts/keyboard-handler';

describe('KeyboardShortcutManager', () => {
  let manager;
  let mockActions;
  let mockActiveElement;

  beforeAll(() => {
    mockActiveElement = document.body;
    jest.spyOn(document, 'activeElement', 'get').mockImplementation(() => mockActiveElement);
  });

  beforeEach(() => {
    mockActions = {
      nextPost: jest.fn(),
      previousPost: jest.fn(),
      likePost: jest.fn(),
      cycleFeed: jest.fn(),
      goHome: jest.fn()
    };

    manager = new KeyboardShortcutManager({
      'j': { action: mockActions.nextPost },
      'k': { action: mockActions.previousPost },
      'l': { action: mockActions.likePost },
      'c': { action: mockActions.cycleFeed, allowedModifiers: ['shift'] },
      'gh': { action: mockActions.goHome }
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
    document.body.innerHTML = '';
    mockActiveElement = document.body;
  });

  describe('Basic keyboard shortcuts', () => {
    test('executes action on valid shortcut', () => {
      const event = new KeyboardEvent('keydown', { 
        key: 'j',
        bubbles: true,
        cancelable: true
      });
      document.dispatchEvent(event);
      expect(mockActions.nextPost).toHaveBeenCalledTimes(1);
    });

    test('does not execute action on invalid shortcut', () => {
      const event = new KeyboardEvent('keydown', { 
        key: 'x',
        bubbles: true,
        cancelable: true
      });
      document.dispatchEvent(event);
      expect(mockActions.nextPost).not.toHaveBeenCalled();
    });
  });

  describe('Input field handling', () => {
    beforeEach(() => {
      document.body.innerHTML = `
        <input type="text" id="textInput" />
        <textarea id="textArea"></textarea>
        <div role="textbox" id="richTextbox" contenteditable="true"></div>
      `;
    });

    test('ignores shortcuts in text input', () => {
      const input = document.getElementById('textInput');
      mockActiveElement = input;
      const event = new KeyboardEvent('keydown', { 
        key: 'j',
        bubbles: true,
        cancelable: true
      });
      input.dispatchEvent(event);
      expect(mockActions.nextPost).not.toHaveBeenCalled();
    });

    test('ignores shortcuts in textarea', () => {
      const textarea = document.getElementById('textArea');
      mockActiveElement = textarea;
      const event = new KeyboardEvent('keydown', { 
        key: 'j',
        bubbles: true,
        cancelable: true
      });
      textarea.dispatchEvent(event);
      expect(mockActions.nextPost).not.toHaveBeenCalled();
    });

    test('ignores shortcuts in contentEditable', () => {
      const richTextbox = document.getElementById('richTextbox');
      mockActiveElement = richTextbox;
      const event = new KeyboardEvent('keydown', { 
        key: 'j',
        bubbles: true,
        cancelable: true
      });
      richTextbox.dispatchEvent(event);
      expect(mockActions.nextPost).not.toHaveBeenCalled();
    });
  });

  describe('Prefix key handling', () => {
    test('handles "g" prefix correctly', () => {
      mockActiveElement = document.body;
      const gEvent = new KeyboardEvent('keydown', { 
        key: 'g',
        bubbles: true,
        cancelable: true
      });
      const hEvent = new KeyboardEvent('keydown', { 
        key: 'h',
        bubbles: true,
        cancelable: true
      });
      
      document.dispatchEvent(gEvent);
      document.dispatchEvent(hEvent);
      expect(mockActions.goHome).toHaveBeenCalledTimes(1);
    });

    test('resets prefix after timeout', () => {
      jest.useFakeTimers();
      mockActiveElement = document.body;
      
      const gEvent = new KeyboardEvent('keydown', { 
        key: 'g',
        bubbles: true,
        cancelable: true
      });
      const hEvent = new KeyboardEvent('keydown', { 
        key: 'h',
        bubbles: true,
        cancelable: true
      });

      document.dispatchEvent(gEvent);
      jest.advanceTimersByTime(501); // prefix timeout is 500ms
      document.dispatchEvent(hEvent);
      
      expect(mockActions.goHome).not.toHaveBeenCalled();
      jest.useRealTimers();
    });

    test('allows typing "g" in input fields', () => {
      const input = document.createElement('input');
      document.body.appendChild(input);
      mockActiveElement = input;
      
      const event = new KeyboardEvent('keydown', { 
        key: 'g',
        bubbles: true,
        cancelable: true 
      });
      
      input.dispatchEvent(event);
      expect(mockActions.goHome).not.toHaveBeenCalled();
    });
  });

  describe('Modifier key handling', () => {
    test('executes action with allowed modifier', () => {
      mockActiveElement = document.body;
      const event = new KeyboardEvent('keydown', { 
        key: 'c',
        shiftKey: true,
        bubbles: true,
        cancelable: true
      });
      document.dispatchEvent(event);
      expect(mockActions.cycleFeed).toHaveBeenCalled();
    });

    test('blocks action with disallowed modifier', () => {
      mockActiveElement = document.body;
      const event = new KeyboardEvent('keydown', { 
        key: 'j',
        ctrlKey: true,
        bubbles: true,
        cancelable: true
      });
      document.dispatchEvent(event);
      expect(mockActions.nextPost).not.toHaveBeenCalled();
    });
  });
});