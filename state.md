# SKILLS.md — Помощник консультанта магазина

Документ содержит регламент разработки, архитектуру, спецификацию API и технические стандарты для проекта **«Помощник консультанта магазина»**.

---

## 1. Обзор проекта и стек технологий

Проект представляет собой Fullstack веб-приложение на Next.js для продавцов-консультантов и администраторов магазина.

### Основной функционал
1. **Модуль консультанта:** Быстрый поиск товаров, просмотр актуальных продажных цен, добавление товаров в очередь печати и отправка пакета ценников на локальный печатный сервис.
2. **Админ-панель:** Управление шаблонами ценников (создание, редактирование параметров, настройка размеров, текстовых блоков, штрихкодов и визуальный предпросмотр в реальном времени).

### Стек технологий
* **Framework:** Next.js (App Router + Server Route Handlers).
* **UI Framework:** Shadcn UI (Tailwind CSS, Radix UI, Lucide Icons).
* **State Management & Data Fetching:** TanStack Query (`@tanstack/react-query`) + Native `fetch` API (**категорический запрет на Axios**).
* **Авторизация и роли:** Сессионная аутентификация с разграничением доступов (`CONSULTANT`, `ADMIN`).
* **Печать ценников:** Прямая отправка сформированных данных из веб-интерфейса на локальный десктопный сервис печати по HTTP (`http://localhost:9100/print`).

---

## 2. Архитектура и структура проекта

```text
app/
├── (auth)/
│   └── login/
│       └── page.tsx              # Страница авторизации (Консультант / Админ)
├── (dashboard)/
│   ├── layout.tsx                # Лейаут с навигацией, шапкой и проверкой прав
│   ├── products/
│   │   └── page.tsx              # Поиск и каталог товаров
│   ├── print/
│   │   └── page.tsx              # Раздел очереди печати ценников
│   └── admin/
│       └── templates/
│           ├── page.tsx          # Список всех шаблонов ценников
│           ├── new/page.tsx      # Создание шаблона с интерактивным предпросмотром
│           └── [id]/page.tsx     # Редактирование шаблона
├── api/
│   ├── auth/
│   │   ├── login/route.ts        # Авторизация и запись сессии
│   │   └── me/route.ts           # Проверка текущей сессии и роли
│   ├── products/
│   │   └── search/route.ts       # Route Handler: проксирование запросов к Umag API
│   └── admin/
│       └── templates/
│           ├── route.ts          # GET (список), POST (создать шаблон)
│           └── [id]/route.ts     # GET, PUT, DELETE шаблона
components/
├── ui/                           # Компоненты Shadcn UI (Button, Input, Table, Dialog, Switch и т.д.)
├── products/                     # Компоненты каталога и карточек товаров
├── print/                        # Компоненты корзины печати
└── admin/                        # Компоненты админки (Live Preview ценника, формы настроек)
lib/
├── fetcher.ts                    # Обертка над native fetch
├── session.ts                    # Конфигурация сессий и ролей
└── umag.ts                       # Типы и константы Umag API
```

---

## 3. Спецификация данных и TypeScript Интерфейсы

### 1. Umag API (Товары)
* **Store ID:** `41796` (Константа)
* **URL:** `https://api.umag.kz/rest/cabinet/nom/product/search?storeId=41796`
* **Method:** `POST`

```typescript
export interface UmagProductSearchPayload {
  first: number;                   // Смещение (0, 10, 20...)
  pageSize: number;                // Размер страницы
  measure?: 0 | 1;                 // 0 = шт, 1 = кг, undefined = все
  fullSearchCriteria?: string;     // Текст поиска (undefined если не указан)
}

export interface UmagProduct {
  id: number;                      // ID товара
  barcode: number;                 // Основной штрихкод
  name: string;                    // Название товара
  fullName: string;
  type: 0 | 1;                     // 0 = шт, 1 = кг
  measureName: string;             // "шт." || "кг."
  arrivalCost: number;             // Закупочная цена
  sellingPrice: number;            // Закупочная цена (по спецификации Umag)
  wholesalePrice: number;          // ПРОДАЖНАЯ ЦЕНА (выводить консультанту и на ценник)
  aliasList: string[];             // Дополнительные штрихкоды
}

export interface UmagSearchResponse {
  totalCount: number;
  fetchedCount: number;
  content: UmagProduct[];
}
```

### 2. Шаблоны печати (Admin Panel)

```typescript
export interface PrintTemplateConfig {
  showStoreName: boolean;        // Показывать название магазина
  storeNameText?: string;        // Текст заголовка (напр. "Alpamis")
  showBarcode: boolean;          // Выводить штрихкод
  showMeasure: boolean;          // Выводить единицу измерения (шт/кг)
  showDate: boolean;             // Выводить дату печати
  titleFontSize: number;         // Размер шрифта названия (в pt/px)
  priceFontSize: number;         // Размер шрифта цены (в pt/px)
  currencySymbol: string;        // Символ валюты ("₸", "сум", "руб.")
}

export interface PrintTemplate {
  id: string;                    // Уникальный ID шаблона
  name: string;                  // Название (напр. "Стандартный 58х40мм")
  widthMm: number;               // Ширина ценника в мм
  heightMm: number;              // Высота ценника в мм
  isDefault: boolean;            // Шаблон по умолчанию
  config: PrintTemplateConfig;
  createdAt: string;
  updatedAt: string;
}

export type CreatePrintTemplateDto = Omit<PrintTemplate, 'id' | 'createdAt' | 'updatedAt'>;
```

---

## 4. Бэкенд-слой (Next.js Route Handlers)

### 1. Проксирование товаров Umag (`app/api/products/search/route.ts`)

```typescript
import { NextResponse } from 'next/server';
import { UmagProductSearchPayload } from '@/lib/umag';

const UMAG_API_URL = 'https://api.umag.kz/rest/cabinet/nom/product/search?storeId=41796';

export async function POST(request: Request) {
  try {
    const body: UmagProductSearchPayload = await request.json();

    const response = await fetch(UMAG_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Ошибка сервера Umag API' }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}
```

### 2. API Шаблонов печати (`app/api/admin/templates/route.ts`)

```typescript
import { NextResponse } from 'next/server';
import { CreatePrintTemplateDto } from '@/lib/types';

export async function GET() {
  // Получение всех шаблонов из базы данных
  const templates = await db.printTemplate.findMany();
  return NextResponse.json(templates);
}

export async function POST(request: Request) {
  try {
    const body: CreatePrintTemplateDto = await request.json();
    const newTemplate = await db.printTemplate.create({ data: body });
    return NextResponse.json(newTemplate, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Ошибка создания шаблона' }, { status: 500 });
  }
}
```

---

## 5. Фронтенд-слой (TanStack Query + Native Fetch)

### Базовая обертка `fetch` (`lib/fetcher.ts`)

```typescript
export async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error || 'Ошибка запроса к API');
  }

  return res.json();
}
```

### Custom Hooks (`hooks/useProducts.ts` и `hooks/useTemplates.ts`)

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/fetcher';
import { UmagSearchResponse, UmagProductSearchPayload, PrintTemplate, CreatePrintTemplateDto } from '@/lib/types';

// Загрузка каталога товаров
export function useProducts(params: UmagProductSearchPayload) {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => apiFetch<UmagSearchResponse>('/api/products/search', {
      method: 'POST',
      body: JSON.stringify(params),
    }),
    staleTime: 1000 * 60 * 3,
    placeholderData: (prev) => prev,
  });
}

// Загрузка списка шаблонов
export function useTemplates() {
  return useQuery({
    queryKey: ['print-templates'],
    queryFn: () => apiFetch<PrintTemplate[]>('/api/admin/templates'),
  });
}

// Создание шаблона в админке
export function useCreateTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreatePrintTemplateDto) =>
      apiFetch<PrintTemplate>('/api/admin/templates', {
        method: 'POST',
        body: JSON.stringify(dto),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['print-templates'] });
    },
  });
}
```

---

## 6. Функциональные модули и стандарты UI

### 1. Поиск и просмотр товаров (Консультант)
* **Строка поиска:** Задержка ввода `useDebounce` (300 мс) для поля `fullSearchCriteria`.
* **Переключатель измерений:** `measure`: Все / Штучные (`0`) / Весовые (`1`).
* **Отображение цен:** Обязательный вывод продажной цены из поля **`wholesalePrice`**.
* **Действие:** Добавление товара в локальную очередь печати кнопкой «+ В очередь».

### 2. Модуль печати ценников
* **Очередь:** Корзина выбранных позиций с возможностью изменения количества печатаемых копий.
* **Селект шаблона:** Выбор доступного шаблона из базы данных.
* **Отправка на печать:** Прямой HTTP-запрос в десктопное приложение локальной печати:

```typescript
export interface PrintJobPayload {
  template: PrintTemplate;
  items: {
    barcode: string;
    name: string;
    price: number;
    measureName: string;
    quantity: number;
  }[];
}

export async function sendToLocalPrinter(payload: PrintJobPayload) {
  const LOCAL_PRINTER_URL = 'http://localhost:9100/print';

  try {
    const res = await fetch(LOCAL_PRINTER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error('Ошибка локального сервиса печати');
    return await res.json();
  } catch (err) {
    throw new Error('Не удалось связаться с печатным сервисом. Проверьте, запущена ли программа печати на компьютере.');
  }
}
```

### 3. Админ-панель: Конструктор шаблонов печати (`/admin/templates`)
* **Список шаблонов:** Таблица с размерами (мм), галочкой "По умолчанию" и действиями редактирования.
* **Форма создания/редактирования (`/admin/templates/new`):**
  * Поля физических размеров: Ширина (мм), Высота (мм).
  * Настройки (Shadcn `Switch` и `Input`): Название магазина, показ штрихкода, даты, ед. измерения, шрифты цены и названия.
  * **Компонент Live Preview:** Блок ценника с динамическим `style={{ width: `${widthMm}mm`, height: `${heightMm}mm` }}`, мгновенно отображающий внешность ценника при изменении любого поля формы.

---

## 7. Чек-лист разработки

* [ ] **Отсутствие Axios:** Запрещено добавлять `axios` в зависимости `package.json`.
* [ ] **Shadcn UI:** Все компоненты строить на базе компонентов Shadcn UI (`Table`, `Dialog`, `Form`, `Select`, `Switch`, `Input`, `Button`, `Toast`).
* [ ] **Цены:** Всегда брать поле **`wholesalePrice`** для отображения розничной цены.
* [ ] **CORS и локальная печать:** Ловить сетевые сбои при отправке на `http://localhost:9100` и уведомлять пользователя понятным всплывающим сообщением (`toast.error`).
```