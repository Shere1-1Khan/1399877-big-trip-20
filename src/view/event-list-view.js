import AbstractView from '../framework/view/abstract-view.js';

function createListEvent(){
  return '<ul class="trip-events__list"></ul>';
}

export default class ListEvent extends AbstractView {
  get template() {
    return createListEvent();
  }
}
