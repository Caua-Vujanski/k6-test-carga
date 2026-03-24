import http from 'k6/http';
import { check } from 'k6';

export const options = {
  vus: 100,
  duration: '5m',
};

const users = JSON.parse(open('./users.json'));

export default function () {
  const url = 'https://erp-api-dev-922117522963.us-central1.run.app/api/v1/app/auth/login';
  const user = users[__VU % users.length];

  const payload = `login=${user.login}&password=${user.senha}`;

  const res = http.post(url, payload, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });

  check(res, {
    'status 200': (r) => r.status === 200,
  });
}