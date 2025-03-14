<script setup>
import { ref, onMounted, onUnmounted  } from "vue";
const data = ref("");

const regions = {
  "Europe West": "euw",
  "North America": "na",
  "Middle East": "me",
  "Europe Nordic & East": "eune",
  Oceania: "oce",
};

const isDropdownOpen = ref(false);
const selectedOption = ref("Select Region");
const options = ref(["Europe West", "North America", "Middle East", "Europe Nordic & East", "Oceania"]);
const dropdown = ref(null);


const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value;
};

const selectOption = (option) => {
  selectedOption.value = option;
  isDropdownOpen.value = false;
};


const handleSubmit = () => {
  console.log(data.value);
};

const closeDropdown = (event) => {
  if (dropdown.value && !dropdown.value.contains(event.target)) {
    isDropdownOpen.value = false;
  }
};

onMounted(() => {
  window.addEventListener("click", closeDropdown);
});

onUnmounted(() => {
  window.removeEventListener("click", closeDropdown);
});
</script>

<template>
  <div class="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
    <!-- Дропдаун меню -->
    <div class="relative inline-block mb-6" ref="dropdown">
      <button
        @click="toggleDropdown"
        class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
        type="button"
      >
        {{ selectedOption }}
        <svg
          class="w-2.5 h-2.5 ms-3"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 10 6"
        >
          <path
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="m1 1 4 4 4-4"
          />
        </svg>
      </button>

      <div
        v-if="isDropdownOpen"
        class="absolute left-1/2 transform -translate-x-1/2 mt-2 z-10 bg-white divide-y divide-gray-100 rounded-lg shadow-sm w-44 dark:bg-gray-700"
      >
        <ul class="py-2 text-sm text-gray-700 dark:text-gray-200">
          <li v-for="option in options" :key="option">
            <a
              href="#"
              @click="selectOption(option)"
              class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white text-center"
            >
              {{ option }}
            </a>
          </li>
        </ul>
      </div>
    </div>

    <!-- Основний контейнер -->
    <div class="flex flex-col items-center w-full max-w-[800px] px-4">
      <h1
        class="text-center mb-8 text-4xl font-extrabold leading-none tracking-tight text-gray-900 md:text-5xl lg:text-6xl dark:text-white"
      >
        League of Check
      </h1>
      
      <div class="w-full mb-6">
        <input
          v-model="data"
          placeholder="name#tag"
          type="text"
          id="large-input"
          class="block w-full p-4 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-base focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
        />
      </div>

      <div class="flex justify-center">
        <button
          @click="handleSubmit"
          class="relative inline-flex items-center justify-center p-0.5 mb-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-purple-600 to-blue-500 group-hover:from-purple-600 group-hover:to-blue-500 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800"
        >
          <span
            class="relative px-10 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-transparent group-hover:dark:bg-transparent"
          >
            CHECK
          </span>
        </button>
      </div>
    </div>
  </div>
</template>
