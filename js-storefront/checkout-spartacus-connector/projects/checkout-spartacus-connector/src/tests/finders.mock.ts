import { DebugElement, Type } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

export function queryDebugElementByCss<T>(fixture: ComponentFixture<T>, selector: string): DebugElement {
  const debugElement = fixture.debugElement.query(By.css(selector));
  return debugElement;
}

export function queryAllDebugElementsByCss<T>(fixture: ComponentFixture<T>, selector: string) {
  return fixture.debugElement.queryAll(By.css(selector));
}

export function queryDebugElementById<T>(fixture: ComponentFixture<T>, testId: string) {
  const selector = `[data-test-id="${testId}"]`;
  return queryDebugElementByCss(fixture, selector);
}

export function queryAllByDirective<T, D>(fixture: ComponentFixture<T>, directive: Type<D>) {
  return fixture.debugElement.queryAll(By.directive(directive));
}

export function getTextContentById<T>(fixture: ComponentFixture<T>, testId: string): string {
  const debugElement = queryDebugElementById(fixture, testId);
  const element = debugElement.nativeElement;
  return element.textContent.trim();
}

export function getTextContentByCss<T>(fixture: ComponentFixture<T>, selector: string): string {
  const debugElement = queryDebugElementByCss(fixture, selector);
  const element = debugElement.nativeElement;
  return element.textContent.trim();
}

export function getTextContentByDebugElement(debugElement: DebugElement): string {
  const element = debugElement.nativeElement;
  return element.textContent.trim();
}

export const flowUIConfiguration = {
  colorAction: '#5E48FC',
  colorBackground: '#0A0A0C',
  colorBorder: '#68686C',
  colorDisabled: '#64646E',
  colorError: '#FF3300',
  colorFormBackground: '#1F1F1F',
  colorFormBorder: '#1F1F1F',
  colorInverse: '#F9F9FB',
  colorOutline: '#ADA4EC',
  colorPrimary: '#F9F9FB',
  colorSecondary: '#828388',
  colorSuccess: '#2ECC71',
  button: {
    fontSize: '16px',
  },
  borderRadius: ['8px', '8px'],
};