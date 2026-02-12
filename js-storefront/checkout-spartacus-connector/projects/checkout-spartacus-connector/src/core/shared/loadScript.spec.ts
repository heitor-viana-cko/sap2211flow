import { WindowRef } from '@spartacus/core';
import { loadScript } from './loadScript';

describe('loadScript', () => {
  let mockWindowRef: jasmine.SpyObj<WindowRef>;
  let mockDocument: Document;
  let headElement: HTMLElement;

  beforeEach(() => {
    // Mock the document and its methods
    mockDocument = document.implementation.createHTMLDocument();
    headElement = mockDocument.createElement('head');
    mockDocument.documentElement.appendChild(headElement);

    // Create a mock WindowRef
    mockWindowRef = jasmine.createSpyObj('WindowRef', ['document'], {
      document: mockDocument,
    });
  });

  it('should append a new script to the head if script is not already present', () => {
    const scriptSrc = 'https://example.com/test.js';

    loadScript(mockWindowRef, scriptSrc);

    const scripts = mockDocument.getElementsByTagName('script');
    expect(scripts.length).toBe(1);
    expect(scripts[0].src).toBe(scriptSrc);
    expect(scripts[0].type).toBe('text/javascript');
    expect(scripts[0].async).toBeTrue();
  });

  it('should not append a script if the same script is already present', () => {
    const scriptSrc = 'https://example.com/test.js';

    // Add a script manually to simulate existing script
    const existingScript = mockDocument.createElement('script');
    existingScript.src = scriptSrc;
    headElement.appendChild(existingScript);

    loadScript(mockWindowRef, scriptSrc);

    const scripts = mockDocument.getElementsByTagName('script');
    expect(scripts.length).toBe(1); // No additional script should be added
  });

  it('should set the onload callback if provided', () => {
    const scriptSrc = 'https://example.com/test.js';
    const onloadSpy = jasmine.createSpy('onloadCallback');

    loadScript(mockWindowRef, scriptSrc, onloadSpy);

    const scripts = mockDocument.getElementsByTagName('script');
    expect(scripts.length).toBe(1);
    expect(scripts[0].onload).toBe(onloadSpy);
  });

  it('should set the id of the script if provided', () => {
    const scriptSrc = 'https://example.com/test.js';
    const scriptId = 'test-script-id';

    loadScript(mockWindowRef, scriptSrc, undefined, scriptId);

    const scripts = mockDocument.getElementsByTagName('script');
    expect(scripts.length).toBe(1);
    expect(scripts[0].id).toBe(scriptId);
  });

  it('should handle multiple scripts being added', () => {
    const scriptSrc1 = 'https://example.com/test1.js';
    const scriptSrc2 = 'https://example.com/test2.js';

    loadScript(mockWindowRef, scriptSrc1);
    loadScript(mockWindowRef, scriptSrc2);

    const scripts = mockDocument.getElementsByTagName('script');
    expect(scripts.length).toBe(2);
    expect(scripts[0].src).toBe(scriptSrc1);
    expect(scripts[1].src).toBe(scriptSrc2);
  });
});