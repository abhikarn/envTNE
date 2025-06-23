import { Injectable } from '@angular/core';
import { IFormControl } from '../form-control.interface';

@Injectable({
  providedIn: 'root'
})
export class FormEventService {
  private eventHandlers = new Map<string, Map<string, (event: any, control: IFormControl) => void>>();

  // Register a handler for a specific event type and control
  registerHandler(controlName: string, eventType: string, handler: (event: any, control: IFormControl) => void): void {
    if (!this.eventHandlers.has(controlName)) {
      this.eventHandlers.set(controlName, new Map());
    }
    this.eventHandlers.get(controlName)?.set(eventType, handler);
  }

  // Handle an event for a specific control
  handleEvent(controlName: string, eventType: string, event: any, control: IFormControl): void {
    const controlHandlers = this.eventHandlers.get(controlName);
    if (controlHandlers) {
      const handler = controlHandlers.get(eventType);
      if (handler) {
        handler(event, control);
      }
    }
  }

  // Handle form-level events (maintains backward compatibility)
  handleFormEvent(eventType: string, data: { event: any; control: IFormControl }, eventHandler: any): void {
    const field = data.control;
    const event = data.event;
    const handlerName = field.events?.[eventType];

    if (handlerName && typeof eventHandler[handlerName] === 'function') {
      eventHandler[handlerName](event, field);
    } else {
      console.warn(`Handler '${handlerName}' is not defined for ${field.name}.`);
    }
  }

  // Clear all handlers for a control
  clearControlHandlers(controlName: string): void {
    this.eventHandlers.delete(controlName);
  }

  // Clear all handlers
  clearAllHandlers(): void {
    this.eventHandlers.clear();
  }
} 