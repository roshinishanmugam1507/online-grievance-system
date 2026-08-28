import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  fetchGrievances,
  selectAllGrievances,
  selectGrievanceStatus,
  selectGrievanceError,
  submitGrievance,
  updateGrievance,
  withdrawGrievance
} from '../features/grievances/grievanceSlice';

export const useGrievances = (filterParams = null) => {
  const dispatch = useDispatch();
  const allGrievances = useSelector(selectAllGrievances);
  const status = useSelector(selectGrievanceStatus);
  const error = useSelector(selectGrievanceError);

  useEffect(() => {
    // If not loaded or explicit params, fetch
    if (allGrievances.length === 0 && status === 'idle') {
      dispatch(fetchGrievances(filterParams || {}));
    }
  }, [dispatch, allGrievances.length, status, filterParams]);

  return {
    grievances: allGrievances,
    status,
    error,
    refresh: (params) => dispatch(fetchGrievances(params || {})),
    submit: (data) => dispatch(submitGrievance(data)),
    update: (id, data) => dispatch(updateGrievance({ id, data })),
    withdraw: (id, reason, citizenName) =>
      dispatch(withdrawGrievance({ id, reason, citizenName }))
  };
};
