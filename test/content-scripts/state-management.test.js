import AppState from '../../src/content-scripts/state-management';
import Logger from '../../src/utils/logger';

jest.mock('../../src/utils/logger');

describe('AppState', () => {
  let appState;
  let mockLogger;
  
  beforeEach(() => {
    mockLogger = {
      error: jest.fn(),
      warn: jest.fn(),
      info: jest.fn(),
      debug: jest.fn()
    };
    jest.spyOn(Logger.prototype, 'error').mockImplementation(mockLogger.error);
    jest.spyOn(Logger.prototype, 'warn').mockImplementation(mockLogger.warn);
    jest.spyOn(Logger.prototype, 'info').mockImplementation(mockLogger.info);
    jest.spyOn(Logger.prototype, 'debug').mockImplementation(mockLogger.debug);

    global.MutationObserver = jest.fn(function(callback) {
      this.observe = jest.fn();
      this.disconnect = jest.fn();
      this.trigger = (mutations) => callback(mutations);
    });

    appState = new AppState();
  });

  afterEach(() => {
    appState.cleanup();
    jest.clearAllMocks();
  });

  describe('initialization', () => {
    test('initializes with correct default state', () => {
      expect(appState.state).toEqual({
        feedTabs: [],
        currentFeedIndex: 0,
        currentPost: null,
        currentController: null,
        location: window.location.pathname
      });
    });

    test('initializes subscribers as empty Set', () => {
      expect(appState.subscribers).toBeInstanceOf(Set);
      expect(appState.subscribers.size).toBe(0);
    });

    test('sets up location observer', () => {
      expect(appState.observer).toBeDefined();
      expect(appState.observer.observe).toHaveBeenCalledWith(
        document.documentElement,
        { childList: true, subtree: false }
      );
    });
  });

  describe('subscription management', () => {
    test('subscribe adds callback to subscribers', () => {
      const callback = jest.fn();
      appState.subscribe(callback);
      expect(appState.subscribers.has(callback)).toBe(true);
    });

    test('subscribe returns unsubscribe function', () => {
      const callback = jest.fn();
      const unsubscribe = appState.subscribe(callback);
      
      unsubscribe();
      expect(appState.subscribers.has(callback)).toBe(false);
    });

    test('multiple subscribers are notified of state changes', () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();
      
      appState.subscribe(callback1);
      appState.subscribe(callback2);
      
      appState.updateState({ currentPost: 'test-post' });
      
      expect(callback1).toHaveBeenCalledWith(appState.state);
      expect(callback2).toHaveBeenCalledWith(appState.state);
    });

    test('unsubscribed callbacks are not notified', () => {
      const callback = jest.fn();
      const unsubscribe = appState.subscribe(callback);
      
      unsubscribe();
      appState.updateState({ currentPost: 'test-post' });
      
      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('state updates', () => {
    test('updateState merges new state with existing state', () => {
      const initialState = { ...appState.state };
      const newState = { currentPost: 'test-post', feedTabs: ['tab1', 'tab2'] };
      
      appState.updateState(newState);
      
      expect(appState.state).toEqual({
        ...initialState,
        ...newState
      });
    });

    test('updateState notifies subscribers', () => {
      const callback = jest.fn();
      appState.subscribe(callback);
      
      appState.updateState({ currentPost: 'test-post' });
      
      expect(callback).toHaveBeenCalledWith(appState.state);
    });

    test('updateState handles nested state updates', () => {
      const newFeedTabs = [{ id: 1, active: true }, { id: 2, active: false }];
      appState.updateState({ feedTabs: newFeedTabs });
      
      expect(appState.state.feedTabs).toEqual(newFeedTabs);
    });
  });

  describe('location observer', () => {
    beforeEach(() => {
      window.requestAnimationFrame = jest.fn(cb => cb());
    });

    test('detects pathname changes', () => {
      const callback = jest.fn();
      appState.subscribe(callback);
      
      const originalLocation = window.location;
      const mockLocation = new URL('https://bsky.app/profile');
      delete window.location;
      window.location = mockLocation;
      
      appState.observer.trigger([{ type: 'childList' }]);
      
      expect(appState.state.location).toBe('/profile');
      expect(callback).toHaveBeenCalled();
      
      window.location = originalLocation;
    });

    test('ignores non-pathname changes', () => {
      const callback = jest.fn();
      appState.subscribe(callback);
      
      const currentCallCount = callback.mock.calls.length;
      appState.observer.trigger([{ type: 'childList' }]);
      
      expect(callback).toHaveBeenCalledTimes(currentCallCount);
    });
  });

  describe('cleanup', () => {
    test('disconnects observer', () => {
      appState.cleanup();
      expect(appState.observer.disconnect).toHaveBeenCalled();
    });

    test('clears all subscribers', () => {
      const callback = jest.fn();
      appState.subscribe(callback);
      
      appState.cleanup();
      
      expect(appState.subscribers.size).toBe(0);
    });

    test('subsequent state updates do not trigger callbacks after cleanup', () => {
      const callback = jest.fn();
      appState.subscribe(callback);
      
      appState.cleanup();
      appState.updateState({ currentPost: 'test-post' });
      
      expect(callback).not.toHaveBeenCalled();
    });
  });
});