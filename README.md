## Instrukcje uruchomienia aplikacji:

### Wymagania wstępne:
- Zainstalowane PHP 8.3 lub nowsze (NTS) ze strony [php.net](https://www.php.net/downloads.php).
- Zainstalowany Composer ze strony [getcomposer.org](https://getcomposer.org/download/) (dla Windows jest dostępny instalator `.msi`).
- Zainstalowany serwer bazy danych PostgreSQL (np. poprzez narzędzie desktopowe pgAdmin).
- Zainstalowany Node.js w wersji 20 (najlepiej LTS) lub nowszej ze strony [nodejs.org](https://nodejs.org/en/download/).

### Przygotowanie aplikacji:
W terminalu ustawionym na katalog główny aplikacji wykonaj następujące kroki:
- Zainstaluj zależności PHP za pomocą Composera:
  ```
  composer install
  ```
- Skopiuj plik konfiguracyjny środowiska:
  ```
  cp .env.example .env
  ```
- Wygeneruj klucz aplikacji:
  ```
  php artisan key:generate
  ```
- Skonfiguruj połączenie z bazą danych w pliku `.env`, ustawiając odpowiednie wartości dla `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME` i `DB_PASSWORD`. Przykładowy `.env.example` ma już ustawione (na datę 19/01 aktualne) klucze autoryzacji GitHub.
- Wykonaj migracje bazy danych:
  ```
  php artisan migrate
  ```
- Zainstaluj zależności front-endowe za pomocą npm:
  ```
  npm install
  ```
- Skompiluj zasoby front-endowe:
  ```
  npm run dev
  ```
  
### Uruchomienie aplikacji:
- Lokalny serwer deweloperski:
  ```
  composer run dev
  ```
- Jednocześnie w oddzielnym oknie terminala (serwer WebSocket):
  ```
  php artisan reverb:start
  ```
  
Aplikacja będzie dostępna pod adresem `http://localhost:8000`.