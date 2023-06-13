import { render, replace, remove } from '../framework/render.js';
import EventsView from '../view/event-view.js';
import EventEdit from '../view/event-edit.js';
import {UpdateType, UserAction} from '../const.js';


const PointMode = {
  VIEW: 'view',
  EDIT: 'edit',
};

export default class PointPresenter{

  #eventsListView = null;
  #offersModel = null;
  #destinationsModel = null;
  #pointData = null;
  #pointViewComponent = null;
  #pointEditComponent = null;
  #newPoint = null;
  #handleEditModeChange = null;
  #handleDataChange = null;
  #mode = PointMode.VIEW;
  #onDeleteClick = null;

  constructor({eventsListView, offersModel, destinationsModel, onDataChange}) {
    this.#eventsListView = eventsListView;
    this.#offersModel = offersModel;
    this.#destinationsModel = destinationsModel;
    this.#handleDataChange = onDataChange;
  }


  #handelDeleteClick = (point) => {
    this.#handleDataChange(
      UserAction.DELETE_POINT,
      UpdateType.MINOR,
      point,
    );
  };


  #createViewModeComponent(point) {
    const pointView = new EventsView({
      point,
      destination : this.#destinationsModel.getById(point.destination),
      offers : this.#offersModel.getByType(point.type),
    });
    pointView.setEditHandler(this.openEditMode);
    pointView.setEditHandlerKey(this.openEditMode);
    pointView.setFavoriteHandler(this.changeFavorite);

    return pointView;
  }

  #createEditModeComponent(point) {
    const pointEdit = new EventEdit ({
      point,
      destinations : this.#destinationsModel.get(),
      offers : this.#offersModel.get(),
      onSave : this.#handlerPointSubmit,
      onDelete : this.#handelDeleteClick
    });

    pointEdit.setCancelHandler(this.closeEditMode);
    return pointEdit;
  }

  #renderOrReplace(view) {
    const currentView = this.#mode === PointMode.VIEW ? this.#pointViewComponent : this.#pointEditComponent;
    if (currentView) {
      replace(view, currentView);
    } else {
      render(view, this.#eventsListView.element);
    }
  }

  #renderEditMode() {
    const view = this.#createEditModeComponent(this.#pointData);
    this.#renderOrReplace(view);
    this.#pointEditComponent = view;
    this.#mode = PointMode.EDIT;
  }

  #renderViewMode() {
    const view = this.#createViewModeComponent(this.#pointData);
    this.#renderOrReplace(view);

    this.#pointViewComponent = view;
    this.#mode = PointMode.VIEW;
  }


  openEditMode = () =>{
    if(this.#mode === PointMode.VIEW){
      this.#renderEditMode();
      this.#handleEditModeChange?.();
      document.addEventListener('keydown', this.escKeyDownHandler);
    }
  };

  setOpenEditModeHandler = (cb) =>{
    this.#handleEditModeChange = cb;
  };

  closeEditMode = () => {
    if(this.#mode === PointMode.EDIT){
      this.#renderViewMode();
      document.removeEventListener('keydown', this.escKeyDownHandler);
    }
  };

  escKeyDownHandler = (evt) => {
    if(evt.key === 'Escape'){
      evt.preventDefault();
      this.closeEditMode();
    }
  };

  changeFavorite = () => {
    this.#handleDataChange(
      UserAction.UPDATE_POINT,
      UpdateType.PATCH,
      {...this.#pointData,isFavorite: !this.#pointData.isFavorite});
  };


  destroy(){
    this.closeEditMode();
    remove(this.#pointEditComponent);
    remove(this.#pointViewComponent);
  }

  #handlerPointSubmit = (point) => {
    this.#pointData = point;
    this.#handleDataChange(
      UserAction.UPDATE_POINT,
      UpdateType.MINOR,
      {...this.#pointData});

    this.#renderViewMode();
  };

  init(pointData) {
    this.#pointData = pointData;
    if (this.#mode === PointMode.VIEW) {
      this.#renderViewMode();
    } else {
      this.#renderEditMode();
    }
  }

}
