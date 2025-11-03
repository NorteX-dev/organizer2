# TODO - Lista zadań do spełnienia 100% wymagań projektu

## 📋 1. Product Backlog (Rejestr Produktu)

### 1.1 Interfejs Product Backlog

- [x] Utworzyć kontroler `BacklogController` dla zarządzania backlogiem produktu
- [x] Dodać route `GET /projects/{project}/backlog` - wyświetlanie backlogu produktu
- [x] Stworzyć stronę frontend `resources/js/pages/projects/[id]/backlog.tsx`
- [x] Wyświetlać wszystkie zadania projektu, które nie są przypisane do sprintu (`sprint_id IS NULL`)
- [x] Dodać możliwość sortowania zadań w backlogu (ręczne, przyciskami up/down)
- [x] Zaimplementować filtrowanie zadań po typie (story, task, bug, epic), priorytecie, statusie
- [x] Dodać wyszukiwarkę zadań w backlogu

### 1.2 Zarządzanie elementami Product Backlog

- [x] Dodać route `POST /projects/{project}/backlog` - tworzenie zadania w backlogu
- [x] Dodać route `PUT /projects/{project}/backlog/{task}` - edycja zadania w backlogu
- [x] Dodać route `DELETE /projects/{project}/backlog/{task}` - usuwanie zadania z backlogu
- [x] Dodać route `POST /projects/{project}/backlog/reorder` - zmiana kolejności zadań
- [x] Zaimplementować priorytetyzację zadań w backlogu (zmiana kolejności)
- [ ] Dodać możliwość masowej edycji zadań (zmiana priorytetu, story points)

### 1.3 Estymacja i priorytetyzacja

- [x] Upewnić się, że estymacja story points działa poprawnie w backlogu
- [x] Dodać możliwość sortowania backlogu po story points (filtrowanie)
- [x] Dodać możliwość sortowania backlogu po priorytecie (filtrowanie)
- [x] Dodać wizualizację priorytetów w liście backlogu (kolory, ikony)

## 🏃 2. Sprint Planning i Przenoszenie zadań

### 2.1 Przenoszenie z Product Backlog do Sprint Backlog

- [x] Dodać route `POST /projects/{project}/sprints/{sprint}/tasks/add-from-backlog`
- [x] Stworzyć interfejs do wyboru zadań z backlogu podczas planowania sprintu
- [x] Zaimplementować funkcję przenoszenia zadań z backlogu do sprintu (zmiana `sprint_id`)
- [x] Dodać możliwość masowego przenoszenia zadań (checkbox selection)
- [x] Dodać walidację - nie można przenieść zadania już przypisanego do innego sprintu
- [x] Dodać możliwość cofnięcia zadania z sprintu z powrotem do backlogu

### 2.2 Interfejs planowania sprintu

- [x] Rozszerzyć stronę tworzenia sprintu o sekcję wyboru zadań z backlogu
- [x] Wyświetlać dostępne zadania z backlogu z możliwością zaznaczenia
- [x] Pokaż podsumowanie: suma story points wybranych zadań
- [x] Dodać możliwość dodawania zadań do istniejącego sprintu (nie tylko podczas tworzenia)
- [x] Dodać możliwość wyświetlania backlogu podczas edycji sprintu

### 2.3 Walidacja i ograniczenia

- [x] Sprawdzać czy sprint nie przekracza capacity (jeśli zdefiniowane)
- [x] Ostrzegać użytkownika przy przekroczeniu planowanych story points
- [x] Dodać możliwość ustawienia capacity sprintu

## 🔗 3. Dekompozycja historyjek użytkownika

### 3.1 Relacje między zadaniami

- [ ] Dodać kolumnę `parent_task_id` do tabeli `tasks` (migration)
- [ ] Zaktualizować model `Task` o relacje `parentTask()` i `subTasks()`
- [ ] Dodać możliwość tworzenia zadania jako podzadania (child task)
- [ ] Zaimplementować hierarchię: Epic → Story → Task
- [ ] Dodać możliwość dekompozycji story na zadania bezpośrednio z interfejsu

### 3.2 Interfejs dekompozycji

- [ ] Dodać przycisk "Rozbij na zadania" przy zadaniach typu "story" lub "epic"
- [ ] Stworzyć dialog/modal do tworzenia podzadań
- [ ] Wyświetlać drzewo zadań (hierarchia) w liście backlogu
- [ ] Wyświetlać drzewo zadań w sprint backlog
- [ ] Dodać możliwość zwinania/rozwijania podzadań
- [ ] Dodać wizualizację relacji parent-child (wcięcia, linie)

### 3.3 Logika biznesowa

- [ ] Upewnić się, że usunięcie parent task nie usuwa automatycznie podzadań (może opcjonalnie)
- [ ] Dodać możliwość przenoszenia podzadań razem z parent task do sprintu
- [ ] Zaimplementować automatyczne sumowanie story points parent task z podzadań
- [ ] Dodać możliwość przeciągnięcia zadania jako podzadanie innego zadania

## 👥 4. System ról Scrum

### 4.1 Struktura ról

- [ ] Utworzyć migrację `create_roles_table` z rolami: `product_owner`, `scrum_master`, `developer`, `admin`
- [ ] Dodać tabelę pivot `team_user_role` dla przypisywania ról użytkownikom w zespole
- [ ] Zaktualizować model `User` o relację `roles()` w kontekście zespołu
- [ ] Dodać model `Role` lub enum dla ról Scrum
- [ ] Dodać metodę `hasRole($team, $role)` w modelu User

### 4.2 Autoryzacja oparta na rolach

- [ ] Zaktualizować `ProjectPolicy` aby sprawdzać role użytkownika
- [ ] Zaktualizować `SprintPolicy` aby sprawdzać role użytkownika
- [ ] Dodać uprawnienia specyficzne dla ról:
    - Product Owner: zarządzanie backlogiem, priorytetyzacja, akceptacja zadań
    - Scrum Master: zarządzanie sprintami, retrospektywy, usuwanie blokerów
    - Developer: praca nad zadaniami, aktualizacja statusów
    - Admin: pełny dostęp do wszystkich funkcji
- [ ] Dodać middleware sprawdzające role użytkownika

### 4.3 Interfejs zarządzania rolami

- [ ] Dodać możliwość przypisywania ról użytkownikom w zespole
- [ ] Stworzyć interfejs w sekcji zarządzania zespołem do przypisywania ról
- [ ] Wyświetlać role użytkowników w interfejsie
- [ ] Dodać możliwość zmiany ról (tylko dla admina)
- [ ] Dodać wizualne oznaczenia ról w interfejsie (badges, kolory)

## 📝 5. Retrospektywy

### 5.1 Backend - Retrospektywy

- [ ] Utworzyć `RetrospectiveController` z pełnym CRUD
- [ ] Dodać route `GET /projects/{project}/sprints/{sprint}/retrospective`
- [ ] Dodać route `POST /projects/{project}/sprints/{sprint}/retrospective`
- [ ] Dodać route `PUT /projects/{project}/sprints/{sprint}/retrospective/{retrospective}`
- [ ] Zaimplementować logikę tworzenia retrospektywy po zakończeniu sprintu
- [ ] Dodać możliwość dodawania punktów: "Co poszło dobrze", "Co poszło źle", "Co poprawić"

### 5.2 System głosowania

- [ ] Zaimplementować endpoint do głosowania na punkty retrospektywy
- [ ] Dodać route `POST /retrospectives/{retrospective}/vote`
- [ ] Zaimplementować możliwość upvote/downvote punktów retrospektywy
- [ ] Dodać wyświetlanie liczby głosów dla każdego punktu
- [ ] Upewnić się, że użytkownik może zagłosować tylko raz na punkt

### 5.3 Interfejs retrospektywy

- [ ] Stworzyć stronę `resources/js/pages/projects/[id]/sprints/[sprintId]/retrospective.tsx`
- [ ] Dodać formularz do tworzenia/edycji retrospektywy
- [ ] Wyświetlać sekcje: "Co poszło dobrze", "Co poszło źle", "Co poprawić"
- [ ] Dodać możliwość głosowania na punkty (przyciski upvote/downvote)
- [ ] Dodać możliwość dodawania komentarzy do punktów retrospektywy (opcjonalnie)
- [ ] Dodać link do retrospektywy w widoku sprintu (po zakończeniu)

## 💬 6. Komentarze do zadań

### 6.1 Backend - Komentarze

- [ ] Dodać metody do `TaskController` lub utworzyć `TaskCommentController`
- [ ] Dodać route `GET /tasks/{task}/comments` - lista komentarzy
- [ ] Dodać route `POST /tasks/{task}/comments` - dodawanie komentarza
- [ ] Dodać route `PUT /tasks/{task}/comments/{comment}` - edycja komentarza
- [ ] Dodać route `DELETE /tasks/{task}/comments/{comment}` - usuwanie komentarza
- [ ] Zaimplementować soft deletes dla komentarzy (opcjonalnie)
- [ ] Dodać możliwość edycji własnych komentarzy tylko przez autora

### 6.2 Interfejs komentarzy

- [ ] Dodać sekcję komentarzy w widoku szczegółów zadania
- [ ] Stworzyć komponent `TaskComments` w frontend
- [ ] Dodać formularz do dodawania nowego komentarza
- [ ] Wyświetlać komentarze z informacją o autorze i dacie
- [ ] Dodać możliwość edycji i usuwania własnych komentarzy
- [ ] Dodać możliwość oznaczenia komentarza jako rozwiązanie problemu (opcjonalnie)

## 🗣️ 7. WebSocket Chat (Opcjonalne, ale wymienione w opisie)

### 7.1 Backend - WebSocket

- [ ] Zainstalować Laravel Broadcasting (Pusher, Laravel Echo Server lub podobne)
- [ ] Skonfigurować broadcasting w `config/broadcasting.php`
- [ ] Utworzyć eventy dla wiadomości czatu
- [ ] Dodać route WebSocket dla czatu
- [ ] Zaimplementować kanały czatu per projekt lub per zespół

### 7.2 Model i struktura czatu

- [ ] Utworzyć migrację `create_chat_messages_table`
- [ ] Dodać model `ChatMessage`
- [ ] Dodać relacje: ChatMessage belongsTo User, ChatMessage belongsTo Project/Team
- [ ] Zaimplementować endpoint `POST /chat/messages` do wysyłania wiadomości

### 7.3 Frontend - Czat

- [ ] Zainstalować Laravel Echo i Pusher JS (lub alternatywę)
- [ ] Stworzyć komponent czatu `ChatWindow`
- [ ] Dodać widok czatu per projekt lub w layoutzie aplikacji
- [ ] Zaimplementować real-time wyświetlanie wiadomości
- [ ] Dodać wskaźniki "pisze..." (typing indicators)
- [ ] Dodać powiadomienia o nowych wiadomościach

## 📊 8. Historia aktywności projektu

### 8.1 Implementacja ProjectActivity

- [ ] Zaimplementować logowanie aktywności przy zmianach:
    - Tworzenie/edycja/usuwanie zadań
    - Zmiana statusu zadania
    - Przypisanie zadania do użytkownika
    - Dodanie zadania do sprintu
    - Zmiany w sprintach
    - Zmiany w projekcie
- [ ] Dodać automatyczne tworzenie `ProjectActivity` w kontrolerach
- [ ] Utworzyć helper method `logActivity()` w kontrolerach

### 8.2 Interfejs historii

- [ ] Dodać route `GET /projects/{project}/activities` - historia aktywności
- [ ] Stworzyć stronę/widok historii aktywności projektu
- [ ] Wyświetlać chronologiczną listę aktywności
- [ ] Dodać filtrowanie aktywności po typie, użytkowniku, dacie
- [ ] Dodać paginację dla historii aktywności
- [ ] Możliwie dodać feed aktywności w dashboardzie projektu

## 🔒 9. Zabezpieczenia i walidacja

### 9.1 Zabezpieczenia

- [ ] Sprawdzić wszystkie endpointy pod kątem autoryzacji
- [ ] Dodać walidację CSRF dla wszystkich formularzy
- [ ] Zaimplementować rate limiting dla API
- [ ] Dodać walidację danych wejściowych we wszystkich kontrolerach
- [ ] Zabezpieczyć wrażliwe dane (tokens GitHub) przed wyciekiem

### 9.2 Walidacja danych

- [ ] Dodać szczegółowe reguły walidacji dla wszystkich formularzy
- [ ] Sprawdzić walidację dat sprintów (nie mogą się nakładać)
- [ ] Dodać walidację story points (zakres wartości)
- [ ] Dodać walidację relacji między zadaniami (parent-child nie może tworzyć cykli)

## ✅ 10. Testy i weryfikacja

### 10.1 Testy jednostkowe

- [ ] Napisać testy dla wszystkich kontrolerów
- [ ] Testy dla modeli i relacji
- [ ] Testy dla polityk autoryzacji (Policies)
- [ ] Testy dla dekompozycji zadań (parent-child)

### 10.2 Testy funkcjonalne

- [ ] Testy dla przepływu: Product Backlog → Sprint Backlog
- [ ] Testy dla systemu ról i autoryzacji
- [ ] Testy dla retrospektyw
- [ ] Testy dla komentarzy

## 📌 Priorytety

### Wysoki priorytet (wymagane dla 100%):

1. Product Backlog - interfejs i zarządzanie
2. Przenoszenie zadań z backlogu do sprintów
3. System ról Scrum
4. Retrospektywy
5. Komentarze do zadań

### Średni priorytet:

6. Dekompozycja historyjek
7. Historia aktywności
8. Testy automatyczne

### Niski priorytet (opcjonalne):

9. WebSocket Chat
10. Zaawansowane wizualizacje
11. Dokumentacja użytkownika

---
