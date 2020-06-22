# Desarrollo de Software | Evaluación Corta 3 - Contenedores de PetroMiles

<p align="center">
  <img 
  alt="PetroMiles Round Logo"
  width="192" src="petromiles-frontend/public/img/icons/android-chrome-192x192.png">
</p>

## Levantar servicios con contenedores

Estos contenedores se construyeron haciendo uso de Docker y Docker Compose con fines educativos

### Backend

1. Crear archivo petromiles-backend/.env

```bash
# API
PORT=

# DATABASE
DATABASE_NAME=
DATABASE_PORT=
DATABASE_HOST=
DATABASE_TYPE=
DATABASE_USER=
DATABASE_PASSWORD=
DATABASE_SYNCHRONIZE=

# STRIPE - TEST MODE
STRIPE_SECRET_KEY=
STRIPE_PUBLIC_KEY=
STRIPE_API_VERSION=

# STRIPE - TEST MODE
STRIPE_SECRET_KEY=
STRIPE_PUBLIC_KEY=
STRIPE_API_VERSION=

# SENDGRID - TEST MODE
SENDGRID_API_KEY=
SENDGRID_FROM=
SENDGRID_WELCOME_TEMPLATE=
SENDGRID_WELCOME_INVOICE_EN_TEMPLATE=
SENDGRID_WELCOME_INVOICE_ES_TEMPLATE=
SENDGRID_UPGRADE_TO_GOLD_EN_TEMPLATE=
SENDGRID_UPGRADE_TO_GOLD_ES_TEMPLATE=
SENDGRID_BANK_REGISTRATION_EN_TEMPLATE=
SENDGRID_BANK_REGISTRATION_ES_TEMPLATE=
SENDGRID_BANK_VERIFIED_EN_TEMPLATE=
SENDGRID_BANK_VERIFIED_ES_TEMPLATE=
SENDGRID_BANK_UNVERIFIED_EN_TEMPLATE=
SENDGRID_BANK_UNVERIFIED_ES_TEMPLATE=
SENDGRID_BANK_DELETION_EN_TEMPLATE=
SENDGRID_BANK_DELETION_ES_TEMPLATE=
SENDGRID_SUCCESSFUL_POINTS_PAYMENT_EN_TEMPLATE=2121dde9
SENDGRID_SUCCESSFUL_POINTS_PAYMENT_ES_TEMPLATE=53a0335f
SENDGRID_FAILED_POINTS_PAYMENT_EN_TEMPLATE=46c4
SENDGRID_FAILED_POINTS_PAYMENT_ES_TEMPLATE=4e19
SENDGRID_WITHDRAWAL_EN_TEMPLATE=
SENDGRID_WITHDRAWAL_ES_TEMPLATE=

# JWT
JWT_SECRET=
JWT_NAME=
JWT_EXPIRES_IN=

# POEditor
POEDITOR_API_KEY=
POEDITOR_PROJECT_ID=

# CRON
CRON_INCLUDE=true
```

2. Levantar servicio de Backend y Base de Datos con Docker Compose

```bash
cd petromiles-backend
docker-compose up
```

(Opcional) De querer reiniciar la base de datos creada con el contenedor

```bash
cd petromiles-backend
docker-compose up --build --remove-orphans -V
```

### Frontend

Luego de tener levantados los servicios del backend

1. Crear archivo petromiles-frontend/.env

```bash
# API
VUE_APP_PETROMILES_API_URL=
VUE_APP_PETROMILES_API_PORT=
VUE_APP_PETROMILES_API_TIMEOUT=

# FIREBASE
VUE_APP_FIREBASE_APIKEY=
VUE_APP_FIREBASE_DATABASE_URL=
VUE_APP_FIREBASE_PROYECT_ID=
VUE_APP_FIREBASE_STORAGE_BUCKET=
VUE_APP_FIREBASE_MESSAGING_SENDER_ID=
VUE_APP_FIREBASE_APP_ID=
VUE_APP_FIREBASE_AUTH=

# I18N
VUE_APP_I18N_LOCALE=en
VUE_APP_I18N_FALLBACK_LOCALE=en
```

3. Levantar servicio de Frontend con Docker

```bash
cd petromiles-frontend
docker build -t petromiles-frontend .
docker run --publish 8000:8080 --network host --env-file=.env petromiles-frontend
```

## Integrantes

<p>
    <img
      alt="Gustavo Sánchez Github Avatar" 
      width="80" 
      src="https://github.com/gustavosr98.png?size=80"
    >
    <img
      alt="michellealleyne Github Avatar" 
      width="80" 
      src="https://github.com/michellealleyne.png?size=80"
    >
    <img
      alt="JAA1998 Github Avatar"
      width="80"
      src="https://github.com/JAA1998.png?size=80"
    >
</p>

- Gustavo Sánchez [@gustavosr98](https://github.com/gustavosr98)
- Michelle Alleyne [@michellealleyne](https://github.com/michellealleyne)
- Javier Andrade [@JAA1998](https://github.com/JAA1998)
