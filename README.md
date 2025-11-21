# NuxtDash Pro 🚀

![Nuxt 4 Ready](https://img.shields.io/badge/Nuxt_4-Ready-00DC82?style=flat-square&logo=nuxt.js)
![TypeScript](https://img.shields.io/badge/Language-TypeScript-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind_CSS-38B2AC?style=flat-square&logo=tailwind-css)

**NuxtDash Pro** is a high-performance, enterprise-grade admin dashboard template built with **Nuxt 4 (Future Compatible)** and **Tailwind CSS**. Designed for scalability, maintainability, and excellent User Experience (UX).

It features a modern split-screen authentication flow, interactive data visualization, real-time CRUD operations, and a fully responsive layout with dark mode support.

![Dashboard Preview](./public/preview.png)
*(Note: Replace `./public/preview.png` with your actual screenshot path)*

---

## 🛠️ Tech Stack

Built with the latest and greatest web technologies:

| Technology | Description | Logo |
| :--- | :--- | :---: |
| **Nuxt 4** | The Intuitive Vue Framework (Future Mode Enabled) | <img src="https://upload.wikimedia.org/wikipedia/commons/a/ae/Nuxt_logo.svg" width="30"/> |
| **Vue 3** | The Progressive JavaScript Framework (Composition API) | <img src="https://upload.wikimedia.org/wikipedia/commons/9/95/Vue.js_Logo_2.svg" width="30"/> |
| **TypeScript** | Strongly typed programming language | <img src="https://upload.wikimedia.org/wikipedia/commons/4/4c/Typescript_logo_2020.svg" width="30"/> |
| **Tailwind CSS** | Utility-first CSS framework for rapid UI development | <img src="https://upload.wikimedia.org/wikipedia/commons/d/d5/Tailwind_CSS_Logo.svg" width="30"/> |
| **Pinia** | The intuitive store for Vue.js (State Management) | <img src="https://pinia.vuejs.org/logo.svg" width="30"/> |
| **ApexCharts** | Modern & Interactive Charts (`vue3-apexcharts`) | <img src="https://apexcharts.com/wp-content/themes/apexcharts/img/apexcharts-logo.svg" width="30"/> |
| **Lucide Icons** | Beautiful & consistent icon set | 🎨 |

---

## ✨ Key Features

### 🎨 UI & UX
* **Dark Mode Support**: Built-in theme switcher (System/Light/Dark) using `@nuxtjs/color-mode`.
* **Responsive Sidebar**: Collapsible sidebar with backdrop blur on mobile devices.
* **Custom Components**: Reusable Atomic Components (`AppButton`, `AppInput`, `AppModal`, `AppToast`).
* **Interactive Charts**: Beautiful Area, Bar, and Donut charts for data visualization.
* **Custom 404 Page**: Aesthetic error handling page.

### ⚡ Functionality
* **CRUD Operations**: complete Data Table with Add, Edit, Delete, Search, and Pagination logic.
* **Authentication Flow**:
    * Split-screen Login Page.
    * **Middleware Protection**: Route guards (`auth.global.ts`) to protect dashboard routes.
    * Login/Logout state persistence using Pinia.
* **Global State Management**: User profile data shared across Sidebar and Settings page via Pinia Store.
* **Toast Notifications**: Custom composable `useToast()` for non-blocking alerts.
* **Image Upload Preview**: Real-time avatar preview using Object URL.

---

## 📂 Project Structure

We follow the **Nuxt 4 Future** folder structure guidelines (Modular & Flat):

```bash
nuxt-dashboard-pro/
├── components/          # Atomic & UI Components (AppButton, RevenueChart, etc.)
├── composables/         # Shared logic (useToast)
├── layouts/             # Layouts (default.vue, auth.vue)
├── middleware/          # Route Guards (auth.global.ts)
├── pages/               # Application Routes
│   ├── index.vue        # Dashboard Overview
│   ├── analytics.vue    # Charts & Reports
│   ├── customers.vue    # CRUD Data Table
│   ├── settings.vue     # User Profile Form
│   └── login.vue        # Auth Page
├── stores/              # Pinia State Stores (user.ts)
├── plugins/             # Plugins (apexcharts.client.ts)
├── app.vue              # Root Component
└── nuxt.config.ts       # Nuxt Configuration