import { PURGE } from 'redux-persist';

const purgeMiddleware = store => next => action => {
  if (action.type === 'auth/logout') {
    store.dispatch({ type: PURGE, key: 'root'});
  }
  return next(action);
};

export default purgeMiddleware;