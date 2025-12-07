import { Component } from './Component';
import { IEvents } from './Events';

export abstract class View<T> extends Component<T> {
  protected events: IEvents;

  constructor(container: HTMLElement, events: IEvents) {
    super(container);
    this.events = events;
  }
}
