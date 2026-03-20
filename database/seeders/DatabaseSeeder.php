<?php

namespace Database\Seeders;

use App\Models\Document;
use App\Models\Label;
use App\Models\Project;
use App\Models\ProjectActivity;
use App\Models\Retrospective;
use App\Models\RetrospectiveVote;
use App\Models\Sprint;
use App\Models\Task;
use App\Models\TaskComment;
use App\Models\Team;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::first();

        if (!$user) {
            $this->command->error("Brak użytkowników w bazie. Zaloguj się przez GitHub przed uruchomieniem seedera.");
            return;
        }

        $team = Team::create(["name" => "Przykładowy Zespół"]);
        $team->users()->attach($user->id, ["role" => "scrum_master"]);

        $project = Project::create([
            "team_id" => $team->id,
            "name" => "Platforma E-commerce",
            "description" =>
                "Kompleksowa platforma sprzedaży online z integracją płatności, systemem produktów i panelem administracyjnym.",
            "github_repo" => "przykladowy-zespol/ecommerce-platform",
            "default_sprint_length" => 14,
            "status" => "active",
        ]);

        $sprint1 = Sprint::create([
            "project_id" => $project->id,
            "name" => "Sprint 1",
            "goal" => "Wdrożenie modułu autoryzacji użytkowników oraz podstawowych elementów interfejsu sklepu.",
            "start_date" => "2026-01-06",
            "end_date" => "2026-01-17",
            "status" => "completed",
            "planned_points" => 34,
            "completed_points" => 28,
        ]);

        $sprint2 = Sprint::create([
            "project_id" => $project->id,
            "name" => "Sprint 2",
            "goal" => "Implementacja panelu produktowego, koszyka zakupowego i pierwszych integracji płatności.",
            "start_date" => "2026-01-20",
            "end_date" => "2026-01-31",
            "status" => "active",
            "planned_points" => 29,
            "completed_points" => 12,
        ]);

        $sprint3 = Sprint::create([
            "project_id" => $project->id,
            "name" => "Sprint 3",
            "goal" => "System powiadomień, integracja z mediami społecznościowymi i optymalizacja wydajności.",
            "start_date" => "2026-02-03",
            "end_date" => "2026-02-14",
            "status" => "planning",
            "planned_points" => 0,
            "completed_points" => 0,
        ]);

        $labelFrontend = Label::create(["project_id" => $project->id, "name" => "Frontend", "color" => "#3B82F6"]);
        $labelBackend = Label::create(["project_id" => $project->id, "name" => "Backend", "color" => "#8B5CF6"]);
        $labelPilne = Label::create(["project_id" => $project->id, "name" => "Pilne", "color" => "#EF4444"]);
        $labelUxUi = Label::create(["project_id" => $project->id, "name" => "UX/UI", "color" => "#F59E0B"]);
        $labelDokumentacja = Label::create([
            "project_id" => $project->id,
            "name" => "Dokumentacja",
            "color" => "#10B981",
        ]);
        $labelTesty = Label::create(["project_id" => $project->id, "name" => "Testy", "color" => "#6366F1"]);

        $epicAuth = Task::create([
            "project_id" => $project->id,
            "assigned_to" => $user->id,
            "title" => "Moduł autoryzacji użytkowników",
            "description" =>
                "Epic obejmujący rejestrację, logowanie przez GitHub OAuth, weryfikację e-mail i zarządzanie sesją.",
            "type" => "epic",
            "status" => "Completed",
            "priority" => 7,
            "story_points" => 13,
            "position" => 0,
        ]);

        $taskLogin = Task::create([
            "project_id" => $project->id,
            "sprint_id" => $sprint1->id,
            "parent_task_id" => $epicAuth->id,
            "assigned_to" => $user->id,
            "title" => "Implementacja logowania przez GitHub OAuth",
            "description" =>
                "Użytkownik powinien móc zalogować się za pomocą konta GitHub. Integracja z Laravel Socialite.",
            "type" => "story",
            "status" => "Completed",
            "priority" => 7,
            "story_points" => 5,
            "position" => 1,
        ]);
        $taskLogin->labels()->attach([$labelFrontend->id, $labelBackend->id]);

        $taskRegister = Task::create([
            "project_id" => $project->id,
            "sprint_id" => $sprint1->id,
            "parent_task_id" => $epicAuth->id,
            "assigned_to" => $user->id,
            "title" => "Rejestracja i weryfikacja nowych kont",
            "description" =>
                "Po pierwszym logowaniu przez GitHub konto jest automatycznie tworzone. E-mail weryfikacyjny jest wysyłany.",
            "type" => "story",
            "status" => "Completed",
            "priority" => 5,
            "story_points" => 3,
            "position" => 2,
        ]);
        $taskRegister->labels()->attach([$labelBackend->id]);

        $taskHomepage = Task::create([
            "project_id" => $project->id,
            "sprint_id" => $sprint1->id,
            "assigned_to" => $user->id,
            "title" => "Responsywna strona główna z hero section",
            "description" =>
                "Zaprojektowanie i wdrożenie responsywnej strony głównej sklepu z sekcją hero, nawigacją i stopką.",
            "type" => "task",
            "status" => "Completed",
            "priority" => 5,
            "story_points" => 5,
            "position" => 3,
        ]);
        $taskHomepage->labels()->attach([$labelFrontend->id, $labelUxUi->id]);

        $taskBugContact = Task::create([
            "project_id" => $project->id,
            "sprint_id" => $sprint1->id,
            "assigned_to" => $user->id,
            "title" => "Błąd walidacji formularza kontaktu",
            "description" =>
                "Formularz kontaktowy nie waliduje pola telefonu - użytkownik może wpisać litery i formularz wysyła się poprawnie.",
            "type" => "bug",
            "status" => "Completed",
            "priority" => 7,
            "story_points" => 2,
            "position" => 4,
        ]);
        $taskBugContact->labels()->attach([$labelPilne->id]);

        $taskStripe = Task::create([
            "project_id" => $project->id,
            "sprint_id" => $sprint1->id,
            "assigned_to" => $user->id,
            "title" => "Integracja z bramką płatniczą Stripe",
            "description" =>
                "Podłączenie biblioteki Stripe do obsługi płatności kartą. Obsługa webhooków potwierdzenia płatności i zwrotów.",
            "type" => "task",
            "status" => "Completed",
            "priority" => 7,
            "story_points" => 8,
            "position" => 5,
        ]);
        $taskStripe->labels()->attach([$labelBackend->id]);

        Task::create([
            "project_id" => $project->id,
            "sprint_id" => $sprint1->id,
            "assigned_to" => $user->id,
            "title" => "Migracja schematu bazy danych - moduł użytkowników",
            "description" => "Przygotowanie i uruchomienie migracji dla tabel users, sessions, teams, team_user.",
            "type" => "task",
            "status" => "Completed",
            "priority" => 5,
            "story_points" => 5,
            "position" => 6,
        ]);

        $epicProducts = Task::create([
            "project_id" => $project->id,
            "assigned_to" => $user->id,
            "title" => "Panel zarządzania produktami",
            "description" => "Epic - kompletny panel dla administratora do zarządzania katalogiem produktów.",
            "type" => "epic",
            "status" => "Active",
            "priority" => 7,
            "story_points" => 21,
            "position" => 0,
        ]);

        $taskProductList = Task::create([
            "project_id" => $project->id,
            "sprint_id" => $sprint2->id,
            "parent_task_id" => $epicProducts->id,
            "assigned_to" => $user->id,
            "title" => "Lista produktów z filtrowaniem i paginacją",
            "description" =>
                "Strona listy produktów z możliwością filtrowania po kategorii, cenie i dostępności. Paginacja po 20 produktów.",
            "type" => "story",
            "status" => "Active",
            "priority" => 7,
            "story_points" => 8,
            "position" => 1,
        ]);
        $taskProductList->labels()->attach([$labelFrontend->id, $labelBackend->id]);

        $taskProductDetail = Task::create([
            "project_id" => $project->id,
            "sprint_id" => $sprint2->id,
            "parent_task_id" => $epicProducts->id,
            "assigned_to" => $user->id,
            "title" => "Strona szczegółów produktu",
            "description" =>
                "Widok szczegółowy produktu - galeria zdjęć, opis, cena, warianty, przycisk dodania do koszyka.",
            "type" => "story",
            "status" => "Planned",
            "priority" => 5,
            "story_points" => 5,
            "position" => 2,
        ]);
        $taskProductDetail->labels()->attach([$labelFrontend->id, $labelUxUi->id]);

        $taskCart = Task::create([
            "project_id" => $project->id,
            "sprint_id" => $sprint2->id,
            "assigned_to" => $user->id,
            "title" => "Koszyk zakupowy",
            "description" => "Implementacja koszyka zakupowego z sesją, możliwością zmiany ilości i usuwania pozycji.",
            "type" => "story",
            "status" => "Active",
            "priority" => 7,
            "story_points" => 8,
            "position" => 3,
        ]);
        $taskCart->labels()->attach([$labelFrontend->id]);

        $taskBugCart = Task::create([
            "project_id" => $project->id,
            "sprint_id" => $sprint2->id,
            "assigned_to" => $user->id,
            "title" => "Błąd - podwójne dodanie produktu do koszyka",
            "description" =>
                'Po szybkim podwójnym kliknięciu "Dodaj do koszyka" produkt jest dodawany dwukrotnie zamiast zwiększenia ilości.',
            "type" => "bug",
            "status" => "Completed",
            "priority" => 10,
            "story_points" => 2,
            "position" => 4,
        ]);
        $taskBugCart->labels()->attach([$labelPilne->id]);

        Task::create([
            "project_id" => $project->id,
            "sprint_id" => $sprint2->id,
            "assigned_to" => $user->id,
            "title" => "Optymalizacja zapytań SQL - lista produktów",
            "description" =>
                "Zapytanie listujące produkty wykonuje N+1 queries. Należy dodać eager loading relacji kategorii i mediów.",
            "type" => "task",
            "status" => "Planned",
            "priority" => 5,
            "story_points" => 3,
            "position" => 5,
        ]);

        Task::create([
            "project_id" => $project->id,
            "sprint_id" => $sprint2->id,
            "assigned_to" => $user->id,
            "title" => "Testy jednostkowe - moduł koszyka",
            "description" => "Napisanie testów jednostkowych i integracyjnych dla serwisu koszyka.",
            "type" => "task",
            "status" => "Planned",
            "priority" => 5,
            "story_points" => 3,
            "position" => 6,
        ])
            ->labels()
            ->attach([$labelTesty->id]);

        Task::create([
            "project_id" => $project->id,
            "title" => "System powiadomień e-mail",
            "description" =>
                "Automatyczne e-maile - potwierdzenie zamówienia, wysyłka, zwrot. Integracja z Laravel Mail i Mailgun.",
            "type" => "story",
            "status" => "Backlog",
            "priority" => 5,
            "story_points" => 5,
            "position" => 1,
        ])
            ->labels()
            ->attach([$labelBackend->id]);

        Task::create([
            "project_id" => $project->id,
            "title" => "Integracja z mediami społecznościowymi",
            "description" => "Przyciski udostępniania produktów na Facebook, Twitter, Instagram.",
            "type" => "task",
            "status" => "Backlog",
            "priority" => 3,
            "story_points" => 3,
            "position" => 2,
        ]);

        $epicReports = Task::create([
            "project_id" => $project->id,
            "title" => "Raportowanie sprzedaży - Epic",
            "description" =>
                "Epic - panel raportów sprzedaży dla managera z wykresami, filtrami dat i eksportem danych.",
            "type" => "epic",
            "status" => "Backlog",
            "priority" => 5,
            "story_points" => 21,
            "position" => 3,
        ]);
        $epicReports->labels()->attach([$labelDokumentacja->id]);

        Task::create([
            "project_id" => $project->id,
            "parent_task_id" => $epicReports->id,
            "title" => "Eksport raportów do CSV/Excel",
            "description" => "Funkcja eksportu danych sprzedaży do pliku CSV lub Excel z wyborem zakresu dat.",
            "type" => "task",
            "status" => "Backlog",
            "priority" => 3,
            "story_points" => 5,
            "position" => 4,
        ]);

        Task::create([
            "project_id" => $project->id,
            "parent_task_id" => $epicReports->id,
            "title" => "Wykresy i statystyki sprzedaży",
            "description" => "Dashboard z wykresami - przychody dzienne/miesięczne, top produkty, konwersja koszyków.",
            "type" => "task",
            "status" => "Backlog",
            "priority" => 5,
            "story_points" => 8,
            "position" => 5,
        ]);

        Task::create([
            "project_id" => $project->id,
            "sprint_backlog_id" => $sprint3->id,
            "title" => "Wdrożenie systemu powiadomień push",
            "description" =>
                "Powiadomienia push przez WebSocket dla zdarzeń - nowe zamówienie, zmiana statusu, wiadomość od obsługi.",
            "type" => "story",
            "status" => "Backlog",
            "priority" => 5,
            "story_points" => 8,
            "position" => 1,
        ]);

        Task::create([
            "project_id" => $project->id,
            "sprint_backlog_id" => $sprint3->id,
            "title" => "Optymalizacja wydajności - cache produktów",
            "description" => "Wdrożenie Redis cache dla listy produktów i szczegółów. Cache invalidation przy edycji.",
            "type" => "task",
            "status" => "Backlog",
            "priority" => 7,
            "story_points" => 5,
            "position" => 2,
        ]);

        TaskComment::create([
            "task_id" => $taskProductList->id,
            "user_id" => $user->id,
            "content" =>
                "Zaimplementowałem filtrowanie po kategorii i przedziale cenowym. PR #12 czeka na review. Dodałem też indeks na kolumnie category_id dla wydajności.",
        ]);

        TaskComment::create([
            "task_id" => $taskProductList->id,
            "user_id" => $user->id,
            "content" => "Proszę o uzupełnienie testów dla filtrowania po dostępności.",
        ]);

        TaskComment::create([
            "task_id" => $taskCart->id,
            "user_id" => $user->id,
            "content" =>
                "Napotkałem problem z sesją koszyka po wylogowaniu - koszyk nie jest czyszczony. Problem z kolejnością middleware - naprawione.",
        ]);

        TaskComment::create([
            "task_id" => $taskBugCart->id,
            "user_id" => $user->id,
            "content" =>
                'Znalazłem przyczynę - brak debounce na przycisku "Dodaj do koszyka" + brak unique constraint na pozycji koszyka. Naprawione.',
        ]);

        TaskComment::create([
            "task_id" => $taskStripe->id,
            "user_id" => $user->id,
            "content" =>
                "Webhook endpoint skonfigurowany. Testy na środowisku staging przeszły. Dodałem obsługę charge.refunded wymaganą dla zwrotów.",
        ]);

        $retro = Retrospective::create([
            "sprint_id" => $sprint1->id,
            "created_by" => $user->id,
            "went_well" =>
                "Dobra komunikacja w zespole - daily stand-upy były efektywne i krótkie. Wszystkie user stories zostały dostarczone. Integracja z GitHub OAuth przebiegła sprawniej niż oczekiwano.",
            "went_wrong" =>
                "Integracja ze Stripe zajęła znacznie więcej czasu niż oszacowano (8 SP zamiast planowanych 5). Wymagania dla modułu płatności były niejasne na początku sprintu.",
            "to_improve" =>
                "Lepsze doprecyzowanie wymagań dla zadań >5 SP przed startem sprintu. Dodać debounce do wszystkich przycisków akcji. Więcej testów integracyjnych dla modułów płatności.",
        ]);

        RetrospectiveVote::create([
            "retrospective_id" => $retro->id,
            "user_id" => $user->id,
            "vote_type" => "went_well",
            "upvote" => true,
        ]);

        RetrospectiveVote::create([
            "retrospective_id" => $retro->id,
            "user_id" => $user->id,
            "vote_type" => "went_wrong",
            "upvote" => true,
        ]);

        RetrospectiveVote::create([
            "retrospective_id" => $retro->id,
            "user_id" => $user->id,
            "vote_type" => "to_improve",
            "upvote" => true,
        ]);

        Document::create([
            "project_id" => $project->id,
            "created_by" => $user->id,
            "title" => "Architektura systemu",
            "content" =>
                "Stos technologiczny: Backend - Laravel 12, Frontend - React 19 + Inertia.js, Baza danych - PostgreSQL 16, Cache - Redis 7, WebSocket - Laravel Reverb.",
            "position" => 0,
        ]);

        ProjectActivity::create([
            "project_id" => $project->id,
            "user_id" => $user->id,
            "action" => "sprint_started",
            "subject_type" => "App\Models\Sprint",
            "subject_id" => $sprint1->id,
            "metadata" => json_encode(["sprint_name" => "Sprint 1"]),
            "created_at" => now()->subWeeks(3),
            "updated_at" => now()->subWeeks(3),
        ]);

        ProjectActivity::create([
            "project_id" => $project->id,
            "user_id" => $user->id,
            "action" => "sprint_completed",
            "subject_type" => "App\Models\Sprint",
            "subject_id" => $sprint1->id,
            "metadata" => json_encode(["completed_points" => 28, "planned_points" => 34]),
            "created_at" => now()->subWeek(),
            "updated_at" => now()->subWeek(),
        ]);

        ProjectActivity::create([
            "project_id" => $project->id,
            "user_id" => $user->id,
            "action" => "sprint_started",
            "subject_type" => "App\Models\Sprint",
            "subject_id" => $sprint2->id,
            "metadata" => json_encode(["sprint_name" => "Sprint 2"]),
            "created_at" => now()->subDays(6),
            "updated_at" => now()->subDays(6),
        ]);

        ProjectActivity::create([
            "project_id" => $project->id,
            "user_id" => $user->id,
            "action" => "task_status_changed",
            "subject_type" => "App\Models\Task",
            "subject_id" => $taskProductList->id,
            "metadata" => json_encode(["from" => "Planned", "to" => "Active"]),
            "created_at" => now()->subDays(5),
            "updated_at" => now()->subDays(5),
        ]);

        ProjectActivity::create([
            "project_id" => $project->id,
            "user_id" => $user->id,
            "action" => "task_status_changed",
            "subject_type" => "App\Models\Task",
            "subject_id" => $taskBugCart->id,
            "metadata" => json_encode(["from" => "Active", "to" => "Completed", "bug_fix" => true]),
            "created_at" => now()->subDays(4),
            "updated_at" => now()->subDays(4),
        ]);

        ProjectActivity::create([
            "project_id" => $project->id,
            "user_id" => $user->id,
            "action" => "task_assigned",
            "subject_type" => "App\Models\Task",
            "subject_id" => $taskProductDetail->id,
            "metadata" => json_encode(["assigned_to" => $user->name]),
            "created_at" => now()->subDays(3),
            "updated_at" => now()->subDays(3),
        ]);
    }
}
