import { GlobalMessageService } from '@spartacus/core';

export class MockGlobalMessageService implements Partial<GlobalMessageService> {
  add = jasmine.createSpy('add');
}

export const globalMessageServiceSpy: jasmine.SpyObj<GlobalMessageService> = jasmine.createSpyObj('GlobalMessageService', ['add']);
