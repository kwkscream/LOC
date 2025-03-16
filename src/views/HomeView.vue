<script setup>
import { useRouter } from "vue-router";
import { ref } from "vue";
const data = ref("");
const router = useRouter();

 
const onSubmitForm = () => {
  if(!data.value.length){
    alert('Cant be empty');
    return;
  }
  if(data.value.includes('#') !== true){
    alert('Incorrect username, please add "#"');
    return;
  }

  router.push({
    path: '/player-info',
    query: {
      user: data.value
    }
  })
}

</script>

<template>
  <div
    class="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900" >
    <!-- Основний контейнер -->
    <form class="flex flex-col items-center w-full max-w-[800px] px-4" @submit.prevent="onSubmitForm">
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
          class="relative inline-flex items-center justify-center p-0.5 mb-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-purple-600 to-blue-500 group-hover:from-purple-600 group-hover:to-blue-500 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800"
        >
          <span
            class="relative px-10 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-transparent group-hover:dark:bg-transparent"
          >
            CHECK
          </span>
        </button>
      </div>
    </form>
  </div>
</template>
