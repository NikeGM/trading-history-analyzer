Подготовка к запуску
1) Создать бд, юзера, дать юзеру доступ к бд (см. конфиги)
2) npm i
3) knex migrate:latest
4) npm run load

Запуск
npm run start

или с помощью pm2
pm2 start pm2.json 