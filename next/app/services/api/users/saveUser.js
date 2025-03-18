import { usersRoute, userRoute } from "@/app/services/routes";
import { handleApiError } from "@/app/services/errorHandler";

export default async function saveUser(userData, token) {
  let url, method;
  if (userData.Id) {
    url = userRoute(userData.Id);
    method = "PATCH";
  } else {
    url = usersRoute();
    method = "PUT";
  }

  const res = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(userData)
  });

  const text = await res.text();
  const data = text ? JSON.parse(text) : {};

  if (res.ok) return data;
  handleApiError(res, data);
}