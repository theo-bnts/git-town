export async function setCookie(key, value) {
  await fetch(`/api/cookies/set?key=${encodeURIComponent(key)}&value=${encodeURIComponent(value)}`, {
    method: 'POST',
    credentials: 'include',
  });
}

export async function getCookie(key) {
  const res = await fetch(`/api/cookies/get?key=${encodeURIComponent(key)}`, {
    credentials: 'include',
  });
  const data = await res.json();
  return data.value;
}

export async function removeCookie(key) {
  await fetch(`/api/cookies/remove?key=${encodeURIComponent(key)}`, {
    method: 'POST',
    credentials: 'include',
  });
}
