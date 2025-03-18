<script setup>
import { useRoute } from "vue-router";
import { onMounted, ref } from "vue";
import { RouterLink } from "vue-router";

const route = useRoute();
const user = route.query.user || "";
const stats = ref(null);

const handleQuery = async () => {
  if (!user.includes("#")) {
    alert("Something went wrong! Please check you added '#' symbol.");
    return;
  }

  const [username, usertag] = user.split("#");

  try {
    // Отримуємо PUUID
    const res1 = await fetch(`http://localhost:3000/getPUUID?gameName=${username}&tagLine=${usertag}`);
    if (!res1.ok) {
      const errorText = await res1.text();
      throw new Error(`Помилка getPUUID: ${errorText}`);
    }
    const result = await res1.json();
    if (!result.puuid) {
      throw new Error("PUUID не знайдено");
    }
    console.log("PUUID:", result.puuid);

    // Отримуємо статистику гравця
    const res2 = await fetch(`http://localhost:3000/playerStats?puuid=${result.puuid}`);
    if (!res2.ok) {
      const errorText = await res2.text();
      throw new Error(`Помилка playerStats: ${errorText}`);
    }
    const data = await res2.json();
    stats.value = data;
    console.log("🔥 Статистика гравця:", data);
  } catch (error) {
    console.error("❌ Помилка:", error);
  }
};



onMounted(() => {
	handleQuery();
});

</script>

<template>
	<div class="flex flex-col items-center justify-center h-screen">
		<div
			class="bg-gray-900 text-white p-6 rounded-2xl shadow-lg w-[500px] text-center min-h-[450px]"
		>
			<h2 class="text-xl font-bold text-center mb-4">
				Summoner: {{ user || "Loading..." }}
			</h2>

			<div v-if="stats" class="grid grid-cols-3 gap-5 text-center">
				<div
					class="bg-gray-800 p-4 rounded-lg h-full flex flex-col justify-center min-h-[80px] min-w-[150px]"
				>
					<p class="text-sm text-gray-400">KDA</p>
					<p class="text-xl font-semibold">{{ stats.kda }}</p>
				</div>
				<div
					class="bg-gray-800 p-4 rounded-lg h-full flex flex-col justify-center min-h-[80px] min-w-[150px]"
				>
					<p class="text-sm text-gray-400">Champion</p>
					<p class="text-xs text-gray-600">(Last 10)</p>
					<p class="text-xl font-semibold">
						{{ stats?.topChampion }}
					</p>
				</div>
				<div
					class="bg-gray-800 p-4 rounded-lg h-full flex flex-col justify-center min-h-[80px] min-w-[150px]"
				>
					<p class="text-sm text-gray-400">Level</p>
					<p class="text-xl font-semibold">{{ stats.level }}</p>
				</div>

				<template
					v-for="item in stats.rankedInfo.sort(
						(a, b) => a.queueType < b.queueType,
					)"
				>
					<div
						class="bg-green-600 p-4 rounded-lg h-full flex flex-col justify-center min-h-[80px] min-w-[150px]"
					>
						<p class="text-sm">Season Wins</p>
						<p class="text-xl font-semibold">
							{{ item.wins }}
						</p>
					</div>
					<div
						class="bg-gray-800 p-4 rounded-lg h-full flex flex-col justify-center min-h-[80px] min-w-[150px]"
					>
						<p
							v-if="item.queueType === 'RANKED_FLEX_SR'"
							class="text-sm text-gray-400"
						>
							Rating (FLEX)
						</p>
						<p
							v-if="item.queueType === 'RANKED_SOLO_5x5'"
							class="text-sm text-gray-400"
						>
							Rating (Solo/Duo)
						</p>
						<p
							v-if="
								['CHALLENGER', 'MASTER', 'GRANDMASTER'].indexOf(
									item.tier,
								) === -1
							"
							class="text-lg font-semibold"
						>
							{{ item.tier + " " + item.rank }}
						</p>
						<p v-else class="text-lg font-semibold">
							{{ item.tier }}
						</p>
						<p class="text-lg font-semibold">
							{{ item.leaguePoints + " " + "LP" }}
						</p>
					</div>
					<div
						class="bg-red-600 p-4 rounded-lg h-full flex flex-col justify-center min-h-[80px] min-w-[150px]"
					>
						<p class="text-sm">Season Losses</p>
						<p class="text-xl font-semibold">
							{{ item.losses }}
						</p>
					</div>
				</template>

				<template v-for="_ in Array(2 - stats.rankedInfo.length)">
					<div
						class="bg-gray-800 p-4 rounded-lg h-full flex flex-col justify-center min-h-[80px] min-w-[150px]"
					>
						<p class="text-sm">None</p>
					</div>
					<div
						class="bg-gray-800 p-4 rounded-lg h-full flex flex-col justify-center min-h-[80px] min-w-[150px]"
					>
						<p class="text-sm">None</p>
					</div>
					<div
						class="bg-gray-800 p-4 rounded-lg h-full flex flex-col justify-center min-h-[80px] min-w-[150px]"
					>
						<p class="text-sm">None</p>
					</div>
				</template>
			</div>
			<p v-else class="text-center text-gray-400">Loading stats...</p>
		</div>
		<div>
			<RouterLink
				to="/"
				class="relative inline-flex items-center justify-center p-0.5 mb-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-purple-600 to-blue-500 group-hover:from-purple-600 group-hover:to-blue-500 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800"
			>
				<span
					class="relative px-10 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-transparent group-hover:dark:bg-transparent"
				>
					Back
				</span>
			</RouterLink>
		</div>
	</div>
</template>
