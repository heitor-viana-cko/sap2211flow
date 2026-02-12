import { EventService } from '@spartacus/core';
import { EMPTY } from 'rxjs';
import createSpy = jasmine.createSpy;

export class MockEventService implements Partial<EventService> {
  get = createSpy().and.returnValue(EMPTY);
  dispatch = createSpy();
}