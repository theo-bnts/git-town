// /app/services/errorHandler.jsx
import { API_ERRORS } from "@/app/services/errorCodes";

export function handleApiError(res, data) {
  const status = res.status;

  if (data.error && API_ERRORS[status] && API_ERRORS[status][data.error]) {
    throw new Error(API_ERRORS[status][data.error]);
  }
  
  if (API_ERRORS[status] && API_ERRORS[status].default) {
    throw new Error(API_ERRORS[status].default);
  }

  throw new Error(`Oups, une erreur s'est produite (code ${status}).`);
}
