# Programowanie aplikacji internetowych (semestr zimowy 2023)

## Przygotowanie projektu do pracy nad nim
1. Sklonować projekt z https://gitlab.com/mariusz.jarocki/pai2023zima
1. W głównym katalogu projektu zainstalować zależności: `npm install`
1. Skopiować config-example.json do config.json i wyedytować ten ostatni
1. Uruchomić backend: `npm start`
1. Z katalogu frontend uruchomić serwer roboczy: `npm run serve`
1. Z przeglądarki połączyć się z https://localhost:8080

## Przygotowanie wersji produkcyjnej
1. Z katalogu frontend `npm run build`
1. Z przeglądarki połączyć się z https://localhost:8000 (port z konfiguracji)

## Zadania zaliczeniowe

### Zadanie na 3
1. Każdy projekt ma swojego managera (jeden z członków projektu).
1. Wprowadzamy nowy byt: zadanie (Task). Każde zadanie ma nazwę, należy do jednego projektu, ma osoby odpowiedzielne za wykonanie, które muszą być członkami projektu, ma czas rozpoczęcia i opcjonalny zakończenia.
1. Stworzyć interfejs do zarządzania zadaniami projektu, dostępny dla użytkownika w roli 1
1. Użytkownik wybiera projekt i na liście zadań do niego przypisanych może wykonywać operacje CRUD, tak jak na osobach i projektach. Uwzględnić wyszukiwanie po nazwie zadania.
1. Użytkownik może zaznaczyć grupę niezakończonych zadań projektu i jednym przyciskiem ustawić datę zakończenia na aktualną.

### Zadanie na 4
Do zadania na 3 dodać:
1. W widoku zadań dodać diagram Gantta dla projektu: na osi x daty, na osi y zadania. Zadania reprezentowane są przez prostokąty (odcinki) od daty do daty. Zadania bez daty końca są pokazywane innym kolorem, a ich data końca jest datą aktualną. Wykres ma aktualizować się automatycznie przy każdej zmianie zadań projektu.
1. W widoku osób dodać przy każdej osobie przycisk, aktywujące okienko modalne z diagramem Gantta zadań danej osoby.

### Zadanie na 5
Do zadania na 4 dodać:
1. Każdy użytkownik w roli x jest powiadamiany (za pomocą v-snackbar'a) o zalogowaniu się innego użytkownika o tej samej roli.
1. Wyświetlane dane o zadaniach oraz diagramy mają się odświeżać w momencie, gdy inny użytkownik o odpowiednim poziomie praw dokona zmian w zakresie zadań.