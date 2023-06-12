import AbstractStatefulView from '../framework/view/abstract-stateful-view';
import flatpickr from 'flatpickr';

import 'flatpickr/dist/flatpickr.min.css';


function createItemEvent(data){

  const {point, destinations , offers} = data;
  const currentOffers = offers.find((offer) => offer.type === point.type)?.offers ?? [];
  const currentDestination = destinations.find((destination) => destination.id === point.destination);

  const descriptionTitles = destinations.map((destination) => `<option value="${destination.name}"></option>`).join('');
  const destinationPhoto = currentDestination?.picture
    ?.map((picture) => `<img class="event__photo" src="${picture.src}" alt="${picture.description}">`).join('');

  const currentOffersList = currentOffers.map((offer) => `
    <div class="event__offer-selector">
      <input class="event__offer-checkbox  visually-hidden" id="${offer.id}" type="checkbox" name="event-offer-luggage"
      ${point.offers?.some((offerId) => offerId === offer.id) ? ' checked' : ''}>
      <label class="event__offer-label" for="${offer.id}">
        <span class="event__offer-title">${offer.title}</span>
        &plus;&euro;&nbsp;
        <span class="event__offer-price">${offer.price}</span>
      </label>
    </div>`).join('');

  const typeList = offers.map((offer) => `
    <div class="event__type-item">
      <input id="event-type-${offer.type}" class="event__type-input  visually-hidden" type="radio" name="event-type" value="${offer.type}">
      <label class="event__type-label  event__type-label--${offer.type}" for="event-type-${offer.type}">${offer.type}</label>
    </div>`).join('');

  return (`<li class="trip-events__item">
  <form class="event event--edit" action="#" method="post">
    <header class="event__header">
      <div class="event__type-wrapper">
        <label class="event__type  event__type-btn" for="event-type-toggle-1">
          <span class="visually-hidden">Choose event type</span>
          <img class="event__type-icon" width="17" height="17" src="img/icons/${point.type}.png" alt="Event type icon">
        </label>
        <input class="event__type-toggle  visually-hidden" id="event-type-toggle-1" type="checkbox">

        <div class="event__type-list">
          <fieldset class="event__type-group">
            <legend class="visually-hidden">Event type</legend>
            ${typeList}
          </fieldset>
        </div>
      </div>

      <div class="event__field-group  event__field-group--destination">
        <label class="event__label  event__type-output" for="event-destination-1">
          ${point.type}
        </label>
        <input class="event__input  event__input--destination" id="event-destination-1" type="text" name="event-destination"
        value="${currentDestination?.name || ''}"
        list="destination-list-1">
        <datalist id="destination-list-1">
        ${descriptionTitles}
        </datalist>
      </div>

      <div class="event__field-group  event__field-group--time">
        <label class="visually-hidden" for="event-start-time-1">From</label>
        <input class="event__input  event__input--time" id="event-start-time-1" type="text" name="event-start-time" value="19/03/19 00:00">
        &mdash;
        <label class="visually-hidden" for="event-end-time-1">To</label>
        <input class="event__input  event__input--time" id="event-end-time-1" type="text" name="event-end-time" value="19/03/19 00:00">
      </div>

      <div class="event__field-group  event__field-group--price">
        <label class="event__label" for="event-price-1">
          <span class="visually-hidden">Price</span>
          &euro;
        </label>
        <input class="event__input  event__input--price" id="event-price-1" type="text" name="event-price" value="${point.basePrice}">
      </div>

      <button class="event__save-btn  btn  btn--blue" type="submit">Save</button>
      <button class="event__reset-btn" type="reset">Delete</button>
    </header>
    <section class="event__details">
    <section class="event__section  event__section--offers">
      <h3 class="event__section-title  event__section-title--offers">Offers</h3>
      <div class="event__available-offers">${currentOffersList}</div>
    </section>
  </section>
    <section class="event__details">
      <section class="event__section  event__section--destination">
        <h3 class="event__section-title  event__section-title--destination">Destination</h3>
        <p class="event__destination-description">${point.type}</p>

        <div class="event__photos-container">
          <div class="event__photos-tape">
           ${destinationPhoto}
          </div>
        </div>
      </section>
    </section>
  </form>
</li>`);
}

export default class EventEdit extends AbstractStatefulView {

  #handelSave = null;
  #handelCansel = null;

  #destinations = null;
  #offers = null;

  #datepickerFrom = null;
  #datepickerTo = null;
  #handelDeleteClick = null;

  constructor({point, destinations, offers, onSave, onDelete}){
    super();
    this.#destinations = destinations;
    this.#offers = offers;

    this.#handelSave = onSave;

    this._setState(EventEdit.parsePointToState({point}));
    this.#handelDeleteClick = onDelete;

    this._restoreHandlers();
  }

  get template() {
    return createItemEvent({
      destinations : this.#destinations,
      offers : this.#offers,
      ...this._state
    });
  }

  #formSubmitHandler = (evt) => {
    evt.preventDefault();
    this.#handelSave(EventEdit.parseStateToPoint(this._state));
  };

  #resetButtonClickHandler = (evt) => {
    evt.preventDefault();
    this.#handelCansel();
  };

  setCancelHandler(cb) {
    this.#handelCansel = cb;
  }

  #typeChangeHandler = (evt) => {
    this._state.point.type = evt.target.value;

    this.updateElement({
      point: {
        ...this._state.point,
        type: evt.target.value,
        offers : []
      }
    });
  };

  #offerClickHandler = (evt) => {
    evt.preventDefault();

    const checkedBoxes = Array.from(this.element.querySelectorAll('.event__offer-checkbox:checked'));

    this._setState({
      point : {
        ...this._state.point,
        offers : checkedBoxes.map((element) => element.id)
      }
    });
  };

  #destinationListChangeHandler = (evt) => {
    evt.preventDefault();
    this._state.point.destination = this.#destinations.find((destination) => destination.name === evt.target.value)?.id;

    this.updateElement(this._state);
  };

  #PriceChangeHandler = (evt) => {
    this._state.point.basePrice = evt.target.value;

    this.updateElement(this._state);
  };


  _restoreHandlers(){
    this.element.querySelector('form').addEventListener('submit', this.#formSubmitHandler);
    this.element.querySelector('.event__reset-btn').addEventListener('click', this.#formDeleteClickHandler);

    this.element.querySelector('.event__type-group').addEventListener('change', this.#typeChangeHandler);
    this.element.querySelector('.event__input--destination').addEventListener('change', this.#destinationListChangeHandler);
    this.element.querySelector('.event__input--price').addEventListener('change', this.#PriceChangeHandler);
    this.element.querySelector('.event__section--offers').addEventListener('change', this.#offerClickHandler);

    this.#setDatapickers();

  }

  #formDeleteClickHandler = (evt) => {
    evt.preventDefault();
    this.#handelDeleteClick(EventEdit.parseStateToPoint(this._state));
  };

  removeElement = () => {
    super.removeElement();

    if(this.#datepickerFrom){
      this.#datepickerFrom.destroy();
      this.#datepickerFrom = null;
    }

    if(this.#datepickerTo){
      this.#datepickerTo.destroy();
      this.#datepickerTo = null;
    }
  };

  #dateFromChangeHandler = ([userDate]) => {
    this._setState({
      point : {
        ...this._state.point,
        dateFrom : userDate
      }
    });
    this.#datepickerFrom.set('minDate', this._state.point.dateFrom);
  };

  #dateToChangeHandler = ([userDate]) => {
    this._setState({
      point : {
        ...this._state.point,
        dateTo : userDate
      }
    });
    this.#datepickerTo.set('maxDate', this._state.point.dateTo);
  };

  #setDatapickers = () => {

    const [dateFromElement, dateToElement] = this.element.querySelectorAll('.event__input--time');

    this.#datepickerFrom = flatpickr(
      dateFromElement,
      {
        dateFormat : 'd/m/y H:i',
        defaultDate : this._state.point.dateFrom,
        onClose : this.#dateFromChangeHandler,
        enableTime : true,
        locale: {
          firstDayOfWeek : 1,
        },
        'time_24hr' : true
      },
    );


    this.#datepickerTo = flatpickr(
      dateToElement,
      {
        dateFormat : 'd/m/y H:i',
        defaultDate : this._state.point.dateTo,
        onClose : this.#dateToChangeHandler,
        enableTime : true,
        locale: {
          firstDayOfWeek : 1,
        },
        'time_24hr' : true
      },
    );

  };

  static parsePointToState = (data) => ({...data});

  static parseStateToPoint = (state) => state.point;
}

